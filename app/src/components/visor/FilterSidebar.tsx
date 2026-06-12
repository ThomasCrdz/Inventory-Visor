import type { InventoryRow } from '@/types';
import { FILTER_DEFS } from '@/lib/constants';
import { FilterGroup } from './FilterGroup';

interface FilterSidebarProps {
  filterText: Record<string, string>;
  filtered: InventoryRow[];
  allCount: number;
  onFilter: (key: string, val: string) => void;
  onClear: () => void;
  onChangeFile: (file: File) => void;
}

export function FilterSidebar({
  filterText,
  filtered,
  allCount,
  onFilter,
  onClear,
  onChangeFile,
}: FilterSidebarProps) {
  return (
    <div className="bg-s1 border border-b1 rounded-fleet p-4 sticky top-[72px]">

      {/* Header */}
      <div className="flex justify-between items-center mb-[14px]">
        <span className="text-[9px] font-mono text-t3 uppercase tracking-[1.2px]">
          Filtros
        </span>
        <span
          className="text-[10px] text-t3 cursor-pointer hover:text-fred transition-colors duration-150"
          onClick={onClear}
        >
          ✕ Limpiar todo
        </span>
      </div>

      {/* Filter groups */}
      {FILTER_DEFS.map(def => (
        <FilterGroup
          key={def.key}
          def={def}
          value={filterText[def.key] ?? ''}
          onChange={onFilter}
        />
      ))}

      {/* Result info */}
      <div className="text-[11px] font-mono text-t2 pt-[10px] border-t border-b1 mt-[6px]">
        {filtered.length === allCount
          ? <>Mostrando <b className="text-cyan">{allCount.toLocaleString()}</b> registros</>
          : <><b className="text-cyan">{filtered.length.toLocaleString()}</b> de {allCount.toLocaleString()} registros</>
        }
      </div>

      {/* Change file */}
      <div className="mt-[10px]">
        <label className="flex items-center justify-center gap-[5px] bg-s2 border border-dashed border-b2 rounded-[5px] px-[9px] py-[6px] cursor-pointer text-[11px] text-t2 transition-all duration-200 hover:border-cyan hover:text-cyan">
          📂 Cambiar archivo
          <input
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChangeFile(file);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
