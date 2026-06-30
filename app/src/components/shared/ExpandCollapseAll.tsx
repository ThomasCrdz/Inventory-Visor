interface ExpandCollapseAllProps {
  allOpen: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function ExpandCollapseAll({ allOpen, onExpandAll, onCollapseAll }: ExpandCollapseAllProps) {
  return (
    <div className="flex justify-start mb-3 pb-[10px] border-b border-b1">
      <button
        type="button"
        onClick={allOpen ? onCollapseAll : onExpandAll}
        className="text-[10px] font-mono text-t4 uppercase tracking-[0.9px] cursor-pointer hover:text-cyan transition-colors duration-150"
      >
        {allOpen ? '⊟ Contraer' : '⊞ Expandir'}
      </button>
    </div>
  );
}
