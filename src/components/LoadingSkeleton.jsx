import React from 'react';

// Masonry-style skeleton that matches the flex-column grid layout
export function WallpaperSkeleton() {
  // 4 columns × 3 skeletons each = 12 total skeleton cards
  const colCount = 4;
  // Vary aspect ratios to simulate real masonry variety
  const ratios = [
    '4/3', '3/4', '16/9', '1/1',
    '3/2', '9/16', '4/5', '16/10',
    '1/1', '4/3', '3/4', '3/2'
  ];

  const cols = Array.from({ length: colCount }, (_, colIdx) =>
    ratios.slice(colIdx * 3, colIdx * 3 + 3)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-4 sm:gap-5 md:gap-6 w-full items-start">
        {cols.map((ratioList, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1 min-w-0">
            {ratioList.map((ratio, i) => (
              <div
                key={i}
                className="w-full rounded-2xl bg-card-theme border border-border-theme/40 overflow-hidden animate-pulse relative"
                style={{ aspectRatio: ratio }}
              >
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                {/* Bottom label stub */}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
                  <div className="h-2.5 bg-border-theme/60 rounded-full w-3/5" />
                  <div className="h-2 bg-border-theme/40 rounded-full w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Large Image Column */}
      <div className="lg:col-span-8 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[70vh] bg-card-theme border border-border-theme/50 rounded-3xl" />
      
      {/* Sidebar Info Column */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        <div className="h-8 bg-card-theme border border-border-theme/50 rounded-xl w-3/4" />
        <div className="h-5 bg-card-theme border border-border-theme/50 rounded-lg w-1/3" />
        
        <hr className="border-border-theme/40" />
        
        <div className="h-24 bg-card-theme border border-border-theme/50 rounded-2xl w-full" />
        <div className="h-12 bg-accent-theme/10 border border-accent-theme/20 rounded-xl w-full" />
        
        <hr className="border-border-theme/40" />
        
        <div className="space-y-3">
          <div className="h-4 bg-card-theme border border-border-theme/50 rounded w-1/2" />
          <div className="h-4 bg-card-theme border border-border-theme/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
