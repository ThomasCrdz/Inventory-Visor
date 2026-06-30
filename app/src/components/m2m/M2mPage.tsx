import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { M2MRow, RawSources } from '@/types';
import { M2M_COLS, M2M_FILTER_DEFS } from '@/lib/constants';
import { useTableFilters } from '@/hooks/useTableFilters';
import { buildM2mRows } from '@/lib/m2mProcessor';
import { exportM2m } from '@/lib/exportXLSX';
import { GenericFilterSidebar } from '@/components/shared/GenericFilterSidebar';
import { GenericDataTable } from '@/components/shared/GenericDataTable';

interface M2mPageProps {
  raw: RawSources;
}

export function M2mPage({ raw }: M2mPageProps) {
  const [allRows, setAllRows] = useState<M2MRow[]>([]);

  useEffect(() => {
    if (raw.sims) {
      const rows = buildM2mRows(raw);
      setAllRows(rows);
    }
  }, [raw]);

  const {
    filterText, filterMap, filtered, pageRows, page, pageSize, totalPages,
    sortCol, sortDir, setFilter, clearFilters, sort, goPage, changePageSize,
  } = useTableFilters(allRows, M2M_FILTER_DEFS, M2M_COLS);

  const handleExport = useCallback(() => {
    exportM2m(filtered, allRows.length, allRows);
    toast.success(`✓ Exportados ${filtered.length.toLocaleString()} registros`);
  }, [filtered, allRows]);

  if (!raw.sims) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="text-[40px] opacity-30">📶</div>
        <div className="text-[16px] text-t2">Sin datos SIMs M2M</div>
        <div className="text-[13px] font-mono text-t3">
          Carga el archivo M2M SIMs en la pestaña Exportar y procesa primero
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">
      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '260px 1fr' }}>
        <GenericFilterSidebar
          filterDefs={M2M_FILTER_DEFS}
          filterText={filterText}
          filteredCount={filtered.length}
          allCount={allRows.length}
          onFilter={setFilter}
          onClear={clearFilters}
        />
        <GenericDataTable
          cols={M2M_COLS}
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
