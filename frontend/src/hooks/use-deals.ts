import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import api from '@/lib/api';
import type { Deal, PaginatedResponse } from '@/types';

interface FindDealsParams {
  page?: number;
  limit?: number;
  status?: string;
}

function extractError(error: unknown, fallback: string): string {
  const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}

export function useDeals(params: FindDealsParams = {}) {
  return useQuery<PaginatedResponse<Deal>>({
    queryKey: ['deals', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
      );
      const res = await api.get('/deals', { params: filtered });
      return res.data;
    },
  });
}

export function useDeal(id: string) {
  return useQuery<Deal>({
    queryKey: ['deals', id],
    queryFn: async () => {
      const res = await api.get(`/deals/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: ['deals', 'stats'],
    queryFn: async () => {
      const res = await api.get('/deals/stats');
      return res.data;
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const res = await api.post('/deals', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal created');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to create deal'));
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Deal> & { id: string }) => {
      const res = await api.patch(`/deals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal updated');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to update deal'));
    },
  });
}

export function useCloseDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await api.post(`/deals/${id}/close`, { status, notes });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['deals'] });
      const snapshots = qc.getQueriesData<PaginatedResponse<Deal>>({ queryKey: ['deals'] });
      qc.setQueriesData<PaginatedResponse<Deal>>({ queryKey: ['deals'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((d) => (d.id === id ? { ...d, status: status as Deal['status'] } : d)),
        };
      });
      return { snapshots };
    },
    onError: (error: unknown, _vars, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error(extractError(error, 'Failed to close deal'));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Deal closed');
    },
  });
}
