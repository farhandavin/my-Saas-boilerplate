import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../backend/src/services/api';

export const useBillingMutation = () => {
  const queryClient = useQueryClient();

  // 1. Create Checkout Session
  const createCheckout = useMutation({
    mutationFn: async ({ priceId, userId }) => {
      const { data } = await api.post('/payments/create-checkout-session', { priceId, userId });
      return data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url; // Redirect ke Stripe
    },
  });

  // 2. Cancel Subscription
  const cancelSubscription = useMutation({
    mutationFn: async ({ userId }) => {
      const { data } = await api.post('/payments/cancel-subscription', { userId });
      return data;
    },
    onSuccess: () => {
      // Refresh data user setelah cancel agar UI berubah (misal tombol jadi "Resume")
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      alert("Langganan berhasil dibatalkan.");
    },
  });

  // 3. Resume Subscription
  const resumeSubscription = useMutation({
    mutationFn: async ({ userId }) => {
      const { data } = await api.post('/payments/resume-subscription', { userId });
      return data;
    },
    onSuccess: () => {
      // Refresh data user
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      alert("Langganan berhasil diaktifkan kembali!");
    },
  });

  return { createCheckout, cancelSubscription, resumeSubscription };
};