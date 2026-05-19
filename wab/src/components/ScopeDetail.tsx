import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getScope,
  listRequirements,
  coverageHistogram,
  requirementLinks,
  type Scope,
  type Requirement,
  type Coverage,
  type RequirementLinks
} from '../db';
import { CoverageBadge, DraftBadge, RequirementBadge } from './CoverageBadge';

const COVERAGE_ORDER: Coverage[] = [
  'implemented', 'configurable', 'facilitated', 'documented', 'out-of-scope'
];

export function ScopeDetail () {
  const { id } = useParams<{ id: string }>();
  const [scope, setScope] = useState<Scope | null>(null);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [histogram, setHistogram] = useState<Record<Coverage, number>>({} as any);
  const [error, setError] = useState<string | null>(null);
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [links, setLinks] = useState<RequirementLinks | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getScope(id), listRequirements(id), coverageHistogram(id)])
      .then(([s, r, h]) => {
        setScope(s);
        setReqs(r);
        setHistogram(h);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id || !openRef) { setLinks(null); return; }
    requirementLinks(id, openRef).then(setLinks).catch(() => setLinks(null));
  }, [id, openRef]);

  if (error) return <div className='p-6 text-red-600'>Failed to load scope: {error}</div>;
  if (!scope) return <div className='p-6 text-slate-500'>Loading…</div>;

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <Link to='/' className='text-sm text-slate-500 hover:text-slate-700'>← all scopes</Link>
      <h1 className='text-2xl font-bold mt-2'>{scope.title}</h1>
      <div className='text-sm text-slate-500 mt-1'>
        {scope.jurisdiction} · {scope.version} ({scope.version_date})
        {scope.canonical_url && (
          <>
            {' · '}
            <a className='text-blue-600 hover:underline' href={scope.canonical_url} target='_blank' rel='noreferrer'>
              canonical text
            </a>
          </>
        )}
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {COVERAGE_ORDER.map((c) => (
          <div key={c} className='flex items-center gap-2'>
            <CoverageBadge coverage={c} />
            <span className='text-sm text-slate-600'>{histogram[c] ?? 0}</span>
          </div>
        ))}
      </div>

      {reqs.length === 0 && (
        <div className='mt-6 text-slate-500'>
          No requirements authored yet. See [INPUT.md](https://github.com/pryv/compliance-matrix) for status.
        </div>
      )}

      {reqs.length > 0 && (
        <table className='w-full mt-6 text-sm border border-slate-200'>
          <thead>
            <tr className='bg-slate-100 text-left'>
              <th className='p-2 font-medium w-24'>Ref</th>
              <th className='p-2 font-medium'>Title</th>
              <th className='p-2 font-medium w-32'>Coverage</th>
            </tr>
          </thead>
          <tbody>
            {reqs.map((r) => (
              <>
                <tr
                  key={`${r.ref}-row`}
                  className='border-t border-slate-200 hover:bg-slate-50 cursor-pointer'
                  onClick={() => setOpenRef(openRef === r.ref ? null : r.ref)}
                >
                  <td className='p-2 font-mono text-xs'>{r.ref}</td>
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
                {openRef === r.ref && (
                  <tr key={`${r.ref}-det`} className='bg-slate-50'>
                    <td colSpan={3} className='p-4 text-sm space-y-4'>
                      {r.overview && (
                        <section>
                          <div className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
                            Overview
                          </div>
                          <div className='text-base leading-relaxed whitespace-pre-wrap'>{r.overview}</div>
                        </section>
                      )}
                      {r.detail && (
                        <section>
                          <div className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
                            Detail
                          </div>
                          <div className='whitespace-pre-wrap'>{r.detail}</div>
                        </section>
                      )}
                      {r.technical && (
                        <section>
                          <div className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
                            Technical
                          </div>
                          <div className='whitespace-pre-wrap font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded p-2'>{r.technical}</div>
                        </section>
                      )}
                      {links && (
                        <section>
                          <div className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1'>
                            Evidence
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <LinkSection title='Tests' items={links.tests} />
                            <LinkSection title='Docs' items={links.docs} />
                            <LinkSection title='QMS' items={links.qms} />
                            <LinkSection title='Config keys' items={links.configs} mono />
                            <LinkSection title='Functional specs' items={links.specs} mono />
                            <LinkSection title='Derives from' items={links.derives} mono />
                          </div>
                        </section>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function LinkSection ({ title, items, mono = false }: { title: string; items: string[]; mono?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>{title}</div>
      <ul className='mt-1 flex flex-wrap gap-1'>
        {items.map((i) => (
          <li key={i} className={`text-xs px-2 py-0.5 rounded bg-white border border-slate-200 ${mono ? 'font-mono' : ''}`}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
