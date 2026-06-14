import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { label: '🔥 Trending',    query: 'trending' },
  { label: '🌿 Nature',      query: 'Nature' },
  { label: '🌌 Space',       query: 'Space' },
  { label: '🤖 AI Art',      query: 'AI Art' },
  { label: '🎮 Gaming',      query: 'Gaming' },
  { label: '🌊 Ocean',       query: 'Ocean' },
  { label: '🏙️ City',        query: 'Architecture' },
  { label: '🚗 Cars',        query: 'Cars' },
  { label: '⛰️ Mountains',   query: 'Mountains' },
  { label: '💻 Tech',        query: 'Technology' },
  { label: '🎨 Abstract',    query: 'Abstract' },
  { label: '✨ Minimalist',  query: 'Minimalist' },
  { label: '🌸 Anime',       query: 'Anime Inspired' },
  { label: '🌆 Cyberpunk',   query: 'Cyberpunk' },
];

export function CategoryChips() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const params = new URLSearchParams(location.search);
  const activeCategory = params.get('category') || params.get('search') || '';

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const handleChipClick = (query) => {
    const path = location.pathname;
    if (query === 'trending') {
      navigate(path === '/' ? '/' : path);
    } else if (path === '/images') {
      navigate(`/images?category=${encodeURIComponent(query)}`);
    } else if (path === '/videos') {
      navigate(`/videos?category=${encodeURIComponent(query)}`);
    } else if (path === '/gifs') {
      navigate(`/gifs?category=${encodeURIComponent(query)}`);
    } else {
      navigate(`/wallpapers?category=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Left fade + arrow */}
      {showLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 pl-1"
          style={{ background: 'linear-gradient(to right, #0B0B0F 60%, transparent)' }}
        >
          <ChevronLeft className="w-4 h-4 text-white/60" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {CATEGORIES.map(({ label, query }) => {
          const isActive =
            activeCategory.toLowerCase() === query.toLowerCase() ||
            (query === 'trending' && !activeCategory);

          return (
            <button
              key={query}
              onClick={() => handleChipClick(query)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #7c5cfc, #a890ff)',
                      color: '#fff',
                      boxShadow: '0 0 12px rgba(124,92,252,0.5)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.65)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Right fade + arrow */}
      {showRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 pr-1"
          style={{ background: 'linear-gradient(to left, #0B0B0F 60%, transparent)' }}
        >
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      )}
    </div>
  );
}
