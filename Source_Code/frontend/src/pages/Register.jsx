// src/pages/Register.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './AuthLayout.css'; 

// --- DEFINISI URL API ---
const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // --- UPDATE URL DISINI ---
      const res = await axios.post(`${api_url}/api/auth/register`, {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Register Gagal");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleRegister}>
        <h1 className="a11y-hidden">Register Form</h1>

        <figure aria-hidden="true">
          <div className="person-body"></div>
          <div className="neck skin"></div>
          <div className="head skin">
            <div className="eyes"></div>
            <div className="mouth"></div>
          </div>
          <div className="hair"></div>
          <div className="ears"></div>
          <div className="shirt-1"></div>
          <div className="shirt-2"></div>
        </figure>

        {/* --- NAME INPUT --- */}
        <div>
          <label>
            <input
              type="text"
              className="text"
              name="name"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="required">Name</span>
          </label>
        </div>

        <div>
          <label className="label-email">
            <input
              type="email"
              className="text"
              name="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="required">Email</span>
          </label>
        </div>

        <input type="checkbox" name="show-password" className="show-password a11y-hidden" id="show-password" />
        <label className="label-show-password" htmlFor="show-password">
          <span>Show Password</span>
        </label>

        <div>
          <label className="label-password">
            <input
              type="text"
              className="text"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="required">Password</span>
          </label>
        </div>

        <input type="submit" value="Sign Up" />

        <div className="email-link">
          <Link to="/login">Already have an account? Log In</Link>
        </div>
      </form>
    </div>
  );
}