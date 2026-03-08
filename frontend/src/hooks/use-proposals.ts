import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import api from '@/lib/api';
import type { Proposal, PaginatedResponse } from '@/types';

interface FindProposalsParams {
  page?: number;
  limit?: number;
  status?: string;
  agentId?: string;
  nicheId?: string;
}

function extractError(error: unknown, fallback: string): string {
  const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}

export function useProposals(params: FindProposalsParams = {}) {
  return useQuery<PaginatedResponse<Proposal>>({
    queryKey: ['proposals', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
      );
      const res = await api.get('/proposals', { params: filtered });
      return res.data;
    },
  });
}

export function useProposal(id: string) {
  return useQuery<Proposal>({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const res = await api.get(`/proposals/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useProposalStats(agentId?: string) {
  return useQuery({
    queryKey: ['proposals', 'stats', agentId],
    queryFn: async () => {
      const params = agentId ? { agentId } : {};
      const res = await api.get('/proposals/stats', { params });
      return res.data;
    },
  });
}

export function useProposalQueue(nicheId: string) {
  return useQuery<Proposal[]>({
    queryKey: ['proposals', 'queue', nicheId],
    queryFn: async () => {
      const res = await api.get(`/proposals/queue/${nicheId}`);
      return res.data;
    },
    enabled: !!nicheId,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Proposal>) => {
      const res = await api.post('/proposals', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal created');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to create proposal'));
    },
  });
}

export function useUpdateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Proposal> & { id: string }) => {
      const res = await api.patch(`/proposals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal updated');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to update proposal'));
    },
  });
}

export function useUpdateProposalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/proposals/${id}/status`, { status });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['proposals'] });
      const snapshots = qc.getQueriesData<PaginatedResponse<Proposal>>({
        queryKey: ['proposals'],
      });
      qc.setQueriesData<PaginatedResponse<Proposal>>({ queryKey: ['proposals'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p.id === id ? { ...p, status: status as Proposal['status'] } : p,
          ),
        };
      });
      return { snapshots };
    },
    onError: (error: unknown, _vars, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error(extractError(error, 'Failed to update proposal status'));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal status updated');
    },
  });
}

export function useClaimProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const res = await api.post(`/proposals/${proposalId}/claim`);
      return res.data;
    },
    onMutate: async (proposalId) => {
      await qc.cancelQueries({ queryKey: ['proposals', 'queue'] });
      // Snapshot all queue queries for rollback
      const snapshots = qc.getQueriesData<Proposal[]>({ queryKey: ['proposals', 'queue'] });
      // Optimistically remove from queue
      qc.setQueriesData<Proposal[]>({ queryKey: ['proposals', 'queue'] }, (old) => {
        if (!old) return old;
        return old.filter((p) => p.id !== proposalId);
      });
      return { snapshots };
    },
    onError: (error: unknown, _vars, ctx) => {
      if (ctx?.snapshots) {
        ctx.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error(extractError(error, 'Failed to claim proposal'));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal claimed');
    },
  });
}
