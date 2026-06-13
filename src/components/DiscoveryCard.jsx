import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Download, Share2, Check, ExternalLink, Play, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite, getUserFavorites, addDownload } from '../services/db';

export function DiscoveryCard({ item, onFavoriteChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const isVideo = item.type === 'video';

  useEffect(() => {
    const checkFav = async () => {
      const currentUserId = user?.uid || 'mock_user';
      try {
        const favs = await getUserFavorites(currentUserId);
        setIsFavorited(favs.some(f => f.wallpaperId === item.id));
      } catch (err) {
        console.warn("Favorite check error for card:", err);
      }
    };
    checkFav();
  }, [user, item.id]);

  const handleCardClick = () => {
    // Wallpapers have a detailed route; other items open full-res download/media file in lightbox or copy share
    if (item.type === 'wallpaper') {
      navigate(`/wallpaper/${item.id}`);
    } else {
      // Open direct media link in a new tab
      window.open(item.src?.original || item.video_url || item.gif_url, '_blank');
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const currentUserId = user?.uid || 'mock_user';
    try {
      if (isFavorited) {
        await removeFavorite(currentUserId, item.id);
        setIsFavorited(false);
      } else {
        await addFavorite(currentUserId, item);
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
    const downloadUrl = item.video_url || item.gif_url || item.src?.original;
    try {
      await addDownload(user?.uid || null, item);
      const res = await fetch(downloadUrl, { mode: 'cors' });
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = localUrl;
      
      const extension = item.type === 'video' ? 'mp4' : item.type === 'gif' ? 'gif' : 'jpg';
      a.download = `aurora-${item.type}-${item.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch (error) {
      console.warn("CORS blocked download, opening in new window.");
      window.open(downloadUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = item.type === 'wallpaper' 
      ? `${window.location.origin}/wallpaper/${item.id}` 
      : item.src?.original || item.video_url || item.gif_url;
      
    navigator.clipboard.writeText(shareUrl);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const handleHoverStart = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(err => console.log("Muted autoplay blocked:", err));
    }
  };

  const handleHoverEnd = () => {
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative break-inside-avoid overflow-hidden rounded-2xl group border border-border-theme/40 bg-card-theme hover:border-accent-theme/35 accent-glow-hover duration-300 cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      <div className="relative overflow-hidden w-full bg-surface-theme">
        
        {/* Render Video Preview */}
        {isVideo ? (
          <div className="relative w-full h-auto min-h-[150px] aspect-video">
            <video
              ref={videoRef}
              src={item.video_url}
              poster={item.preview_url}
              muted
              loop
              playsInline
              preload="none"
              onLoadedData={() => setMediaLoaded(true)}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Play indicator badge */}
            <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/50 border border-white/10 text-white group-hover:scale-90 transition-transform">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
        ) : (
          /* Render Image / GIF */
          <img
            src={item.preview_url || item.src?.large2x || item.gif_url}
            alt={item.title}
            onLoad={() => setMediaLoaded(true)}
            className={`w-full h-auto object-cover transform duration-700 ease-out group-hover:scale-[1.03] ${
              mediaLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-md'
            }`}
            style={{ minHeight: '150px' }}
          />
        )}

        {/* Color placeholder while loading */}
        {!mediaLoaded && (
          <div
            className="absolute inset-0 animate-pulse bg-card-theme/80"
            style={{ backgroundColor: item.avg_color || '#15151a' }}
          />
        )}

        {/* Dynamic type category tag (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black/55 backdrop-blur-md border border-white/10 text-white rounded-md">
            {item.type}
          </span>
        </div>

        {/* Premium Hover Overlay Layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-theme/95 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
          
          {/* Photographer Attribution & Actions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              
              <div className="flex flex-col max-w-[55%]">
                <span className="text-[9px] text-white/50">Author</span>
                <span className="text-xs font-bold text-white truncate flex items-center gap-0.5">
                  {item.photographer}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5">
                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 hover:bg-white hover:text-black"
                  title="Copy Link"
                >
                  {shareFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>

                {/* Favorite */}
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-xl border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isFavorited
                      ? 'bg-accent-theme border-accent-theme text-white'
                      : 'bg-black/45 border-white/10 text-white hover:bg-white hover:text-black'
                  }`}
                  title={isFavorited ? 'Remove Favorite' : 'Save Favorite'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="p-2 rounded-xl border border-white/10 bg-black/45 text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95 hover:bg-accent-theme hover:border-accent-theme disabled:opacity-50"
                  title="Download File"
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
