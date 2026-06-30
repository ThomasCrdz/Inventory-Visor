import { useCallback } from 'react';
import { toast } from 'sonner';
import type { InventoryRow } from '@/types';
import { SCOLS, SFILTER_DEFS } from '@/lib/constants';
import { useTableFilters } from '@/hooks/useTableFilters';
import { exportSimFiltered } from '@/lib/exportXLSX';
import { GenericFilterSidebar } from '@/components/shared/GenericFilterSidebar';
import { GenericDataTable } from '@/components/shared/GenericDataTable';

interface SimPageProps {
  rows: InventoryRow[];
  simsRaw: Record<string, string>[] | null;
}

export function SimPage({ rows, simsRaw }: SimPageProps) {
  const {
    filterText, filterMap, filtered, pageRows, page, pageSize, totalPages,
    sortCol, sortDir, setFilter, clearFilters, sort, goPage, changePageSize,
  } = useTableFilters(rows, SFILTER_DEFS, SCOLS);

  const handleExport = useCallback(() => {
    exportSimFiltered(filtered, rows.length, simsRaw);
    toast.success(`✓ Exportados ${filtered.length.toLocaleString()} registros`);
  }, [filtered, rows.length, simsRaw]);

  if (!rows.length) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col items-center gap-4 text-center">
        <div className="text-[40px] opacity-30">💳</div>
        <div className="text-[16px] text-t2">Sin datos de inventario</div>
        <div className="text-[13px] font-mono text-t3">
          Procesa los archivos en la pestaña Exportar primero
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">
      <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '260px 1fr' }}>
        <GenericFilterSidebar
          filterDefs={SFILTER_DEFS}
          filterText={filterText}
          filteredCount={filtered.length}
          allCount={rows.length}
          onFilter={setFilter}
          onClear={clearFilters}
        />
        <GenericDataTable
          cols={SCOLS}
          filtered={filtered}
          pageRows={pageRows}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          sortCol={sortCol}
          sortDir={sortDir}
          filterMap={filterMap}
          allCount={rows.length}
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
