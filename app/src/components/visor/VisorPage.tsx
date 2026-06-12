import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { InventoryRow } from '@/types';
import { useVisorFilters } from '@/hooks/useVisorFilters';
import { loadVisorFile } from '@/lib/xlsxParser';
import { exportFiltered } from '@/lib/exportXLSX';
import { VisorDropZone } from './VisorDropZone';
import { FilterSidebar } from './FilterSidebar';
import { DataTable } from './DataTable';

interface VisorPageProps {
  initialRows?: InventoryRow[];
  onRecordCountChange?: (n: number) => void;
}

export function VisorPage({ initialRows, onRecordCountChange }: VisorPageProps) {
  const [allRows, setAllRows] = useState<InventoryRow[]>([]);
  const [loaded, setLoaded]   = useState(false);

  const {
    filterText, filterMap, filtered,
    pageRows, page, pageSize, totalPages,
    sortCol, sortDir,
    setFilter, clearFilters, sort, goPage, changePageSize,
  } = useVisorFilters(allRows);

  // Load from Export tab when rows are passed
  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setAllRows(initialRows);
      clearFilters();
      setLoaded(true);
      onRecordCountChange?.(initialRows.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRows]);

  const handleFile = useCallback(async (file: File) => {
    try {
      const rows = await loadVisorFile(file);
      if (!rows.length) { toast.error('No se encontraron datos'); return; }
      setAllRows(rows);
      clearFilters();
      setLoaded(true);
      onRecordCountChange?.(rows.length);
      toast.success(`✓ ${rows.length.toLocaleString()} registros — ${file.name}`);
    } catch (err: unknown) {
      toast.error('Error al leer: ' + (err as Error).message);
    }
  }, [clearFilters, onRecordCountChange]);

  const handleExport = useCallback(() => {
    exportFiltered(filtered, allRows.length);
    toast.success(`✓ Exportados ${filtered.length.toLocaleString()} registros`);
  }, [filtered, allRows.length]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">
      {!loaded ? (
        <VisorDropZone onFile={handleFile} />
      ) : (
        <div
          className="grid gap-4 items-start"
          style={{ gridTemplateColumns: '260px 1fr' }}
        >
          {/* Sidebar */}
          <FilterSidebar
            filterText={filterText}
            filtered={filtered}
            allCount={allRows.length}
            onFilter={setFilter}
            onClear={clearFilters}
            onChangeFile={handleFile}
          />

          {/* Table */}
          <DataTable
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
          />
        </div>
      )}
    </div>
  );
}
