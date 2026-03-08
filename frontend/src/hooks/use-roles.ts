import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Role } from '@/types';

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/users/roles');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // roles rarely change
  });
}
