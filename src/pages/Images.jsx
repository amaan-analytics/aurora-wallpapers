import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { getImages, resetImagesPageOffset } from '../services/api';
import { DiscoveryGrid } from '../components/DiscoveryGrid';
import { CategoryChips } from '../components/CategoryChips';
import { SEO } from '../components/SEO';

const CATEGORIES = [
  'Portrait',
  'Business',
  'Lifestyle',
  'Travel',
  'Fashion',
  'Photography',
  'People',
  'Office',
  'Creative',
  'Street'
];

export function Images() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    resetImagesPageOffset();
    setPage(1);
    setImages([]);
    setHasMore(true);
    fetchImages(1, true);
  }, [searchQuery, activeCategory]);

  const fetchImages = async (pageNum, isReset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const targetQuery = searchQuery || activeCategory;
      const res = await getImages(targetQuery, pageNum, 16);
      // Only keep images that have a valid source URL
      const newItems = (res.items || []).filter(
        img => img && img.id && (img.preview_url || img.src?.large2x)
      );

      setImages(prev => {
        if (isReset) return newItems;
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newItems.filter(p => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasMore(!!res.next_page);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load discovery images:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchImages(page + 1);
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
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="min-h-screen pb-28 md:pb-16 relative">
      <SEO 
        title={searchQuery ? `Images matching "${searchQuery}"` : activeCategory ? `Category: ${activeCategory}` : 'High Resolution Images'}
        description="Discover beautiful high resolution creative photography and digital images from Pexels and Unsplash."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4 bg-gradient-to-b from-surface-theme/20 via-background-theme/50 to-background-theme">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent-theme/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-accent-theme/10 border border-accent-theme/20 text-accent-theme text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Pexels Photography Collection
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            High Fidelity <span className="bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent">Creative Photos</span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
            Discover professional portraits, lifestyle photography, business photos, and creative visual content.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center relative mt-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search portraits, people, travel, business..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base rounded-2xl text-text-primary glass-input focus:ring-2 focus:ring-accent-theme shadow-xl focus:scale-[1.01] transition-all duration-300"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Mobile-only: Scrollable Category Chips */}
      <div className="md:hidden sticky top-12 z-40" style={{ background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)' }}>
        <CategoryChips />
      </div>

      {/* Category Chips (desktop only) */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-accent-theme border-accent-theme text-white shadow-lg'
                  : 'bg-card-theme/60 border-border-theme/40 text-text-secondary hover:text-text-primary hover:border-accent-theme/25'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border-theme/30 pt-4 gap-4 flex-wrap">
          <div className="text-xs text-text-secondary font-medium">
            {searchQuery && `Showing results for "${searchQuery}"`}
            {activeCategory && `Category: ${activeCategory}`}
            {!searchQuery && !activeCategory && "Trending Images"}
          </div>
        </div>
      </section>

      {/* Grid container */}
      <DiscoveryGrid 
        items={images} 
        loading={loading} 
        hasMore={hasMore} 
        onLoadMore={handleLoadMore} 
      />
    </div>
  );
}
