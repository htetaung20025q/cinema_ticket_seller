import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, MapPin, Sparkles, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import client from '../api/client';
import SeatSelector from '../components/SeatSelector';
import CheckoutModal from '../components/CheckoutModal';

export default function MovieDetails({ user, onOpenAuth }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  
  // Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ seats: [], totalPrice: "0.00", hallData: null });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/movies/${id}`);
        setMovie(res.data);
        if (res.data.showtimes && res.data.showtimes.length > 0) {
          setSelectedShowtimeId(res.data.showtimes[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch movie showtime details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleProceedToCheckout = (selectedSeats, totalPrice, hallData) => {
    setCheckoutData({ seats: selectedSeats, totalPrice, hallData });
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cinema-red animate-spin" />
        <p className="text-gray-400 text-sm font-semibold animate-pulse">Loading theater auditorium and schedule...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-2xl mx-auto my-24 p-8 text-center bg-cinema-card rounded-3xl border border-cinema-border">
        <h3 className="text-xl font-bold text-white mb-2">Movie Not Found</h3>
        <p className="text-sm text-gray-400 mb-6">The requested movie ID does not exist in our current database.</p>
        <Link to="/" className="px-6 py-3 bg-cinema-red text-white text-sm font-bold rounded-xl">
          &larr; Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-cinema-bg">
      
      {/* HEADER & HERO OVERVIEW */}
      <div className="relative w-full bg-cinema-card/50 border-b border-cinema-border py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Backdrop Glow */}
        <div className="absolute inset-0 opacity-20 filter blur-3xl scale-125 -z-0">
          <img src={movie.backdrop_url} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-cinema-red mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Movies & Showtimes
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster thumbnail */}
            <div className="w-48 sm:w-60 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Meta */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-cinema-red text-white text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider shadow-red-sm">
                  {movie.is_showing ? "Now in Theaters" : "Advance Premiere"}
                </span>
                <span className="text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700">
                  {movie.rating}
                </span>
                <span className="text-cinema-gold text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> IMAX 3D & Dolby Atmos
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                <span className="text-cinema-red font-semibold">{movie.genre}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cinema-red" /> {movie.duration_mins} Mins</span>
                <span>&bull;</span>
                <span>Released: {movie.release_date}</span>
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {movie.description}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SHOWTIMES & SEAT SELECTION INTERFACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Select Showtime & Theater Hall
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Choose an active auditorium slot below to launch interactive seat map.
          </p>
        </div>

        {/* SHOWTIME TABS */}
        {movie.showtimes && movie.showtimes.length > 0 ? (
          <div>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {movie.showtimes.map(st => {
                const dateObj = new Date(st.start_time + 'Z'); // Ensure UTC display formatting
                const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const isSelected = selectedShowtimeId === st.id;

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedShowtimeId(st.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 min-w-[150px] ${
                      isSelected
                        ? 'bg-cinema-red border-white text-white shadow-red-neon scale-105 font-bold'
                        : 'bg-cinema-card border-cinema-border text-gray-300 hover:border-cinema-red hover:text-white hover:bg-cinema-hover'
                    }`}
                  >
                    <span className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-red-100' : 'text-cinema-red'}`}>
                      {dateString} &bull; {st.hall?.name || `Hall #${st.hall_id}`}
                    </span>
                    <span className="text-xl sm:text-2xl font-black">
                      {timeString}
                    </span>
                    <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      From ${st.base_price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* INTERACTIVE SEAT MAP FOR SELECTED SHOWTIME */}
            {selectedShowtimeId && (
              <div className="mt-12 bg-cinema-card/40 border border-cinema-border/60 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cinema-red/10 rounded-full filter blur-[100px] pointer-events-none" />
                
                <SeatSelector 
                  showtimeId={selectedShowtimeId}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto my-12 p-8 text-center bg-cinema-card rounded-3xl border border-cinema-border">
            <Calendar className="w-12 h-12 text-cinema-red mx-auto mb-3 opacity-80" />
            <h4 className="text-lg font-bold text-white mb-1">No Available Showtimes</h4>
            <p className="text-gray-400 text-sm">
              Tickets for this feature are currently sold out or advance screenings have not opened yet. Check back shortly!
            </p>
          </div>
        )}

      </div>

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedSeats={checkoutData.seats}
        totalPrice={checkoutData.totalPrice}
        hallData={checkoutData.hallData}
        showtimeId={selectedShowtimeId}
        user={user}
        onOpenAuth={onOpenAuth}
      />

    </div>
  );
}
