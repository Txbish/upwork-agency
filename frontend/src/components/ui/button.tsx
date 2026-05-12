import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Filled ink — primary action
        default: 'rounded-btn bg-ink text-cream hover:bg-storm',
        // Outlined blue — secondary / links to internal flows
        outline:
          'rounded-btn border border-blue bg-transparent text-blue hover:bg-blue/[0.08]',
        // Ghost — quiet text action, no fill at rest
        ghost: 'rounded-btn text-ink hover:bg-ink/[0.06]',
        // Secondary — parchment fill
        secondary:
          'rounded-btn bg-parchment text-ink border border-mist/60 hover:bg-mist/40',
        // Destructive — rare; deep red, ink text
        destructive:
          'rounded-btn bg-destructive text-cream hover:bg-destructive/90',
        // Link — pure text
        link: 'text-blue underline-offset-4 hover:underline',
        // Wash orange — singular brand accent
        wash: 'rounded-btn bg-orange text-ink hover:bg-orange/90',
      },
      size: {
        default: 'h-11 px-6 text-[15px]',
        sm: 'h-9 px-4 text-[14px]',
        lg: 'h-12 px-7 text-[16px]',
        xs: 'h-8 px-3 text-[13px]',
        icon: 'h-10 w-10 rounded-btn',
      },
    },
    defaultVariants: {
      variant: 'default',
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
