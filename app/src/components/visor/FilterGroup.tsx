import { useState } from 'react';
import type { FilterDef } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface FilterGroupProps {
  def: FilterDef;
  value: string;
  onChange: (key: string, val: string) => void;
  collapsible?: boolean;
}

export function FilterGroup({ def, value, onChange, collapsible = false }: FilterGroupProps) {
  const [open, setOpen] = useState(false);
  const active = value.trim().length > 0;

  if (collapsible) {
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between text-[11px] font-mono text-t3 uppercase tracking-[0.9px] mb-[5px] cursor-pointer hover:text-t2 transition-colors duration-150"
        >
          <span className="flex items-center gap-[6px]">
            {def.icon} {def.label}
            {active && <span className="w-[6px] h-[6px] rounded-full bg-cyan inline-block" />}
          </span>
          <span className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}>›</span>
        </button>
        {open && (
          <>
            <Textarea
              value={value}
              rows={2}
              onChange={(e) => onChange(def.key, e.target.value)}
            />
            <div className="text-[11px] text-t4 font-mono mt-[3px]">
              Pega varios valores, uno por línea o separados por comas
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="text-[11px] font-mono text-t3 uppercase tracking-[0.9px] mb-[5px]">
        {def.icon} {def.label}
      </div>
      <Textarea
        value={value}
        placeholder={def.ph}
        rows={2}
        onChange={(e) => onChange(def.key, e.target.value)}
      />
      <div className="text-[11px] text-t4 font-mono mt-[3px]">
        Pega varios valores, uno por línea o separados por comas
      </div>
    </div>
  );
}
