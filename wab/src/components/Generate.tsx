import { useEffect, useState } from 'react';
import { zipSync, strToU8 } from 'fflate';
import {
  listScopes, listRequirements, requirementLinks,
  type Scope, type Requirement, type RequirementLinks
} from '../db';
import {
  QUESTION_FIELDS, renderScopeDoc, renderGapReport, renderIndex, renderTemplate,
  type Answers
} from '../generate';

function todayISO (): string {
  return new Date().toISOString().slice(0, 10);
}

export function Generate () {
  const [scopes, setScopes] = useState<Scope[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({ 'storage-engine': 'PostgreSQL' });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    listScopes().then(setScopes).catch((e: Error) => setError(e.message));
  }, []);

  const setField = (key: string, value: string | boolean) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const toggleScope = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  async function generate () {
    setError(null);
    if (!answers.organization || !String(answers.organization).trim()) {
      setError('Organization is required.'); return;
    }
    if (selected.size === 0) { setError('Select at least one scope.'); return; }
    setBusy(true);
    setStatus('Reading matrix…');
    try {
      const date = todayISO();
      const chosen = (scopes || []).filter((s) => selected.has(s.id));
      const files: Record<string, Uint8Array> = {};
      const reqsByScope: Record<string, Requirement[]> = {};

      for (const scope of chosen) {
        setStatus(`Building ${scope.short || scope.id}…`);
        const reqs = await listRequirements(scope.id);
        reqsByScope[scope.id] = reqs;
        const linksByRef: Record<string, RequirementLinks> = {};
        for (const r of reqs) linksByRef[r.ref] = await requirementLinks(scope.id, r.ref);
        files[`${scope.id}.md`] = strToU8(renderScopeDoc(scope, reqs, linksByRef, answers, date));
      }

      files['gap-report.md'] = strToU8(renderGapReport(chosen, reqsByScope, answers, date));
      files['index.md'] = strToU8(renderIndex(chosen, answers, date));

      setStatus('Filling QMS template…');
      const res = await fetch(`${import.meta.env.BASE_URL}qms-template.json`);
      if (res.ok) {
        const tmpl = await res.json() as Record<string, string>;
        for (const [rel, content] of Object.entries(tmpl)) {
          files[`qms/${rel}`] = strToU8(renderTemplate(content, answers));
        }
      } else {
        files['qms/README.md'] = strToU8('QMS template bundle was not available at generate time.\n');
      }

      setStatus('Zipping…');
      const zipped = zipSync(files, { level: 6 });
      const blob = new Blob([zipped as unknown as BlobPart], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = String(answers.organization).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org';
      a.href = url;
      a.download = `compliance-pack-${slug}-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(`Done, ${chosen.length} scope(s) + gap report + QMS bundled.`);
    } catch (e) {
      setError((e as Error).message);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  if (error && !scopes) return <div className='p-6 text-red-600'>Failed to load matrix: {error}</div>;
  if (!scopes) return <div className='p-6 text-slate-500'>Loading matrix…</div>;

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-xl font-semibold text-slate-800 mb-1'>Generate a compliance pack</h1>
      <p className='text-sm text-slate-600 mb-6'>
        Answer the short questionnaire, pick the regulations that apply to your
        deployment, and download a documentation skeleton, per-scope coverage
        with evidence pointers, a gap report of your responsibilities, and a
        filled-in copy of the implementer QMS template. Everything runs in your
        browser. This is a starting point, not legal advice.
      </p>

      <section className='mb-6'>
        <h2 className='text-sm font-semibold text-slate-700 mb-3'>Your details</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {QUESTION_FIELDS.map((f) => (
            <label key={f.key} className='text-sm text-slate-600 flex flex-col gap-1'>
              {f.type === 'bool'
                ? (
                  <span className='flex items-center gap-2 pt-5'>
                    <input
                      type='checkbox'
                      checked={!!answers[f.key]}
                      onChange={(e) => setField(f.key, e.target.checked)}
                    />
                    {f.label}
                  </span>
                  )
                : (
                  <>
                    {f.label}
                    <input
                      type='text'
                      className='border border-slate-300 rounded px-2 py-1 text-slate-800'
                      placeholder={f.placeholder}
                      value={String(answers[f.key] ?? '')}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  </>
                  )}
            </label>
          ))}
        </div>
      </section>

      <section className='mb-6'>
        <h2 className='text-sm font-semibold text-slate-700 mb-3'>
          Applicable regulations / standards <span className='font-normal text-slate-400'>({selected.size} selected)</span>
        </h2>
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          {scopes.map((s) => (
            <li key={s.id}>
              <label className='flex items-center gap-2 text-sm text-slate-700 p-2 bg-white border border-slate-200 rounded cursor-pointer hover:border-slate-400'>
                <input type='checkbox' checked={selected.has(s.id)} onChange={() => toggleScope(s.id)} />
                <span>{s.short || s.title}</span>
                <span className='ml-auto text-xs text-slate-400'>{s.requirement_count} rows</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className='flex items-center gap-3'>
        <button
          onClick={generate}
          disabled={busy}
          className='px-4 py-2 rounded bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50'
        >
          {busy ? 'Generating…' : 'Generate & download ZIP'}
        </button>
        {status && <span className='text-sm text-slate-500'>{status}</span>}
        {error && <span className='text-sm text-red-600'>{error}</span>}
      </div>
    </div>
  );
}
