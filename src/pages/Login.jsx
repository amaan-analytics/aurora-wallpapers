import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export function Login() {
  const { login, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
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
      setError('Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email first to reset password.');
      return;
    }
    setIsResetting(true);
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to send reset link. Verify your email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-surface-theme/20 to-background-theme">
      <SEO title="Log In" description="Log in to your Aurora Wallpapers account to access your favorites and downloads." />

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
            Welcome Back
          </h2>
          <p className="text-sm text-text-secondary">
            Log in to manage your favorites and downloads.
          </p>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>A reset link has been dispatched to {email}.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl text-text-primary glass-input focus:ring-1 focus:ring-accent-theme transition-all"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-text-secondary">Password</label>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="text-xs font-medium text-accent-theme hover:underline disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-theme text-white text-sm font-semibold rounded-2xl shadow-lg shadow-accent-theme/20 hover:bg-accent-theme/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <hr className="border-border-theme/40" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-[10px] uppercase font-bold text-text-secondary bg-surface-theme border border-border-theme/40 rounded-md">
            Or continue with
          </span>
        </div>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-card-theme/60 border border-border-theme/50 text-text-primary text-sm font-semibold rounded-2xl hover:bg-card-theme hover:border-accent-theme/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {/* Simple google SVG */}
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.568a5.94 5.94 0 0 1 5.99-5.952c1.624 0 3.102.617 4.226 1.625l3.14-3.14A10.12 10.12 0 0 0 13.99 2 10.18 10.18 0 0 0 4 12.182a10.18 10.18 0 0 0 9.99 10.182c5.61 0 9.77-3.945 9.77-9.932 0-.6-.05-1.182-.15-1.745H12.24Z"
            />
          </svg>
          Google Account
        </button>

        {/* Call to Register */}
        <div className="mt-8 text-center text-xs text-text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent-theme hover:underline inline-flex items-center gap-0.5">
            Create account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
