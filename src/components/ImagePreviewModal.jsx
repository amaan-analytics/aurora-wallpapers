import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Heart, Share2, ChevronLeft, ChevronRight,
  Check, ExternalLink, Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { usePreview } from '../context/PreviewContext';
import { useAuth } from '../context/AuthContext';
import { addFavorite, removeFavorite, getUserFavorites, addDownload } from '../services/db';

export function ImagePreviewModal() {
  const { isPreviewOpen, previewItems, currentIndex, closePreview, prevItem, nextItem, setCurrentIndex } = usePreview();
  const { user } = useAuth();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Touch/swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const item = previewItems[currentIndex];

  // Reset image loaded state and check favorite on item change
  useEffect(() => {
    setImageLoaded(false);
    setIsPlaying(true);
    if (!item) return;

    const checkFav = async () => {
      const uid = user?.uid || 'mock_user';
      try {
        const favs = await getUserFavorites(uid);
        setIsFavorited(favs.some(f => f.wallpaperId === item.id));
      } catch { /* silent */ }
    };
    checkFav();
  }, [item, user]);

  // Lock body scroll when modal open
  useEffect(() => {
      if (isPreviewOpen) {
        document.body.style.overflow = 'hidden';

        window.history.pushState(
          { previewOpen: true },
          '',
          window.location.pathname
        );
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isPreviewOpen]);

    useEffect(() => {
      const handlePopState = () => {
        if (isPreviewOpen) {
          closePreview();
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, [isPreviewOpen, closePreview]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPreviewOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prevItem();
      else if (e.key === 'ArrowRight') nextItem();
      else if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPreviewOpen, prevItem, nextItem, closePreview]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) nextItem();
      else prevItem();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    const uid = user?.uid || 'mock_user';
    try {
      if (isFavorited) {
        await removeFavorite(uid, item.id);
        setIsFavorited(false);
      } else {
        await addFavorite(uid, item);
        setIsFavorited(true);
      }
    } catch { /* silent */ }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    const downloadUrl = item.video_url || item.gif_url || item.src?.original || item.largeImageURL || item.preview_url;
    try {
      await addDownload(user?.uid || null, item);
      const res = await fetch(downloadUrl, { mode: 'cors' });
      const blob = await res.blob();
      const localUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = localUrl;
      const ext = item.type === 'video' ? 'mp4' : item.type === 'gif' ? 'gif' : 'jpg';
      a.download = `aurora-${item.type || 'media'}-${item.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch {
      window.open(downloadUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = item.type === 'wallpaper'
      ? `${window.location.origin}/wallpaper/${item.id}`
      : item.type === 'video'
        ? `${window.location.origin}/video/${item.id}`
        : item.type === 'image'
          ? `${window.location.origin}/image/${item.id}`
          : item.src?.original || item.video_url || '';
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!isPreviewOpen || !item) return null;

  const isVideo = item.type === 'video';
  const isGif = item.type === 'gif';
  const mediaSrc = isVideo
    ? item.video_url
    : item.preview_url || item.largeImageURL || item.src?.large2x || item.src?.large || item.gif_url;
  const photographer = item.photographer || item.user || 'Unknown Artist';
  const attribution = item.source || (isVideo ? 'Pexels' : item.type === 'image' ? 'Pixabay' : 'Aurora');

  return (
    <AnimatePresence>
      {isPreviewOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(20px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 pt-safe py-3 flex-shrink-0"
            style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
          >
            <button
              onClick={() => {window.history.back();}}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition-all text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-white/80 truncate max-w-[180px]">
                {photographer}
              </span>
              <span className="text-[10px] text-white/40">via {attribution}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition-all text-white"
              >
                {shareFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              {/* Favorite */}
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full backdrop-blur-md active:scale-90 transition-all ${
                  isFavorited
                    ? 'bg-[#7c5cfc] text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Media Area */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden px-2">
            {/* Prev / Next arrows (desktop / tablet) */}
            {previewItems.length > 1 && currentIndex > 0 && (
              <button
                onClick={prevItem}
                className="absolute left-2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition-all text-white hidden sm:flex"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Main media */}
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-h-full flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              >
                {isVideo ? (
                  <div className="relative w-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <video
                      ref={videoRef}
                      src={mediaSrc}
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      onClick={toggleVideoPlayback}
                      onLoadedData={() => setImageLoaded(true)}
                      className="w-full h-auto rounded-2xl object-contain"
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                    />
                    {/* Video controls overlay */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <button
                        onClick={toggleVideoPlayback}
                        className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full flex items-center justify-center">
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-2 border-[#7c5cfc] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={mediaSrc}
                      alt={item.title || 'Aurora Preview'}
                      onLoad={() => setImageLoaded(true)}
                      className={`w-full h-auto rounded-2xl object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {previewItems.length > 1 && currentIndex < previewItems.length - 1 && (
              <button
                onClick={nextItem}
                className="absolute right-2 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition-all text-white hidden sm:flex"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Pagination dots (mobile swipe hint) */}
          {previewItems.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {previewItems.slice(0, 10).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-4 h-1.5 bg-[#7c5cfc]'
                      : 'w-1.5 h-1.5 bg-white/30'
                  }`}
                />
              ))}
              {previewItems.length > 10 && (
                <span className="text-[10px] text-white/40 ml-1">{currentIndex + 1}/{previewItems.length}</span>
              )}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div
            className="px-4 py-4 flex-shrink-0"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center gap-3">
              {/* Download Button - primary action */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #a890ff)' }}
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>

              {/* Source link */}
              {(item.pageURL || item.url) && (
                <a
                  href={item.pageURL || item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 rounded-2xl bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-90 transition-all text-white"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Swipe hint */}
            {previewItems.length > 1 && (
              <p className="text-center text-[10px] text-white/30 mt-2">
                Swipe left/right to browse · {currentIndex + 1} of {previewItems.length}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
