import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getPrimitive,
  listPrimitiveCoverage,
  listScopes,
  type Primitive,
  type PrimitiveCoverageRow,
  type Scope
} from '../db';
import { DraftBadge, RequirementBadge } from './CoverageBadge';

const MAX_SCOPES = 3;

/**
 * Detail page for a single Pryv primitive. Shows the primitive's
 * summary + the requirements citing it across the matrix, grouped
 * by scope. User can narrow the view by selecting up to 3 scopes
 * (chips below the header) — defaults to "all scopes".
 *
 * The view answers "Pryv ships X — which compliance obligations
 * does X help with, in the regulators I care about?"
 */
export function PrimitiveDetail () {
  const { id } = useParams<{ id: string }>();
  const [primitive, setPrimitive] = useState<Primitive | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [rows, setRows] = useState<PrimitiveCoverageRow[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPrimitive(id), listScopes()])
      .then(([p, s]) => { setPrimitive(p); setScopes(s); })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    listPrimitiveCoverage(id, selectedScopes).then(setRows).catch(() => setRows([]));
  }, [id, selectedScopes]);

  const grouped = useMemo(() => {
    const m = new Map<string, PrimitiveCoverageRow[]>();
    for (const r of rows) {
      const arr = m.get(r.scope_id) ?? [];
      arr.push(r);
      m.set(r.scope_id, arr);
    }
    return m;
  }, [rows]);

  if (error) return <div className='p-6 text-red-600'>Failed to load primitive: {error}</div>;
  if (!primitive) return <div className='p-6 text-slate-500'>Loading…</div>;

  const toggleScope = (sid: string) => {
    if (selectedScopes.includes(sid)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== sid));
    } else if (selectedScopes.length < MAX_SCOPES) {
      setSelectedScopes([...selectedScopes, sid]);
    }
  };

  // Scopes that actually cite this primitive (defines the chip set).
  const citingScopeIds = Object.keys(primitive.scope_counts).sort();
  const citingScopes = scopes.filter((s) => citingScopeIds.includes(s.id));

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <Link to='/primitives' className='text-sm text-slate-500 hover:text-slate-700'>
        ← all primitives
      </Link>

      <div className='mt-2 flex items-baseline gap-3'>
        <h1 className='text-2xl font-bold font-mono'>{primitive.id}</h1>
        <span className='text-sm text-slate-500'>
          {primitive.requirement_count} requirement(s) across {citingScopeIds.length} scope(s)
        </span>
      </div>
      <p className='text-base text-slate-700 mt-2 leading-relaxed max-w-3xl'>
        {primitive.summary}
      </p>

      <div className='mt-5'>
        <div className='flex items-baseline gap-2 mb-2'>
          <span className='text-xs text-slate-500 uppercase tracking-wide font-medium'>
            Focus on scope(s)
          </span>
          <span className='text-xs text-slate-400'>
            · pick up to {MAX_SCOPES} — empty = all
          </span>
          {selectedScopes.length > 0 && (
            <button
              type='button'
              onClick={() => setSelectedScopes([])}
              className='text-xs text-slate-500 hover:text-slate-700 underline ml-auto'
            >
              clear
            </button>
          )}
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {citingScopes.map((s) => {
            const isActive = selectedScopes.includes(s.id);
            const atCap = !isActive && selectedScopes.length >= MAX_SCOPES;
            const count = primitive.scope_counts[s.id] ?? 0;
            return (
              <button
                key={s.id}
                type='button'
                onClick={() => toggleScope(s.id)}
                disabled={atCap}
                className={`px-2 py-1 rounded-full border text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-800'
                    : atCap
                      ? 'bg-white text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
                title={atCap ? `Max ${MAX_SCOPES} scopes selected — deselect one first` : s.title}
              >
                {s.short ?? s.title}
                <span className='ml-1 opacity-75 tabular-nums'>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 && (
        <div className='mt-6 text-slate-500'>
          No requirements match the current filter.
        </div>
      )}

      {rows.length > 0 && (
        <div className='mt-6 space-y-6'>
          {Array.from(grouped.entries()).map(([scopeId, scopeRows]) => {
            const scope = scopes.find((s) => s.id === scopeId);
            const heading = scope ? (scope.short ?? scope.title) : scopeId;
            return (
              <section key={scopeId}>
                <div className='flex items-baseline gap-2 mb-2'>
                  <Link
                    to={`/scope/${scopeId}`}
                    className='text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline'
                  >
                    {heading}
                  </Link>
                  <span className='text-xs text-slate-500'>
                    · {scopeRows.length} requirement(s)
                  </span>
                </div>
                <table className='w-full text-sm border border-slate-200'>
                  <thead>
                    <tr className='bg-slate-100 text-left'>
                      <th className='p-2 font-medium w-32'>Ref</th>
                      <th className='p-2 font-medium'>Title</th>
                      <th className='p-2 font-medium w-56'>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeRows.map((r) => (
                      <tr key={`${r.scope_id}-${r.ref}`} className='border-t border-slate-200 hover:bg-slate-50'>
                        <td className='p-2 font-mono text-xs'>
                          <Link
                            to={`/scope/${r.scope_id}`}
                            className='text-slate-700 hover:text-slate-900'
                          >
                            {r.ref}
                          </Link>
                        </td>
                        <td className='p-2'>
                          {r.title}
                          {r.draft && <DraftBadge />}
                        </td>
                        <td className='p-2'>
                          <RequirementBadge
                            coverage={r.coverage}
                            mode={r.facilitation_mode}
                            effort={r.pryv_effort_saved}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
