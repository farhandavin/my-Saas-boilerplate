// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null); // Konteks Organisasi/Tim saat ini
  const [loading, setLoading] = useState(true);

  // Fungsi Login: Simpan Token & Set State
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const { token, user, team } = res.data;
      
      // Simpan ke storage
      localStorage.setItem('token', token);
      
      // Update state aplikasi
      setUser(user);
      setTeam(team);
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error.response?.data?.message || "Login failed";
    }
  };

  // Fungsi Register: Menerima Company Name juga
  const register = async (name, email, password, companyName) => {
    try {
      await api.post('/auth/register', { name, email, password, companyName });
      // Setelah register sukses, user disuruh login manual (atau auto-login)
      return true;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTeam(null);
    window.location.href = '/auth';
  };

  // "Re-hydrate" Session: Cek token saat halaman di-refresh
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setTeam(res.data.team);
        } catch (error) {
          console.log("Session expired");
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ user, team, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);