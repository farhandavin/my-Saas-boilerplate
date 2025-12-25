import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// --- 1. USER & AUTH ---
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

// --- 2. TEAMS MANAGEMENT ---

// Ambil semua tim di mana user bergabung
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    },
  });
};

// Hook Baru: Ambil detail SATU tim spesifik (Dibutuhkan halaman Pricing)
export const useTeamQuery = (teamId) => {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${teamId}`);
      return data;
    },
    enabled: !!teamId, // Hanya jalan jika teamId ada
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

export const useJoinTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token) => api.post(`/teams/join/${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error) => {
      console.error("Gagal bergabung ke tim:", error.response?.data || error.message);
    }
  });
};

// --- 3. AI GENERATION & ANALYTICS ---

export const useGenerateAI = () => {
  return useMutation({
    mutationFn: (data) => api.post('/ai/generate', data),
  });
};

// Hook Baru: Ambil riwayat penggunaan untuk grafik (Sesuai Audit Tahap 2)
export const useAIUsageHistory = (teamId) => {
  return useQuery({
    queryKey: ['aiUsageHistory', teamId],
    queryFn: async () => {
      const { data } = await api.get(`/ai/usage-history?teamId=${teamId}`);
      return data;
    },
    enabled: !!teamId
  });
};

// --- 4. BILLING & PAYMENTS ---

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: ({ priceId, teamId }) => api.post('/payments/create-checkout-session', { priceId, teamId }),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Gagal memproses pembayaran.");
    }
  });
};

export const usePortal = () => {
  return useMutation({
    mutationFn: (teamId) => api.post('/payments/create-portal-session', { teamId }),
    onSuccess: (response) => {
      if (response.data.url) window.location.href = response.data.url;
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Gagal membuka portal billing.");
    }
  });
};