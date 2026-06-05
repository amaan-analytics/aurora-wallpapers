import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Download, 
  Heart, 
  ShieldAlert, 
  Eye, 
  TrendingUp, 
  Calendar,
  Grid,
  FileText,
  UserX,
  Settings
} from 'lucide-react';
import { getAdminStats } from '../services/db';
import { SEO } from '../components/SEO';

export function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview', 'users', 'downloads', 'settings'

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const adminData = await getAdminStats();
        setStats(adminData);
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-theme border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard Stats Definitions
  const metrics = [
    { 
      name: 'Registered Users', 
      value: stats?.totalUsers || 0, 
      change: '+12% this week', 
      icon: <Users className="w-5 h-5 text-accent-theme" />,
      color: 'bg-accent-theme/10 border-accent-theme/20' 
    },
    { 
      name: 'Total Downloads', 
      value: stats?.totalDownloads || 0, 
      change: '+24% this week', 
      icon: <Download className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      name: 'Wallpapers Favorited', 
      value: stats?.totalFavorites || 0, 
      change: '+8% this week', 
      icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />,
      color: 'bg-rose-500/10 border-rose-500/20' 
    },
    { 
      name: 'Total Views (Est.)', 
      value: (stats?.totalDownloads || 0) * 4 + 87, 
      change: '+15% this week', 
      icon: <Eye className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-500/10 border-amber-500/20' 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SEO title="Admin Dashboard" description="Aurora admin dashboard for managing users and viewing download metrics." />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-accent-theme" />
            Admin Dashboard
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Overview of users registration, favorites counts, and download trends.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-card-theme/50 border border-border-theme/40 rounded-2xl p-1 self-start">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'overview'
                ? 'bg-accent-theme text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'users'
                ? 'bg-accent-theme text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveSubTab('downloads')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'downloads'
                ? 'bg-accent-theme text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Downloads Log
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'settings'
                ? 'bg-accent-theme text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* -------------------- OVERVIEW TAB -------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m) => (
              <div key={m.name} className="glass-card rounded-2xl p-5 border border-border-theme/40 flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${m.color} flex-shrink-0`}>
                  {m.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-text-secondary font-medium block">{m.name}</span>
                  <span className="text-2xl font-bold text-text-primary block">{m.value}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> {m.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent users snippet */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-border-theme/40 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-accent-theme" />
                Newly Registered Users
              </h3>
              
              <div className="space-y-3">
                {stats?.users?.slice(0, 4).map((usr) => (
                  <div key={usr.uid} className="flex items-center justify-between border-b border-border-theme/20 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={usr.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.email}`} 
                        alt="" 
                        className="w-8 h-8 rounded-full bg-surface-theme border border-border-theme/40"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">{usr.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-text-secondary">{usr.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-card-theme rounded-md border border-border-theme/30 capitalize">
                      {usr.role || 'user'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent downloads snippet */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-border-theme/40 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4.5 h-4.5 text-emerald-500" />
                Recent Download Logs
              </h3>

              <div className="space-y-3">
                {stats?.recentDownloads?.length === 0 ? (
                  <div className="text-xs text-text-secondary text-center py-6">No downloads logged yet.</div>
                ) : (
                  stats?.recentDownloads?.slice(0, 4).map((dl, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border-theme/20 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={dl.imageUrl}
                          alt=""
                          className="w-10 h-7 rounded object-cover border border-border-theme/40"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary truncate max-w-[150px]">
                            Wallpaper #{dl.wallpaperId}
                          </span>
                          <span className="text-[9px] text-text-secondary">
                            By {dl.photographer}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-text-secondary block font-medium">
                          User ID: {dl.userId.substring(0, 8)}...
                        </span>
                        <span className="text-[9px] text-text-secondary block">
                          {new Date(dl.downloadDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- USERS MANAGEMENT TAB -------------------- */}
      {activeSubTab === 'users' && (
        <div className="glass-card rounded-2xl border border-border-theme/40 p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-base font-bold text-text-primary">User Accounts</h3>
            <span className="text-xs text-text-secondary font-medium">Total registered: {stats?.users?.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-theme/40 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">User details</th>
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Registration Date</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-theme/20">
                {stats?.users?.map((usr) => (
                  <tr key={usr.uid} className="text-xs text-text-secondary hover:bg-card-theme/20">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={usr.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${usr.email}`} 
                          alt="" 
                          className="w-8 h-8 rounded-full border border-border-theme/40 bg-surface-theme"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary">{usr.name || 'Anonymous'}</span>
                          <span className="text-[10px] text-text-secondary">{usr.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[10px]">{usr.uid}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        usr.role === 'admin' 
                          ? 'bg-accent-theme/10 text-accent-theme border border-accent-theme/20' 
                          : 'bg-card-theme border border-border-theme/40 text-text-secondary'
                      }`}>
                        {usr.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4">
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'N/A'}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button 
                        onClick={() => alert(`Moderating user ${usr.name || usr.email}`)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Ban User"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- DOWNLOADS LOG TAB -------------------- */}
      {activeSubTab === 'downloads' && (
        <div className="glass-card rounded-2xl border border-border-theme/40 p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary">Download History Audit</h3>
            <span className="text-xs text-text-secondary font-medium">Logged count: {stats?.recentDownloads?.length}</span>
          </div>

          <div className="overflow-x-auto">
            {stats?.recentDownloads?.length === 0 ? (
              <div className="text-xs text-text-secondary py-12 text-center">No downloads logged yet. Download a wallpaper to view audit trail.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-theme/40 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Wallpaper</th>
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Color Info</th>
                    <th className="pb-3">Dimensions</th>
                    <th className="pb-3 pr-2 text-right">Download Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-theme/20">
                  {stats?.recentDownloads?.map((dl, idx) => (
                    <tr key={idx} className="text-xs text-text-secondary hover:bg-card-theme/20">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={dl.imageUrl} 
                            alt="" 
                            className="w-11 h-8 rounded object-cover border border-border-theme/40 bg-surface-theme"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">ID #{dl.wallpaperId}</span>
                            <span className="text-[10px] text-text-secondary">By {dl.photographer}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[10px]">{dl.userId}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: dl.avgColor }} />
                          <span className="font-semibold">{dl.avgColor}</span>
                        </div>
                      </td>
                      <td className="py-4">{dl.width} × {dl.height}</td>
                      <td className="py-4 text-right pr-2 font-medium">
                        {new Date(dl.downloadDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* -------------------- SETTINGS TAB -------------------- */}
      {activeSubTab === 'settings' && (
        <div className="glass-card rounded-2xl border border-border-theme/40 p-6 space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-text-primary">Moderation & Platform Settings</h3>
            <p className="text-xs text-text-secondary mt-0.5">Control the API search defaults, download limits, and curation filters.</p>
          </div>

          <hr className="border-border-theme/40" />

          <div className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Pexels Search SafeSearch Default</label>
              <select className="w-full px-3 py-2 text-xs rounded-xl text-text-primary glass-input">
                <option value="true">SafeSearch Enabled (Standard)</option>
                <option value="false">SafeSearch Disabled</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Free Users Hourly Download Limit</label>
              <input type="number" defaultValue={20} className="w-full px-3 py-2 text-xs rounded-xl text-text-primary glass-input" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-border-theme/40 text-accent-theme focus:ring-accent-theme" />
              <label className="text-xs font-medium text-text-secondary">Log anonymous user download events for metrics</label>
            </div>

            <button
              onClick={() => alert('Platform settings saved successfully (mockup)')}
              className="px-4 py-2 bg-accent-theme text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow shadow-accent-theme/20"
            >
              <Settings className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
