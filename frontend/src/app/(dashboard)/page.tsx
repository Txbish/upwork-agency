'use client';

import Link from 'next/link';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    label: 'Total Proposals',
    value: '2,847',
    change: '+12.5%',
    trend: 'up' as const,
    href: '/proposals',
  },
  {
    label: 'Active Meetings',
    value: '38',
    change: '+4.2%',
    trend: 'up' as const,
    href: '/meetings',
  },
  { label: 'Won Deals', value: '156', change: '+8.1%', trend: 'up' as const, href: '/deals' },
  {
    label: 'Revenue',
    value: '$482,300',
    change: '+22.4%',
    trend: 'up' as const,
    href: '/analytics',
  },
];

const recentActivity = [
  { action: 'Proposal submitted', target: 'React Dashboard Project', time: '2 hours ago' },
  { action: 'Meeting completed', target: 'Client onboarding call', time: '4 hours ago' },
  { action: 'Deal won', target: 'E-commerce Platform Redesign', time: '1 day ago' },
  { action: 'Task completed', target: 'API integration review', time: '1 day ago' },
  { action: 'New proposal', target: 'Mobile App Development', time: '2 days ago' },
];

export default function DashboardPage() {
  const { user, fullUser } = useAuthContext();

  const displayName = fullUser
    ? [fullUser.firstName, fullUser.lastName].filter(Boolean).join(' ') || fullUser.email
    : (user?.email ?? 'User');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {displayName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <Badge
                    variant={stat.trend === 'up' ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <span className="text-sm font-medium">{activity.action}</span>
                  <span className="text-sm text-muted-foreground"> — {activity.target}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
