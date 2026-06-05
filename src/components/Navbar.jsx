import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  'Nature', 'Abstract', 'Space', 'Cyberpunk', 'Minimalist', 
  'Gaming', 'Anime Inspired', 'Cars', 'Technology', 
  'Architecture', 'Mountains', 'Ocean', 'AI Art'
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const themeRef = useRef(null);
  const categoryRef = useRef(null);
  const profileRef = useRef(null);

  // Sync search input with search URL param if on home page
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // Click outside handlers to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    } else {
      navigate('/');
    }
  };

  const handleCategoryClick = (category) => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  const handleLogoutClick = async () => {
    setProfileDropdownOpen(false);
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'dark': return <Moon className="w-4 h-4 text-indigo-400" />;
      default: return <Monitor className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-theme to-[#a890ff] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-text-primary via-[#b9a5ff] to-accent-theme bg-clip-text text-transparent">
              Aurora
            </span>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-grow max-w-md relative mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search premium wallpapers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all duration-200"
              />
            </div>
          </form>

          {/* Right side Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Categories Dropdown */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl hover:bg-card-theme/60 transition-colors"
              >
                Categories
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {categoryDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-card p-2 shadow-xl border border-border-theme/60 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="text-left px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-accent-theme/10 hover:text-accent-theme rounded-lg transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card-theme/60 transition-colors"
                title="Switch theme"
              >
                {getThemeIcon()}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl glass-card p-1.5 shadow-xl border border-border-theme/60 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${theme === 'dark' ? 'bg-accent-theme/10 text-accent-theme' : 'text-text-secondary hover:bg-card-theme hover:text-text-primary'}`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark Mode
                  </button>
                  <button
                    onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${theme === 'light' ? 'bg-accent-theme/10 text-accent-theme' : 'text-text-secondary hover:bg-card-theme hover:text-text-primary'}`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light Mode
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setThemeDropdownOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${theme === 'system' ? 'bg-accent-theme/10 text-accent-theme' : 'text-text-secondary hover:bg-card-theme hover:text-text-primary'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    System
                  </button>
                </div>
              )}
            </div>

            <hr className="h-6 border-l border-border-theme/40" />

            {/* User Profile / Login */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border-theme/50 bg-card-theme/55 hover:border-accent-theme/35 transition-colors"
                >
                  <span className="text-xs font-semibold text-text-primary hidden lg:inline-block max-w-[100px] truncate ml-1">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-border-theme bg-surface-theme"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-card p-1.5 shadow-xl border border-border-theme/60 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-card-theme rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-accent-theme hover:bg-accent-theme/10 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <hr className="my-1.5 border-border-theme/40" />
                    
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-accent-theme hover:bg-accent-theme/90 rounded-xl transition-all duration-300 shadow-md shadow-accent-theme/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Log In
              </Link>
            )}

          </div>

          {/* Mobile Menu Toggler */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Quick theme toggler for mobile */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-text-secondary hover:text-text-primary rounded-xl"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-border-theme/40 animate-in slide-in-from-top duration-200 p-4 space-y-4">
          
          {/* Mobile Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search wallpapers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl text-text-primary glass-input"
            />
          </form>

          {/* Categories list in Mobile */}
          <div>
            <span className="block text-xs font-semibold text-text-secondary px-2 mb-2 uppercase tracking-wider">
              Explore Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5 px-2">
              {CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="text-left py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  # {cat}
                </button>
              ))}
              {CATEGORIES.length > 8 && (
                <button
                  onClick={() => handleCategoryClick('Nature')}
                  className="text-left py-1.5 text-xs text-accent-theme font-semibold"
                >
                  Explore All...
                </button>
              )}
            </div>
          </div>

          <hr className="border-border-theme/40" />

          {/* Profile options in Mobile */}
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-1">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-border-theme bg-surface-theme"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">
                      {user.displayName || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {user.email}
                    </span>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs text-text-secondary hover:text-text-primary py-2 px-2 rounded-lg"
                >
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-accent-theme font-semibold py-2 px-2 rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogoutClick}
                  className="text-left text-xs text-red-500 font-semibold py-2 px-2 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full block py-2.5 text-center text-xs font-semibold text-white bg-accent-theme rounded-xl"
              >
                Log In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
