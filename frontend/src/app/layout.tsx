import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'AOP · Agency Operations',
  description: 'High-contrast operations platform for an Upwork agency.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-cream text-ink antialiased">
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
