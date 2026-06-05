import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Flame, ArrowUp, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { getCuratedWallpapers, searchWallpapers } from '../services/pexels';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { SEO } from '../components/SEO';

const CATEGORIES = [
  'Nature', 'Abstract', 'Space', 'Cyberpunk', 'Minimalist', 
  'Gaming', 'Anime Inspired', 'Cars', 'Technology', 
  'Architecture', 'Mountains', 'Ocean', 'AI Art'
];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';

  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Resolution filtering (Desktop / Mobile orientation search)
  const [orientationFilter, setOrientationFilter] = useState(''); // '', 'landscape', 'portrait'

  const [localSearch, setLocalSearch] = useState('');
  const [wallpaperOfTheDay, setWallpaperOfTheDay] = useState(null);

  // Load wallpaper of the day (once)
  useEffect(() => {
    const fetchWOTD = async () => {
      try {
        const res = await getCuratedWallpapers(1, 10);
        if (res.photos && res.photos.length > 0) {
          // Select 2nd photo for variety
          setWallpaperOfTheDay(res.photos[Math.min(res.photos.length - 1, 1)]);
        }
      } catch (err) {
        console.warn("Failed to load WOTD:", err);
      }
    };
    fetchWOTD();
  }, []);

  // Sync search input with URL search param
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Monitor scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset page and reload wallpapers when search query, active category, or orientation changes
  useEffect(() => {
    setPage(1);
    setWallpapers([]);
    setHasMore(true);
    fetchWallpapers(1, true);
  }, [searchQuery, activeCategory, orientationFilter]);

  const fetchWallpapers = async (pageNum, isReset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let response;
      const targetQuery = searchQuery || activeCategory;

      if (targetQuery) {
        response = await searchWallpapers(targetQuery, pageNum, 16, orientationFilter);
      } else {
        response = await getCuratedWallpapers(pageNum, 16);
      }

      const newPhotos = response.photos || [];
      
      setWallpapers(prev => {
        if (isReset) return newPhotos;
        // Filter duplicates
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newPhotos.filter(p => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasMore(!!response.next_page);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading wallpapers:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchWallpapers(page + 1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat) {
      // Toggle off
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-28 md:pb-16 relative">
      <SEO 
        title={searchQuery ? `Search results for "${searchQuery}"` : activeCategory ? `Category: ${activeCategory}` : 'Home'}
        description={searchQuery ? `Explore exquisite 4K wallpapers matching "${searchQuery}".` : 'Discover high-fidelity background themes for desktop and mobile.'}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 bg-gradient-to-b from-surface-theme/20 via-background-theme/50 to-background-theme">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent-theme/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-accent-theme/10 border border-accent-theme/20 text-accent-theme text-xs font-semibold rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated 4K Wallpaper Collection
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-tight"
          >
            Discover Exquisite <span className="bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent">Backgrounds</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Elevate your screen with our premium collection of high-resolution art, nature, minimalist, and cyberpunk wallpapers.
          </motion.p>

          {/* Large Hero Search bar */}
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
                placeholder="Search wallpapers (e.g., Space, Cyberpunk, Mountains...)"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base rounded-2xl text-text-primary glass-input focus:ring-2 focus:ring-accent-theme shadow-xl focus:scale-[1.01] transition-all duration-300"
              />
            </div>
          </motion.form>
        </div>
      </section>

      {/* Category Chips & Filter Buttons Container */}
      <section className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        
        {/* Category horizontal scroll bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-accent-theme border-accent-theme text-white shadow-lg shadow-accent-theme/20 scale-105'
                  : 'bg-card-theme/60 border-border-theme/40 text-text-secondary hover:text-text-primary hover:border-accent-theme/25 hover:bg-card-theme'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Orientation Filter Options */}
        <div className="flex items-center justify-between border-t border-border-theme/30 pt-4 gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary font-medium mr-1">Filter Layout:</span>
            <button
              onClick={() => setOrientationFilter('')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                orientationFilter === ''
                  ? 'bg-text-primary text-background-theme border-text-primary'
                  : 'bg-card-theme/40 border-border-theme/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              All Layouts
            </button>
            <button
              onClick={() => setOrientationFilter('landscape')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                orientationFilter === 'landscape'
                  ? 'bg-text-primary text-background-theme border-text-primary'
                  : 'bg-card-theme/40 border-border-theme/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setOrientationFilter('portrait')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                orientationFilter === 'portrait'
                  ? 'bg-text-primary text-background-theme border-text-primary'
                  : 'bg-card-theme/40 border-border-theme/40 text-text-secondary hover:text-text-primary'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Mobile
            </button>
          </div>

          {/* Heading state */}
          <div className="text-xs text-text-secondary font-medium">
            {searchQuery && `Showing results for "${searchQuery}"`}
            {activeCategory && `Category: ${activeCategory}`}
            {!searchQuery && !activeCategory && "Curated Selection"}
          </div>
        </div>
      </section>

      {/* Wallpaper of the Day Hero Banner (Only shown on default home page first page) */}
      {!searchQuery && !activeCategory && !orientationFilter && wallpaperOfTheDay && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <Link to={`/wallpaper/${wallpaperOfTheDay.id}`}>
            <div className="relative h-64 sm:h-80 md:h-[400px] w-full rounded-3xl overflow-hidden group border border-border-theme/40 glass-card">
              <img
                src={wallpaperOfTheDay.src.original}
                alt="Wallpaper of the day"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-theme via-transparent to-black/35"></div>
              
              {/* Wallpaper of the day content tags */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end items-start space-y-2.5 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-theme text-white text-[10px] font-bold tracking-wider rounded-full uppercase">
                  <Flame className="w-3 h-3 fill-current" />
                  Wallpaper of the Day
                </span>
                
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white max-w-lg leading-tight drop-shadow-md">
                  Discover {wallpaperOfTheDay.category || "Exquisite Space"} Art
                </h2>
                
                <p className="text-xs text-white/70">
                  By <span className="font-semibold text-white">{wallpaperOfTheDay.photographer}</span>
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Wallpaper Grid */}
      <WallpaperGrid 
        wallpapers={wallpapers} 
        loading={loading} 
        hasMore={hasMore} 
        onLoadMore={handleLoadMore} 
      />

      {/* Back to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-accent-theme text-white border border-accent-theme/20 shadow-lg shadow-accent-theme/20 hover:scale-110 active:scale-95 transition-all"
            title="Back to Top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
