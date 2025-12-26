// frontend/src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Removed unused useAuth import to prevent linter warnings
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// --- COMPONENTS ---
import PrivateRoute from "./components/PrivateRoute";

// --- PAGES (PUBLIC) ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword"; // Uncomment when file exists
// import JoinTeam from "./pages/JoinTeam";           // Uncomment when file exists

// --- PAGES (PROTECTED) ---
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";    // <--- New Page for RAG
// import Pricing from "./pages/Pricing";             // Uncomment when file exists

// --- HELPER: GOOGLE AUTH CALLBACK HANDLER ---
// Captures the token from URL: /auth/success?token=xyz
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Manually save token 
      // Note: Ideally, use a context helper like loginWithToken() if available
      localStorage.setItem("token", token);
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Completing secure sign-in...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      {/* Toaster for Notifications (Success/Error alerts) */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Router>
        <Routes>
          {/* =========================================
              1. PUBLIC ROUTES
             ========================================= */}
          
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Google SSO Callback Route */}
          <Route path="/auth/success" element={<AuthCallback />} />

          {/* Password Recovery (Placeholder) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Team Invitation Handling (Placeholder) */}
          {/* <Route path="/join/:token" element={<JoinTeam />} /> */}

          {/* =========================================
              2. PROTECTED ROUTES (Requires Login)
             ========================================= */}
          
          {/* Dashboard Area */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Knowledge Base (RAG Management) - NEW */}
          <Route
            path="/knowledge-base"
            element={
              <PrivateRoute>
                <KnowledgeBase />
              </PrivateRoute>
            }
          />

          {/* Pricing / Billing Page (Placeholder) */}
          {/* <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          /> 
          */}

          {/* =========================================
              3. FALLBACK (404)
             ========================================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;