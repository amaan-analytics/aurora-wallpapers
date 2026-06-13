import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink, 
  Heart, 
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { getImageById, getImages } from '../services/api';
import { addFavorite, removeFavorite, getUserFavorites, addDownload } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { DiscoveryGrid } from '../components/DiscoveryGrid';
import { SEO } from '../components/SEO';

export function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  
  const [image, setImage] = useState(state?.image || null);
  const [similarImages, setSimilarImages] = useState([]);
  const [loading, setLoading] = useState(!state?.image);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let data = state?.image;
        if (!data) {
          data = await getImageById(id);
          if (data) setImage(data);
        }

        if (data) {
          // Load similar images using the image tags/title
          // clean up query to get better matches
          const cleanQuery = (data.title || 'creative')
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .slice(0, 3)
            .join(' ');
          const similar = await getImages(cleanQuery, 1, 8);
          setSimilarImages(similar.items?.filter(img => img.id !== data.id) || []);

          // Check if favorited
          const currentUserId = user?.uid || 'mock_user';
          const favs = await getUserFavorites(currentUserId);
          setIsFavorited(favs.some(f => f.wallpaperId === data.id));
        }
      } catch (err) {
        console.error("Failed to load image details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user, state?.image]);

  const handleFavoriteToggle = async () => {
    if (!image) return;
    const currentUserId = user?.uid || 'mock_user';
    try {
      if (isFavorited) {
        await removeFavorite(currentUserId, image.id);
        setIsFavorited(false);
      } else {
        await addFavorite(currentUserId, image);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    setIsDownloading(true);

    try {
      await addDownload(user?.uid || null, image);
      const res = await fetch(image.src.original, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      
      // Determine file extension
      const extension = image.src.original.split('.').pop().split('?')[0] || 'jpg';
      a.download = `aurora-image-${image.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("CORS block, opening direct download URL.");
      window.open(image.src.original, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const shareImage = async () => {
    if (!image) return;
    const shareData = {
      title: `${image.title} | Aurora Images`,
      text: `Check out this gorgeous photography on Aurora!`,
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
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-theme border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h3 className="text-xl font-bold mb-2">Image not found</h3>
        <button onClick={() => navigate('/images')} className="text-accent-theme flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Images
        </button>
      </div>
    );
  }

  const sourceName = image.id.includes('pixabay') ? 'Pixabay' : 'Aurora Content';

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 sm:py-8 space-y-12 lg:pb-8">
      <SEO 
        title={`${image.title} | Aurora Images`}
        description={`Download high resolution creative image by ${image.photographer}.`}
      />

      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-card-theme/60 border border-border-theme/40 text-text-secondary hover:text-text-primary rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Full-size Image Preview Panel */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center relative bg-card-theme/20 border border-border-theme/30 rounded-3xl overflow-hidden min-h-[40vh] lg:min-h-[60vh] p-4">
          <img
            src={image.src.original}
            alt={image.title}
            className="w-full h-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-500"
          />
        </div>

        {/* Sidebar details */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest block mb-1">
                Photographer
              </span>
              <a 
                href={image.photographer_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-lg font-bold text-text-primary hover:text-accent-theme flex items-center gap-1.5 transition-colors"
              >
                {image.photographer}
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
              <span className="text-xs text-text-secondary mt-1 block">
                Source: {sourceName}
              </span>
            </div>

            <hr className="border-border-theme/40" />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
                <span className="text-[10px] text-text-secondary block">Resolution</span>
                <span className="text-xs font-semibold text-text-primary">
                  {image.width} × {image.height}
                </span>
              </div>
              <div className="bg-background-theme/60 p-3 rounded-xl border border-border-theme/20">
                <span className="text-[10px] text-text-secondary block">Type</span>
                <span className="text-xs font-semibold text-text-primary uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-accent-theme" />
                  HD Photo
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-accent-theme text-white text-sm font-semibold rounded-2xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              {isDownloading ? 'Downloading...' : 'Download Free'}
            </button>

            <div className="grid grid-cols-2 gap-3">
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

              <button
                onClick={shareImage}
                className="flex items-center justify-center gap-2 py-3 bg-card-theme/60 border border-border-theme/40 text-text-secondary hover:text-text-primary hover:bg-card-theme hover:border-accent-theme/25 rounded-2xl transition-all"
              >
                {shareFeedback ? <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in" /> : <Share2 className="w-4 h-4" />}
                <span className="text-xs font-semibold">
                  {shareFeedback ? 'Copied' : 'Share'}
                </span>
              </button>
            </div>

            <button
              onClick={copyUrlToClipboard}
              className="w-full flex items-center justify-center gap-2 py-3 bg-card-theme/30 border border-border-theme/20 text-xs text-text-secondary hover:text-text-primary rounded-2xl hover:bg-card-theme/60 transition-all"
            >
              {copyFeedback ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'Link Copied!' : 'Copy Page Link'}</span>
            </button>

          </div>
        </div>

      </div>

      <hr className="border-border-theme/40" />

      {/* Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4">
          <ImageIcon className="w-5 h-5 text-accent-theme" />
          <h3 className="text-xl font-bold tracking-tight text-text-primary">
            Similar Images
          </h3>
        </div>
        <DiscoveryGrid 
          items={similarImages} 
          loading={false} 
          hasMore={false} 
        />
      </div>

      {/* Floating Bottom Bar for Mobile View */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card-theme/90 backdrop-blur-xl border-t border-border-theme/40 p-4 flex items-center justify-between gap-3 lg:hidden animate-in slide-in-from-bottom duration-300">
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

        <div className="flex-[2] relative">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent-theme text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 active:scale-95 transition-all disabled:opacity-60"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
          </button>
        </div>

        <button
          onClick={shareImage}
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
