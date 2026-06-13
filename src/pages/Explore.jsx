import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { getExploreContent } from '../services/api';
import { DiscoveryGrid } from '../components/DiscoveryGrid';
import { SEO } from '../components/SEO';

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setExploreItems([]);
    setHasMore(true);
    fetchExplore(1, true);
  }, [searchQuery]);

  const fetchExplore = async (pageNum, isReset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await getExploreContent(searchQuery, pageNum, 20);
      const newItems = res.items || [];

      setExploreItems(prev => {
        if (isReset) return newItems;
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = newItems.filter(p => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasMore(!!res.next_page);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load explore contents:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchExplore(page + 1);
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

  return (
    <div className="min-h-screen pb-28 md:pb-16 relative">
      <SEO 
        title={searchQuery ? `Explore results for "${searchQuery}"` : 'Aggregated Media Feed | Explore'}
        description="Explore the unified Visual Discovery Platform blending Wallpapers, Photography, Stock Footage, and animated Giphy GIFs in one place."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 px-4 bg-gradient-to-b from-surface-theme/20 via-background-theme/50 to-background-theme">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent-theme/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-accent-theme/10 border border-accent-theme/20 text-accent-theme text-xs font-semibold rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Aggregated Trending Discovery
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Search Across <span className="bg-gradient-to-r from-accent-theme via-[#a890ff] to-[#dfd5ff] bg-clip-text text-transparent">Everything</span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
            A unified Pinterest-style layout aggregating wallpapers, creative photography, stock videos, and funny animated GIFs.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center relative mt-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search Wallpapers, Photos, Videos & GIFs at once..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base rounded-2xl text-text-primary glass-input focus:ring-2 focus:ring-accent-theme shadow-xl focus:scale-[1.01] transition-all duration-300"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Grid container */}
      <DiscoveryGrid 
        items={exploreItems} 
        loading={loading} 
        hasMore={hasMore} 
        onLoadMore={handleLoadMore} 
      />
    </div>
  );
}
