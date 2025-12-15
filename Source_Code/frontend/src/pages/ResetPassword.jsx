import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const { token } = useParams(); // Ambil token dari URL
  const navigate = useNavigate();
  const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${api_url}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });
      alert("Password berhasil diubah! Silakan login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Token expired atau salah");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Buat Password Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Simpan Password
          </button>
        </form>
      </div>
    </div>
  );
}