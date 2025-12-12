import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AuthLayout.css'; // Import CSS baru

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Login Berhasil!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login Gagal');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleLogin}>
        <h1 className="a11y-hidden">Login Form</h1>
        
        {/* --- ANIMATED FIGURE --- */}
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

        {/* --- INPUTS --- */}
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

        {/* --- SHOW PASSWORD TOGGLE (Pure CSS Logic) --- */}
        <input type="checkbox" name="show-password" class="show-password a11y-hidden" id="show-password" />
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

        {/* --- SUBMIT --- */}
        <input type="submit" value="Log In" />

        {/* --- LINKS --- */}
        <div className="email-link">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <div className="email-link" style={{marginTop: '5px'}}>
          <Link to="/register">Don't have an account? Sign Up</Link>
        </div>
      </form>
    </div>
  );
}