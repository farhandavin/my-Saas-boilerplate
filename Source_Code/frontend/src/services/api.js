import axios from 'axios';

// Gunakan Env Variable. Fallback ke localhost jika dev.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Otomatis tempel Token
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

// 2. Response Interceptor: Global Error Handling (misal 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token expired (401), otomatis logout agar user tidak bingung
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth'; // Redirect paksa ke login
    }
    return Promise.reject(error);
  }
);

export default api;