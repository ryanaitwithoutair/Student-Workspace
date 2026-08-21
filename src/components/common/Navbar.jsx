import React from 'react';
import { Link, useNavigate } from '../../router/router';
import { Leaf, Sparkles } from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#0a0b0d]/78 px-4 py-3 backdrop-blur-2xl sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] shadow-[0_10px_24px_-16px_rgba(16,185,129,0.8)] transition-transform duration-200 group-hover:scale-105">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Evolve<span className="text-emerald-400 font-light">.</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#about" className="nav-link">Philosophy</a>
          <a href="#preview" className="nav-link">Workspace Preview</a>
          <a href="#features" className="nav-link">Features</a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/app')}
              className="btn-emerald rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 sm:px-5"
            >
              Open Workspace
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-emerald rounded-xl px-4 py-2.5 text-sm font-bold sm:px-5"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
