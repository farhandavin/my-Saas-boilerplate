// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Cek apakah ada token di localStorage (tanda user sudah login)
  const token = localStorage.getItem('token');

  // Jika tidak ada token, arahkan kembali ke halaman Auth/Login
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Jika ada token, izinkan akses ke halaman Dashboard (children)
  return children;
};

export default PrivateRoute;