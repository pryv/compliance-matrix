import { useState } from 'react';
import Pryv from 'pryv';

// Two-pane CMC demonstrator. Each pane is one controller's account. The
// consent/* event chain is the record of processing; verify the exact CMC
// handshake against your deployment's components/cmc/ (see README).

interface ConsentEvent {
  id: string;
  type: string;
  content?: Record<string, unknown>;
  created: number;
}

function fmt (ts: number): string {
  return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19);
}

function usePane () {
  const [endpoint, setEndpoint] = useState('');
  const [conn, setConn] = useState<any>(null);
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadConsent (c: any) {
    const res = await c.api([{
      method: 'events.get',
      params: { types: ['consent/request-cmc', 'consent/accept-cmc', 'consent/revoke-cmc'], limit: 50, sortAscending: false }
    }]);
    if (!res[0]?.error) setEvents(res[0].events || []);
  }

  async function connect () {
    setError(null);
    try {
      const c = new Pryv.Connection(endpoint.trim());
      await c.accessInfo();
      setConn(c);
      await loadConsent(c);
    } catch (e) { setError((e as Error).message); }
  }

  async function createConsent (type: string, content: Record<string, unknown>) {
    if (!conn) return;
    setError(null);
    try {
      const res = await conn.api([{ method: 'events.create', params: { streamIds: ['consent'], type, content } }]);
      if (res[0]?.error) throw new Error(res[0].error.message);
      await loadConsent(conn);
    } catch (e) { setError((e as Error).message); }
  }

  return { endpoint, setEndpoint, conn, events, error, connect, createConsent, reload: () => conn && loadConsent(conn) };
}

function Pane ({ title, pane, action }: { title: string; pane: ReturnType<typeof usePane>; action: React.ReactNode }) {
  return (
    <section className='flex-1 bg-white border border-slate-200 rounded-lg p-4 min-w-0'>
      <h2 className='font-semibold text-slate-700 mb-2'>{title}</h2>
      {!pane.conn
        ? (
          <div>
            <input
              className='w-full border border-slate-300 rounded px-2 py-1 text-sm'
              placeholder='https://<token>@<username>.pryv.me'
              value={pane.endpoint}
              onChange={(e) => pane.setEndpoint(e.target.value)}
            />
            <button onClick={pane.connect} disabled={!pane.endpoint.trim()} className='mt-2 px-3 py-1.5 rounded bg-slate-800 text-white text-sm disabled:opacity-50'>Sign in</button>
          </div>
          )
        : (
          <div>
            {action}
            <h3 className='text-xs uppercase tracking-wide text-slate-400 mt-4 mb-1'>consent/* chain</h3>
            <ul className='text-xs font-mono space-y-1'>
              {pane.events.map((ev) => (
                <li key={ev.id} className='text-slate-600'>{fmt(ev.created)} · {ev.type}</li>
              ))}
              {!pane.events.length && <li className='text-slate-400'>none yet</li>}
            </ul>
          </div>
          )}
      {pane.error && <p className='mt-2 text-sm text-red-600'>{pane.error}</p>}
    </section>
  );
}

export function App () {
  const a = usePane();
  const b = usePane();
  const [scope, setScope] = useState('health-summary');

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-5xl mx-auto px-6 py-4'>
          <h1 className='text-lg font-semibold'>Cross-account share (CMC)</h1>
          <p className='text-sm text-slate-500'>Controller-to-controller transmission by subject consent, not joint controllership (Art.20(2), not Art.26).</p>
        </div>
      </header>
      <main className='max-w-5xl mx-auto px-6 py-6'>
        <div className='mb-4 flex items-center gap-2 text-sm'>
          <label>Requested scope:</label>
          <input className='border border-slate-300 rounded px-2 py-1' value={scope} onChange={(e) => setScope(e.target.value)} />
        </div>
        <div className='flex flex-col md:flex-row gap-4'>
          <Pane
            title='User A, requester (controller)'
            pane={a}
            action={
              <button
                onClick={() => a.createConsent('consent/request-cmc', { scope, requestedAt: Math.floor(Date.now() / 1000) })}
                className='px-3 py-1.5 rounded bg-indigo-600 text-white text-sm'
              >Request share of “{scope}”</button>
            }
          />
          <Pane
            title='User B, recipient (controller)'
            pane={b}
            action={
              <div className='flex flex-wrap gap-2'>
                <button onClick={() => b.createConsent('consent/accept-cmc', { scope, acceptedAt: Math.floor(Date.now() / 1000) })} className='px-3 py-1.5 rounded bg-emerald-600 text-white text-sm'>Accept</button>
                <button onClick={() => b.createConsent('consent/revoke-cmc', { scope, revokedAt: Math.floor(Date.now() / 1000) })} className='px-3 py-1.5 rounded bg-red-600 text-white text-sm'>Revoke</button>
              </div>
            }
          />
        </div>
        <p className='mt-4 text-xs text-slate-500'>
          Each side keeps its own consent record and can revoke independently, local deletion is
          authoritative, peer delivery best-effort. Verify the exact CMC handshake against your
          deployment's <code>components/cmc/</code> (see README).
        </p>
      </main>
    </div>
  );
}
