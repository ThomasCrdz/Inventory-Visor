import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[20px] bg-s2 border border-b1 px-3 py-1 font-mono text-[11px] text-t2',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
