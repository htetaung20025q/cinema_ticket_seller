import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Calendar, ArrowRight, Film } from 'lucide-react';

export default function MovieCard({ movie }) {
  return (
    <div className="group relative bg-cinema-card rounded-2xl overflow-hidden border border-cinema-border transition-all duration-500 hover:-translate-y-2 hover:border-cinema-red/50 hover:shadow-[0_15px_35px_-15px_rgba(229,9,20,0.4)] flex flex-col h-full">
      
      {/* Poster Image with Overlay Gradient */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Rating Tag */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/15 text-gray-200 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider">
          {movie.rating || "PG-13"}
        </div>

        {/* Status Tag */}
        <div className="absolute top-3 right-3 bg-cinema-red/90 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase shadow-red-sm">
          {movie.is_showing ? "Now Showing" : "Coming Soon"}
        </div>
      </div>

      {/* Content Meta Section */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-cinema-red mb-2 uppercase tracking-wide">
            <span>{movie.genre || 'Action / Drama'}</span>
          </div>
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-cinema-red transition-colors duration-200">
            {movie.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        <div className="pt-3 border-t border-cinema-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-cinema-red" />
            <span>{movie.duration_mins}m</span>
          </div>
          
          <Link
            to={`/movies/${movie.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-cinema-hover hover:bg-cinema-red text-gray-200 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 group-hover:shadow-red-sm"
          >
            <span>{movie.is_showing ? "Book Seats" : "Showtimes"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}
