import React, { useState } from 'react';
import { useNavigate, Link } from '../router/router';
import { ArrowRight, Eye, EyeOff, Leaf, Lock, ShieldCheck } from '../components/common/Icons';
import { useApp } from '../context/AppContext';

export const ResetPasswordPage = () => {
  const { isPasswordRecovery, updatePasswordFromRecovery, clearPasswordRecovery } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 12) {
      setError('Use at least 12 characters for your new password.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePasswordFromRecovery(password);
      navigate('/app');
    } catch (resetError) {
      setError(resetError.message || 'Unable to reset your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const exitRecovery = () => {
    clearPasswordRecovery();
    navigate('/login');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] p-4 text-white sm:p-6">
      <div className="pointer-events-none absolute -top-36 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
      <section className="relative z-10 w-full max-w-md animate-fadeIn rounded-[2rem] border border-white/[0.11] bg-[linear-gradient(145deg,rgba(27,29,33,0.9),rgba(15,16,19,0.88))] p-6 shadow-[0_30px_80px_-36px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 group"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] shadow-lg shadow-emerald-500/[0.08]"><Leaf className="h-6 w-6 text-emerald-400" /></span></Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-[1.7rem]">Choose a new password</h1>
          <p className="mt-2 text-sm font-medium text-neutral-400">This one-time recovery session lets you secure your account.</p>
        </div>

        {!isPasswordRecovery ? (
          <div className="mt-7 text-center">
            <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">This recovery link is no longer active. Request a new link and open the newest email only.</div>
            <button type="button" onClick={exitRecovery} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"><ArrowRight className="h-4 w-4" /> Request another link</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/15 p-3.5 text-center text-sm font-medium text-red-100">{error}</div>}
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-neutral-200">New password</label>
              <div className="relative"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" /><input id="new-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="glass-input w-full rounded-xl py-3 pl-10 pr-12 text-sm" disabled={isLoading} /><button type="button" onClick={() => setShowPasswords((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              <p className="mt-2 text-xs text-neutral-500">Use at least 12 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-neutral-200">Confirm new password</label>
              <div className="relative"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" /><input id="confirm-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="glass-input w-full rounded-xl py-3 pl-10 pr-4 text-sm" disabled={isLoading} /></div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-emerald flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? 'Updating password...' : 'Update password'} {!isLoading && <ArrowRight className="h-4 w-4" />}</button>
          </form>
        )}

        <div className="mt-7 flex items-center justify-center gap-1.5 border-t border-neutral-800 pt-5 text-xs font-medium text-neutral-400"><ShieldCheck className="h-4 w-4 text-emerald-400" /><span>Secured by Supabase Authentication</span></div>
      </section>
    </main>
  );
};
