import React from 'react';
import { useNavigate } from '../router/router';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  LayoutGrid, 
  Timer, 
  Quote, 
  CheckCircle2 as CheckCircle,
  UserCheck,
  Lock
} from '../components/common/Icons';
import { useApp } from '../context/AppContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { toggleSound, activeSoundId, user } = useApp();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero relative overflow-hidden px-5 pb-24 pt-16 sm:px-6 sm:pt-20 md:pb-32">
        {/* Background ambient lighting glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-5xl space-y-7 text-center sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2 text-xs font-semibold text-emerald-300 shadow-[0_12px_32px_-20px_rgba(16,185,129,0.75)]">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Eliminate Distractions • Master Continuous Flow</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl md:text-7xl">
            A sanctuary for{' '}
            <span className="emerald-gradient-text">deep, uninterrupted focus.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-neutral-300 sm:text-lg md:text-xl">
            Evolve pairs customizable sensory spaces, procedural ambient audio soundscapes, and minimalist Pomodoro workflows into a serene workspace for original thought.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 pt-3 sm:flex-row sm:gap-4">
            {user ? (
              <button
                onClick={() => navigate('/app')}
                className="btn-emerald flex w-full items-center justify-center gap-3 rounded-2xl px-7 py-3.5 text-base font-bold shadow-2xl sm:w-auto sm:px-8 sm:py-4"
              >
                Open Your Focus Workspace
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>

                <button
                  onClick={() => navigate('/login')}
                  className="btn-emerald flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold shadow-2xl sm:w-auto sm:px-8 sm:py-4"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Sign In to Sanctuary
                </button>
              </>
            )}

            <a
              href="#preview"
              className="glass-panel w-full rounded-2xl border border-white/[0.1] px-6 py-3.5 text-base font-semibold text-neutral-200 transition-all hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.06] sm:w-auto sm:py-4"
            >
              Explore Workspace
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 pt-7 text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Private two-user workspace</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> No audio downloads</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /> Secure cloud sync</span>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-20 sm:px-6">
        <div className="mb-12 space-y-3 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Designed for Cognitive Calm
          </h2>
          <p className="text-sm text-neutral-400">
            Interactive preview of the Evolve focus sanctuary
          </p>
        </div>

        {/* Live Mockup UI Container */}
        <div className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/[0.11] p-3 shadow-2xl sm:p-4 md:p-7">
          <div className="w-full space-y-6 rounded-[1.45rem] border border-white/[0.07] bg-[#0a0b0d]/80 p-5 sm:p-6">
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-xs text-neutral-400 font-mono ml-4">evolve.app/workspace/zen-forest</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSound('rain')}
                  className="flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/[0.12]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {activeSoundId === 'rain' ? 'Rain Playing' : 'Play Ambient Rain'}
                </button>
              </div>
            </div>

            {/* Content Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Spaces */}
              <div className="feature-card glass-panel space-y-4 rounded-2xl border border-white/[0.08] p-6">
                <div className="flex items-center gap-3 text-emerald-400">
                  <LayoutGrid className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Zen Forest Space</h3>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tailored visual backdrop with space-specific markdown notes and quick bookmark links.
                </p>
                <div className="p-3 rounded-xl bg-black/40 text-[11px] text-neutral-300 font-mono border border-neutral-800">
                  Goal: Complete system design sprint
                </div>
              </div>

              {/* Card 2: Timer */}
              <div className="feature-card glass-panel flex flex-col items-center justify-center space-y-4 rounded-2xl border border-white/[0.08] p-6 text-center">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Timer className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Pomodoro Timer</h3>
                </div>
                <span className="text-4xl font-mono font-bold text-white tracking-tight my-2">
                  25:00
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
                  Ready to Focus
                </span>
              </div>

              {/* Card 3: Wisdom */}
              <div className="feature-card glass-panel space-y-4 rounded-2xl border border-white/[0.08] p-6">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Quote className="w-5 h-5" />
                  <h3 className="font-bold text-sm text-white">Daily Stoicism</h3>
                </div>
                <p className="text-xs italic text-neutral-300 leading-relaxed">
                  "You have power over your mind - not outside events."
                </p>
                <span className="text-[11px] font-bold text-emerald-400 block">— Marcus Aurelius</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Philosophy Section */}
      <section id="about" className="mx-auto w-full max-w-5xl scroll-mt-24 space-y-12 px-5 py-20 sm:px-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            The Philosophy of Deep Work
          </h2>
          <p className="max-w-2xl mx-auto text-base text-neutral-300 leading-relaxed">
            In an economy driven by superficial notifications, deep focus is the ultimate competitive superpower.
          </p>
        </div>

        <div id="features" className="grid scroll-mt-24 grid-cols-1 gap-8 md:grid-cols-3">
          <div className="feature-card glass-panel space-y-4 rounded-3xl border border-white/[0.08] p-7 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Distraction Shield</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clean visual architecture eliminates clutter, preventing context switching and decision fatigue.
            </p>
          </div>

          <div className="feature-card glass-panel space-y-4 rounded-3xl border border-white/[0.08] p-7 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Procedural Acoustics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Synthesized noise spectrums mask environmental interruptions and stimulate alpha/gamma brainwaves.
            </p>
          </div>

          <div className="feature-card glass-panel space-y-4 rounded-3xl border border-white/[0.08] p-7 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Flow Timeboxing</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Pomodoro rhythms encourage intense work bursts followed by cognitive recovery breaks.
            </p>
          </div>
        </div>
      </section>

      {/* Authentication Call To Action Section */}
      <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center sm:px-6">
        <div className="glass-panel relative overflow-hidden space-y-6 rounded-[2rem] border border-emerald-400/18 p-8 sm:p-10 md:p-14">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <UserCheck className="w-7 h-7" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Ready for your next focused session?
          </h2>

          <p className="max-w-xl mx-auto text-sm text-neutral-300 leading-relaxed">
            Sign in to continue with your environments, focus history, notes, and task schedule.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">

            <button
              onClick={() => navigate('/login')}
              className="btn-emerald w-full rounded-xl px-8 py-3.5 text-sm font-bold sm:w-auto"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
