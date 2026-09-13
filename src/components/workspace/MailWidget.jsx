import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { soundEngine } from '../../audio/soundGenerator';
import { Send, X, Mail } from 'lucide-react';

export const MailWidget = () => {
  const { user, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [partnerId, setPartnerId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchPartnerAndMessages = async () => {
      // Get partner
      const { data: partnerData } = await supabase.rpc('get_party_partner');
      const partner = partnerData && partnerData[0] ? partnerData[0].partner_id : null;
      setPartnerId(partner);

      // Fetch unread messages
      if (partner) {
        const { data: unreadMsg } = await supabase
          .from('party_messages')
          .select('*')
          .eq('recipient_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false });

        if (unreadMsg && unreadMsg.length > 0) {
          setMessages(prev => {
            const newMap = new Map([...prev, ...unreadMsg].map(m => [m.id, m]));
            return Array.from(newMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          });
          setUnreadCount(unreadMsg.length);
          setIsOpen(true); // Pop open if unread exists
        }
      }
    };

    fetchPartnerAndMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:party_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'party_messages', filter: \ecipient_id=eq.\\ },
        (payload) => {
          setMessages(prev => [payload.new, ...prev]);
          setUnreadCount(c => c + 1);
          soundEngine.playMessageSound(1.0); // Play cute ring
          setIsOpen(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    const unreadIds = messages.filter(m => !m.is_read).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase.from('party_messages').update({ is_read: true }).in('id', unreadIds);
      setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    markAsRead();
  };

  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!partnerId) {
      showToast('You must establish a focus partnership first.', 'error');
      return;
    }
    if (!newMessage.trim()) return;

    const { data, error } = await supabase.from('party_messages').insert({
      sender_id: user.id,
      recipient_id: partnerId,
      content: newMessage.trim()
    }).select();

    if (error) {
      showToast('Could not send message.', 'error');
    } else {
      setNewMessage('');
      showToast('Cute message sent! 💌', 'success');
    }
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg transition-transform hover:scale-105 z-40"
      >
        <Mail size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <h3 className="font-semibold flex items-center gap-2 text-white"><Mail size={16} /> Partner Mail</h3>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto flex flex-col-reverse gap-3 bg-neutral-950/50">
            {messages.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center my-auto">No messages yet. Send a cute note!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-neutral-800 p-3 rounded-lg rounded-tl-none border border-neutral-700/50 text-sm text-neutral-200">
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-neutral-800 bg-neutral-900">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Send a cute message..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
