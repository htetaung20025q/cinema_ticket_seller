import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Film, Plus, Trash2, AlertCircle, CheckCircle, 
  RefreshCw, Lock, ExternalLink, Calendar, Clock, Sparkles, X, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import client from '../api/client';

export default function AdminDashboard({ user, onOpenAuth }) {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states for creating a new cinematic release
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster_url: '',
    backdrop_url: '',
    duration_mins: 120,
    genre: '',
    rating: 'PG-13',
    release_date: '2026-08-15',
    is_showing: true
  });

  // Modal state for soft deletion
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    movie: null,
    processing: false
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminMovies();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/api/admin/movies?limit=50&offset=0', {
        headers: { Authorization: `Bearer ${localStorage.getItem('cinema_jwt_token')}` }
      });
      setMovies(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch catalog from administrative server.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'duration_mins' ? parseInt(value) || 0 : value)
    }));
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Frontend strict form validation
    if (!formData.title.trim() || !formData.genre.trim() || !formData.description.trim()) {
      setFormError("Title, Genre, and Description cannot be blank.");
      return;
    }
    if (formData.duration_mins <= 0) {
      setFormError("Duration must be a positive integer greater than zero.");
      return;
    }
    if (!formData.poster_url.includes('http') || !formData.backdrop_url.includes('http')) {
      setFormError("Please provide valid HTTPS URL links for Poster and Backdrop images.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await client.post('/api/admin/movies', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cinema_jwt_token')}` }
      });
      setMovies(prev => [res.data, ...prev]);
      setSuccessMsg(`Successfully published "${res.data.title}" to active theater schedules!`);
      setIsFormOpen(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        poster_url: '',
        backdrop_url: '',
        duration_mins: 120,
        genre: '',
        rating: 'PG-13',
        release_date: '2026-08-15',
        is_showing: true
      });
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setFormError(err.response?.data?.detail || "An error occurred while creating the movie.");
    } finally {
      setFormLoading(false);
    }
  };

  const confirmSoftDelete = (movie) => {
    setDeleteModal({
      isOpen: true,
      movie: movie,
      processing: false
    });
  };

  const handleExecuteSoftDelete = async () => {
    if (!deleteModal.movie) return;
    setDeleteModal(prev => ({ ...prev, processing: true }));
    try {
      const movieId = deleteModal.movie.id;
      await client.delete(`/api/admin/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cinema_jwt_token')}` }
      });
      
      // Update local state to reflect soft delete
      setMovies(prev => prev.map(m => m.id === movieId ? { ...m, is_active: false, is_showing: false } : m));
      setSuccessMsg(`"${deleteModal.movie.title}" has been soft deleted and archived from customer feeds.`);
      setDeleteModal({ isOpen: false, movie: null, processing: false });
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to execute soft delete operation.");
      setDeleteModal(prev => ({ ...prev, processing: false }));
    }
  };

  // Pre-fill button with high quality cinematic demonstration values
  const handlePrefillDemo = () => {
    setFormData({
      title: "Interstellar: Beyond Continuum",
      description: "When Earth's climate rapidly disintegrates, a crew of astronauts traverses a wormhole near Saturn in exploration of a viable habitable exoplanet for humanity's continuance.",
      poster_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
      backdrop_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80",
      duration_mins: 169,
      genre: "Sci-Fi / Adventure / Drama",
      rating: "PG-13",
      release_date: "2026-11-05",
      is_showing: true
    });
    setFormError(null);
  };

  // RBAC Access Guard Protection
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[85vh] bg-cinema-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-cinema-border text-center shadow-screen-glow relative overflow-hidden animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 tracking-wide">
            Restricted Admin Portal
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            This management center requires an authenticated <span className="text-amber-400 font-bold">Administrator Role</span> token. Standard user access is explicitly prohibited under strict RBAC enforcement.
          </p>
          <div className="space-y-3">
            <button 
              onClick={onOpenAuth} 
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-black" />
              Sign in as Admin
            </button>
            <Link 
              to="/" 
              className="w-full py-3 bg-cinema-card border border-cinema-border text-gray-300 hover:text-white rounded-xl font-bold text-sm block transition-colors"
            >
              Return to Public Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live summary indicators
  const totalCount = movies.length;
  const activeCount = movies.filter(m => m.is_active).length;
  const showingCount = movies.filter(m => m.is_active && m.is_showing).length;
  const archivedCount = movies.filter(m => !m.is_active).length;

  return (
    <div className="min-h-screen bg-cinema-bg pb-20 animate-fadeIn">
      
      {/* Decorative Top Ambient Light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[128px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-cinema-red/10 rounded-full filter blur-[128px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-cinema-border/60">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                RBAC Security Portal • Authorized Admin
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Cinema Management Center
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Configure releases, orchestrate showtime visibility, and manage non-destructive soft archiving.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAdminMovies}
              disabled={loading}
              className="p-3 bg-cinema-card border border-cinema-border text-gray-400 hover:text-white rounded-2xl transition-colors hover:border-gray-600 shadow-sm"
              title="Refresh repository"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`py-3 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-300 shadow-sm ${
                isFormOpen 
                  ? 'bg-cinema-card border border-cinema-border text-gray-300 hover:text-white' 
                  : 'bg-cinema-red hover:bg-cinema-redGlow text-white shadow-red-sm hover:shadow-red-neon'
              }`}
            >
              {isFormOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isFormOpen ? "Close Panel" : "Add New Movie"}
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successMsg && (
          <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-semibold animate-fadeIn shadow-lg">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div className="glass-card rounded-2xl p-5 border border-cinema-border/80">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Total Catalog</span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-cinema-border/80">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">Active Status</span>
            <span className="text-2xl font-black text-white">{activeCount}</span>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-cinema-border/80">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">Now Showing</span>
            <span className="text-2xl font-black text-white">{showingCount}</span>
          </div>
          <div className="glass-card rounded-2xl p-5 border border-cinema-border/80">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">Soft Deleted / Archived</span>
            <span className="text-2xl font-black text-white">{archivedCount}</span>
          </div>
        </div>

        {/* Add Movie Collapsible Panel */}
        {isFormOpen && (
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-cinema-border/80 mb-10 relative overflow-hidden animate-fadeIn shadow-screen-glow">
            <div className="flex items-center justify-between pb-6 border-b border-cinema-border/60 mb-6">
              <div className="flex items-center gap-3">
                <Film className="w-6 h-6 text-cinema-red" />
                <h3 className="text-xl font-extrabold text-white tracking-wide">Publish New Film to Catalog</h3>
              </div>
              <button 
                type="button" 
                onClick={handlePrefillDemo}
                className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-fill Cinematic Demo Data
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMovie} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Movie Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Inception: Dream Protocol"
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Genre Classification</label>
                  <input 
                    type="text" 
                    name="genre" 
                    value={formData.genre} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Sci-Fi / Action / Thriller"
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    name="duration_mins" 
                    value={formData.duration_mins} 
                    onChange={handleInputChange} 
                    min="1" 
                    max="600" 
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">MPAA Rating</label>
                  <select 
                    name="rating" 
                    value={formData.rating} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  >
                    <option value="G">G - General Audiences</option>
                    <option value="PG">PG - Parental Guidance</option>
                    <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                    <option value="R">R - Restricted (17+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Release Date</label>
                  <input 
                    type="date" 
                    name="release_date" 
                    value={formData.release_date} 
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Poster Image URL (High-Res)</label>
                  <input 
                    type="url" 
                    name="poster_url" 
                    value={formData.poster_url} 
                    onChange={handleInputChange} 
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Backdrop Banner URL (16:9 Landscape)</label>
                  <input 
                    type="url" 
                    name="backdrop_url" 
                    value={formData.backdrop_url} 
                    onChange={handleInputChange} 
                    placeholder="https://images.unsplash.com/..."
                    required
                    className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Synopsis / Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows="3" 
                  placeholder="Provide a compelling cinematic overview of the film plot and immersive IMAX features..."
                  required
                  className="w-full px-4 py-3 bg-cinema-bg border border-cinema-border rounded-xl text-white text-sm focus:outline-none focus:border-cinema-red leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="is_showing" 
                  name="is_showing" 
                  checked={formData.is_showing} 
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-cinema-bg border-cinema-border text-cinema-red focus:ring-cinema-red"
                />
                <label htmlFor="is_showing" className="text-sm font-semibold text-gray-200 cursor-pointer">
                  Activate immediately on public <span className="text-cinema-red">Now Showing</span> customer schedules
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-cinema-border/60">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-cinema-card border border-cinema-border text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="px-8 py-3.5 rounded-xl font-extrabold text-sm bg-cinema-red hover:bg-cinema-redGlow text-white shadow-red-sm hover:shadow-red-neon transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {formLoading ? "Publishing via Async Engine..." : "Commit Movie to Catalog"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table Section */}
        <div className="glass-card rounded-3xl border border-cinema-border/80 overflow-hidden shadow-screen-glow">
          <div className="p-6 border-b border-cinema-border/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Movie Management & Schedule Repository</h2>
              <p className="text-xs text-gray-400 mt-0.5">Showing all active and soft-archived titles. Deactivated films remain locked in historic booking records.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm font-semibold">Synchronizing with high-speed async PostgreSQL / SQLite engine...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm font-bold px-4">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              No movies currently in catalog. Click "Add New Movie" above to populate the repository!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cinema-border/60 text-xs text-gray-400 uppercase tracking-wider font-bold bg-black/40">
                    <th className="py-4 px-6">Movie Title & Poster</th>
                    <th className="py-4 px-6">Genre & Duration</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6">Schedule Status</th>
                    <th className="py-4 px-6">Catalog State</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinema-border/40 text-sm">
                  {movies.map((movie) => (
                    <tr key={movie.id} className={`transition-colors hover:bg-white/5 ${!movie.is_active ? 'opacity-60 bg-black/30' : ''}`}>
                      
                      {/* Movie Identity */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title} 
                            className="w-12 h-16 rounded-lg object-cover shadow-md flex-shrink-0 bg-cinema-card border border-cinema-border/60"
                          />
                          <div>
                            <span className="font-bold text-white text-base block">{movie.title}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                              <Calendar className="w-3 h-3 text-cinema-red" /> {movie.release_date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Genre & Mins */}
                      <td className="py-4 px-6 text-gray-300 font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{movie.genre}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> {movie.duration_mins} mins
                          </span>
                        </div>
                      </td>

                      {/* MPAA Rating */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-cinema-border/60 text-white rounded-md text-xs font-bold border border-gray-600">
                          {movie.rating || "PG-13"}
                        </span>
                      </td>

                      {/* Showing Status */}
                      <td className="py-4 px-6">
                        {movie.is_showing ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            <Eye className="w-3.5 h-3.5" /> Now Showing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <EyeOff className="w-3.5 h-3.5" /> Upcoming Release
                          </span>
                        )}
                      </td>

                      {/* Active State / Soft Delete status */}
                      <td className="py-4 px-6">
                        {movie.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" /> Soft Deleted
                          </span>
                        )}
                      </td>

                      {/* Action Controls */}
                      <td className="py-4 px-6 text-right">
                        {movie.is_active ? (
                          <button 
                            onClick={() => confirmSoftDelete(movie)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                            title="Soft Delete & Remove from Public Feed"
                          >
                            <Trash2 className="w-4 h-4" /> Deactivate
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-gray-600 bg-black/40 px-3 py-1.5 rounded-xl border border-gray-800">
                            Archived in DB
                          </span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Safety Confirmation Modal for Soft Deletion */}
      {deleteModal.isOpen && deleteModal.movie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-cinema-card rounded-3xl border border-cinema-border p-8 shadow-screen-glow overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/20 rounded-full filter blur-3xl -z-0 pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center mb-6 shadow-sm">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2 tracking-wide">
              Deactivate Movie Schedule?
            </h3>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              You are about to execute a <span className="text-red-400 font-bold">Soft Delete</span> on <span className="font-black text-white">"{deleteModal.movie.title}"</span>.
            </p>

            <div className="bg-black/50 p-4 rounded-2xl border border-cinema-border/80 text-xs text-gray-400 mb-6 leading-relaxed">
              <p className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Non-Destructive Integrity Guarantee:
              </p>
              This film will immediately be hidden from public customer reservation feeds (<code className="text-gray-300">is_active = False</code>). However, all historic patron bookings and ticket receipts referencing this movie ID will remain fully preserved without schema failures.
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, movie: null, processing: false })}
                disabled={deleteModal.processing}
                className="w-1/2 py-3.5 rounded-xl font-bold text-sm bg-cinema-bg border border-cinema-border text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSoftDelete}
                disabled={deleteModal.processing}
                className="w-1/2 py-3.5 rounded-xl font-extrabold text-sm bg-red-600 hover:bg-red-500 text-white shadow-red-sm hover:shadow-red-neon transition-all flex items-center justify-center gap-2"
              >
                {deleteModal.processing ? "Archiving..." : "Confirm Soft Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
