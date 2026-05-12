'use client';

import { Menu, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuthContext } from '@/components/auth-provider';
import { MobileNav } from './mobile-nav';
import { useState } from 'react';
import { ProfileDialog } from '@/components/layout/profile-dialog';
import { usePathname } from 'next/navigation';
import { navItems } from '@/components/layout/sidebar';

export function TopBar() {
  const { user, fullUser, logout } = useAuthContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const initials = fullUser
    ? `${fullUser.firstName?.[0] ?? ''}${fullUser.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : (user?.email?.[0]?.toUpperCase() ?? 'U');

  const displayName = fullUser
    ? [fullUser.firstName, fullUser.lastName].filter(Boolean).join(' ') || fullUser.email
    : (user?.email ?? 'User');

  const roleName = fullUser?.role?.name ?? user?.role ?? '';

  const currentNav = navItems.find(
    (i) => i.href === pathname || (i.href !== '/' && pathname.startsWith(i.href)),
  );
  const pageLabel = currentNav?.label ?? 'Dashboard';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-mist bg-cream/95 backdrop-blur-sm px-4 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-storm/55">
            Page
          </span>
          <span className="h-3 w-px bg-mist" aria-hidden />
          <h1 className="text-[18px] font-medium leading-none tracking-[-0.012em] text-ink">
            {pageLabel}
          </h1>
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          className="relative text-storm/70 hover:text-ink rounded-full"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative h-10 w-10 rounded-full border border-mist transition-colors hover:border-ink/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
            >
              <Avatar className="h-full w-full border-0">
                <AvatarFallback className="bg-ink text-cream text-[12px] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1 normal-case tracking-normal">
                <p className="text-[14px] font-medium leading-tight text-ink">{displayName}</p>
                <p className="text-[12px] leading-tight text-storm/70 capitalize">
                  {roleName}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-[hsl(var(--destructive))] focus:bg-[hsl(var(--destructive))] focus:text-cream"
            >
              <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
