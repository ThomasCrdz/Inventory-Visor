import type { ColDef } from '@/types';
import { esc } from '@/lib/utils';
import { Pager } from '@/components/visor/Pager';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calcReglaEntel } from '@/lib/exportXLSX';

interface GenericDataTableProps<T extends object> {
  cols: ColDef[];
  filtered: T[];
  pageRows: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  sortCol: number | null;
  sortDir: 1 | -1;
  filterMap: Record<string, Set<string>>;
  allCount: number;
  onSort: (ci: number) => void;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  onExport: () => void;
  exportLabel?: string;
}

const PAGE_SIZES = [25, 50, 100, 200];

function renderCell(val: unknown, colKey: string): string {
  const v = String(val ?? '');

  if (colKey === 'monitored') {
    const vl = v.toLowerCase();
    if (vl === 'yes') return '<span style="color:#22c55e;font-weight:600">✓ Yes</span>';
    if (vl === 'no')  return '<span style="color:#ef4444;font-weight:600">✗ No</span>';
    return '<span style="color:#8b96b8">N/A</span>';
  }

  if (colKey === 'gReglaEntel' || colKey === 'ffcReglaEntel') {
    // gFecha/ffcFecha is not passed here — value is pre-computed
    if (v === 'SI') return '<span style="color:#22c55e;font-weight:600">SI</span>';
    if (v === 'NO') return '<span style="color:#ef4444">NO</span>';
    return '<span style="color:#8b96b8">—</span>';
  }

  if (colKey === 'reglaEntel') {
    if (v === 'SI') return '<span style="color:#22c55e;font-weight:600">SI</span>';
    if (v === 'NO') return '<span style="color:#ef4444">NO</span>';
    return '<span style="color:#8b96b8">—</span>';
  }

  if (colKey === 'fuenteID') {
    const color = v === 'Custom' || v === 'Hardware+Custom'
      ? '#22c55e' : v === 'Hardware' ? '#a78bfa' : v === 'Inventory' ? '#60a5fa' : '#8b96b8';
    return `<span style="color:${color}">${esc(v) || '—'}</span>`;
  }

  if (!v) return '<span style="color:#8b96b8;font-style:italic">—</span>';

  if (colKey === 'genGuardian') {
    const cls = v === 'GEN1' ? 'gen1' : v === 'GEN2' ? 'gen2' : v === 'GEN3' ? 'gen3' : '';
    return `<span class="${cls}">${esc(v)}</span>`;
  }

  if (colKey === 'datosMB' || colKey === 'datosGB') {
    const n = parseFloat(v);
    if (isNaN(n)) return esc(v);
    return `<span style="color:#a8b4d0">${n.toLocaleString('es-CL', { maximumFractionDigits: 4 })}</span>`;
  }

  return esc(v);
}

export function GenericDataTable<T extends object>({
  cols, filtered, pageRows, page, pageSize, totalPages,
  sortCol, sortDir, filterMap, allCount,
  onSort, onPage, onPageSize, onExport, exportLabel,
}: GenericDataTableProps<T>) {
  if (filtered.length === 0) {
    return (
      <div className="bg-s1 border border-b1 rounded-fleet">
        <div className="flex flex-col items-center py-12 px-5 gap-[10px] text-center">
          <div className="text-[36px] opacity-35">🔍</div>
          <div className="text-[15px] text-t2">
            {allCount > 0 ? 'Sin resultados para estos filtros' : 'Sin datos'}
          </div>
          <div className="text-[12px] font-mono text-t3">
            {allCount > 0 ? 'Ajusta los filtros' : 'Procesa los archivos o carga un XLSX'}
          </div>
        </div>
      </div>
    );
  }

  const start = isFinite(pageSize) ? (page - 1) * pageSize : 0;
  const end   = isFinite(pageSize) ? Math.min(start + pageSize, filtered.length) : filtered.length;

  return (
    <div className="bg-s1 border border-b1 rounded-fleet overflow-hidden">

      <div className="flex items-center justify-between px-[14px] py-[10px] bg-s2 border-b border-b1">
        <span className="text-[12px] font-mono text-t2">
          Filas <b className="text-cyan">{start + 1}–{end}</b> de <b className="text-cyan">{filtered.length.toLocaleString()}</b>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="green" size="sm" onClick={onExport}>
            ⬇ {exportLabel ?? `Exportar vista (${filtered.length.toLocaleString()})`}
          </Button>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="bg-s3 border border-b1 text-t2 font-mono text-[12px] px-[7px] py-[3px] rounded-[4px] outline-none cursor-pointer"
          >
            {PAGE_SIZES.map(n => <option key={n} value={n}>{n}/pág</option>)}
            <option value={Infinity}>Todos</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        <table className="w-full border-collapse text-[13.5px] font-mono">
          <thead>
            <tr>
              <th className="bg-s3 text-t3 px-[11px] py-2 text-left whitespace-nowrap sticky top-0 z-[2] text-[11px] uppercase tracking-[0.8px] border-b border-b1 w-[32px]">#</th>
              {cols.map((col, ci) => {
                const isActive = sortCol === ci;
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(ci)}
                    className={cn(
                      'bg-s3 text-t3 px-[11px] py-2 text-left whitespace-nowrap sticky top-0 z-[2]',
                      'text-[11px] uppercase tracking-[0.8px] border-b border-b1',
                      'cursor-pointer select-none transition-colors duration-150 hover:text-t1',
                    )}
                  >
                    {col.label}
                    <span className={cn('ml-[3px]', isActive ? 'text-cyan' : 'opacity-25')}>
                      {isActive ? (sortDir === 1 ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, li) => (
              <tr
                key={start + li}
                className="border-b border-b1/50 hover:bg-cyan/[0.04] transition-colors duration-100"
              >
                <td className="px-2 py-2 text-right text-t4 w-[34px] text-[12px]">{start + li + 1}</td>
                {cols.map(col => {
                  const r = row as Record<string, unknown>;
                  let val = r[col.key];
                  if (col.key === 'gReglaEntel')   val = calcReglaEntel(String(r['gFecha']   ?? ''));
                  if (col.key === 'ffcReglaEntel')  val = calcReglaEntel(String(r['ffcFecha'] ?? ''));
                  return (
                    <td
                      key={col.key}
                      className="px-[11px] py-2 text-t1 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                      dangerouslySetInnerHTML={{ __html: renderCell(val, col.key) }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} onPage={onPage} />
    </div>
  );
}
