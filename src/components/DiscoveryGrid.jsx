import React, { useRef, useEffect, useState } from 'react';
import { DiscoveryCard } from './DiscoveryCard';
import { WallpaperSkeleton } from './LoadingSkeleton';

function distributeIntoColumns(items, numCols) {
  if (numCols <= 0) return [items];

  const columns = Array.from({ length: numCols }, () => []);
  const heights = new Array(numCols).fill(0);

  for (const item of items) {
    // Estimate relative height using aspect ratio (width/height ratio)
    const ratio = item.width && item.height ? item.width / item.height : 1.5;
    // Height is proportional to 1/ratio
    const estimatedHeight = 1 / ratio;

    // Find the shortest column
    const shortestCol = heights.indexOf(Math.min(...heights));
    columns[shortestCol].push(item);
    heights[shortestCol] += estimatedHeight;
  }

  return columns;
}

function useColumnCount() {
  const getCount = () => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    if (w < 640) return 1;      // Mobile: 1 card per row
    if (w < 1024) return 2;     // Tablet: 2 cards per row
    if (w < 1440) return 3;     // Small/Medium Desktop: 3 cards per row
    return 4;                   // Large Desktop: 4 cards per row maximum
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const handler = () => setCount(getCount());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return count;
}

export function DiscoveryGrid({ items, loading, hasMore, onLoadMore, onFavoriteChange }) {
  const loaderRef = useRef(null);
  const numCols = useColumnCount();
  
  // Track failed media IDs locally to immediately collapse and reflow the layout on error
  const [failedIds, setFailedIds] = useState(new Set());

  // Reset failed IDs when source items change significantly (e.g. query change)
  useEffect(() => {
    setFailedIds(new Set());
  }, [items]);

  const handleLoadError = (itemId) => {
    console.warn("Media failed to load:", itemId);

    // Don't remove card from grid
    // Just log the error
  };

  // Filter out duplicates and failed loads
  const activeItems = items.filter(item => item && item.id);
  const uniqueItems = [];
  const seenIds = new Set();

  for (const item of activeItems) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueItems.push(item);
    }
  }

  const columns = distributeIntoColumns(uniqueItems, numCols);

  useEffect(() => {
    if (!loaderRef.current || !onLoadMore || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, loading, hasMore]);

  if (uniqueItems.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
        <p className="text-text-secondary max-w-sm text-sm">
          Try adjusting your query or filters to discover fresh content.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* Masonry Layout: items distributed dynamically */}
      <div className="flex gap-4 sm:gap-5 md:gap-6 w-full items-start" style={{ alignItems: 'flex-start' }}>
        {columns.map((colItems, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1 min-w-0">
            {colItems.map((item) => (
              <DiscoveryCard
                key={item.id}
                item={item}
                onFavoriteChange={onFavoriteChange}
                onLoadError={handleLoadError}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Loading states */}
      {loading && <WallpaperSkeleton />}

      {/* Scroll trigger */}
      {!loading && hasMore && (
        <div ref={loaderRef} className="w-full h-24 flex items-center justify-center mt-6">
          <div className="w-7 h-7 border-2 border-accent-theme border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
