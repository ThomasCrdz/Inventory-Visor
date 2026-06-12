import type { FilterDef } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface FilterGroupProps {
  def: FilterDef;
  value: string;
  onChange: (key: string, val: string) => void;
}

export function FilterGroup({ def, value, onChange }: FilterGroupProps) {
  return (
    <div className="mb-3">
      <div className="text-[9px] font-mono text-t3 uppercase tracking-[0.9px] mb-[5px]">
        {def.icon} {def.label}
      </div>
      <Textarea
        value={value}
        placeholder={def.ph}
        rows={2}
        onChange={(e) => onChange(def.key, e.target.value)}
      />
      <div className="text-[9px] text-t4 font-mono mt-[3px]">
        Pega varios valores, uno por línea o separados por comas
      </div>
    </div>
  );
}
