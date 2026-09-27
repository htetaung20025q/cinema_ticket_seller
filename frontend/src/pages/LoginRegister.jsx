import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus, Sparkles, X, AlertCircle, Shield } from 'lucide-react';
import client from '../api/client';

export default function LoginRegister({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const response = await client.post('/api/auth/register', {
          email,
          password,
          full_name: fullName
        });
        localStorage.setItem('cinema_jwt_token', response.data.access_token);
        localStorage.setItem('cinema_user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        onClose();
      } else {
        const response = await client.post('/api/auth/login', {
          email,
          password
        });
        localStorage.setItem('cinema_jwt_token', response.data.access_token);
        localStorage.setItem('cinema_user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@cinevibe.com");
    setPassword("password123");
    setIsRegister(false);
  };

  const fillDemoAdminCredentials = () => {
    setEmail("admin@cinevibe.com");
    setPassword("admin123");
    setIsRegister(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-cinema-card rounded-3xl border border-cinema-border p-8 shadow-screen-glow overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cinema-red/20 rounded-full filter blur-3xl -z-0 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-cinema-hover text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-cinema-red flex items-center justify-center text-white mb-6 shadow-red-sm">
            {isRegister ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-wide">
            {isRegister ? "Join Apex Cinema Club" : "Welcome Back Patron"}
          </h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            {isRegister ? "Unlock priority seat reservations & Dolby digital tickets." : "Sign in to access your digital order history and quick checkout."}
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-cinema-red flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="Alex Mercer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cinema-red transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  placeholder="name@cinevibe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cinema-red transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  min="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cinema-red transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cinema-red hover:bg-cinema-redGlow text-white font-extrabold text-sm rounded-xl transition-all shadow-red-sm hover:shadow-red-neon active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : (isRegister ? "Create Account" : "Sign In & Reserve")}
            </button>
          </form>

          {!isRegister && (
            <div className="mt-4 pt-4 border-t border-cinema-border/60 text-center space-y-2.5">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs font-semibold text-cinema-red hover:underline flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Use Instant Demo Patron Account
              </button>
              <button
                type="button"
                onClick={fillDemoAdminCredentials}
                className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 hover:border-amber-500/60 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Use Instant Demo Admin Account (RBAC)
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            {isRegister ? "Already hold a VIP pass?" : "New to Apex Cinema?"}{" "}
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-white font-extrabold hover:text-cinema-red transition-colors ml-1"
            >
              {isRegister ? "Sign In" : "Register Now"}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
