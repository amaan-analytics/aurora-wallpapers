import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Do not show bottom nav on Detail page to maximize image preview space and avoid conflict with the fixed download bar
  if (path.startsWith('/wallpaper/')) {
    return null;
  }

  const isActive = (targetPath, searchCheck = null) => {
    if (searchCheck) {
      return path === targetPath && location.search.includes(searchCheck);
    }
    if (targetPath === '/') {
      return path === '/' && !location.search.includes('focus=search');
    }
    return path.startsWith(targetPath) && !location.search.includes('tab=favorites');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden bg-card-theme/75 backdrop-blur-xl border border-border-theme/40 rounded-2xl py-2.5 px-6 flex justify-around items-center shadow-2xl">
      {/* Home */}
      <Link 
        to="/" 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          isActive('/') ? 'text-accent-theme scale-105' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[9px] font-bold">Home</span>
      </Link>

      {/* Explore / Search */}
      <Link 
        to="/explore" 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          path === '/explore' ? 'text-accent-theme scale-105' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[9px] font-bold">Explore</span>
      </Link>

      {/* Favorites Tab */}
      <Link 
        to={user ? "/profile?tab=favorites" : "/login"} 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          path === '/profile' && location.search.includes('tab=favorites') ? 'text-accent-theme scale-105' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span className="text-[9px] font-bold">Saved</span>
      </Link>

      {/* Profile / Account */}
      <Link 
        to={user ? "/profile" : "/login"} 
        className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
          isActive('/profile') || path === '/login' || path === '/signup'
            ? 'text-accent-theme scale-105'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[9px] font-bold">Account</span>
      </Link>
    </div>
  );
}
