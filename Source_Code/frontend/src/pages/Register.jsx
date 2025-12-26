// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
  // 1. State Management: Unified object for cleaner code
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '' // Required to create the initial Team/Workspace
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Hooks
  const { register } = useAuth(); // Uses the centralized AuthContext we discussed earlier
  const navigate = useNavigate();

  // 3. Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call register from AuthContext (handles API URL & Token saving internally)
      await register(
        formData.name, 
        formData.email, 
        formData.password, 
        formData.companyName
      );
      
      // On success, redirect to login
      navigate('/login');
    } catch (err) {
      // Handle errors (e.g., "Email already in use")
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Start Your Journey
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your <span className="font-bold text-indigo-600">BusinessOS</span> workspace in seconds.
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
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="e.g. Elon Musk"
                onChange={handleChange}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Work Email</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="name@company.com"
                onChange={handleChange}
              />
            </div>

            {/* Company Name (New & Critical) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Company / Workspace Name</label>
              <input
                name="companyName"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="e.g. Tesla Corp"
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} /> Creating Workspace...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
          
          {/* Footer Link */}
          <div className="text-center mt-4">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                  Sign in here
                </Link>
              </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;