'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FunnelMetric {
  stage: string;
  count: number;
  conversionRate: number;
}

interface DashboardAnalytics {
  funnel: FunnelMetric[];
  summary: {
    totalProposals: number;
    totalMeetings: number;
    totalDeals: number;
    totalRevenue: number;
    avgDealSize: number;
    winRate: number;
  };
  recentTrends: {
    period: string;
    proposals: number;
    meetings: number;
    deals: number;
    revenue: number;
  }[];
}

const fallbackData: DashboardAnalytics = {
  funnel: [
    { stage: 'Proposals Sent', count: 2847, conversionRate: 100 },
    { stage: 'Viewed', count: 1982, conversionRate: 69.6 },
    { stage: 'Shortlisted', count: 743, conversionRate: 37.5 },
    { stage: 'Interview', count: 312, conversionRate: 42.0 },
    { stage: 'Won', count: 156, conversionRate: 50.0 },
  ],
  summary: {
    totalProposals: 2847,
    totalMeetings: 312,
    totalDeals: 156,
    totalRevenue: 482300,
    avgDealSize: 3092,
    winRate: 50.0,
  },
  recentTrends: [
    { period: 'Jan', proposals: 210, meetings: 28, deals: 12, revenue: 37100 },
    { period: 'Feb', proposals: 245, meetings: 31, deals: 14, revenue: 43300 },
    { period: 'Mar', proposals: 280, meetings: 35, deals: 18, revenue: 55700 },
    { period: 'Apr', proposals: 260, meetings: 30, deals: 15, revenue: 46400 },
    { period: 'May', proposals: 295, meetings: 38, deals: 20, revenue: 61900 },
    { period: 'Jun', proposals: 310, meetings: 42, deals: 22, revenue: 68100 },
  ],
};

export default function AnalyticsPage() {
  const { data: analytics } = useQuery<DashboardAnalytics>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
    placeholderData: fallbackData,
  });

  const data = analytics || fallbackData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Proposals', value: data.summary.totalProposals.toLocaleString() },
          { label: 'Total Meetings', value: data.summary.totalMeetings.toLocaleString() },
          { label: 'Deals Won', value: data.summary.totalDeals.toLocaleString() },
          { label: 'Revenue', value: `$${data.summary.totalRevenue.toLocaleString()}` },
          { label: 'Avg Deal Size', value: `$${data.summary.avgDealSize.toLocaleString()}` },
          { label: 'Win Rate', value: `${data.summary.winRate}%` },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.funnel.map((stage, index) => {
              const maxCount = data.funnel[0].count;
              const widthPercent = Math.max((stage.count / maxCount) * 100, 8);
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0 text-sm text-muted-foreground text-right">
                    {stage.stage}
                  </div>
                  <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: `hsl(${220 - index * 20}, 70%, ${55 + index * 5}%)`,
                      }}
                    >
                      <span className="text-sm font-medium text-white drop-shadow-sm">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-sm text-muted-foreground text-right">
                    {index === 0 ? '---' : `${stage.conversionRate}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Proposals</TableHead>
                <TableHead>Meetings</TableHead>
                <TableHead>Deals</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentTrends.map((row) => (
                <TableRow key={row.period}>
                  <TableCell className="font-medium">{row.period}</TableCell>
                  <TableCell>{row.proposals}</TableCell>
                  <TableCell>{row.meetings}</TableCell>
                  <TableCell>{row.deals}</TableCell>
                  <TableCell>${row.revenue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Chart visualization placeholder</p>
              <p className="text-muted-foreground text-xs mt-1">Recharts integration pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
