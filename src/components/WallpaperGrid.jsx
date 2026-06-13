import React, { useRef, useEffect, useState } from 'react';
import { WallpaperCard } from './WallpaperCard';
import { WallpaperSkeleton } from './LoadingSkeleton';

// Distribute wallpapers into N columns using a "shortest column first" greedy algorithm.
// We use the wallpaper's aspect ratio as a proxy for height to avoid layout thrashing.
function distributeIntoColumns(wallpapers, numCols) {
  if (numCols <= 0) return [wallpapers];

  const columns = Array.from({ length: numCols }, () => []);
  const heights = new Array(numCols).fill(0);

  for (const wp of wallpapers) {
    // Estimate relative height using aspect ratio (width/height ratio)
    const ratio = wp.width && wp.height ? wp.width / wp.height : 1;
    // Height is proportional to 1/ratio; use a normalized column width of 1
    const estimatedHeight = 1 / ratio;

    // Find the shortest column
    const shortestCol = heights.indexOf(Math.min(...heights));
    columns[shortestCol].push(wp);
    heights[shortestCol] += estimatedHeight;
  }

  return columns;
}

// Hook to get the current number of columns based on window width
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

export function WallpaperGrid({ wallpapers, loading, hasMore, onLoadMore, onFavoriteChange }) {
  const loaderRef = useRef(null);
  const numCols = useColumnCount();

  // Track failed media IDs locally to immediately collapse and reflow the layout on error
  const [failedIds, setFailedIds] = useState(new Set());

  // Reset failed IDs when source wallpapers change (e.g. search query change)
  useEffect(() => {
    setFailedIds(new Set());
  }, [wallpapers]);

  const handleLoadError = (wpId) => {
    setFailedIds(prev => {
      const next = new Set(prev);
      next.add(wpId);
      return next;
    });
  };

  // Filter out duplicates and failed loads
  const activeWallpapers = wallpapers.filter(w => w && w.id && !failedIds.has(w.id));
  const uniqueWallpapers = [];
  const seenIds = new Set();

  for (const wp of activeWallpapers) {
    if (!seenIds.has(wp.id)) {
      seenIds.add(wp.id);
      uniqueWallpapers.push(wp);
    }
  }

  const columns = distributeIntoColumns(uniqueWallpapers, numCols);

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

  if (uniqueWallpapers.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h3 className="text-xl font-bold text-text-primary mb-2">No wallpapers found</h3>
        <p className="text-text-secondary max-w-sm text-sm">
          We couldn't find matches. Try searching other keywords or choose a category chip above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* JS-driven masonry: fixed columns, items appended to shortest column */}
      <div
        className="flex gap-4 sm:gap-5 md:gap-6 w-full items-start"
        style={{ alignItems: 'flex-start' }}
      >
        {columns.map((colWallpapers, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1 min-w-0"
          >
            {colWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                onFavoriteChange={onFavoriteChange}
                onLoadError={handleLoadError}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && <WallpaperSkeleton />}

      {/* Infinite scroll trigger */}
      {!loading && hasMore && (
        <div ref={loaderRef} className="w-full h-24 flex items-center justify-center mt-6">
          <div className="w-7 h-7 border-2 border-accent-theme border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
