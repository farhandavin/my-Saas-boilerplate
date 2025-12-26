import axios from 'axios';

// 1. BASE CONFIGURATION
// Ensure this matches your backend port (usually 5001 based on previous steps)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. REQUEST INTERCEPTOR (Attach Token)
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

// 3. RESPONSE INTERCEPTOR (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A. Handle Token Expired (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to the specific login route we defined in App.jsx
      window.location.href = '/login'; 
    }

    // B. Handle Quota/Billing Issue (402 Payment Required)
    if (error.response && error.response.status === 402) {
      alert("⚠️ Team Quota Exceeded! Please upgrade your plan to continue.");
      window.location.href = '/pricing'; // Redirect to billing page
    }

    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------
// 4. SERVICE EXPORTS
// ------------------------------------------------------------------

// A. PAYMENT SERVICES
export const paymentService = {
  createCheckoutSession: async (teamId, priceId) => {
    const response = await api.post("/payments/create-checkout-session", {
      teamId,
      priceId,
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

// B. AI & DOCUMENT SERVICES
export const aiService = {
  // Uploads PDF/TXT for RAG context
  uploadDocument: async (teamId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('teamId', teamId); // Ensure backend knows which team owns this doc

    return await api.post('/ai/upload-doc', formData, {
      headers: {
        // Axios will automatically set the correct boundary for multipart/form-data
        'Content-Type': 'multipart/form-data', 
      },
    });
  },

  // Generic AI Generation
  generate: async (payload) => {
    // payload = { teamId, templateId, inputData }
    const response = await api.post('/ai/generate', payload);
    return response.data;
  }
};

export default api;