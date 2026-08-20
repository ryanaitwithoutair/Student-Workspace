import React from 'react';
import { Link, useNavigate } from '../../router/router';
import { Leaf, Sparkles } from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-neutral-800 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Evolve<span className="text-emerald-400 font-light">.</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <a href="#about" className="hover:text-emerald-400 transition-colors">Philosophy</a>
          <a href="#preview" className="hover:text-emerald-400 transition-colors">Workspace Preview</a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/app')}
              className="btn-emerald px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
            >
              Open Workspace
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-emerald px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
