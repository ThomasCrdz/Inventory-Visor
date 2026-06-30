import { cn } from '@/lib/utils';

interface PagerProps {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

function buildPages(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const l = Math.max(1, page - 2);
  const r = Math.min(total, page + 2);
  const nums: (number | '…')[] = [];
  if (l > 1) nums.push(1, '…');
  for (let i = l; i <= r; i++) nums.push(i);
  if (r < total) nums.push('…', total);
  return nums;
}

const PgBtn = ({
  label, onClick, disabled, active,
}: { label: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'bg-s3 border border-b1 text-t2 font-mono text-[12px] px-[9px] py-1 rounded-[4px]',
      'cursor-pointer transition-all duration-150',
      !disabled && 'hover:border-cyan hover:text-cyan',
      disabled && 'opacity-30 cursor-default',
      active && 'bg-cyan/[0.12] border-cyan text-cyan',
    )}
  >
    {label}
  </button>
);

export function Pager({ page, totalPages, onPage }: PagerProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <div className="flex items-center gap-[6px] px-[14px] py-[10px] bg-s2 border-t border-b1 flex-wrap">
      <PgBtn label="«" onClick={() => onPage(1)}           disabled={page === 1} />
      <PgBtn label="‹" onClick={() => onPage(page - 1)}   disabled={page === 1} />
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`sep-${i}`} className="text-t4 text-[13px]">…</span>
          : <PgBtn key={p} label={p} onClick={() => onPage(p as number)} active={p === page} />
      )}
      <PgBtn label="›" onClick={() => onPage(page + 1)}   disabled={page === totalPages} />
      <PgBtn label="»" onClick={() => onPage(totalPages)} disabled={page === totalPages} />
      <span className="text-[12px] font-mono text-t3 ml-auto">
        Pág {page}/{totalPages}
      </span>
    </div>
  );
}
