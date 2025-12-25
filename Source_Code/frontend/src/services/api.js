import axios from 'axios';

// 1. Konfigurasi Dasar
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor: Menempelkan Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Interceptor: Menangani Error 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// 4. Ekspor Fungsi Layanan (Services)
// Fungsi-fungsi ini sekarang menggunakan instance 'api' yang sudah terkonfigurasi
export const paymentService = {
  createCheckoutSession: async (teamId, priceId) => {
    const response = await api.post("/payments/create-checkout-session", {
      teamId,
      priceId, // Menggunakan priceId sesuai kebutuhan Stripe
    });
    return response.data;
  },

  getBillingPortal: async (teamId) => {
    const response = await api.post("/payments/create-portal-session", {
      teamId,
    });
    return response.data;
  },
};

export default api;