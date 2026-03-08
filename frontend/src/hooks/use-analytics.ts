import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardSummary {
  totalProposals: number;
  totalMeetings: number;
  totalDeals: number;
  totalRevenue: number;
  avgDealSize: number;
  winRate: number;
}

interface FunnelMetric {
  stage: string;
  count: number;
  conversionRate: number;
}

interface FunnelResponse {
  funnel: FunnelMetric[];
}

export function useDashboardAnalytics() {
  return useQuery<{ summary: DashboardSummary; funnel: FunnelMetric[]; recentTrends: unknown[] }>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
  });
}

export function useFunnelAnalytics(startDate?: string, endDate?: string) {
  return useQuery<FunnelResponse>({
    queryKey: ['analytics', 'funnel', startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/analytics/funnel', { params });
      return res.data;
    },
  });
}

export function useAgentAnalytics(agentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'agents', agentId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get(`/analytics/agents/${agentId}`, { params });
      return res.data;
    },
    enabled: !!agentId,
  });
}

export function useTopAgents(limit = 10, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['analytics', 'top-agents', limit, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get('/analytics/top-agents', { params });
      return res.data;
    },
  });
}
