'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  /** Inverts the colors for use on dark/ink backgrounds. */
  invert?: boolean;
  /** When true, only the mark is rendered (no wordmark). */
  markOnly?: boolean;
}

export function Logo({ size = 40, className, invert = false, markOnly = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/logo.svg"
        alt="AOP"
        width={size}
        height={size}
        priority
        className={cn(
          'block shrink-0 rounded-md',
          invert && '[filter:invert(1)]',
        )}
      />
      {!markOnly && (
        <span
          className={cn(
            'text-[18px] font-medium tracking-tight leading-none',
            invert ? 'text-cream' : 'text-ink',
          )}
        >
          aop.
        </span>
      )}
    </span>
  );
}
