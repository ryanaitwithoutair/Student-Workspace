import React, { useEffect, useState } from 'react';
import { useNavigate } from '../router/router';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { TopBar } from '../components/workspace/TopBar';
import { Sidebar } from '../components/workspace/Sidebar';

export const AdminPage = () => {
  const { user, isAuthLoading } = useApp();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error || !data) {
          setError('Unauthorized 403: Administrator access required.');
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
          
          // Fetch audit logs
          const { data: auditData, error: auditError } = await supabase
            .from('audit_events')
            .select(`
              id, event_type, resource_type, resource_id, metadata, created_at,
              actor:actor_user_id ( id, email )
            `)
            .order('created_at', { ascending: false })
            .limit(100);
            
          if (auditError) {
            console.error(auditError);
            setError('Error loading audit events');
          } else {
            setEvents(auditData);
          }
        }
      } catch (err) {
        setError('Authorization error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user, isAuthLoading, navigate]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">403 Forbidden</h1>
          <p className="text-neutral-400">{error || 'You do not have administrative privileges.'}</p>
          <button onClick={() => navigate('/app')} className="mt-6 px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700 text-white transition-colors">
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden select-none transition-all duration-500 relative bg-[#09090b]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto min-h-full relative space-y-7 animate-fadeIn">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-400">Administration</p>
              <h1 className="mt-1 text-3xl font-bold text-white">Audit Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-400">View recent system activity and access logs.</p>
            </div>
            
            <section className="glass-panel rounded-3xl border border-neutral-800 p-5 sm:p-6">
              <h2 className="font-bold text-white mb-4">Recent Audit Events</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-400">
                  <thead className="text-xs uppercase bg-black/20 text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Event Type</th>
                      <th className="px-4 py-3">Resource</th>
                      <th className="px-4 py-3 rounded-tr-lg">Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-neutral-800/50 hover:bg-white/[.02] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(event.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                           {event.actor?.email ? event.actor.email : event.actor_user_id}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{event.event_type}</td>
                        <td className="px-4 py-3">{event.resource_type} {event.resource_id && `(${event.resource_id})`}</td>
                        <td className="px-4 py-3">
                           <pre className="text-[10px] max-w-[200px] truncate">{JSON.stringify(event.metadata)}</pre>
                        </td>
                      </tr>
                    ))}
                    {!events.length && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-neutral-500">No audit events found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
