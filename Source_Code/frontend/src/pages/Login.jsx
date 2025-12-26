// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  // 1. State Management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // UX Improvement
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Hooks
  const { login } = useAuth();
  const navigate = useNavigate();

  // 3. Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call centralized login function
      await login(email, password);
      
      // On success, redirect to Dashboard
      // (Token saving is handled inside AuthContext)
      navigate('/dashboard');
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google SSO URL construction
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your <span className="font-bold text-indigo-600">BusinessOS</span>.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input with Toggle */}
            <div className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <img 
                className="h-5 w-5" 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
              />
              Sign in with Google
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                  Create one now
                </Link>
              </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;