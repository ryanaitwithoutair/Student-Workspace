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
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background ambient lighting glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-neutral-700 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Eliminate Distractions • Master Continuous Flow</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            A sanctuary for <br />
            <span className="emerald-gradient-text">deep, uninterrupted focus.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-300 font-normal leading-relaxed">
            Evolve pairs customizable sensory spaces, procedural ambient audio soundscapes, and minimalist Pomodoro workflows into a serene workspace for original thought.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate('/app')}
                className="btn-emerald px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 w-full sm:w-auto shadow-2xl"
              >
                Open Your Focus Workspace
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>

                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-2xl glass-panel hover:bg-neutral-800 text-neutral-200 font-semibold text-base transition-all w-full sm:w-auto border border-neutral-700 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Sign In to Sanctuary
                </button>
              </>
            )}

            <a
              href="#preview"
              className="px-6 py-4 rounded-2xl glass-panel hover:bg-neutral-800 text-neutral-300 font-semibold text-base transition-all w-full sm:w-auto border border-neutral-800"
            >
              Explore Workspace
            </a>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Free & Local Storage</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Zero Audio Downloads</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Instant Account Access</span>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Designed for Cognitive Calm
          </h2>
          <p className="text-sm text-neutral-400">
            Interactive preview of the Evolve focus sanctuary
          </p>
        </div>

        {/* Live Mockup UI Container */}
        <div className="glass-panel rounded-3xl p-4 md:p-8 border border-neutral-700 shadow-2xl relative overflow-hidden">
          <div className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
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
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-neutral-700"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {activeSoundId === 'rain' ? 'Rain Playing' : 'Play Ambient Rain'}
                </button>
              </div>
            </div>

            {/* Content Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Spaces */}
              <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-4">
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
              <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-4 flex flex-col items-center justify-center text-center">
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
              <div className="glass-panel p-6 rounded-2xl border border-neutral-800 space-y-4">
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
      <section id="about" className="py-20 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            The Philosophy of Deep Work
          </h2>
          <p className="max-w-2xl mx-auto text-base text-neutral-300 leading-relaxed">
            In an economy driven by superficial notifications, deep focus is the ultimate competitive superpower.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Distraction Shield</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clean visual architecture eliminates clutter, preventing context switching and decision fatigue.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Procedural Acoustics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Synthesized noise spectrums mask environmental interruptions and stimulate alpha/gamma brainwaves.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-neutral-800 space-y-4">
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
      <section className="py-20 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="glass-panel rounded-3xl p-10 md:p-14 border border-neutral-700 space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
            <UserCheck className="w-7 h-7" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Ready to enter your personal flow state?
          </h2>

          <p className="max-w-xl mx-auto text-sm text-neutral-300 leading-relaxed">
            Create your account to save custom image environments, bookmark links, notes, and task schedules.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">

            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-xl glass-panel hover:bg-neutral-800 text-white font-semibold text-sm transition-all w-full sm:w-auto border border-neutral-700"
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
