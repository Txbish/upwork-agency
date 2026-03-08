import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import api from '@/lib/api';
import type { QAReview, PaginatedResponse } from '@/types';

interface FindQAReviewsParams {
  page?: number;
  limit?: number;
  reviewerId?: string;
  status?: string;
}

export function useQAReviews(params: FindQAReviewsParams = {}) {
  return useQuery<PaginatedResponse<QAReview>>({
    queryKey: ['qa-reviews', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
      );
      const res = await api.get('/qa-reviews', { params: filtered });
      return res.data;
    },
  });
}

export function useQAReview(id: string) {
  return useQuery<QAReview>({
    queryKey: ['qa-reviews', id],
    queryFn: async () => {
      const res = await api.get(`/qa-reviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useQAReviewByTask(taskId: string) {
  return useQuery<QAReview>({
    queryKey: ['qa-reviews', 'task', taskId],
    queryFn: async () => {
      const res = await api.get(`/qa-reviews/task/${taskId}`);
      return res.data;
    },
    enabled: !!taskId,
  });
}

export function useCreateQAReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      reviewerId: string;
      status?: string;
      score?: number;
      comments?: string;
    }) => {
      const res = await api.post('/qa-reviews', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa-reviews'] });
      toast.success('QA review created');
    },
    onError: (error: unknown) => {
      const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create QA review');
    },
  });
}

export function useUpdateQAReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      status?: string;
      score?: number;
      comments?: string;
    }) => {
      const res = await api.patch(`/qa-reviews/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['qa-reviews'] });
      toast.success('QA review updated');
    },
    onError: (error: unknown) => {
      const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to update QA review');
    },
  });
}
