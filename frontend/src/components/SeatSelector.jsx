import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertCircle, RefreshCw, Armchair, DollarSign } from 'lucide-react';
import client from '../api/client';

export default function SeatSelector({ showtimeId, onProceedToCheckout, onBack }) {
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.get(`/api/showtimes/${showtimeId}/seats`);
      setHallData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load theater seating map. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();
    setSelectedSeats([]);
  }, [showtimeId]);

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    
    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 8) {
        alert("For group bookings above 8 tickets, please perform multiple transactions.");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <RefreshCw className="w-10 h-10 text-cinema-red animate-spin" />
        <p className="text-gray-400 text-sm font-medium animate-pulse">Connecting to Dolby theater seating layout...</p>
      </div>
    );
  }

  if (error || !hallData) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center max-w-xl mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-cinema-red mx-auto mb-3" />
        <h4 className="text-lg font-bold text-white mb-1">Could not load theater hall</h4>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button onClick={fetchSeatMap} className="px-5 py-2 bg-cinema-red text-white text-sm font-bold rounded-xl hover:bg-cinema-redGlow">
          Try Again
        </button>
      </div>
    );
  }

  // Organize seats by row letter (A, B, C...)
  const rowsMap = {};
  hallData.seats.forEach(seat => {
    if (!rowsMap[seat.row_letter]) rowsMap[seat.row_letter] = [];
    rowsMap[seat.row_letter].push(seat);
  });

  const rowLetters = Object.keys(rowsMap).sort();
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(2);

  return (
    <div className="relative pb-36 max-w-4xl mx-auto px-4">
      
      {/* Hall & Pricing Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
          Select Your Cinematic Seats
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {hallData.hall_name} &bull; Standard <span className="text-white font-semibold">${hallData.base_price}</span> | VIP Plush <span className="text-cinema-gold font-semibold">${(hallData.base_price * 1.5).toFixed(2)}</span>
        </p>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-12 bg-cinema-card/80 p-4 rounded-2xl border border-cinema-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-600" />
          <span className="text-xs font-medium text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cinema-red shadow-red-sm flex items-center justify-center text-white font-bold text-xs" />
          <span className="text-xs font-medium text-white">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-900 border border-gray-800 opacity-40 flex items-center justify-center text-gray-600 font-bold text-[10px]">✕</div>
          <span className="text-xs font-medium text-gray-500">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gray-800 border-2 border-cinema-gold" />
          <span className="text-xs font-medium text-cinema-gold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> VIP Back Rows
          </span>
        </div>
      </div>

      {/* CINEMA SCREEN VISUALIZATION */}
      <div className="max-w-2xl mx-auto mb-16 px-8 text-center">
        <div className="cinema-screen mb-4" />
        <span className="text-[11px] font-extrabold tracking-[0.3em] text-gray-400 uppercase">
          ▲ TOWARDS THE SCREEN ▲
        </span>
      </div>

      {/* SEATING GRID */}
      <div className="flex flex-col items-center gap-4 mb-10 overflow-x-auto pb-4">
        {rowLetters.map(rowLetter => {
          const rowSeats = rowsMap[rowLetter];
          const isVipRow = rowSeats.some(s => s.is_vip);

          return (
            <div key={rowLetter} className="flex items-center gap-3 md:gap-5">
              {/* Row Label Left */}
              <div className="w-6 text-right font-extrabold text-sm text-gray-400">
                {rowLetter}
              </div>

              {/* Seats in Row */}
              <div className="flex items-center gap-2 md:gap-3">
                {rowSeats.map(seat => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isBooked = seat.is_booked;

                  let buttonStyles = "w-9 h-9 md:w-11 md:h-11 rounded-t-xl rounded-b-md font-bold text-xs md:text-sm flex items-center justify-center transition-all duration-200 relative ";

                  if (isBooked) {
                    buttonStyles += "bg-gray-950 border border-gray-800 text-gray-600 opacity-30 cursor-not-allowed";
                  } else if (isSelected) {
                    buttonStyles += "bg-cinema-red text-white border-2 border-white shadow-red-neon scale-110 -translate-y-1 z-10";
                  } else {
                    buttonStyles += "bg-gray-800/90 text-gray-300 hover:bg-cinema-red/30 hover:border-cinema-red hover:text-white cursor-pointer hover:scale-105 active:scale-95 ";
                    if (seat.is_vip) {
                      buttonStyles += "border-2 border-cinema-gold/70";
                    } else {
                      buttonStyles += "border border-gray-600";
                    }
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                      title={isBooked ? `Seat ${rowLetter}${seat.seat_number} - Booked` : `Seat ${rowLetter}${seat.seat_number} - $${seat.price}`}
                      className={buttonStyles}
                    >
                      {isBooked ? "✕" : seat.seat_number}
                      {seat.is_vip && !isBooked && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cinema-gold" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row Label Right */}
              <div className="w-6 text-left font-extrabold text-sm text-gray-400">
                {rowLetter}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mb-8">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Real-time concurrency protection enabled. Your seat selection is checked dynamically against simultaneous bookers.</span>
      </div>

      {/* STICKY BOTTOM CHECKOUT BAR */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-cinema-border transition-all duration-500 transform ${
        selectedSeats.length > 0 ? 'translate-y-0 opacity-100 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]' : 'translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Selected Seats ({selectedSeats.length})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1 justify-center sm:justify-start">
              {selectedSeats.map(s => (
                <span key={s.id} className="bg-cinema-red text-white px-2.5 py-0.5 rounded-md text-xs font-extrabold shadow-sm">
                  {s.row_letter}{s.seat_number}
                  {s.is_vip && " ⭐"}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-medium text-gray-400 block">Total Amount</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center">
                <DollarSign className="w-5 h-5 text-cinema-red -mr-0.5" />
                {totalPrice}
              </span>
            </div>

            <button
              onClick={() => onProceedToCheckout(selectedSeats, totalPrice, hallData)}
              className="px-8 py-3.5 bg-cinema-red hover:bg-cinema-redGlow text-white rounded-2xl font-extrabold text-sm tracking-wide transition-all shadow-red-neon hover:scale-105 active:scale-95"
            >
              Confirm & Pay &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
