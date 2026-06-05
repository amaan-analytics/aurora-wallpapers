import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Download, 
  User, 
  Edit3, 
  Check, 
  RefreshCw,
  LogOut,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserFavorites, getUserDownloads, updateUserProfile } from '../services/db';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { SEO } from '../components/SEO';

export function Profile() {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites', 'downloads'
  const [favorites, setFavorites] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile editing state
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email.split('@')[0]);
      // Extracts seed from existing dicebear photoURL or sets random
      const urlMatch = user.photoURL?.match(/seed=(.+)/);
      setAvatarSeed(urlMatch ? urlMatch[1] : user.uid.substring(0, 6));
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const currentUserId = user.uid;
      const favList = await getUserFavorites(currentUserId);
      const downloadList = await getUserDownloads(currentUserId);

      // Map databases favorites/downloads object keys to match standard pexels photos object keys
      const formattedFavs = favList.map(item => ({
        id: item.wallpaperId,
        width: item.width,
        height: item.height,
        avg_color: item.avgColor || '#15151a',
        photographer: item.photographer,
        photographer_url: item.photographerUrl,
        src: item.src,
        category: item.category
      }));

      const formattedDownloads = downloadList.map(item => ({
        id: item.wallpaperId,
        width: item.width,
        height: item.height,
        avg_color: item.avgColor || '#15151a',
        photographer: item.photographer,
        photographer_url: item.photographerUrl,
        src: item.src,
        category: item.category || 'General'
      }));

      setFavorites(formattedFavs);
      setDownloads(formattedDownloads);
    } catch (err) {
      console.error("Failed to load user records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setUpdateSuccess(false);

    try {
      const newPhotoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;
      await updateUserProfile(user.uid, displayName, newPhotoURL);
      
      setUpdateSuccess(true);
      setEditMode(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // Reload page state
      window.location.reload();
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const regenerateSeed = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <SEO title="My Profile" description="Manage your Aurora Wallpapers account and view saved designs." />

      {/* User Information Header Card */}
      <section className="glass-card rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-border-theme/40 relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-accent-theme/10 rounded-full blur-[80px] pointer-events-none" />

        {/* User Profile Avatar */}
        <div className="relative group flex-shrink-0">
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
            alt="User avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-border-theme bg-surface-theme shadow-lg object-cover"
          />
          {editMode && (
            <button 
              onClick={regenerateSeed}
              className="absolute bottom-0 right-0 p-2 bg-accent-theme text-white border border-accent-theme/20 rounded-full hover:scale-105 transition-all shadow-md"
              title="Regenerate Avatar Art"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Details Block */}
        <div className="flex-grow text-center md:text-left space-y-4 w-full">
          {!editMode ? (
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary flex items-center justify-center md:justify-start gap-2">
                {user.displayName || user.email.split('@')[0]}
                <button 
                  onClick={() => setEditMode(true)}
                  className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-theme/60 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </h2>
              <p className="text-sm text-text-secondary font-medium">{user.email}</p>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme"
                  required
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Avatar seed"
                    value={avatarSeed}
                    onChange={(e) => setAvatarSeed(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl text-text-primary glass-input"
                    title="Dicebear Seed"
                  />
                  <button
                    type="button"
                    onClick={regenerateSeed}
                    className="px-3 py-2.5 bg-card-theme border border-border-theme/40 text-xs font-semibold rounded-xl hover:text-text-primary flex items-center gap-1 flex-shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" /> Roll
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-accent-theme text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-card-theme border border-border-theme/40 text-xs font-semibold text-text-secondary rounded-xl hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {updateSuccess && (
            <div className="text-emerald-400 text-xs font-medium flex items-center gap-1.5 justify-center md:justify-start">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          {/* Core Metrics Row */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
              <span className="font-bold text-text-primary">{favorites.length}</span> Favorites
            </div>
            <hr className="w-4 border-t border-border-theme/40 rotate-90" />
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Download className="w-4 h-4 text-accent-theme" />
              <span className="font-bold text-text-primary">{downloads.length}</span> Downloads
            </div>
          </div>
        </div>
      </section>

      {/* Profile Navigation Tabs */}
      <section className="space-y-6">
        <div className="flex border-b border-border-theme/40">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'favorites'
                ? 'border-accent-theme text-accent-theme'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorites ({favorites.length})
          </button>
          
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'downloads'
                ? 'border-accent-theme text-accent-theme'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Download className="w-4 h-4" />
            Downloads History ({downloads.length})
          </button>
        </div>

        {/* Tab Content Panels */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent-theme border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'favorites' ? (
                <motion.div
                  key="favs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <WallpaperGrid 
                    wallpapers={favorites} 
                    loading={false} 
                    hasMore={false} 
                    onFavoriteChange={loadUserData} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dls"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <WallpaperGrid 
                    wallpapers={downloads} 
                    loading={false} 
                    hasMore={false} 
                    onFavoriteChange={loadUserData} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
