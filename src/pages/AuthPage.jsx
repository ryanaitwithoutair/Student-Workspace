import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from '../router/router';
import { Leaf, Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck } from '../components/common/Icons';
import { useApp } from '../context/AppContext';

export const AuthPage = ({ initialSignUp }) => {
  const [searchParams] = useSearchParams();
  
  // Determine if default mode is sign up
  const [isSignUp, setIsSignUp] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('/signup')) return true;
    if (hash.includes('/login')) return false;
    if (initialSignUp !== undefined) return initialSignUp;
    return searchParams.get('mode') === 'signup';
  });

  const { login, signup, googleAuth } = useApp();
  const navigate = useNavigate();

  // Listen to hash changes directly
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash.includes('/signup')) {
        setIsSignUp(true);
      } else if (hash.includes('/login')) {
        setIsSignUp(false);
      } else if (initialSignUp !== undefined) {
        setIsSignUp(initialSignUp);
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, [initialSignUp]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-neutral-800', width: 'w-0' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!agreeTerms) {
        setError('Please accept the Terms of Service to continue.');
        return;
      }
      signup(name.trim(), email.trim(), password);
    } else {
      login(email.trim(), password);
    }

    navigate('/app');
  };

  const handleGoogleSignIn = () => {
    googleAuth();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-neutral-700 shadow-2xl relative z-10 space-y-7 animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
          </Link>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create Your Focus Sanctuary' : 'Welcome back to Evolve'}
            </h2>
            <p className="text-xs text-neutral-300 mt-1 font-medium">
              {isSignUp ? 'Start eliminating distractions and enter a state of deep flow' : 'Sign in to access your custom work spaces and focus tools'}
            </p>
          </div>
        </div>

        {/* Tab Switcher (Sign Up vs Sign In) */}
        <div className="flex items-center justify-center p-1 bg-neutral-800/80 rounded-xl border border-neutral-700">
          <button
            type="button"
            onClick={() => { 
              setIsSignUp(false); 
              setError(''); 
              window.location.hash = '/login';
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isSignUp ? 'bg-emerald-500 text-white shadow-md' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { 
              setIsSignUp(true); 
              setError(''); 
              window.location.hash = '/signup';
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isSignUp ? 'bg-emerald-500 text-white shadow-md' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Sage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-10 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {isSignUp && password && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold block text-right">
                  Strength: {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Terms checkbox */}
          {isSignUp && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <span className="text-xs text-neutral-300 font-medium">
                I agree to the <span className="text-emerald-400 font-semibold underline">Terms of Service</span> & Privacy Policy
              </span>
            </label>
          )}

          <button
            type="submit"
            className="w-full btn-emerald py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            {isSignUp ? 'Create Free Account' : 'Sign In to Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full"></div>
          <span className="bg-neutral-900 px-3 text-[11px] text-neutral-400 uppercase font-semibold shrink-0">Or continue with</span>
          <div className="border-t border-neutral-800 w-full"></div>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 rounded-xl glass-panel hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          Sign in with Google
        </button>

        {/* Footer text */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Storage & Secure Encryption Active</span>
        </div>
      </div>
    </div>
  );
};
