import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Team } from '@/types';

export function useTeams() {
  return useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await api.get('/users/teams');
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // teams rarely change
  });
}
