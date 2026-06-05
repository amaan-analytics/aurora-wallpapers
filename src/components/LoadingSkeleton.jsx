import React from 'react';

export function WallpaperSkeleton() {
  // Random heights to simulate masonry blocks
  const heights = ['h-72', 'h-96', 'h-64', 'h-80', 'h-96', 'h-72', 'h-64', 'h-80'];
  
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 p-4 w-full">
      {heights.map((height, i) => (
        <div 
          key={i} 
          className={`w-full ${height} mb-4 rounded-2xl bg-card-theme border border-border-theme/40 animate-pulse-slow overflow-hidden flex flex-col justify-end p-4 relative`}
        >
          {/* Inner details placeholder */}
          <div className="space-y-2 z-10 w-full">
            <div className="h-4 bg-border-theme/85 rounded-full w-2/3"></div>
            <div className="h-3 bg-border-theme/50 rounded-full w-1/2"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-theme/50 to-transparent"></div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse-slow">
      {/* Large Image Column */}
      <div className="lg:col-span-8 aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[70vh] bg-card-theme border border-border-theme/50 rounded-3xl"></div>
      
      {/* Sidebar Info Column */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        <div className="h-8 bg-card-theme border border-border-theme/50 rounded-xl w-3/4"></div>
        <div className="h-5 bg-card-theme border border-border-theme/50 rounded-lg w-1/3"></div>
        
        <hr className="border-border-theme/40" />
        
        <div className="h-24 bg-card-theme border border-border-theme/50 rounded-2xl w-full"></div>
        <div className="h-12 bg-accent-theme/10 border border-accent-theme/20 rounded-xl w-full"></div>
        
        <hr className="border-border-theme/40" />
        
        <div className="space-y-3">
          <div className="h-4 bg-card-theme border border-border-theme/50 rounded w-1/2"></div>
          <div className="h-4 bg-card-theme border border-border-theme/50 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
