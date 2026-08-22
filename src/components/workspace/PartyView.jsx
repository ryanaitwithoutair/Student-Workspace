import React, { useState } from 'react';
import { useParty } from '../../context/PartyContext';
import { Users, Play, LogOut, Copy, Check } from '../common/Icons';

export const PartyView = () => {
  const { partyId, isHost, partyMembers, createParty, joinParty, leaveParty } = useParty();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (partyId) {
      navigator.clipboard.writeText(partyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (partyId) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-emerald-500/30">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              Party Session
            </h2>
            <p className="text-neutral-400 mt-2">
              {isHost ? 'You are hosting this session. Your timer controls will sync with everyone else.' : 'You are in a session. Your timer will automatically follow the host.'}
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Room Code</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-black text-white">{partyId}</span>
              <button 
                onClick={handleCopyCode}
                className="p-2 bg-neutral-800/80 rounded-lg hover:bg-neutral-700 transition-colors text-neutral-300"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            Active Members ({partyMembers.length})
          </h3>
          <div className="space-y-3">
            {partyMembers.map((member, i) => (
              <div key={member.user_id || i} className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 uppercase">
                    {member.username?.[0] || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-white">{member.username || 'Anonymous'}</div>
                    <div className="text-xs text-neutral-500">Joined {new Date(member.joined_at).toLocaleTimeString()}</div>
                  </div>
                </div>
                {member.is_host && (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold rounded-lg border border-emerald-500/20">Host</span>
                )}
              </div>
            ))}
            {partyMembers.length === 0 && (
              <div className="text-neutral-500 text-sm text-center py-4">Waiting for others to join...</div>
            )}
          </div>
        </div>

        <button 
          onClick={leaveParty}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Leave Party
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white mb-4">Focus Together</h1>
        <p className="text-neutral-400 text-lg">Join a friend's focus session or start your own to stay accountable.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/30 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
            <Play className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Host a Session</h2>
          <p className="text-sm text-neutral-400 mb-8 flex-1">Create a new room and share the code. Your timer will sync with everyone in the room.</p>
          <button 
            onClick={createParty}
            className="w-full btn-emerald py-3 rounded-xl font-bold text-sm"
          >
            Create Room
          </button>
        </div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/30 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Join a Session</h2>
          <p className="text-sm text-neutral-400 mb-6 flex-1">Enter a room code to join an existing session and follow the host's timer.</p>
          
          <div className="w-full flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Enter Room Code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl font-mono text-center uppercase tracking-widest font-bold"
              maxLength={8}
            />
            <button 
              onClick={() => joinParty(joinCode)}
              disabled={!joinCode.trim()}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
