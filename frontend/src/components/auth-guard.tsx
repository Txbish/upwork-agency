'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

const PUBLIC_PATHS = ['/login'];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn && !isPublic) {
      router.replace('/login');
    }

    if (isLoggedIn && isPublic) {
      router.replace('/');
    }
  }, [isLoggedIn, isLoading, isPublic, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn && !isPublic) {
    return null;
  }

  if (isLoggedIn && isPublic) {
    return null;
  }

  return <>{children}</>;
}
