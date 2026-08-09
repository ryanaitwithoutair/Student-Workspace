import React, { useEffect } from 'react';
import { CheckCircle2, X } from './Icons';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    info: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
    error: 'border-red-500/40 bg-red-500/10 text-red-100',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fadeIn ${styles[type]}`}
    >
      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors ml-1"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
