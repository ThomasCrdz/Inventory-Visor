import { useState } from 'react';
import type { FilterDef } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface FilterGroupProps {
  def: FilterDef;
  value: string;
  onChange: (key: string, val: string) => void;
  collapsible?: boolean;
  /** Controlled open state. When provided (with onToggle), parent owns the open/closed state. */
  open?: boolean;
  onToggle?: (key: string) => void;
}

export function FilterGroup({ def, value, onChange, collapsible = false, open, onToggle }: FilterGroupProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = open !== undefined;
  const isOpen = controlled ? open : internalOpen;
  const toggle = () => (controlled ? onToggle?.(def.key) : setInternalOpen(o => !o));
  const active = value.trim().length > 0;

  if (collapsible) {
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center justify-between text-[11px] font-mono text-t3 uppercase tracking-[0.9px] mb-[5px] cursor-pointer hover:text-t2 transition-colors duration-150"
        >
          <span className="flex items-center gap-[6px]">
            {def.icon} {def.label}
            {active && <span className="w-[6px] h-[6px] rounded-full bg-cyan inline-block" />}
          </span>
          <span className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}>›</span>
        </button>
        {isOpen && (
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
