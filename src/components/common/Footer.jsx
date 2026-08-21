import React from 'react';
import { Leaf, Heart, Github, Twitter, Linkedin } from './Icons';

export const Footer = () => {
  return (
    <footer className="w-full glass-panel border-t border-emerald-500/10 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-emerald-50">Evolve</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-emerald-200/60 leading-relaxed">
            A sanctuary designed for deep work, cognitive clarity, and sustained flow state.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-emerald-300 uppercase tracking-wider mb-4">Workspace</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="#preview" className="hover:text-emerald-400">Custom Spaces</a></li>
            <li><a href="#features" className="hover:text-emerald-400">Procedural Sounds</a></li>
            <li><a href="#features" className="hover:text-emerald-400">Pomodoro Timer</a></li>
            <li><a href="#features" className="hover:text-emerald-400">Daily Wisdom</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-emerald-300 uppercase tracking-wider mb-4">Philosophy</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li><a href="#about" className="hover:text-emerald-400">Deep Work Principles</a></li>
            <li><a href="#about" className="hover:text-emerald-400">Distraction Elimination</a></li>
            <li><a href="#about" className="hover:text-emerald-400">Brainwave Entrainment</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-emerald-300 uppercase tracking-wider mb-4">Connect</h4>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-emerald-500/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
        <p>© {new Date().getFullYear()} Evolve Workspace. Built for uninterrupted flow.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> for thinkers & creators.
        </p>
      </div>
    </footer>
  );
};
