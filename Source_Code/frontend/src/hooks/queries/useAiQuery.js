import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';

export const useGenerateContent = () => {
  return useMutation({
    mutationFn: async (prompt) => {
      const { data } = await api.post('/ai/generate', { prompt });
      return data;
    },
  });
};