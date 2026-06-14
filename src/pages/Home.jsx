import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Image as ImageIcon, Video, Film, Smile, Search } from 'lucide-react';
import { getImages, getVideos, getGIFs } from '../services/api';
import { getCuratedWallpapers } from '../services/pexels';
import { DiscoveryGrid } from '../components/DiscoveryGrid';
import { SEO } from '../components/SEO';

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for previews
  const [wallpapers, setWallpapers] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreviews = async () => {
      setLoading(true);
      try {
        const randomPage = () => Math.floor(Math.random() * 10) + 1;
        const [wallRes, imgRes, vidRes, gifRes] = await Promise.all([
          getCuratedWallpapers(randomPage(), 12, true),
          getImages('portrait', randomPage(), 12),
          getVideos('', randomPage(), 12),
          getGIFs('', 'Trending', randomPage(), 12)
        ]);

        setWallpapers(
          (wallRes.photos || [])
            .filter(p => p && p.id && p.src?.large2x)
            .slice(0, 12)
            .map(p => ({ ...p, type: 'wallpaper' }))
        );
        setImages(
          (imgRes.items || [])
            .filter(img => img && img.id && (img.preview_url || img.src?.large2x))
            .slice(0, 12)
        );
        setVideos(
          (vidRes.items || [])
            .filter(v => v && v.id && v.video_url && v.preview_url)
            .slice(0, 12)
        );
        setGifs(
          (gifRes.items || [])
            .filter(g => g && g.id && g.gif_url)
            .slice(0, 12)
        );
      } catch (err) {
        console.warn("Failed to load dashboard previews:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPreviews();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const renderPreviewGrid = (items, linkTo, exploreText) => (
    <div className="relative max-h-[700px] overflow-hidden rounded-xl">
      <DiscoveryGrid items={items} loading={loading} hasMore={false} />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background-theme via-background-theme/90 to-transparent flex items-end justify-center pb-6 z-10 pointer-events-none">
        <Link to={linkTo} className="pointer-events-auto px-6 py-3 bg-surface-theme/90 hover:bg-accent-theme border border-border-theme/50 hover:border-transparent text-text-primary hover:text-white text-sm font-bold rounded-full shadow-xl backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2">
          {exploreText} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28 md:pb-16 relative">
      <SEO 
        title="Aurora | Visual Discovery Platform"
        description="Welcome to Aurora - discover high-resolution 4K wallpapers, creative stock photography, HD looping footage, and trending GIFs."
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 bg-gradient-to-b from-surface-theme/30 via-background-theme/60 to-background-theme">
        {/* Glow Backdrops */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[450px] h-[200px] bg-accent-theme/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-2/3 -translate-x-1/2 w-[450px] h-[200px] bg-[#a890ff]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-accent-theme/10 border border-accent-theme/20 text-accent-theme text-xs font-semibold rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Visual Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-none"
          >
            Explore the Infinite <br className="hidden sm:inline" />
            World of <span className="bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent">Visuals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-text-secondary max-w-2xl mx-auto font-medium"
          >
            One unified dashboard connecting 4K wallpapers, high-res photography, stock video footages, and animated expressions.
          </motion.p>

          {/* Unified Search Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto flex items-center relative mt-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search Wallpapers, Photos, Videos & GIFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base rounded-2xl text-text-primary glass-input focus:ring-2 focus:ring-accent-theme shadow-xl focus:scale-[1.01] transition-all duration-300"
              />
            </div>
          </motion.form>
        </div>
      </section>

      {/* Grid Channels Previews */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 space-y-16"
      >
        
        {/* Channel 1: Wallpapers */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-theme/40 pb-4">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-accent-theme" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">Featured Wallpapers</h2>
            </div>
            <Link to="/wallpapers" className="text-xs font-bold text-accent-theme hover:underline flex items-center gap-1">
              View All Wallpapers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderPreviewGrid(wallpapers, '/wallpapers', 'Explore All Wallpapers')}
        </motion.section>

        {/* Channel 2: Images */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-theme/40 pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent-theme" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">Creative Photos</h2>
            </div>
            <Link to="/images" className="text-xs font-bold text-accent-theme hover:underline flex items-center gap-1">
              View All Images <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderPreviewGrid(images, '/images', 'Explore All Images')}
        </motion.section>

        {/* Channel 3: Videos */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-theme/40 pb-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-accent-theme" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">Stock Footages</h2>
            </div>
            <Link to="/videos" className="text-xs font-bold text-accent-theme hover:underline flex items-center gap-1">
              View All Videos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderPreviewGrid(videos, '/videos', 'Explore All Videos')}
        </motion.section>

        {/* Channel 4: GIFs */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border-theme/40 pb-4">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-accent-theme" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">Animated GIFs</h2>
            </div>
            <Link to="/gifs" className="text-xs font-bold text-accent-theme hover:underline flex items-center gap-1">
              View All GIFs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderPreviewGrid(gifs, '/gifs', 'Explore All GIFs')}
        </motion.section>

      </motion.div>
    </div>
  );
}
