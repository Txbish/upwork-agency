'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/auth-provider';
import { OrgSwitcher } from '@/components/layout/org-switcher';
import { navItems } from '@/components/layout/sidebar';
import { Logo } from '@/components/brand/logo';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const userRole = user?.role?.toLowerCase() ?? '';

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex h-16 items-center gap-3 border-b border-mist px-6">
        <Logo size={40} />
        <span className="text-[16px] font-medium text-ink tracking-tight">aop.</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-storm/55">
          Workspace
        </p>
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors',
                isActive
                  ? 'bg-ink text-cream'
                  : 'text-storm/85 hover:bg-ink/[0.06] hover:text-ink',
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <OrgSwitcher />
    </div>
  );
}
