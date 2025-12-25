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
    // Perubahan: Menerima objek { priceId, teamId }
    mutationFn: ({ priceId, teamId }) => api.post('/payments/create-checkout-session', { priceId, teamId }),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
    onError: (error) => {
      console.error("Checkout Failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Gagal memproses pembayaran.");
    }
  });
};

export const usePortal = () => {
  return useMutation({
    // Perubahan: Menerima teamId agar server tahu portal tim mana yang dibuka
    mutationFn: (teamId) => api.post('/payments/create-portal-session', { teamId }),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Gagal membuka portal billing.");
    }
  });
};