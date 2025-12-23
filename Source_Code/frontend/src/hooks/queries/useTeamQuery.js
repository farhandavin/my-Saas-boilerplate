import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// Fetch Teams
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    },
  });
};

// Mutation: Create Team
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamName) => {
      const { data } = await api.post('/teams/create', { name: teamName });
      return data;
    },
    // Setelah sukses, otomatis refresh data 'teams' tanpa reload halaman!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};