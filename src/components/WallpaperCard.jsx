import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite, getUserFavorites, addDownload } from '../services/db';

export function WallpaperCard({ wallpaper, onFavoriteChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      const currentUserId = user?.uid || 'mock_user';
      try {
        const favs = await getUserFavorites(currentUserId);
        setIsFavorited(favs.some(f => f.wallpaperId === wallpaper.id));
      } catch (err) {
        console.warn("Could not load favorite status for card:", err);
      }
    };
    checkFav();
  }, [user, wallpaper.id]);

  const handleCardClick = () => {
    navigate(`/wallpaper/${wallpaper.id}`);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const currentUserId = user?.uid || 'mock_user';
    try {
      if (isFavorited) {
        await removeFavorite(currentUserId, wallpaper.id);
        setIsFavorited(false);
      } else {
        await addFavorite(currentUserId, wallpaper);
        setIsFavorited(true);
      }
      if (onFavoriteChange) onFavoriteChange();
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await addDownload(user?.uid || null, wallpaper);
      const res = await fetch(wallpaper.src.original, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aurora-wallpaper-${wallpaper.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("CORS blocking, opening direct URL.");
      window.open(wallpaper.src.original, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePhotographerClick = (e) => {
    e.stopPropagation();
    window.open(wallpaper.photographer_url, '_blank', 'noreferrer');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative break-inside-avoid overflow-hidden rounded-2xl group border border-border-theme/40 bg-card-theme hover:border-accent-theme/30 accent-glow-hover duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden w-full bg-surface-theme">
        <img
            src={wallpaper.src.large2x}
          alt={`${wallpaper.category || "4K"} Wallpaper by ${wallpaper.photographer}`}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-auto object-cover transform duration-700 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-md'
          }`}
          style={{ minHeight: '150px' }}
        />

        {/* Color placeholder while loading */}
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: wallpaper.avg_color || '#15151a' }}
          />
        )}

        {/* Premium Hover Info Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-theme/90 via-transparent to-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">

          {/* Top: Dimensions badge */}
          <div className="flex justify-between items-start">
            <span className="text-[10px] tracking-wider font-semibold px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {wallpaper.width} × {wallpaper.height}
            </span>
          </div>

          {/* Bottom: Photographer + action buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col max-w-[62%]">
                <span className="text-[10px] text-white/50">Photographer</span>
                {/* button avoids nested <a> inside the card click area */}
                <button
                  onClick={handlePhotographerClick}
                  className="text-xs font-semibold text-white truncate hover:text-accent-theme flex items-center gap-0.5 transition-colors text-left"
                >
                  {wallpaper.photographer}
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Favorite */}
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isFavorited
                      ? 'bg-accent-theme border-accent-theme text-white'
                      : 'bg-black/45 border-white/10 text-white hover:bg-white hover:text-black'
                  }`}
                  title={isFavorited ? 'Remove Favorite' : 'Save to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="p-2 rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-accent-theme hover:border-accent-theme disabled:opacity-50"
                  title="Download Wallpaper"
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
