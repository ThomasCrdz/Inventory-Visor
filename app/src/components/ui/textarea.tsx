import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'w-full bg-s2 border border-b1 rounded-[6px] px-[9px] py-[7px]',
        'text-t1 font-mono text-[11px] leading-relaxed',
        'resize-y min-h-[52px] max-h-[140px]',
        'outline-none transition-colors duration-200',
        'placeholder:text-t4 focus:border-cyan',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
