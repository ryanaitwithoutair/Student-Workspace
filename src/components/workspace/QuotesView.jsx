import React, { useState } from 'react';
import { 
  Quote as QuoteIcon, 
  RotateCw, 
  Heart, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen
} from '../common/Icons';
import { useApp } from '../../context/AppContext';

export const QuotesView = () => {
  const { currentQuote, refreshQuote, favoriteQuotes, toggleFavoriteQuote } = useApp();
  const [copied, setCopied] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleRefresh = () => {
    setIsFlipping(true);
    setTimeout(() => {
      refreshQuote();
      setIsFlipping(false);
    }, 250);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = favoriteQuotes.some(q => q.id === currentQuote.id);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
          <QuoteIcon className="w-8 h-8 text-emerald-400" />
          Daily Wisdom & Philosophy
        </h1>
        <p className="text-sm text-emerald-200 font-medium">
          Timeless insights from history's greatest philosophers, scientists, and masters of deep focus.
        </p>
      </div>

      {/* Main Display Quote Card */}
      <div className={`glass-panel rounded-3xl p-10 border border-emerald-400 relative overflow-hidden transition-all duration-300 ${
        isFlipping ? 'scale-95 opacity-50' : 'scale-100 opacity-100 shadow-2xl shadow-emerald-500/20'
      }`}>
        <div className="absolute top-6 left-6 text-emerald-400/15">
          <QuoteIcon className="w-32 h-32 -rotate-12" />
        </div>

        <div className="relative z-10 space-y-8 text-center max-w-2xl mx-auto py-4">
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400 text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentQuote.category}</span>
          </div>

          {/* Quote Body */}
          <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed text-white italic font-medium">
            "{currentQuote.quote}"
          </blockquote>

          {/* Author Details */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-emerald-300 tracking-wide">
              {currentQuote.author}
            </h3>
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
              {currentQuote.role}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-emerald-500/20">
            <button
              onClick={handleRefresh}
              className="px-6 py-2.5 rounded-xl glass-panel hover:bg-emerald-500/20 text-white transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RotateCw className={`w-4 h-4 text-emerald-400 ${isFlipping ? 'animate-spin' : ''}`} />
              Next Quote
            </button>

            <button
              onClick={() => toggleFavoriteQuote(currentQuote)}
              className={`p-2.5 rounded-xl glass-panel transition-all ${
                isFav ? 'bg-red-500/30 text-red-300 border-red-400' : 'text-emerald-200 hover:text-red-400'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl glass-panel text-white hover:text-emerald-300 transition-colors"
              title="Copy quote"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Favorite Quotes Section */}
      {favoriteQuotes.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-emerald-500/20 pb-3">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Your Saved Quotes ({favoriteQuotes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteQuotes.map((q) => (
              <div key={q.id} className="p-4 rounded-xl glass-panel border border-emerald-500/20 space-y-2">
                <p className="text-xs italic text-white font-medium">"{q.quote}"</p>
                <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                  <span>— {q.author}</span>
                  <button onClick={() => toggleFavoriteQuote(q)} className="text-red-400 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
