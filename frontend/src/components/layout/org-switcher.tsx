'use client';

import { useMyOrganizations } from '@/hooks/use-organizations';
import { useAuthContext } from '@/components/auth-provider';
import { Building2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function OrgSwitcher() {
  const { activeOrganizationId, switchOrg } = useAuthContext();
  const { data: myOrgs, isLoading } = useMyOrganizations();

  if (isLoading || !myOrgs || myOrgs.length === 0) return null;

  const activeOrg = myOrgs.find((m) => m.organizationId === activeOrganizationId);
  const activeName = activeOrg?.organization?.name ?? 'Select Organization';

  return (
    <div className="border-t border-mist px-4 py-4">
      <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-storm/55 flex items-center gap-1.5">
        <Building2 className="h-3 w-3" strokeWidth={1.75} />
        Organization
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left',
              'border border-mist bg-cream text-[14px] font-medium text-ink',
              'transition-colors duration-200 hover:bg-ink/[0.04]',
            )}
          >
            <span className="truncate tracking-[-0.006em]">{activeName}</span>
            {myOrgs.length > 1 && (
              <ChevronDown
                className="h-4 w-4 text-storm/60 flex-shrink-0 ml-2"
                strokeWidth={1.75}
              />
            )}
          </button>
        </DropdownMenuTrigger>
        {myOrgs.length > 1 && (
          <DropdownMenuContent className="w-[228px]" side="top" align="start">
            {myOrgs.map((membership) => {
              const isActive = membership.organizationId === activeOrganizationId;
              return (
                <DropdownMenuItem
                  key={membership.organizationId}
                  onClick={() =>
                    switchOrg(
                      membership.organizationId,
                      membership.organization?.name ?? membership.organizationId.slice(0, 8),
                    )
                  }
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  <span className="truncate">
                    {membership.organization?.name ?? membership.organizationId.slice(0, 8)}
                  </span>
                  {isActive && <Check className="ml-auto h-4 w-4" strokeWidth={1.75} />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
