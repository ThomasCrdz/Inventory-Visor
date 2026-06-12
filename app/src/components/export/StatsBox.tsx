import type { ProcessStats } from '@/types';

interface StatsBoxProps {
  stats: ProcessStats;
}

const ITEMS = [
  { label: 'Registros',        key: 'total'      as const, colorClass: 'text-cyan' },
  { label: 'Con serial',       key: 'withSerial'  as const, colorClass: 'text-fgreen' },
  { label: 'Con SIM Guardian', key: 'withSim'     as const, colorClass: 'text-famber' },
  { label: 'Con IMEI GPS',     key: 'withGPS'     as const, colorClass: 'text-purple' },
];

export function StatsBox({ stats }: StatsBoxProps) {
  return (
    <div className="flex gap-[10px] flex-wrap mt-4">
      {ITEMS.map(item => (
        <div
          key={item.key}
          className="bg-s2 border border-b1 rounded-[7px] px-4 py-[10px] flex-1 min-w-[110px]"
        >
          <div className={`text-[22px] font-bold font-mono leading-none ${item.colorClass}`}>
            {stats[item.key].toLocaleString()}
          </div>
          <div className="text-[10px] text-t2 mt-[2px]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
