import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image, Video, Layers, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Home',       icon: Home,     to: '/' },
  { label: 'Wallpapers', icon: Layers,   to: '/wallpapers' },
  { label: 'Images',     icon: Image,    to: '/images' },
  { label: 'Videos',     icon: Video,    to: '/videos' },
  { label: 'GIFs',       icon: Sparkles, to: '/gifs' },
  { label: 'Profile',    icon: User,     to: '/profile', requiresAuth: true },
];

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Hide on detail pages
  if (path.startsWith('/wallpaper/') || path.startsWith('/video/') || path.startsWith('/image/')) {
    return null;
  }

  const isActive = (item) => {
    if (item.to === '/') return path === '/';
    return path.startsWith(item.to);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(11,11,15,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex justify-around items-end px-1 pt-2 pb-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const targetPath = item.requiresAuth && !user ? '/login' : item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={targetPath}
              className="flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1 relative active:scale-90 transition-transform"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Glow pill behind active icon */}
              {active && (
                <span
                  className="absolute inset-x-2 top-0.5 h-7 rounded-full"
                  style={{
                    background: 'rgba(124,92,252,0.18)',
                    boxShadow: '0 0 12px 3px rgba(124,92,252,0.35)',
                  }}
                />
              )}

              <span className="relative z-10 flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    active ? 'text-[#7c5cfc] drop-shadow-[0_0_6px_rgba(124,92,252,0.8)]' : 'text-white/45'
                  }`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </span>

              <span
                className={`text-[9px] font-semibold tracking-tight transition-colors ${
                  active ? 'text-[#a890ff]' : 'text-white/35'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
