import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-badge px-3 py-1 text-[13px] font-medium leading-none tracking-[0.01em] transition-colors',
  {
    variants: {
      variant: {
        // Translucent cream chip — the canonical (dot)connect status badge
        default: 'bg-cream/80 text-storm border border-mist/60',
        // Filled ink — sharp, used for primary-state callouts
        solid: 'bg-ink text-cream',
        // Outline — empty chip
        outline: 'bg-transparent text-ink border border-ink/30',
        // Parchment — neutral quiet chip (alias of legacy "secondary")
        secondary: 'bg-parchment text-storm border border-mist/60',
        // Operational state colors
        success: 'bg-cream/80 text-[hsl(var(--success))] border border-[hsl(var(--success))]/35',
        warning: 'bg-cream/80 text-ink border border-orange/60',
        destructive: 'bg-cream/80 text-[hsl(var(--destructive))] border border-[hsl(var(--destructive))]/40',
        info: 'bg-cream/80 text-blue border border-blue/35',
        // Orange wash — singular emphasis. Rare.
        wash: 'bg-orange text-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
