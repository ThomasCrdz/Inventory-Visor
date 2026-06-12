import type { InventoryRow } from '@/types';
import { VCOLS } from '@/lib/constants';
import { esc } from '@/lib/utils';
import { Pager } from './Pager';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableProps {
  filtered: InventoryRow[];
  pageRows: InventoryRow[];
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
}

function hlCell(val: string, colKey: string, terms: string[]): string {
  const v = String(val ?? '');
  if (!v) return '<span style="color:#272f48;font-style:italic">—</span>';

  if (colKey === 'genGuardian') {
    if (!v) return '<span style="color:#272f48;font-style:italic">—</span>';
    const cls = v === 'GEN1' ? 'gen1' : v === 'GEN2' ? 'gen2' : v === 'GEN3' ? 'gen3' : '';
    return `<span class="${cls}">${esc(v)}</span>`;
  }

  for (const t of terms) {
    const idx = v.toLowerCase().indexOf(t);
    if (idx >= 0) {
      return (
        esc(v.slice(0, idx)) +
        `<mark class="hl">${esc(v.slice(idx, idx + t.length))}</mark>` +
        esc(v.slice(idx + t.length))
      );
    }
  }
  return esc(v);
}

const PAGE_SIZES = [25, 50, 100, 200];

export function DataTable({
  filtered, pageRows, page, pageSize, totalPages,
  sortCol, sortDir, filterMap, allCount,
  onSort, onPage, onPageSize, onExport,
}: DataTableProps) {
  if (filtered.length === 0) {
    return (
      <div className="bg-s1 border border-b1 rounded-fleet">
        <div className="flex flex-col items-center py-12 px-5 gap-[10px] text-center">
          <div className="text-[36px] opacity-35">🔍</div>
          <div className="text-[13px] text-t2">
            {allCount > 0 ? 'Sin resultados para estos filtros' : 'Sin datos cargados'}
          </div>
          <div className="text-[10px] font-mono text-t3">
            {allCount > 0 ? 'Ajusta los filtros' : 'Carga un archivo XLSX'}
          </div>
        </div>
      </div>
    );
  }

  const start = (page - 1) * pageSize;
  const end   = Math.min(start + pageSize, filtered.length);

  const termsByCol: Record<string, string[]> = {};
  VCOLS.forEach(c => { termsByCol[c.key] = [...(filterMap[c.key] ?? new Set())]; });

  return (
    <div className="bg-s1 border border-b1 rounded-fleet overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-[14px] py-[10px] bg-s2 border-b border-b1">
        <span className="text-[10px] font-mono text-t2">
          Filas{' '}
          <b className="text-cyan">{start + 1}–{end}</b>
          {' '}de{' '}
          <b className="text-cyan">{filtered.length.toLocaleString()}</b>
        </span>
        <div className="flex items-center gap-2">
          <Button variant="green" size="sm" onClick={onExport}>
            ⬇ Exportar vista ({filtered.length.toLocaleString()})
          </Button>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="bg-s3 border border-b1 text-t2 font-mono text-[10px] px-[7px] py-[3px] rounded-[4px] outline-none cursor-pointer"
          >
            {PAGE_SIZES.map(n => (
              <option key={n} value={n}>{n}/pág</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
        <table className="w-full border-collapse text-[11.5px] font-mono">
          <thead>
            <tr>
              <th className="bg-s3 text-t3 px-[11px] py-2 text-left whitespace-nowrap sticky top-0 z-[2] text-[9px] uppercase tracking-[0.8px] border-b border-b1 w-[32px]">
                #
              </th>
              {VCOLS.map((col, ci) => {
                const isActive = sortCol === ci;
                const indicator = isActive ? (sortDir === 1 ? '↑' : '↓') : '↕';
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(ci)}
                    className={cn(
                      'bg-s3 text-t3 px-[11px] py-2 text-left whitespace-nowrap sticky top-0 z-[2]',
                      'text-[9px] uppercase tracking-[0.8px] border-b border-b1',
                      'cursor-pointer select-none transition-colors duration-150 hover:text-t1',
                    )}
                  >
                    {col.label}
                    <span className={cn('ml-[3px]', isActive ? 'text-cyan' : 'opacity-25')}>
                      {indicator}
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
                <td className="px-2 py-2 text-right text-t4 w-[34px] text-[10px]">
                  {start + li + 1}
                </td>
                {VCOLS.map(col => (
                  <td
                    key={col.key}
                    className="px-[11px] py-2 text-t1 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                    dangerouslySetInnerHTML={{
                      __html: hlCell(row[col.key], col.key, termsByCol[col.key]),
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} onPage={onPage} />
    </div>
  );
}
