import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import api from '@/lib/api';
import type { Task, PaginatedResponse } from '@/types';

interface FindTasksParams {
  page?: number;
  limit?: number;
  projectId?: string;
  assigneeId?: string;
  status?: string;
}

function extractError(error: unknown, fallback: string): string {
  const msg = (error as AxiosError<{ message: string | string[] }>)?.response?.data?.message;
  return Array.isArray(msg) ? msg[0] : msg || fallback;
}

export function useTasks(params: FindTasksParams = {}) {
  return useQuery<PaginatedResponse<Task>>({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
      );
      const res = await api.get('/tasks', { params: filtered });
      return res.data;
    },
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Task> & { projectId: string; title: string }) => {
      const res = await api.post('/tasks', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to create task'));
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data;
    },
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueriesData({ queryKey: ['tasks'] });

      qc.setQueriesData({ queryKey: ['tasks'] }, (old) => applyTaskPatch(old, variables));

      return { previous };
    },
    onError: (error: unknown, _variables, context) => {
      context?.previous?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      toast.error(extractError(error, 'Failed to update task'));
    },
    onSuccess: () => {
      toast.success('Task updated');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

function applyTaskPatch(data: unknown, patch: Partial<Task> & { id: string }): typeof data {
  if (!data) return data;

  if (Array.isArray(data)) {
    return updateTaskList(data, patch);
  }

  if (typeof data === 'object') {
    if (isPaginatedTasks(data)) {
      const next = updateTaskList(data.data, patch);
      if (next === data.data) return data;
      return { ...data, data: next };
    }

    if (isTaskEntity(data) && data.id === patch.id) {
      return { ...data, ...patch } as Task;
    }
  }

  return data;
}

function updateTaskList(list: Task[], patch: Partial<Task> & { id: string }) {
  let changed = false;
  const next = list.map((task) => {
    if (task.id !== patch.id) return task;
    changed = true;
    return { ...task, ...patch };
  });

  return changed ? next : list;
}

function isPaginatedTasks(value: unknown): value is PaginatedResponse<Task> {
  return (
    !!value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as PaginatedResponse<Task>).data)
  );
}

function isTaskEntity(value: unknown): value is Task {
  return !!value && typeof value === 'object' && 'id' in value && 'status' in value;
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assigneeId }: { id: string; assigneeId: string }) => {
      const res = await api.post(`/tasks/${id}/assign`, { assigneeId });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task assigned');
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to assign task'));
    },
  });
}

export function useProjectTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'by-project', projectId],
    queryFn: async () => {
      const res = await api.get(`/tasks/by-project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useAllTasks(params: { assigneeId?: string; projectId?: string } = {}) {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'all', params],
    queryFn: async () => {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
      );
      const res = await api.get('/tasks/all', { params: filtered });
      return res.data;
    },
  });
}
