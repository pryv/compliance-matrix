import { useState } from 'react';
import Pryv from 'pryv';

interface Access {
  id: string;
  name: string;
  type: string;
  permissions?: Array<{ streamId?: string; level?: string; tag?: string }>;
  created?: number;
  lastUsed?: number | null;
  token?: string;
}

interface AuditEvent {
  id: string;
  streamIds: string[];
  type: string;
  content?: unknown;
  created: number;
}

function fmt (ts?: number | null): string {
  if (!ts) return '—';
  return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19);
}

function permSummary (a: Access): string {
  if (!a.permissions || !a.permissions.length) return '—';
  return a.permissions
    .map((p) => p.streamId ? `${p.streamId}:${p.level || '?'}` : (p.tag ? `tag ${p.tag}` : '?'))
    .join(', ');
}

export function App () {
  const [endpoint, setEndpoint] = useState('');
  const [conn, setConn] = useState<any>(null);
  const [accesses, setAccesses] = useState<Access[] | null>(null);
  const [audit, setAudit] = useState<AuditEvent[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect () {
    setError(null);
    setBusy(true);
    try {
      const c = new Pryv.Connection(endpoint.trim());
      const res = await c.api([{ method: 'accesses.get', params: {} }]);
      if (res[0]?.error) throw new Error(res[0].error.message || 'accesses.get failed');
      setConn(c);
      setAccesses(res[0].accesses || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshAudit () {
    if (!conn) return;
    try {
      const res = await conn.api([{
        method: 'events.get',
        params: { streams: [':_audit:accesses', ':_audit:actions'], limit: 15, sortAscending: false }
      }]);
      if (!res[0]?.error) setAudit(res[0].events || []);
    } catch { /* audit may be disabled; ignore */ }
  }

  async function revoke (a: Access) {
    if (!conn) return;
    if (!confirm(`Revoke access "${a.name}"? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await conn.api([{ method: 'accesses.delete', params: { id: a.id } }]);
      if (res[0]?.error) throw new Error(res[0].error.message || 'accesses.delete failed');
      const list = await conn.api([{ method: 'accesses.get', params: {} }]);
      setAccesses(list[0].accesses || []);
      await refreshAudit();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800'>
      <header className='border-b border-slate-200 bg-white'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <h1 className='text-lg font-semibold'>Who has access to my data?</h1>
          <p className='text-sm text-slate-500'>
            List and revoke the accesses granted on your Pryv account (GDPR Art.7(3) / 15 / 30).
          </p>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-6 py-6'>
        {!conn && (
          <div className='bg-white border border-slate-200 rounded-lg p-4 max-w-xl'>
            <label className='text-sm text-slate-600 flex flex-col gap-1'>
              Personal API endpoint
              <input
                className='border border-slate-300 rounded px-2 py-1'
                placeholder='https://<token>@<username>.pryv.me'
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </label>
            <button
              onClick={connect}
              disabled={busy || !endpoint.trim()}
              className='mt-3 px-4 py-2 rounded bg-slate-800 text-white text-sm hover:bg-slate-700 disabled:opacity-50'
            >
              {busy ? 'Connecting…' : 'Sign in'}
            </button>
            {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
          </div>
        )}

        {accesses && (
          <>
            <div className='mb-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 px-3 py-2'>
              Revoking an access deletes its token immediately. On older deployments it may not
              cascade to webhooks created by that access, verify with your operator.
            </div>
            <table className='w-full text-sm bg-white border border-slate-200 rounded-lg overflow-hidden'>
              <thead className='bg-slate-100 text-slate-600'>
                <tr>
                  <th className='text-left px-3 py-2'>Name</th>
                  <th className='text-left px-3 py-2'>Type</th>
                  <th className='text-left px-3 py-2'>Scope</th>
                  <th className='text-left px-3 py-2'>Created</th>
                  <th className='text-left px-3 py-2'>Last used</th>
                  <th className='px-3 py-2'></th>
                </tr>
              </thead>
              <tbody>
                {accesses.map((a) => (
                  <tr key={a.id} className='border-t border-slate-100'>
                    <td className='px-3 py-2 font-medium'>{a.name}</td>
                    <td className='px-3 py-2 text-slate-500'>{a.type}</td>
                    <td className='px-3 py-2 text-slate-500'>{permSummary(a)}</td>
                    <td className='px-3 py-2 text-slate-500'>{fmt(a.created)}</td>
                    <td className='px-3 py-2 text-slate-500'>{fmt(a.lastUsed)}</td>
                    <td className='px-3 py-2 text-right'>
                      <button
                        onClick={() => revoke(a)}
                        disabled={busy}
                        className='px-2.5 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-500 disabled:opacity-50'
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {accesses.length === 0 && (
                  <tr><td colSpan={6} className='px-3 py-4 text-center text-slate-400'>No accesses.</td></tr>
                )}
              </tbody>
            </table>
            {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

            <div className='mt-6'>
              <button onClick={refreshAudit} className='text-sm text-slate-600 underline hover:no-underline'>
                Show audit trail of access changes
              </button>
              {audit && (
                <ul className='mt-2 text-xs text-slate-600 space-y-1'>
                  {audit.map((ev) => (
                    <li key={ev.id} className='font-mono'>
                      {fmt(ev.created)} · {ev.type} · {ev.streamIds.join(',')}
                    </li>
                  ))}
                  {audit.length === 0 && <li className='text-slate-400'>No audit events (audit may be disabled).</li>}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
