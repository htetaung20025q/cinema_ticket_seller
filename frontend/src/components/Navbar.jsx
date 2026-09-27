import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Ticket, User, LogOut, Sparkles, Popcorn, Shield } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cinema-border/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-cinema-red flex items-center justify-center shadow-red-sm group-hover:scale-105 transition-transform duration-300">
              <Popcorn className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                APEX<span className="text-cinema-red">.</span>CINEMA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold -mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cinema-red inline" /> Dolby Atmos & IMAX
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-cinema-red py-2 border-b-2 ${
                isActive('/') ? 'text-cinema-red border-cinema-red font-semibold' : 'text-gray-300 border-transparent'
              }`}
            >
              Movies & Showtimes
            </Link>
            <Link 
              to="/my-tickets" 
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-cinema-red py-2 border-b-2 ${
                isActive('/my-tickets') ? 'text-cinema-red border-cinema-red font-semibold' : 'text-gray-300 border-transparent'
              }`}
            >
              <Ticket className="w-4 h-4 text-cinema-red" />
              My Bookings
            </Link>
            {user && user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-1.5 text-xs uppercase tracking-wider transition-all py-2 px-3.5 rounded-full border ${
                  isActive('/admin') 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'bg-amber-500/10 text-amber-400/90 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* User Status / Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-cinema-card/90 py-1.5 px-4 rounded-full border border-cinema-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cinema-red to-orange-500 flex items-center justify-center font-bold text-white text-xs">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-gray-200 leading-tight">{user.full_name}</p>
                    <p className="text-[10px] text-cinema-red font-medium">VIP Member</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 hover:bg-red-500/10 hover:text-cinema-red rounded-full text-gray-400 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-semibold text-white transition-all duration-300 bg-cinema-red rounded-xl hover:bg-cinema-redGlow shadow-red-sm hover:shadow-red-neon active:scale-95 text-sm"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In / Join
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
