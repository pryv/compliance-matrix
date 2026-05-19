import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listScopes, type Scope } from '../db';

const TYPE_GROUPS: Array<{ key: Scope['type']; label: string }> = [
  { key: 'regulation', label: 'Regulations' },
  { key: 'standard', label: 'Standards' },
  { key: 'hosting-cert', label: 'Hosting certifications' }
];

export function ScopeList () {
  const [scopes, setScopes] = useState<Scope[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listScopes()
      .then(setScopes)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className='p-6 text-red-600'>Failed to load matrix: {error}</div>;
  if (!scopes) return <div className='p-6 text-slate-500'>Loading matrix…</div>;
  if (scopes.length === 0) return <div className='p-6 text-slate-500'>No scopes authored yet.</div>;

  return (
    <div className='p-6 max-w-5xl mx-auto'>
      {TYPE_GROUPS.map(({ key, label }) => {
        const items = scopes.filter((s) => s.type === key);
        if (items.length === 0) return null;
        return (
          <section key={key} className='mb-8'>
            <h2 className='text-lg font-semibold text-slate-700 mb-3'>{label}</h2>
            <ul className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {items.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/scope/${s.id}`}
                    className='block p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition'
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold'>{s.short ?? s.title}</h3>
                      <span className='text-xs text-slate-500'>{s.requirement_count} req</span>
                    </div>
                    <div className='text-xs text-slate-500 mt-1'>{s.jurisdiction}</div>
                    {s.curated && (
                      <span className='text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-2 inline-block'>
                        curated
                      </span>
                    )}
                    {s.layered_on.length > 0 && (
                      <div className='text-xs text-slate-500 mt-1'>
                        layered on: {s.layered_on.join(', ')}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
