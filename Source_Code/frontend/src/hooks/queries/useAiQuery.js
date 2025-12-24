import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';

export const useGenerateContent = () => {
  return useMutation({
    /**
     * @param {Object} payload
     * @param {string} payload.templateId - ID template (contoh: 'business-email')
     * @param {Object} payload.inputData - Data form user (contoh: { topic: '...', tone: '...' })
     */
    mutationFn: async ({ templateId, inputData }) => {
      // Mengirim data terstruktur ke backend
      const { data } = await api.post('/ai/generate', { 
        templateId, 
        inputData 
      });
      return data;
    },
    onError: (error) => {
      console.error("AI Generation Failed:", error);
    }
  });
};