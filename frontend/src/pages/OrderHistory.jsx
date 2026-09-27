import React, { useState, useEffect } from 'react';
import { Ticket, Clock, MapPin, QrCode, ArrowRight, Loader2, Calendar, Sparkles, ShieldCheck, DollarSign } from 'lucide-react';
import client from '../api/client';
import { Link } from 'react-router-dom';

export default function OrderHistory({ user, onOpenAuth }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.get('/api/bookings/me');
        setBookings(response.data);
      } catch (err) {
        setError("Failed to retrieve your digital ticket vault. Please verify your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto my-32 px-4 text-center">
        <div className="bg-cinema-card border border-cinema-border rounded-3xl p-10 shadow-screen-glow relative overflow-hidden">
          <div className="w-16 h-16 bg-cinema-red/20 text-cinema-red rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cinema-red/30">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">Sign In to Access Your Ticket Vault</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            View upcoming cinema admissions, digital Dolby passes, and assigned seat row coordinates.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-8 py-4 bg-cinema-red hover:bg-cinema-redGlow text-white rounded-2xl font-extrabold text-sm shadow-red-neon transition-all"
          >
            Sign In / Register &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-cinema-border/60 mb-12">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cinema-red uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> VIP Patron Ticket Vault
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Cinematic Orders
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-cinema-card px-4 py-2 rounded-xl border border-cinema-border text-xs text-gray-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified Digital Gate Admission</span>
        </div>
      </div>

      {loading ? (
        <div className="py-28 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-cinema-red animate-spin" />
          <p className="text-gray-400 text-sm font-medium animate-pulse">Decrypting your digital pass vault...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/15 border border-red-500/40 p-6 rounded-2xl text-center my-8 text-red-200 text-sm">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-cinema-card/60 rounded-3xl border border-cinema-border max-w-2xl mx-auto">
          <Ticket className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-extrabold text-white mb-2">No Past or Upcoming Bookings</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            You haven't booked any Dolby Atmos or IMAX movie admissions yet. Jump into our catalog to experience cinema re-imagined!
          </p>
          <Link
            to="/"
            className="px-8 py-4 bg-cinema-red hover:bg-cinema-redGlow text-white rounded-2xl font-extrabold text-sm shadow-red-neon transition-all inline-flex items-center gap-2"
          >
            <span>Explore Now Showing Movies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.map(booking => {
            const dateObj = new Date(booking.showtime_start + 'Z');
            const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={booking.id}
                className="ticket-card bg-cinema-card rounded-2xl border border-cinema-border overflow-hidden transition-all duration-300 hover:border-cinema-red/50 hover:shadow-2xl flex flex-col md:flex-row"
              >
                {/* LEFT: MOVIE THUMBNAIL */}
                <div className="md:w-56 bg-gray-950 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={booking.movie_poster_url} 
                    alt={booking.movie_title}
                    className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cinema-card/90 hidden md:block" />
                  
                  {/* Status Banner */}
                  <div className="absolute top-3 left-3 md:left-4 bg-cinema-red text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded shadow-red-sm">
                    {booking.status}
                  </div>
                </div>

                {/* CENTER: SHOWTIME & SEATING DETAILS */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-dashed border-cinema-border/80">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-cinema-red uppercase tracking-wider mb-2">
                      <span>{booking.hall_name}</span>
                      <span>&bull;</span>
                      <span>Order #{booking.id}</span>
                    </div>

                    <Link to={`/movies/${booking.movie_id}`} className="text-xl md:text-2xl font-black text-white hover:text-cinema-red transition-colors">
                      {booking.movie_title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm text-gray-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cinema-red" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cinema-red" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat coordinates bar */}
                  <div className="pt-4 border-t border-cinema-border/50 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Assigned Seating
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.seat_labels.map((label, idx) => (
                          <span key={idx} className="px-3 py-1 bg-cinema-bg border border-cinema-border rounded-lg text-xs font-extrabold text-white shadow-sm">
                            Seat {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Amount Paid</span>
                      <span className="text-xl font-black text-white flex items-center justify-end mt-0.5">
                        <DollarSign className="w-4 h-4 text-cinema-red -mr-0.5" />
                        {booking.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: PERFORATED QR CODE SECTION */}
                <div className="p-6 md:p-8 md:w-64 flex flex-col items-center justify-center text-center bg-cinema-bg/60">
                  <div className="w-32 h-32 bg-white p-3 rounded-2xl shadow-md mb-3 flex items-center justify-center">
                    <QrCode className="w-full h-full text-black animate-pulse" />
                  </div>
                  <span className="text-xs font-mono font-extrabold text-cinema-red tracking-widest uppercase">
                    PASS-APX-{booking.id * 8941}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Present at cinema auditorium gate for touchless validation.
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
