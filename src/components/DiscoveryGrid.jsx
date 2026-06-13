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
    if (w < 480) return 2;      // Small phones
    if (w < 640) return 3;      // Large phones
    if (w < 1024) return 4;     // Tablets
    if (w < 1280) return 5;     // Small desktops
    return 6;                   // Large desktops
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
  const columns = distributeIntoColumns(items, numCols);

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

  if (items.length === 0 && !loading) {
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
      <div className="flex gap-3 sm:gap-4 md:gap-5 w-full items-start" style={{ alignItems: 'flex-start' }}>
        {columns.map((colItems, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0">
            {colItems.map((item) => (
              <DiscoveryCard
                key={item.id}
                item={item}
                onFavoriteChange={onFavoriteChange}
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
