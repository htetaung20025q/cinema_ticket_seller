import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import OrderHistory from './pages/OrderHistory';
import LoginRegister from './pages/LoginRegister';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Check if patron user is persisted in localStorage
    const savedUser = localStorage.getItem('cinema_user');
    const token = localStorage.getItem('cinema_jwt_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cinema_user');
        localStorage.removeItem('cinema_jwt_token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cinema_user');
    localStorage.removeItem('cinema_jwt_token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cinema-bg text-gray-100 font-sans">
        
        {/* Persistent glassmorphic Navigation Header */}
        <Navbar 
          user={user} 
          onOpenAuth={() => setIsAuthOpen(true)} 
          onLogout={handleLogout} 
        />

        {/* Main interactive routing engine */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:id" element={<MovieDetails user={user} onOpenAuth={() => setIsAuthOpen(true)} />} />
            <Route path="/my-tickets" element={<OrderHistory user={user} onOpenAuth={() => setIsAuthOpen(true)} />} />
            <Route path="/admin" element={<AdminDashboard user={user} onOpenAuth={() => setIsAuthOpen(true)} />} />
          </Routes>
        </main>

        {/* Auth Dialog */}
        <LoginRegister 
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
        />

        {/* Cinematic Footer */}
        <footer className="bg-cinema-card border-t border-cinema-border py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500">
            <div>
              <p className="font-extrabold text-white tracking-wider">APEX CINEMA ENTERTAINMENT SYSTEM</p>
              <p className="mt-1">&copy; 2026 Apex Cinema. Powered by Dolby Atmos, IMAX & Real-time Concurrency Control.</p>
            </div>
            <div className="flex items-center gap-6 font-medium text-gray-400">
              <span className="hover:text-cinema-red cursor-pointer transition-colors">Privacy & Double-Booking Protection</span>
              <span className="hover:text-cinema-red cursor-pointer transition-colors">Auditorium Rules</span>
              <span className="hover:text-cinema-red cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}
