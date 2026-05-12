import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-lg border border-mist bg-cream px-4 py-3 text-[15px] tracking-[-0.006em] text-ink placeholder:text-storm/45 transition-colors duration-200',
        'focus-visible:outline-none focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/25',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
