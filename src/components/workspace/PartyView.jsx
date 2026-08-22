import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Radio,
  RotateCw,
  Square,
  Users,
  X,
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

const ONLINE_WINDOW_MS = 75_000;
const INVITE_DURATIONS = [25, 50, 90];

const getErrorMessage = (error) => {
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'Party setup is unavailable. Run the latest supabase/schema.sql, then refresh this page.';
  }
  return error?.message || 'Something went wrong. Please try again.';
};

const formatCountdown = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const formatDuration = (minutes) => `${minutes} min`;

const getRemainingSeconds = (session, now) => {
  if (!session?.started_at) return 0;
  const endsAt = new Date(session.started_at).getTime() + (session.duration_minutes * 60_000);
  return Math.max(0, Math.ceil((endsAt - now) / 1_000));
};

const getExpirySeconds = (invite, now) => Math.max(0, Math.ceil((new Date(invite.expires_at).getTime() - now) / 1_000));

const ActionButton = ({ children, className = '', disabled, ...props }) => (
  <button
    type="button"
    disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const PartyView = () => {
  const { showToast, user } = useApp();
  const [party, setParty] = useState({ partner: null, invitations: [], sessions: [] });
  const [partnerPresence, setPartnerPresence] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [duration, setDuration] = useState(25);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const completedSessionRef = useRef(null);

  const loadParty = useCallback(async ({ quiet = false } = {}) => {
    if (!isSupabaseConfigured || !user?.id) {
      setError('Supabase is not configured for this deployment.');
      setIsLoading(false);
      return;
    }

    if (!quiet) setIsLoading(true);
    try {
      const [partnerResult, invitationsResult, sessionsResult] = await Promise.all([
        supabase.rpc('get_party_partner'),
        supabase
          .from('party_invitations')
          .select('id, sender_id, recipient_id, duration_minutes, status, created_at, expires_at, responded_at')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('party_sessions')
          .select('id, invitation_id, created_by, user_one_id, user_two_id, duration_minutes, status, started_at, ended_at')
          .order('started_at', { ascending: false })
          .limit(10),
      ]);

      if (partnerResult.error) throw partnerResult.error;
      if (invitationsResult.error) throw invitationsResult.error;
      if (sessionsResult.error) throw sessionsResult.error;

      const partner = partnerResult.data?.[0] || null;
      let presence = null;
      if (partner?.partner_id) {
        const presenceResult = await supabase
          .from('party_presence')
          .select('heartbeat_at')
          .eq('user_id', partner.partner_id)
          .maybeSingle();
        if (presenceResult.error) throw presenceResult.error;
        presence = presenceResult.data;
      }

      setParty({
        partner,
        invitations: invitationsResult.data || [],
        sessions: sessionsResult.data || [],
      });
      setPartnerPresence(presence);
      setError('');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void loadParty(); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadParty]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return undefined;

    const refresh = () => { void loadParty({ quiet: true }); };
    const channel = supabase
      .channel(`party-view-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_presence' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_invitations' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_sessions' }, refresh)
      .subscribe();
    const poll = window.setInterval(refresh, 15_000);

    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [loadParty, user?.id]);

  const activeSession = useMemo(
    () => party.sessions.find((session) => session.status === 'active') || null,
    [party.sessions],
  );
  const remainingSeconds = getRemainingSeconds(activeSession, now);
  const currentInvitations = useMemo(
    () => party.invitations.filter((invite) => invite.status === 'pending' && getExpirySeconds(invite, now) > 0),
    [party.invitations, now],
  );
  const incomingInvitation = currentInvitations.find((invite) => invite.recipient_id === user?.id) || null;
  const outgoingInvitation = currentInvitations.find((invite) => invite.sender_id === user?.id) || null;
  const partnerOnline = Boolean(
    partnerPresence?.heartbeat_at
    && now - new Date(partnerPresence.heartbeat_at).getTime() <= ONLINE_WINDOW_MS,
  );

  useEffect(() => {
    if (!activeSession || remainingSeconds > 0) {
      completedSessionRef.current = null;
      return;
    }
    if (completedSessionRef.current === activeSession.id) return;

    completedSessionRef.current = activeSession.id;
    const completeExpiredSession = async () => {
      const { error: completeError } = await supabase.rpc('complete_party_session', {
        p_session_id: activeSession.id,
      });
      if (completeError && completeError.code !== 'PGRST116') setError(getErrorMessage(completeError));
      await loadParty({ quiet: true });
    };
    void completeExpiredSession();
  }, [activeSession, loadParty, remainingSeconds]);

  const runAction = async (name, task, successMessage) => {
    setAction(name);
    setError('');
    try {
      await task();
      if (successMessage) showToast(successMessage);
      await loadParty({ quiet: true });
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setAction('');
    }
  };

  const sendInvite = () => {
    const targetEmail = party.partner?.partner_email || recipientEmail.trim();
    if (!targetEmail) {
      setError('Enter your partner’s approved email first.');
      return;
    }

    void runAction('send', async () => {
      const { error: inviteError } = await supabase.rpc('send_party_invite', {
        p_recipient_email: targetEmail,
        p_duration_minutes: duration,
      });
      if (inviteError) throw inviteError;
    }, 'Invite sent — it expires in two minutes.');
  };

  const respondToInvite = (invite, accept) => {
    void runAction(accept ? 'accept' : 'decline', async () => {
      const { error: responseError } = await supabase.rpc('respond_to_party_invite', {
        p_invite_id: invite.id,
        p_accept: accept,
      });
      if (responseError) throw responseError;
    }, accept ? 'Shared focus session started.' : 'Invitation declined.');
  };

  const endSession = () => {
    if (!activeSession) return;
    void runAction('end', async () => {
      const { error: endError } = await supabase.rpc('end_party_session', {
        p_session_id: activeSession.id,
      });
      if (endError) throw endError;
    }, 'Shared focus session ended.');
  };

  const lastSession = party.sessions.find((session) => session.status !== 'active') || null;
  const invitationExpiresIn = incomingInvitation || outgoingInvitation
    ? getExpirySeconds(incomingInvitation || outgoingInvitation, now)
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-fadeIn pb-10">
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-white/[0.09] bg-[#101216]/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-end sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            <Users className="h-4 w-4" /> Private party
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Focus together</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            A private shared timer for the two of you. There are no room codes, public links, or open lobbies.
          </p>
        </div>
        <ActionButton
          onClick={() => void loadParty()}
          disabled={isLoading || Boolean(action)}
          className="border-white/[0.1] bg-white/[0.04] text-neutral-200 hover:border-white/[0.2] hover:bg-white/[0.08]"
        >
          <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </ActionButton>
      </section>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[1.35fr_.85fr]">
        <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#111318]/90 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08]">
                <Radio className={`h-5 w-5 ${partnerOnline ? 'text-emerald-400' : 'text-neutral-500'}`} />
              </div>
              <div>
                <h2 className="font-bold text-white">{party.partner ? party.partner.partner_email : 'Your partner'}</h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {party.partner ? (partnerOnline ? 'Online and ready to focus' : 'Offline — invitations unlock when they return') : 'Connect your approved partner to begin'}
                </p>
              </div>
            </div>
            {party.partner && (
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${partnerOnline ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-white/[0.09] bg-white/[0.04] text-neutral-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${partnerOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-neutral-500'}`} />
                {partnerOnline ? 'Online' : 'Offline'}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-7">
            {isLoading ? (
              <div className="flex min-h-56 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/25 border-t-emerald-400" /></div>
            ) : activeSession ? (
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Shared focus in progress</p>
                <div className="mt-5 text-6xl font-black tabular-nums tracking-tight text-white sm:text-7xl">{formatCountdown(remainingSeconds)}</div>
                <p className="mt-3 text-sm text-neutral-400">{formatDuration(activeSession.duration_minutes)} session · ends for both of you at the same time</p>
                <div className="mt-7 flex justify-center">
                  <ActionButton
                    onClick={endSession}
                    disabled={Boolean(action)}
                    className="border-red-400/30 bg-red-500/[0.08] text-red-200 hover:bg-red-500/[0.16]"
                  >
                    <Square className="h-4 w-4" /> {action === 'end' ? 'Ending…' : 'End for both'}
                  </ActionButton>
                </div>
              </div>
            ) : incomingInvitation ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Incoming invite</p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">Focus together for {formatDuration(incomingInvitation.duration_minutes)}?</h3>
                <p className="mt-2 text-sm text-neutral-400">Accept before the invite expires in {formatCountdown(invitationExpiresIn)}.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ActionButton onClick={() => respondToInvite(incomingInvitation, true)} disabled={Boolean(action)} className="border-emerald-400/45 bg-emerald-500 text-[#03261c] hover:bg-emerald-300">
                    <Check className="h-4 w-4" /> {action === 'accept' ? 'Starting…' : 'Accept and start'}
                  </ActionButton>
                  <ActionButton onClick={() => respondToInvite(incomingInvitation, false)} disabled={Boolean(action)} className="border-white/[0.12] bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]">
                    <X className="h-4 w-4" /> {action === 'decline' ? 'Declining…' : 'Decline'}
                  </ActionButton>
                </div>
              </div>
            ) : outgoingInvitation ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08]"><Radio className="h-6 w-6 animate-pulse text-emerald-400" /></div>
                <h3 className="mt-5 text-2xl font-extrabold text-white">Waiting for your partner</h3>
                <p className="mt-2 text-sm text-neutral-400">Your {formatDuration(outgoingInvitation.duration_minutes)} invitation expires in {formatCountdown(invitationExpiresIn)}.</p>
              </div>
            ) : party.partner ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Start a shared session</p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">Pick a pace that works for both of you.</h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  {INVITE_DURATIONS.map((minutes) => (
                    <button
                      type="button"
                      key={minutes}
                      onClick={() => setDuration(minutes)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${duration === minutes ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-500/10' : 'border-white/[0.09] bg-white/[0.03] text-neutral-400 hover:border-white/[0.18] hover:text-white'}`}
                    >
                      {formatDuration(minutes)}
                    </button>
                  ))}
                </div>
                <ActionButton
                  onClick={sendInvite}
                  disabled={!partnerOnline || Boolean(action)}
                  className="mt-6 w-full border-emerald-400/45 bg-emerald-500 text-[#03261c] hover:bg-emerald-300 sm:w-auto"
                >
                  <ArrowRight className="h-4 w-4" /> {action === 'send' ? 'Sending invite…' : `Invite for ${formatDuration(duration)}`}
                </ActionButton>
                {!partnerOnline && <p className="mt-3 text-xs text-neutral-500">Your partner needs to have the workspace open before you can invite them.</p>}
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">One-time connection</p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">Invite your partner while they’re online.</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">Enter the email for their already-approved Evolve account. It is used only to create this private pairing; no code or link is created.</p>
                <label className="mt-6 block text-xs font-bold uppercase tracking-[0.14em] text-neutral-400" htmlFor="partner-email">Partner’s approved email</label>
                <input
                  id="partner-email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value.slice(0, 254))}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="partner@example.com"
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/15"
                />
                <div className="mt-5 flex flex-wrap gap-2">
                  {INVITE_DURATIONS.map((minutes) => (
                    <button type="button" key={minutes} onClick={() => setDuration(minutes)} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${duration === minutes ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-white/[0.09] bg-white/[0.03] text-neutral-400 hover:border-white/[0.18] hover:text-white'}`}>{formatDuration(minutes)}</button>
                  ))}
                </div>
                <ActionButton onClick={sendInvite} disabled={Boolean(action) || !recipientEmail.trim()} className="mt-6 w-full border-emerald-400/45 bg-emerald-500 text-[#03261c] hover:bg-emerald-300 sm:w-auto">
                  <ArrowRight className="h-4 w-4" /> {action === 'send' ? 'Checking availability…' : `Invite for ${formatDuration(duration)}`}
                </ActionButton>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/[0.09] bg-[#111318]/90 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-400" />
              <div><h2 className="font-bold text-white">How it works</h2><p className="mt-0.5 text-xs text-neutral-500">Private by design</p></div>
            </div>
            <ol className="mt-5 space-y-4 text-sm leading-5 text-neutral-400">
              <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[11px] font-bold text-emerald-300">1</span><span>Both approved accounts open the workspace.</span></li>
              <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[11px] font-bold text-emerald-300">2</span><span>One of you sends a short-lived invite.</span></li>
              <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[11px] font-bold text-emerald-300">3</span><span>When accepted, one synced timer starts for both.</span></li>
            </ol>
          </div>

          <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.045] p-6">
            <div className="flex items-center gap-3 text-emerald-300"><CheckCircle2 className="h-5 w-5" /><h2 className="font-bold">No room codes</h2></div>
            <p className="mt-3 text-sm leading-6 text-neutral-400">The party stays limited to the two accounts that were approved in Supabase. Invitations are not discoverable by anyone else.</p>
          </div>

          {lastSession && !activeSession && (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 text-sm text-neutral-400">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Last shared session</p>
              <p className="mt-2 font-semibold text-neutral-200">{formatDuration(lastSession.duration_minutes)} · {lastSession.status === 'completed' ? 'Completed' : 'Ended early'}</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};
