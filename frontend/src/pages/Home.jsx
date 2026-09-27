import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Flame, Play, Clock, ArrowRight, Loader2 } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import client from '../api/client';
import { Link } from 'react-router-dom';

export default function Home() {
  const [activeTab, setActiveTab] = useState('now-showing');
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [nowRes, upRes] = await Promise.all([
          client.get('/api/movies/now-showing'),
          client.get('/api/movies/upcoming')
        ]);
        setNowShowing(nowRes.data);
        setUpcoming(upRes.data);
      } catch (err) {
        console.error("Failed to load movie catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const displayedMovies = activeTab === 'now-showing' ? nowShowing : upcoming;
  const heroMovie = nowShowing[0] || {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    backdrop_url: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    rating: "PG-13",
    duration_mins: 166,
    genre: "Sci-Fi / Adventure",
    id: 1
  };

  return (
    <div className="min-h-screen pb-24">
      
      {/* HERO SECTION - FEATURED BLOCKBUSTER */}
      <section className="relative w-full h-[65vh] lg:h-[75vh] flex items-center justify-start overflow-hidden bg-cinema-bg">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroMovie.backdrop_url} 
            alt="Hero Backdrop" 
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.45] animate-pulse"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cinema-red/20 border border-cinema-red/40 text-cinema-red text-xs font-extrabold tracking-wide uppercase shadow-red-sm">
              <Flame className="w-3.5 h-3.5 animate-bounce" /> Featured Atmos Experience
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              {heroMovie.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-300">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20">{heroMovie.rating}</span>
              <span className="text-cinema-red">&bull;</span>
              <span>{heroMovie.genre}</span>
              <span className="text-cinema-red">&bull;</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cinema-red" /> {heroMovie.duration_mins} Minutes</span>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3">
              {heroMovie.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Link 
                to={`/movies/${heroMovie.id}`}
                className="px-8 py-4 bg-cinema-red hover:bg-cinema-redGlow text-white rounded-2xl font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-red-neon hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>Book Tickets Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button 
                onClick={() => alert("Trailer playback is integrated in the theater auditorium view!")}
                className="px-6 py-4 bg-cinema-card hover:bg-cinema-hover text-gray-200 hover:text-white rounded-2xl font-bold text-sm sm:text-base border border-cinema-border transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current text-cinema-red" />
                <span>Trailer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative ambient crimson glow bottom */}
        <div className="absolute -bottom-10 right-10 w-96 h-96 bg-cinema-red/15 rounded-full filter blur-[120px] pointer-events-none" />
      </section>

      {/* CATALOG FILTERS & MOVIE GRIDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Header and Custom Tab Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-cinema-border/60 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Film className="w-7 h-7 text-cinema-red" />
              <span>Explore Cinema Catalog</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">Reserve prime seating with zero double-booking interference.</p>
          </div>

          <div className="flex items-center bg-cinema-card p-1.5 rounded-2xl border border-cinema-border">
            <button
              onClick={() => setActiveTab('now-showing')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'now-showing' 
                  ? 'bg-cinema-red text-white shadow-red-sm font-extrabold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Now Showing ({nowShowing.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                activeTab === 'upcoming' 
                  ? 'bg-cinema-red text-white shadow-red-sm font-extrabold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Coming Soon ({upcoming.length})
            </button>
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-cinema-red animate-spin" />
            <p className="text-sm text-gray-400 font-semibold animate-pulse">Synchronizing Dolby & IMAX film directory...</p>
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="text-center py-24 bg-cinema-card/50 rounded-3xl border border-cinema-border">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">No films in this category</h4>
            <p className="text-gray-400 text-sm">Please switch tabs or check back soon for upcoming cinematic premieres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {displayedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
