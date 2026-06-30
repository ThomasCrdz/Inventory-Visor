import { useState } from 'react';
import type { InventoryRow } from '@/types';
import { FILTER_DEFS } from '@/lib/constants';
import { FilterGroup } from './FilterGroup';
import { ExpandCollapseAll } from '@/components/shared/ExpandCollapseAll';

interface FilterSidebarProps {
  filterText: Record<string, string>;
  filtered: InventoryRow[];
  allCount: number;
  onFilter: (key: string, val: string) => void;
  onClear: () => void;
}

export function FilterSidebar({
  filterText,
  filtered,
  allCount,
  onFilter,
  onClear,
}: FilterSidebarProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenMap(m => ({ ...m, [key]: !m[key] }));
  const expandAll = () => setOpenMap(Object.fromEntries(FILTER_DEFS.map(d => [d.key, true])));
  const collapseAll = () => setOpenMap({});
  const allOpen = FILTER_DEFS.length > 0 && FILTER_DEFS.every(d => openMap[d.key]);

  return (
    <div className="bg-s1 border border-b1 rounded-fleet p-4 sticky top-[72px]">

      {/* Header */}
      <div className="flex justify-between items-center mb-[14px]">
        <span className="text-[11px] font-mono text-t3 uppercase tracking-[1.2px]">
          Filtros
        </span>
        <span
          className="text-[12px] text-t3 cursor-pointer hover:text-fred transition-colors duration-150"
          onClick={onClear}
        >
          ✕ Limpiar todo
        </span>
      </div>

      <ExpandCollapseAll allOpen={allOpen} onExpandAll={expandAll} onCollapseAll={collapseAll} />

      {/* Filter groups */}
      {FILTER_DEFS.map(def => (
        <FilterGroup
          key={def.key}
          def={def}
          value={filterText[def.key] ?? ''}
          onChange={onFilter}
          collapsible
          open={openMap[def.key] ?? false}
          onToggle={toggle}
        />
      ))}

      {/* Result info */}
      <div className="text-[13px] font-mono text-t2 pt-[10px] border-t border-b1 mt-[6px]">
        {filtered.length === allCount
          ? <>Mostrando <b className="text-cyan">{allCount.toLocaleString()}</b> registros</>
          : <><b className="text-cyan">{filtered.length.toLocaleString()}</b> de {allCount.toLocaleString()} registros</>
        }
      </div>
    </div>
  );
}
