import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Lock, AlertTriangle, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function CheckoutModal({ isOpen, onClose, selectedSeats, totalPrice, hallData, showtimeId, user, onOpenAuth }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePaymentConfirm = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const seatIds = selectedSeats.map(s => s.id);
      const response = await client.post('/api/bookings', {
        showtime_id: parseInt(showtimeId),
        seat_ids: seatIds
      });

      setSuccessBooking(response.data);
    } catch (err) {
      // Catch Double-Booking 409 Conflict or other errors
      const msg = err.response?.data?.detail || "An error occurred during booking. Please try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTickets = () => {
    onClose();
    navigate('/my-tickets');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-cinema-card rounded-3xl border border-cinema-border p-6 sm:p-8 shadow-screen-glow">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-cinema-hover text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successBooking ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-white mb-2">Tickets Confirmed!</h3>
            <p className="text-sm text-gray-300 mb-6">
              Your transaction was processed securely. Booking ID <span className="text-cinema-red font-mono font-bold">#{successBooking.booking_id}</span> has been saved to your account.
            </p>

            <div className="bg-cinema-bg/80 p-4 rounded-2xl border border-cinema-border text-left mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Movie Title:</span>
                <span className="text-white font-bold">{hallData?.movie_title || "Selected Feature"}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Theater Hall:</span>
                <span className="text-white font-medium">{hallData?.hall_name}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Assigned Seats:</span>
                <span className="text-cinema-red font-bold">
                  {selectedSeats.map(s => `${s.row_letter}${s.seat_number}`).join(", ")}
                </span>
              </div>
            </div>

            <button
              onClick={handleViewTickets}
              className="w-full py-3.5 bg-cinema-red hover:bg-cinema-redGlow text-white rounded-2xl font-extrabold text-sm shadow-red-neon transition-all"
            >
              View in My Bookings Dashboard &rarr;
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div>
            <div className="flex items-center gap-2 text-cinema-red text-xs font-bold uppercase tracking-wider mb-2">
              <CreditCard className="w-4 h-4" /> Secure Ticket Checkout
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-6">
              Review & Confirm Your Reservation
            </h3>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border-2 border-red-500 text-red-200 flex items-start gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold text-white uppercase">Reservation Conflict!</p>
                  <p className="text-xs leading-relaxed mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="bg-cinema-bg p-4 rounded-2xl border border-cinema-border/80">
                <div className="flex justify-between items-center pb-3 border-b border-cinema-border/60">
                  <span className="text-xs font-medium text-gray-400">Feature Movie</span>
                  <span className="text-sm font-bold text-white">{hallData?.movie_title}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-cinema-border/60">
                  <span className="text-xs font-medium text-gray-400">Theater & Auditorium</span>
                  <span className="text-sm font-semibold text-gray-200">{hallData?.hall_name}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-xs font-medium text-gray-400">Selected Seating</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {selectedSeats.map(s => (
                      <span key={s.id} className="px-2 py-0.5 rounded bg-cinema-card text-cinema-red text-xs font-bold border border-cinema-border">
                        {s.row_letter}{s.seat_number} {s.is_vip ? '⭐' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* simulated payment details */}
              <div className="bg-cinema-bg p-4 rounded-2xl border border-cinema-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
                    💳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-200">Simulated Cinema Wallet / Apple Pay</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-400 inline" /> 256-bit Encrypted Transaction
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 uppercase">Instant Valid</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 pb-6 border-t border-cinema-border">
              <span className="text-sm font-bold text-gray-400">Total Amount Due</span>
              <span className="text-3xl font-extrabold text-white text-right">
                ${totalPrice}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-cinema-hover text-gray-300 hover:text-white text-xs font-bold transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={loading}
                className="flex-1 py-3.5 bg-cinema-red hover:bg-cinema-redGlow disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm transition-all shadow-red-neon flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Safe Reservation...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Authorize & Book Now
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-center text-gray-500 mt-4">
              By clicking Authorize, you confirm seat reservation under our strict double-booking protection protocol.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
