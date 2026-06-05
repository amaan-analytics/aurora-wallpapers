import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink, 
  Maximize2, 
  Heart, 
  Sparkles,
  Check
} from 'lucide-react';
import { getWallpaperById, getSimilarWallpapers } from '../services/pexels';
import { addFavorite, removeFavorite, getUserFavorites, addDownload } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { SEO } from '../components/SEO';

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [wallpaper, setWallpaper] = useState(null);
  const [similarWallpapers, setSimilarWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Swipe logic for mobile navigation between similar wallpapers
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 60;

    if (swipeDistance > minSwipeDistance) {
      handleNextWallpaper();
    } else if (swipeDistance < -minSwipeDistance) {
      handlePrevWallpaper();
    }
  };

  const handleNextWallpaper = () => {
    if (similarWallpapers.length === 0) return;
    const currentIndex = similarWallpapers.findIndex(w => Number(w.id) === Number(wallpaper?.id));
    let nextIndex = 0;
    if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % similarWallpapers.length;
    } else {
      nextIndex = 0;
    }
    navigate(`/wallpaper/${similarWallpapers[nextIndex].id}`);
  };

  const handlePrevWallpaper = () => {
    if (similarWallpapers.length === 0) return;
    const currentIndex = similarWallpapers.findIndex(w => Number(w.id) === Number(wallpaper?.id));
    let prevIndex = similarWallpapers.length - 1;
    if (currentIndex !== -1) {
      prevIndex = (currentIndex - 1 + similarWallpapers.length) % similarWallpapers.length;
    } else {
      prevIndex = similarWallpapers.length - 1;
    }
    navigate(`/wallpaper/${similarWallpapers[prevIndex].id}`);
  };

  // Close lightbox on ESC key & lock scroll
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', handleKey);
    
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getWallpaperById(id);
        setWallpaper(data);

        // Load similar wallpapers based on category/tags
        const similar = await getSimilarWallpapers(data, 8);
        setSimilarWallpapers(similar);

        // Check if favorited
        const currentUserId = user?.uid || 'mock_user';
        const favs = await getUserFavorites(currentUserId);
        setIsFavorited(favs.some(f => f.wallpaperId === data.id));

      } catch (err) {
        console.error("Failed to load wallpaper details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const handleFavoriteToggle = async () => {
    const currentUserId = user?.uid || 'mock_user';
    try {
      if (isFavorited) {
        await removeFavorite(currentUserId, wallpaper.id);
        setIsFavorited(false);
      } else {
        await addFavorite(currentUserId, wallpaper);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDownload = async (sizeName, url) => {
    setIsDownloading(true);
    setDownloadDropdownOpen(false);

    try {
      // Log download metric
      await addDownload(user?.uid || null, wallpaper);

      // Download file using fetch BLOB
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `aurora-${sizeName}-${wallpaper.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("CORS block, opening direct download URL.");
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const shareWallpaper = async () => {
    const shareData = {
      title: `Wallpaper by ${wallpaper.photographer} | Aurora`,
      text: `Check out this gorgeous 4K wallpaper on Aurora Wallpapers!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Native share cancelled or failed.", err);
      }
    } else {
      copyUrlToClipboard();
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!wallpaper) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h3 className="text-xl font-bold mb-2">Wallpaper not found</h3>
        <button onClick={() => navigate('/')} className="text-accent-theme flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  // Sizing definitions for Pexels downloads
  const sizes = [
    { name: 'Original (HD 4K)', url: wallpaper.src.original, info: `${wallpaper.width} × ${wallpaper.height}` },
    { name: 'Large 2x', url: wallpaper.src.large2x, info: '1600 × 1200' },
    { name: 'Large', url: wallpaper.src.large, info: '1000 × 750' },
    { name: 'Medium', url: wallpaper.src.medium, info: '600 × 450' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 sm:py-8 space-y-12 lg:pb-8">
      <SEO 
        title={`Wallpaper by ${wallpaper.photographer}`}
        description={`Download high resolution wallpaper by ${wallpaper.photographer}. Resolution: ${wallpaper.width}x${wallpaper.height}.`}
        image={wallpaper.src.large2x}
      />

      {/* Header back navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-card-theme/60 border border-border-theme/40 text-text-secondary hover:text-text-primary rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Wallpaper Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Large Preview Image Column */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative bg-card-theme/20 border border-border-theme/30 rounded-3xl overflow-hidden p-2 min-h-[50vh] lg:min-h-[70vh]">
          
          <div 
            className="relative w-full h-full flex items-center justify-center max-h-[75vh]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={wallpaper.src.large2x || wallpaper.src.original}
              alt={wallpaper.alt || 'Wallpaper preview'}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl cursor-zoom-in transition-all duration-300 hover:brightness-110"
              onClick={() => setLightboxOpen(true)}
            />
            
            {/* Fullscreen / Maximize button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/60 border border-white/10 text-white backdrop-blur-md hover:scale-105 hover:bg-accent-theme/80 active:scale-95 transition-all"
              title="View Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ── Fullscreen Lightbox Modal ── */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-[110] p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              title="Close (ESC)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            {/* Full-resolution image */}
            <img
              src={wallpaper.src.original}
              alt={wallpaper.alt || 'Wallpaper fullscreen'}
              className="max-w-[96vw] max-h-[96vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Hint label */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/40 select-none">
              Click anywhere outside image to close · ESC
            </span>
          </div>
        )}

        {/* Sidebar Info & Controls Column */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Photographer Block */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">
                Artist / Photographer
              </span>
              <a 
                href={wallpaper.photographer_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-lg font-bold text-text-primary hover:text-accent-theme flex items-center gap-1.5 transition-colors"
              >
                {wallpaper.photographer}
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
              <span className="text-xs text-text-secondary mt-1 block">
                Source: Pexels API
              </span>
            </div>

            <hr className="border-border-theme/40" />

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
                <span className="text-[10px] text-text-secondary block">Dimensions</span>
                <span className="text-xs font-semibold text-text-primary">
                  {wallpaper.width} × {wallpaper.height}
                </span>
              </div>
              <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
                <span className="text-[10px] text-text-secondary block">Primary Color</span>
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-white/20 inline-block" style={{ backgroundColor: wallpaper.avg_color }} />
                  {wallpaper.avg_color || '#N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Core User Action Buttons */}
          <div className="space-y-3">
            
            {/* Download selector Button */}
            <div className="relative">
              <button
                onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-accent-theme text-white text-sm font-semibold rounded-2xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                {isDownloading ? 'Downloading...' : 'Download Free'}
              </button>

              {downloadDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-card border border-border-theme/60 p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => handleDownload(size.name, size.url)}
                      className="w-full text-left flex justify-between items-center px-4 py-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-accent-theme/10 hover:text-accent-theme rounded-xl transition-colors"
                    >
                      <span className="font-semibold">{size.name}</span>
                      <span className="text-[10px] text-text-secondary/70">{size.info}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite & Share Bar */}
            <div className="grid grid-cols-2 gap-3">
              {/* Favorite Button */}
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                  isFavorited
                    ? 'bg-accent-theme/10 border-accent-theme/35 text-accent-theme'
                    : 'bg-card-theme/60 border-border-theme/40 text-text-secondary hover:text-text-primary hover:bg-card-theme hover:border-accent-theme/25'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                <span className="text-xs font-semibold">{isFavorited ? 'Saved' : 'Favorite'}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={shareWallpaper}
                className="flex items-center justify-center gap-2 py-3 bg-card-theme/60 border border-border-theme/40 text-text-secondary hover:text-text-primary hover:bg-card-theme hover:border-accent-theme/25 rounded-2xl transition-all"
              >
                {shareFeedback ? <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in" /> : <Share2 className="w-4 h-4" />}
                <span className="text-xs font-semibold">
                  {shareFeedback ? 'Copied Link' : 'Share'}
                </span>
              </button>
            </div>

            {/* Clipboard Copy link button */}
            <button
              onClick={copyUrlToClipboard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-card-theme/30 border border-border-theme/20 text-xs text-text-secondary hover:text-text-primary rounded-2xl hover:bg-card-theme/60 transition-all"
            >
              {copyFeedback ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'Link Copied!' : 'Copy Wallpaper Page Link'}</span>
            </button>

          </div>

          {/* Info Details Section */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block">
              Asset Category Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              <Link 
                to={`/?category=${encodeURIComponent(wallpaper.category || 'Abstract')}`}
                className="px-3 py-1 bg-background-theme/50 border border-border-theme/20 text-xs font-medium text-text-secondary hover:text-accent-theme hover:border-accent-theme/30 rounded-lg transition-all"
              >
                # {wallpaper.category || 'Abstract'}
              </Link>
              {wallpaper.alt && wallpaper.alt.split(' ').slice(0, 5).map(tag => {
                const cleanTag = tag.replace(/[^a-zA-Z]/g, '');
                if (cleanTag.length < 3) return null;
                return (
                  <Link 
                    key={tag}
                    to={`/?search=${encodeURIComponent(cleanTag)}`}
                    className="px-3 py-1 bg-background-theme/50 border border-border-theme/20 text-xs font-medium text-text-secondary hover:text-accent-theme hover:border-accent-theme/30 rounded-lg transition-all"
                  >
                    # {cleanTag}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      <hr className="border-border-theme/40" />

      {/* Similar Wallpapers Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4">
          <Sparkles className="w-5 h-5 text-accent-theme" />
          <h3 className="text-xl font-bold tracking-tight text-text-primary">
            Similar Recommendations
          </h3>
        </div>
        <WallpaperGrid 
          wallpapers={similarWallpapers} 
          loading={false} 
          hasMore={false} 
        />
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card-theme/90 backdrop-blur-xl border-t border-border-theme/40 p-4 flex items-center justify-between gap-3 lg:hidden animate-in slide-in-from-bottom duration-300">
        {/* Favorite */}
        <button
          onClick={handleFavoriteToggle}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
            isFavorited
              ? 'bg-accent-theme/10 border-accent-theme/35 text-accent-theme'
              : 'bg-background-theme/60 border-border-theme/40 text-text-secondary hover:text-text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          <span>{isFavorited ? 'Saved' : 'Favorite'}</span>
        </button>

        {/* Download Free */}
        <div className="flex-[2] relative">
          <button
            onClick={() => handleDownload('Original', wallpaper.src.original)}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent-theme text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 active:scale-95 transition-all disabled:opacity-60"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Downloading...' : 'Download Free'}</span>
          </button>
        </div>

        {/* Share */}
        <button
          onClick={shareWallpaper}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-background-theme/60 border border-border-theme/40 text-text-secondary hover:text-text-primary rounded-xl active:scale-95 transition-all"
        >
          {shareFeedback ? <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in" /> : <Share2 className="w-4 h-4" />}
          <span className="text-xs font-bold">
            {shareFeedback ? 'Copied' : 'Share'}
          </span>
        </button>
      </div>

    </div>
  );
}
