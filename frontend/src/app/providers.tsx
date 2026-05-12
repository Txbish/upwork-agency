'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            style: {
              background: 'hsl(var(--ink))',
              color: 'hsl(var(--cream))',
              border: 'none',
              borderRadius: '12px',
              fontFamily: '"Aeonik Pro Regular", system-ui, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
