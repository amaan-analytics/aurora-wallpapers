import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export function Signup() {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please complete all form fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, name);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await googleLogin();
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-surface-theme/20 to-background-theme">
      <SEO title="Sign Up" description="Create a new Aurora account to build your custom 4K wallpaper collections." />

      {/* Decorative backdrop blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-theme/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-border-theme/40 relative z-10 shadow-2xl"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Create Account
          </h2>
          <p className="text-sm text-text-secondary">
            Join Aurora and save your favorite wallpapers in the cloud.
          </p>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Aria Bennett"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all"
                required
              />
            </div>
          </div>

          {/* Email Address field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="email"
                placeholder="aria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Password (Min 6 chars)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all"
                required
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-theme text-white text-sm font-semibold rounded-2xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <hr className="border-border-theme/40" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] uppercase font-bold text-text-secondary bg-surface-theme border border-border-theme/40 rounded-md">
            Or continue with
          </span>
        </div>

        {/* Google register button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-card-theme/60 border border-border-theme/50 text-text-primary text-sm font-semibold rounded-2xl hover:bg-card-theme hover:border-accent-theme/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.568a5.94 5.94 0 0 1 5.99-5.952c1.624 0 3.102.617 4.226 1.625l3.14-3.14A10.12 10.12 0 0 0 13.99 2 10.18 10.18 0 0 0 4 12.182a10.18 10.18 0 0 0 9.99 10.182c5.61 0 9.77-3.945 9.77-9.932 0-.6-.05-1.182-.15-1.745H12.24Z"
            />
          </svg>
          Google Account
        </button>

        {/* Call to Login */}
        <div className="mt-8 text-center text-xs text-text-secondary">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-accent-theme hover:underline inline-flex items-center gap-0.5">
            Log in here
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
