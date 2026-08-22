import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useApp } from './AppContext';

const PartyContext = createContext();

export const PartyProvider = ({ children }) => {
  const {
    user,
    isTimerRunning,
    timerEndsAt,
    timeLeft,
    timerMode,
    customMinutes,
    syncTimerState,
    showToast
  } = useApp();

  const [partyId, setPartyId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [partyMembers, setPartyMembers] = useState([]);
  const channelRef = useRef(null);
  
  // Track previous state to avoid broadcasting when not needed
  const prevState = useRef({ isTimerRunning, timerEndsAt, timeLeft, timerMode, customMinutes });

  // Keep fresh references of callbacks without triggering effects
  const callbacks = useRef({ syncTimerState, showToast, user });
  useEffect(() => {
    callbacks.current = { syncTimerState, showToast, user };
  }, [syncTimerState, showToast, user]);

  useEffect(() => {
    if (!partyId || !isSupabaseConfigured) return;

    const currentUser = callbacks.current.user;
    const username = currentUser?.email?.split('@')[0] || `User_${Math.floor(Math.random() * 1000)}`;

    const channel = supabase.channel(`party-${partyId}`, {
      config: {
        presence: {
          key: currentUser?.id || `anon-${Math.floor(Math.random() * 10000)}`,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const members = [];
        for (const key in state) {
          state[key].forEach(member => {
            members.push(member);
          });
        }
        setPartyMembers(members);
      })
      .on('broadcast', { event: 'sync_timer' }, ({ payload }) => {
        if (!isHost) {
          callbacks.current.syncTimerState(payload);
        }
      })
      .subscribe(async (status) => {
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser?.id,
            username: username,
            is_host: isHost,
            joined_at: new Date().toISOString(),
          });
          
          if (!isHost) {
             callbacks.current.showToast('Joined party successfully');
          }
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId, isHost]);

  // Host broadcasts timer changes
  useEffect(() => {
    if (!isHost || !partyId || !channelRef.current) return;

    const hasChanged = 
      isTimerRunning !== prevState.current.isTimerRunning ||
      timerEndsAt !== prevState.current.timerEndsAt ||
      timerMode !== prevState.current.timerMode ||
      customMinutes !== prevState.current.customMinutes;
    
    // Also periodically sync timeLeft just in case of drift, but mostly rely on state changes
    if (hasChanged) {
      prevState.current = { isTimerRunning, timerEndsAt, timeLeft, timerMode, customMinutes };
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync_timer',
        payload: { isTimerRunning, timerEndsAt, timeLeft, timerMode, customMinutes },
      });
    }
  }, [isHost, partyId, isTimerRunning, timerEndsAt, timeLeft, timerMode, customMinutes]);

  const createParty = () => {
    if (!isSupabaseConfigured) {
      showToast('Supabase is not configured. Add environment variables to use the Party system.', 'error');
      return;
    }
    const newPartyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setIsHost(true);
    setPartyId(newPartyId);
    showToast(`Party created! Room code: ${newPartyId}`);
  };

  const joinParty = (code) => {
    if (!isSupabaseConfigured) {
      showToast('Supabase is not configured. Add environment variables to use the Party system.', 'error');
      return;
    }
    if (!code || code.trim().length === 0) return;
    setIsHost(false);
    setPartyId(code.trim().toUpperCase());
  };

  const leaveParty = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    setPartyId(null);
    setIsHost(false);
    setPartyMembers([]);
    showToast('Left party');
  };

  return (
    <PartyContext.Provider value={{
      partyId,
      isHost,
      partyMembers,
      createParty,
      joinParty,
      leaveParty,
    }}>
      {children}
    </PartyContext.Provider>
  );
};

export const useParty = () => useContext(PartyContext);
