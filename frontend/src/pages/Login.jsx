import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-12 selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-100/70 via-teal-50/40 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-teal-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Agricultural Texture */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(#059669 1px, transparent 1px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Top Left Home Link */}
      <div className="fixed top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-700 hover:text-emerald-700 bg-white/95 hover:bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs font-semibold backdrop-blur-md transition-all shadow-sm hover:shadow-md hover:border-emerald-200"
        >
          <svg className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/5 border border-emerald-100/80 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-13 h-13 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-md shadow-emerald-500/25">
            🌿
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your AgroGuard management account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl mb-6 text-xs flex items-start gap-2.5">
            <span className="text-sm">⚠️</span>
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">⚡ Demo Quick-Fill</span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">1-Click Auto Fill</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemo('admin@example.com', 'admin123')}
              className="text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">👑</span>
                <span className="text-xs font-bold text-slate-800">Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">admin@example.com</p>
              <p className="text-[9px] text-emerald-700 font-mono mt-0.5">admin123</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('user@example.com', 'user123')}
              className="text-left p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 hover:border-teal-300 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">🌾</span>
                <span className="text-xs font-bold text-slate-800">Farmer</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">user@example.com</p>
              <p className="text-[9px] text-teal-700 font-mono mt-0.5">user123</p>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
