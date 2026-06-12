import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-ui font-bold text-[13px] rounded-[7px] transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30 cursor-pointer border-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-cyan text-black hover:opacity-90 active:scale-[.98]',
        green:   'bg-gradient-green text-black hover:opacity-90',
        ghost:   'bg-transparent border border-b2 text-t2 hover:border-fred hover:text-fred',
        outline: 'border border-b2 text-t2 bg-transparent hover:border-cyan hover:text-cyan',
      },
      size: {
        default: 'px-[22px] py-[11px]',
        sm:      'px-[14px] py-[6px] text-[11px] rounded-[6px]',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
