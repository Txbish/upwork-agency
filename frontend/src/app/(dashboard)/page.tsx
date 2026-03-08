'use client';

import Link from 'next/link';
import { useAuthContext } from '@/components/auth-provider';
import { useDashboardAnalytics } from '@/hooks/use-analytics';
import { useProposalStats } from '@/hooks/use-proposals';
import { useDealStats } from '@/hooks/use-deals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, DollarSign, TrendingUp, Layers, ListChecks } from 'lucide-react';

export default function DashboardPage() {
  const { user, fullUser } = useAuthContext();
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics();
  const { data: proposalStats } = useProposalStats();
  const { data: dealStats } = useDealStats();

  const displayName = fullUser
    ? [fullUser.firstName, fullUser.lastName].filter(Boolean).join(' ') || fullUser.email
    : (user?.email ?? 'User');

  const role = user?.role?.toLowerCase() ?? '';

  const summary = analytics?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {displayName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/proposals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription>Total Proposals</CardDescription>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <span className="text-2xl font-bold">
                  {summary?.totalProposals?.toLocaleString() ?? '0'}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/meetings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription>Total Meetings</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <span className="text-2xl font-bold">
                  {summary?.totalMeetings?.toLocaleString() ?? '0'}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/deals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription>Deals Won</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {summary?.totalDeals?.toLocaleString() ?? '0'}
                  </span>
                  {summary?.winRate != null && (
                    <Badge variant="success" className="text-xs">
                      {summary.winRate}% win
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardDescription>Revenue</CardDescription>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <span className="text-2xl font-bold">
                  ${summary?.totalRevenue?.toLocaleString() ?? '0'}
                </span>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      {proposalStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proposal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {Object.entries(proposalStats as Record<string, number>).map(([status, count]) => (
                <div key={status} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase">
                    {status.replace(/_/g, ' ')}
                  </p>
                  <p className="text-lg font-semibold mt-1">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'closer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link
                href="/queue"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                <Layers className="h-4 w-4" />
                Browse Niche Queue
              </Link>
              <Link
                href="/meetings"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent text-sm font-medium"
              >
                <Calendar className="h-4 w-4" />
                My Meetings
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {role === 'developer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link
                href="/tasks"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                <ListChecks className="h-4 w-4" />
                My Tasks
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {dealStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Negotiating</p>
                <p className="text-xl font-semibold mt-1">{dealStats.negotiating ?? 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Won</p>
                <p className="text-xl font-semibold text-green-600 mt-1">{dealStats.won ?? 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Lost</p>
                <p className="text-xl font-semibold text-red-600 mt-1">{dealStats.lost ?? 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Total Value</p>
                <p className="text-xl font-semibold mt-1">
                  ${(dealStats.totalValue ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
