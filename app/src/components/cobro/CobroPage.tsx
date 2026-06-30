import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { CobroRow, M2MRow } from '@/types';
import { COBRO_COLS, COBRO_FILTER_DEFS } from '@/lib/constants';
import { useTableFilters } from '@/hooks/useTableFilters';
import { buildCobroRows } from '@/lib/m2mProcessor';
import { exportCobro } from '@/lib/exportXLSX';
import { loadCobroFile } from '@/lib/xlsxParser';
import { GenericFilterSidebar } from '@/components/shared/GenericFilterSidebar';
import { GenericDataTable } from '@/components/shared/GenericDataTable';

interface CobroPageProps {
  m2mRows: M2MRow[];
}

export function CobroPage({ m2mRows }: CobroPageProps) {
  const [allRows, setAllRows] = useState<CobroRow[]>([]);
  const [fileName, setFileName] = useState('');

  const {
    filterText, filterMap, filtered, pageRows, page, pageSize, totalPages,
    sortCol, sortDir, setFilter, clearFilters, sort, goPage, changePageSize,
  } = useTableFilters(allRows, COBRO_FILTER_DEFS, COBRO_COLS);

  const handleFile = useCallback(async (file: File) => {
    try {
      const { hdrs, rows } = await loadCobroFile(file);
      const built = buildCobroRows(hdrs, rows as Record<string, string>[], m2mRows);
      setAllRows(built);
      setFileName(file.name);
      clearFilters();
      toast.success(`✓ ${built.length.toLocaleString()} registros — ${file.name}`);
    } catch (err: unknown) {
      toast.error('Error al leer: ' + (err as Error).message);
    }
  }, [m2mRows, clearFilters]);

  const handleExport = useCallback(() => {
    exportCobro(filtered, allRows.length);
    toast.success(`✓ Exportados ${filtered.length.toLocaleString()} registros`);
  }, [filtered, allRows.length]);

  if (!allRows.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="text-[40px] opacity-30">💰</div>
        <div className="text-[16px] text-t2">Sin datos de cobro</div>
        <div className="text-[13px] font-mono text-t3 mb-4">
          Carga el archivo Excel de Cobro (hoja "Detalle")
        </div>
        <label className="flex items-center gap-[8px] bg-s1 border border-dashed border-b2 rounded-fleet px-5 py-3 cursor-pointer text-[14px] text-t2 hover:border-cyan hover:text-cyan transition-all duration-200">
          📂 Seleccionar archivo Excel de Cobro
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </label>
        {!m2mRows.length && (
          <div className="text-[12px] font-mono text-t3 mt-2 opacity-70">
            ⚠ Sin datos M2M cargados — los cruces de dispositivo estarán vacíos
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">

      {/* Header bar with current file + change */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[12px] font-mono text-t3">📄 {fileName}</span>
        <label className="flex items-center gap-[5px] bg-s1 border border-dashed border-b2 rounded-[5px] px-[9px] py-[4px] cursor-pointer text-[12px] text-t2 hover:border-cyan hover:text-cyan transition-all">
          📂 Cambiar archivo
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </label>
      </div>

      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '260px 1fr' }}>
        <GenericFilterSidebar
          filterDefs={COBRO_FILTER_DEFS}
          filterText={filterText}
          filteredCount={filtered.length}
          allCount={allRows.length}
          onFilter={setFilter}
          onClear={clearFilters}
        />
        <GenericDataTable
          cols={COBRO_COLS}
          filtered={filtered}
          pageRows={pageRows}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          sortCol={sortCol}
          sortDir={sortDir}
          filterMap={filterMap}
          allCount={allRows.length}
          onSort={sort}
          onPage={goPage}
          onPageSize={changePageSize}
          onExport={handleExport}
          exportLabel={`Exportar XLSX (${filtered.length.toLocaleString()})`}
        />
      </div>
    </div>
  );
}
