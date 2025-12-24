import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// --- USER & AUTH ---
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    retry: 1,
  });
};

// --- TEAMS ---
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name) => api.post('/teams/create', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useInviteMember = () => {
  return useMutation({
    mutationFn: (data) => api.post('/teams/invite', data),
  });
};

// --- AI GENERATION ---
export const useGenerateAI = () => {
  return useMutation({
    mutationFn: (data) => api.post('/ai/generate', data),
  });
};

// --- BILLING ---
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (priceId) => api.post('/payments/create-checkout-session', { priceId }),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
  });
};

export const usePortal = () => {
  return useMutation({
    mutationFn: () => api.post('/payments/create-portal-session'),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
  });
};