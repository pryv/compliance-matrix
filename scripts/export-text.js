#!/usr/bin/env node
/**
 * export-text.js, write plain-text and JSON views of dist/compliance.sqlite
 * for AI agents and other tools that cannot run the web app.
 *
 * Output (default dist/text/, copied into the published site by the WAB build):
 *   llms.txt               index: what the matrix is, how to read it, one line per scope
 *   llms-full.txt          every scope and requirement in one file
 *   regulations/<id>.md    one Markdown file per scope
 *   context/<id>.md        the context notes
 *   compliance.json        the whole matrix as JSON
 *
 * Run:  npm run export:text [-- <outDir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'dist/compliance.sqlite');
const OUT = path.resolve(process.argv[2] ?? path.join(ROOT, 'dist/text'));

const SITE = 'https://pryv.github.io/compliance-matrix';
const REPO_BLOB = 'https://github.com/pryv/compliance-matrix/blob/master';

const COVERAGE = {
  implemented: 'Pryv ships the control out of the box; it works with no configuration.',
  configurable: 'Pryv provides the control once the operator sets the configuration keys cited on the requirement.',
  facilitated: 'Pryv reduces the work; the implementer still does part of it (see the facilitation mode).',
  documented: 'Guidance only: the implementer does the work, following the cited documentation.',
  'out-of-scope': 'No software contribution from Pryv; the obligation, if any, stays with the implementer.'
};
const COVERAGE_ORDER = Object.keys(COVERAGE);

const EFFORT = {
  high: 'Pryv carries most of the engineering and operational work.',
  medium: 'The work is roughly shared between Pryv and the implementer.',
  low: 'Pryv contributes a small technical substrate; most of the work is the implementer\'s.'
};

const MODES = {
  primitive: 'Pryv\'s permissions, access versioning or system streams technically enforce the obligation; the implementer chooses the stream layout and permission scope.',
  evidence: 'Pryv generates structured data (audit log, access version chain, event history) that the implementer uses as proof in an artefact they produce.',
  storage: 'Pryv durably stores artefacts the implementer creates (notice text, consent records, policies) and makes them recoverable per subject and per time.',
  infrastructure: 'Pryv runs the technical layer the obligation depends on (TLS, encryption at rest, high availability, data residency, backup and restore).',
  awareness: 'Pryv has minimal direct contribution; the row reminds the implementer of the obligation.'
};

if (!fs.existsSync(DB_PATH)) {
  console.error('[export-text] dist/compliance.sqlite missing, run `npm run build` first');
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });
const all = (sql, ...p) => db.prepare(sql).all(...p);

const meta = Object.fromEntries(all('SELECT key, value FROM meta').map((r) => [r.key, r.value]));
const scopes = all('SELECT * FROM scopes ORDER BY id');
const primitives = all('SELECT id, summary FROM pryv_primitives ORDER BY id');
const contextNotes = all('SELECT id, title, summary FROM context_notes ORDER BY id');

const linkTables = {
  tests: ['test_links', 'test_code'],
  specs: ['spec_links', 'reqid'],
  docs: ['doc_links', 'path'],
  qms: ['qms_links', 'path'],
  config_keys: ['config_links', 'config_key'],
  derives_from: ['derives_links', 'target_ref'],
  primitives: ['primitive_links', 'primitive'],
  samples: ['sample_links', 'sample'],
  context_notes: ['context_links', 'context_id']
};
const linksByReq = {};
for (const [name, [table, col]] of Object.entries(linkTables)) {
  for (const row of all(`SELECT scope_id, ref, ${col} AS v FROM ${table}`)) {
    const key = `${row.scope_id}\u0000${row.ref}`;
    ((linksByReq[key] ??= {})[name] ??= []).push(row.v);
  }
}
const plannedByReq = {};
for (const p of all('SELECT scope_id, ref, kind, summary, eta_release, tracking_url FROM planned_changes ORDER BY scope_id, ref, seq')) {
  (plannedByReq[`${p.scope_id}\u0000${p.ref}`] ??= []).push({
    kind: p.kind, summary: p.summary, eta_release: p.eta_release || null, tracking_url: p.tracking_url || null
  });
}

const scopeUrl = (id) => `${SITE}/#/scope/${encodeURIComponent(id)}`;
const scopeMdUrl = (id) => `${SITE}/regulations/${id}.md`;
const contextMdUrl = (id) => `${SITE}/context/${id}.md`;

const data = scopes.map((s) => {
  const requirements = all('SELECT * FROM requirements WHERE scope_id = ? ORDER BY rowid', s.id).map((r) => {
    const key = `${s.id}\u0000${r.ref}`;
    return {
      ref: r.ref,
      title: r.title,
      text: r.text || null,
      text_url: r.text_url || null,
      coverage: r.coverage,
      pryv_effort_saved: r.pryv_effort_saved || null,
      facilitation_mode: r.facilitation_mode || null,
      overview: r.overview || null,
      detail: r.detail || null,
      technical: r.technical || null,
      draft: r.draft === 1,
      reviewed_at: r.reviewed_at || null,
      applies_to_versions: r.applies_to_versions,
      evidence: linksByReq[key] ?? {},
      planned_changes: plannedByReq[key] ?? []
    };
  });
  return {
    id: s.id,
    title: s.title,
    short: s.short || s.title,
    type: s.type,
    jurisdiction: s.jurisdiction || null,
    version: s.version || null,
    version_date: s.version_date || null,
    canonical_url: s.canonical_url || null,
    layered_on: JSON.parse(s.layered_on_json),
    curated: s.curated === 1,
    url: scopeUrl(s.id),
    markdown_url: scopeMdUrl(s.id),
    requirements,
    excluded_items: all('SELECT ref, reason FROM excluded_items WHERE scope_id = ?', s.id)
  };
});

function histogram (reqs) {
  const h = {};
  for (const r of reqs) h[r.coverage] = (h[r.coverage] ?? 0) + 1;
  return COVERAGE_ORDER.filter((c) => h[c]).map((c) => `${h[c]} ${c}`).join(', ');
}

const DISCLAIMER = 'This matrix describes the software\'s contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.';

function legend () {
  const out = ['## How to read a requirement', ''];
  out.push('Coverage (what Pryv does for the implementer):');
  for (const [k, v] of Object.entries(COVERAGE)) out.push(`- \`${k}\`: ${v}`);
  out.push('', 'Effort saved (how much of the work Pryv carries):');
  for (const [k, v] of Object.entries(EFFORT)) out.push(`- \`${k}\`: ${v}`);
  out.push('', 'Facilitation mode (the kind of help, mostly on `facilitated` rows):');
  for (const [k, v] of Object.entries(MODES)) out.push(`- \`${k}\`: ${v}`);
  out.push('', 'Evidence: test codes resolve at https://pryv.github.io/tests/#<code>, functional specs at https://pryv.github.io/functional-specifications/ and docs paths at https://pryv.github.io/<path>/.');
  return out;
}

function scopeHeader (s) {
  const lines = [`# ${s.title} (${s.short})`, ''];
  const facts = [
    `Scope id: \`${s.id}\` (${s.type})`,
    s.jurisdiction && `Jurisdiction: ${s.jurisdiction}`,
    s.version && `Version: ${s.version}${s.version_date ? ` (${s.version_date})` : ''}`,
    s.canonical_url && `Official text: ${s.canonical_url}`,
    s.layered_on.length && `Layered on: ${s.layered_on.join(', ')}`,
    `Requirements: ${s.requirements.length} (${histogram(s.requirements)})`,
    `Browse: ${s.url}`
  ].filter(Boolean);
  for (const f of facts) lines.push(`- ${f}`);
  return lines;
}

function requirementMd (s, r, level = '##') {
  const tags = [r.coverage, r.pryv_effort_saved && `effort saved: ${r.pryv_effort_saved}`, r.facilitation_mode && `mode: ${r.facilitation_mode}`, r.draft && 'draft'].filter(Boolean);
  const lines = [`${level} ${s.short} ${r.ref}: ${r.title}`, '', `Coverage: ${tags.join(' · ')}`];
  if (r.applies_to_versions && r.applies_to_versions !== '*') lines.push(`Applies to open-pryv.io versions: ${r.applies_to_versions}`);
  if (r.text) lines.push('', `Requirement: ${r.text.trim()}`);
  if (r.text_url) lines.push(`Source: ${r.text_url}`);
  if (r.overview) lines.push('', '**What Pryv does for you**', '', r.overview.trim());
  if (r.detail) lines.push('', '**Detail**', '', r.detail.trim());
  if (r.technical) lines.push('', '**Technical**', '', r.technical.trim());
  const ev = Object.entries(r.evidence).filter(([, v]) => v.length);
  if (ev.length) {
    lines.push('', '**Evidence**', '');
    for (const [k, v] of ev) lines.push(`- ${k.replace(/_/g, ' ')}: ${v.join(', ')}`);
  }
  if (r.planned_changes.length) {
    lines.push('', '**Planned changes**', '');
    for (const p of r.planned_changes) lines.push(`- ${p.kind}: ${p.summary}${p.eta_release ? ` (expected: ${p.eta_release})` : ''}`);
  }
  return lines;
}

function scopeMd (s, level = '##') {
  const lines = scopeHeader(s);
  for (const r of s.requirements) lines.push('', ...requirementMd(s, r, level));
  if (s.excluded_items.length) {
    lines.push('', `${level} Excluded clauses`, '', 'Clauses left out of this curated scope because Pryv has no software role in them:', '');
    for (const e of s.excluded_items) lines.push(`- ${e.ref}: ${e.reason.trim().replace(/\s*\n\s*/g, ' ')}`);
  }
  return lines;
}

// Context notes link to other repo files with relative paths; point those at GitHub.
function rewriteContextLinks (md) {
  return md.replace(/\]\((?!https?:|#|mailto:)([^)]+)\)/g, (m, target) => {
    if (/^[\w.-]+\.md(#.*)?$/.test(target)) return `](${SITE}/context/${target})`;
    const resolved = path.posix.normalize(path.posix.join('context', target));
    if (resolved.startsWith('..')) return m;
    return `](${REPO_BLOB}/${resolved})`;
  });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'regulations'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'context'), { recursive: true });

for (const s of data) {
  const lines = [...scopeMd(s), '', '---', '', DISCLAIMER, `Legend and other scopes: ${SITE}/llms.txt`, ''];
  fs.writeFileSync(path.join(OUT, 'regulations', `${s.id}.md`), lines.join('\n'));
}

let contextCount = 0;
for (const n of contextNotes) {
  const src = path.join(ROOT, 'context', `${n.id}.md`);
  if (!fs.existsSync(src)) continue;
  fs.writeFileSync(path.join(OUT, 'context', `${n.id}.md`), rewriteContextLinks(fs.readFileSync(src, 'utf8')));
  contextCount++;
}

const totalReqs = data.reduce((n, s) => n + s.requirements.length, 0);
const intro = [
  '# Pryv compliance matrix',
  '',
  `> Maps ${data.length} regulations and standards (GDPR, HIPAA, Swiss nLPD, CCPA, PIPEDA, DiGA, MDR, HDS, ISO 27001, ISO 27701, ISO 13485, SOC 2 and more) requirement by requirement onto what Pryv, the platform built from open-pryv.io, implements, makes configurable, facilitates or documents, and what stays with the implementer. ${totalReqs} requirements, each backed by evidence (tests, docs, configuration keys).`,
  '',
  'Use it to answer questions such as "does Pryv support GDPR Art. 17 erasure?" or "what is left for me to do for HIPAA 164.312(b)?". Start from the scope file, then follow its evidence links.',
  '',
  DISCLAIMER,
  ''
];

const llms = [...intro, '## Regulations and standards', ''];
for (const s of data) {
  llms.push(`- [${s.title} (${s.short})](${s.markdown_url}): ${s.type}${s.jurisdiction ? `, ${s.jurisdiction}` : ''}; ${s.requirements.length} requirements (${histogram(s.requirements)})`);
}
llms.push('', '## Context notes', '', 'Cross-cutting explanations the requirements refer to (for example `context/event-history.md`).', '');
for (const n of contextNotes) {
  if (fs.existsSync(path.join(OUT, 'context', `${n.id}.md`))) llms.push(`- [${n.title}](${contextMdUrl(n.id)}): ${n.summary.trim().replace(/\s*\n\s*/g, ' ')}`);
}
llms.push('', '## Other formats', '',
  `- [Everything in one file](${SITE}/llms-full.txt)`,
  `- [JSON](${SITE}/compliance.json): every scope, requirement, evidence link and planned change`,
  `- [SQLite](${SITE}/compliance.sqlite): the database the web app reads`,
  `- [Web app](${SITE}/): the same data, browsable`,
  '- [Source](https://github.com/pryv/compliance-matrix): YAML per scope, BSD-3-Clause',
  '- [Pryv developer documentation](https://pryv.github.io/llms.txt)',
  '', ...legend(), '', `Generated ${meta.built_at ?? new Date().toISOString()}.`, '');
fs.writeFileSync(path.join(OUT, 'llms.txt'), llms.join('\n'));

const full = [...intro, ...legend(), ''];
for (const s of data) full.push('', ...scopeMd(s, '###').map((l) => (l.startsWith('# ') ? `#${l}` : l)), '');
fs.writeFileSync(path.join(OUT, 'llms-full.txt'), full.join('\n'));

const json = {
  name: 'Pryv compliance matrix',
  description: intro[2].slice(2),
  disclaimer: DISCLAIMER,
  generated_at: meta.built_at ?? null,
  site: `${SITE}/`,
  source: 'https://github.com/pryv/compliance-matrix',
  license: 'BSD-3-Clause',
  legend: { coverage: COVERAGE, pryv_effort_saved: EFFORT, facilitation_mode: MODES },
  primitives,
  context_notes: contextNotes.map((n) => ({ ...n, markdown_url: contextMdUrl(n.id) })),
  scopes: data
};
fs.writeFileSync(path.join(OUT, 'compliance.json'), JSON.stringify(json, null, 1) + '\n');

db.close();
console.log(`[export-text] ${path.relative(ROOT, OUT) || OUT}: ${data.length} scopes, ${totalReqs} requirements, ${contextCount} context notes`);
