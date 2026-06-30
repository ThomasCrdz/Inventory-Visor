import { useState } from 'react';
import type { FilterDef } from '@/types';
import { FilterGroup } from '@/components/visor/FilterGroup';
import { ExpandCollapseAll } from '@/components/shared/ExpandCollapseAll';

interface GenericFilterSidebarProps {
  filterDefs: FilterDef[];
  filterText: Record<string, string>;
  filteredCount: number;
  allCount: number;
  onFilter: (key: string, val: string) => void;
  onClear: () => void;
}

export function GenericFilterSidebar({
  filterDefs, filterText, filteredCount, allCount, onFilter, onClear,
}: GenericFilterSidebarProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenMap(m => ({ ...m, [key]: !m[key] }));
  const expandAll = () => setOpenMap(Object.fromEntries(filterDefs.map(d => [d.key, true])));
  const collapseAll = () => setOpenMap({});
  const allOpen = filterDefs.length > 0 && filterDefs.every(d => openMap[d.key]);

  return (
    <div className="bg-s1 border border-b1 rounded-fleet p-4 sticky top-[72px]">
      <div className="flex justify-between items-center mb-[14px]">
        <span className="text-[11px] font-mono text-t3 uppercase tracking-[1.2px]">Filtros</span>
        <span
          className="text-[12px] text-t3 cursor-pointer hover:text-fred transition-colors duration-150"
          onClick={onClear}
        >
          ✕ Limpiar todo
        </span>
      </div>

      <ExpandCollapseAll allOpen={allOpen} onExpandAll={expandAll} onCollapseAll={collapseAll} />

      {filterDefs.map(def => (
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

      <div className="text-[13px] font-mono text-t2 pt-[10px] border-t border-b1 mt-[6px]">
        {filteredCount === allCount
          ? <>Mostrando <b className="text-cyan">{allCount.toLocaleString()}</b> registros</>
          : <><b className="text-cyan">{filteredCount.toLocaleString()}</b> de {allCount.toLocaleString()} registros</>
        }
      </div>
    </div>
  );
}
