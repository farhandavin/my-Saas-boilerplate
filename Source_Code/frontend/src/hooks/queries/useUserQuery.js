import { useQuery } from '@tanstack/react-query';
import api from '../../../../backend/src/services/api';

// Fetch User Profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'], // Unique Key untuk cache
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    retry: 1, // Jika gagal, coba 1x lagi saja
  });
};