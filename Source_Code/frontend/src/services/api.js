import axios from 'axios';

// Gunakan Env Variable. Fallback ke localhost jika dev.
// Ambil URL dasar (Root), misal: https://mysaas-api.vercel.app
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Kita tambahkan '/api' di sini secara otomatis
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}); 

// 1. Request Interceptor: Otomatis tempel Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // <--- PASTIKAN INI MENGAMBIL 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // <--- TEMPEL DISINI
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Global Error Handling
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

export default api;