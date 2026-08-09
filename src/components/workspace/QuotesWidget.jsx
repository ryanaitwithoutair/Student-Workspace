import React, { useState } from 'react';
import { 
  Quote as QuoteIcon, 
  RotateCw, 
  Heart, 
  Copy, 
  Check, 
  X 
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { DraggableResizable } from '../common/DraggableResizable';
import { useWidgetTranslucency } from '../../hooks/useWidgetTranslucency';

export const QuotesWidget = () => {
  const { 
    currentQuote, 
    refreshQuote, 
    favoriteQuotes, 
    toggleFavoriteQuote,
    toggleQuotesWidget,
  } = useApp();

  const { widgetBgStyle } = useWidgetTranslucency();

  const [copied, setCopied] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleQuoteRefresh = () => {
    setIsFlipping(true);
    setTimeout(() => {
      refreshQuote();
      setIsFlipping(false);
    }, 250);
  };

  const handleQuoteCopy = () => {
    if (!currentQuote) return;
    navigator.clipboard.writeText(`"${currentQuote.quote}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFav = currentQuote && favoriteQuotes ? favoriteQuotes.some(q => q.id === currentQuote.id) : false;

  if (!currentQuote) return null;

  return (
    <DraggableResizable
      storageKey="floating_quote_v3"
      defaultSize={380}
      resizable={false}
      defaultPosition={{ x: 30, y: 120 }}
      className="fixed z-40 animate-fadeIn"
    >
      {() => (
        <div 
          style={widgetBgStyle}
          className="rounded-3xl p-6 border border-emerald-500/40 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-emerald-400"
        >
          {/* Luminous Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="absolute top-4 right-4 text-emerald-500/10 pointer-events-none">
            <QuoteIcon className="w-20 h-20" />
          </div>

          <div className="relative z-10 space-y-4 no-drag">
            {/* Header with Category Tag and Controls */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                {currentQuote.category}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleQuoteRefresh}
                  className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 transition-colors backdrop-blur-md"
                  title="Next Quote"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isFlipping ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => toggleFavoriteQuote(currentQuote)}
                  className={`p-1.5 rounded-lg transition-colors backdrop-blur-md ${
                    isFav ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-400'
                  }`}
                  title="Favorite"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleQuoteCopy}
                  className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 transition-colors backdrop-blur-md"
                  title="Copy Quote"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Close Widget Button */}
                <button
                  onClick={toggleQuotesWidget}
                  className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors backdrop-blur-md"
                  title="Close Quotes Widget"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quote Body */}
            <blockquote className="text-sm md:text-base font-serif italic text-white leading-relaxed drop-shadow-sm">
              "{currentQuote.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/80">
              <span className="font-bold text-emerald-400">— {currentQuote.author}</span>
              <span className="text-[10px] text-neutral-400 font-medium">{currentQuote.role}</span>
            </div>
          </div>
        </div>
      )}
    </DraggableResizable>
  );
};
