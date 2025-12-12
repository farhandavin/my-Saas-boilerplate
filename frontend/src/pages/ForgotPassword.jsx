import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Gagal mengirim email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Lupa Password?</h2>
        {message ? (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4 text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full p-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Kirim Link Reset
            </button>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}