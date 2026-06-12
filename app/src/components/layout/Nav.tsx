import type { Tab } from '@/types';
import { Badge } from '@/components/ui/badge';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  recordCount: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'export', label: '📥 Exportar' },
  { id: 'visor',  label: '🔍 Visor' },
];

export function Nav({ activeTab, onTabChange, recordCount }: NavProps) {
  return (
    <nav className="sticky top-0 z-[60] bg-[rgba(9,10,15,0.92)] backdrop-blur-[14px] border-b border-b1">
      <div className="max-w-[1400px] mx-auto flex items-center gap-0 px-6">

        {/* Logo */}
        <div className="flex items-center gap-[9px] py-[14px] mr-6 shrink-0">
          <div className="w-[30px] h-[30px] rounded-[6px] bg-gradient-to-br from-cyan to-purple grid place-items-center text-[14px]">
            ⚡
          </div>
          <span className="text-[14px] font-bold tracking-[-0.3px]">
            Fleet <span className="text-cyan">Inventory</span>
          </span>
        </div>

        {/* Tabs */}
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'px-5 py-4 text-[12px] font-semibold tracking-[0.3px] cursor-pointer',
              'border-b-2 border-transparent transition-all duration-200',
              'bg-transparent whitespace-nowrap select-none',
              activeTab === tab.id
                ? 'text-cyan border-cyan'
                : 'text-t3 hover:text-t1',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}

        {/* Right side badge */}
        {recordCount > 0 && (
          <div className="ml-auto">
            <Badge>
              <b className="text-cyan mr-1">{recordCount.toLocaleString()}</b>
              registros
            </Badge>
          </div>
        )}
      </div>
    </nav>
  );
}
