import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '../router/router';
import { Leaf, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from '../components/common/Icons';
import { useApp } from '../context/AppContext';

export const AuthPage = () => {
  const { login, user, isAuthLoading } = useApp();
  const navigate = useNavigate();

  // If already logged in, redirect to app
  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/app');
    }
  }, [user, isAuthLoading, navigate]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
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

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] p-4 text-white sm:p-6">
      {/* Background ambient lighting */}
      <div className="absolute -top-36 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <section aria-labelledby="auth-heading" className="relative z-10 w-full max-w-md animate-fadeIn rounded-[2rem] border border-white/[0.11] bg-[linear-gradient(145deg,rgba(27,29,33,0.9),rgba(15,16,19,0.88))] p-6 shadow-[0_30px_80px_-36px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
        {/* Logo & Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] shadow-lg shadow-emerald-500/[0.08] transition-all group-hover:scale-105 group-hover:border-emerald-400/50">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
          </Link>

          <div>
            <h1 id="auth-heading" className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">
              Welcome back to Evolve
            </h1>
            <p className="text-sm text-neutral-400 mt-2 font-medium">
              Sign in to access your focus workspace.
            </p>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div role="alert" className="mt-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-100 text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-7">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-neutral-200 mb-2">Email address</label>
            <div className="relative">
              <Mail aria-hidden="true" className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-neutral-200 mb-2">Password</label>
            <div className="relative">
              <Lock aria-hidden="true" className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-12 py-3 text-sm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-emerald flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign in to workspace'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer text */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-medium mt-7 pt-5 border-t border-neutral-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured by Supabase Authentication</span>
        </div>
      </section>
    </main>
  );
};
