'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Calendar,
  ListChecks,
  ClipboardCheck,
  BarChart3,
  Building2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/auth-provider';
import { OrgSwitcher } from '@/components/layout/org-switcher';
import { Logo } from '@/components/brand/logo';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'lead', 'bidder', 'closer', 'project_manager', 'operator', 'qa'],
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: FolderKanban,
    roles: ['admin', 'lead', 'bidder', 'closer'],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: Briefcase,
    roles: ['admin', 'lead', 'project_manager', 'closer', 'developer'],
  },
  {
    label: 'Meetings',
    href: '/meetings',
    icon: Calendar,
    roles: ['admin', 'lead', 'closer'],
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: ListChecks,
    roles: ['admin', 'project_manager', 'operator', 'qa', 'closer', 'developer'],
  },
  {
    label: 'QA Reviews',
    href: '/qa-reviews',
    icon: ClipboardCheck,
    roles: ['admin', 'qa', 'operator', 'project_manager'],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'lead'],
  },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Building2,
    roles: ['admin'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['admin'],
  },
];

export { navItems };

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const userRole = user?.role?.toLowerCase() ?? '';

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:border-r lg:border-mist bg-cream">
      {/* Wordmark */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Logo size={46} />
        <span className="text-[24px] font-medium tracking-[-0.02em] leading-none text-ink">
          aop.
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-storm/55">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-ink text-cream'
                      : 'text-storm/85 hover:bg-ink/[0.06] hover:text-ink',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-cream' : 'text-storm/65 group-hover:text-ink',
                    )}
                    strokeWidth={1.75}
                  />
                  <span className="tracking-[-0.006em]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <OrgSwitcher />
    </aside>
  );
}
