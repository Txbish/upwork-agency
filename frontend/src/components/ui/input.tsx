import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-mist bg-cream px-4 text-[15px] tracking-[-0.006em] text-ink placeholder:text-storm/45 transition-colors duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
          'focus-visible:outline-none focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
