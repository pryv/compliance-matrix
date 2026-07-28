// In-browser compliance-pack generator. Pure functions (no DOM / network) so
// they are unit-testable; the Generate component wires them to the loaded
// SQLite + the bundled QMS template and zips the result.
//
// Mirrors scripts/generate-template.js (the CLI) but typed against the WAB's
// db.ts shapes.

import type { Scope, Requirement, RequirementLinks, Coverage } from './db';

export type Answers = Record<string, string | boolean | string[]>;

export interface QuestionField {
  key: string;
  label: string;
  type: 'text' | 'bool';
  placeholder?: string;
}

// Form fields mirror schemas/questionnaire.schema.json (kebab-case keys map
// 1:1 onto the {{placeholders}} in the implementer QMS template).
export const QUESTION_FIELDS: QuestionField[] = [
  { key: 'organization', label: 'Organization (legal entity)', type: 'text', placeholder: 'Acme Health GmbH' },
  { key: 'deployment-name', label: 'Deployment name', type: 'text', placeholder: 'Acme Personal Data Vault' },
  { key: 'jurisdiction', label: 'Jurisdiction(s)', type: 'text', placeholder: 'EU / Germany' },
  { key: 'controller-or-processor', label: 'Your role (controller / processor)', type: 'text', placeholder: 'controller' },
  { key: 'storage-engine', label: 'Storage engine', type: 'text', placeholder: 'PostgreSQL' },
  { key: 'dpo-contact', label: 'Data-protection contact', type: 'text', placeholder: 'dpo@acme.example' },
  { key: 'security-contact', label: 'Security contact', type: 'text', placeholder: 'security@acme.example' },
  { key: 'quality-owner', label: 'Quality owner', type: 'text', placeholder: 'Head of Engineering' },
  { key: 'retention-policy', label: 'Retention policy', type: 'text', placeholder: 'Health events 10y; logs 1y' },
  { key: 'backup-schedule', label: 'Backup schedule', type: 'text', placeholder: 'Daily, retained 35 days' },
  { key: 'breach-notify-deadline', label: 'Breach-notification deadline', type: 'text', placeholder: '72 hours' },
  { key: 'access-review-cadence', label: 'Access-review cadence', type: 'text', placeholder: 'quarterly' },
  { key: 'restore-test-cadence', label: 'Restore-test cadence', type: 'text', placeholder: 'every 6 months' },
  { key: 'multi-core', label: 'Multi-core topology', type: 'bool' },
  { key: 'mfa-enabled', label: 'MFA enabled', type: 'bool' },
  { key: 'audit-enabled', label: 'Audit logging enabled', type: 'bool' }
];

// ---- minimal templating: {{#if x}}…{{/if}} then {{x}} ----

export function renderTemplate (text: string, vars: Answers): string {
  let out = text.replace(/\{\{#if ([\w-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m, key: string, body: string) => {
    const v = vars[key];
    return v && v !== 'false' ? body : '';
  });
  out = out.replace(/\{\{([\w-]+)\}\}/g, (m, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return String(vars[key]);
    return m;
  });
  return out;
}

const COVERAGE_ORDER: Coverage[] = ['implemented', 'configurable', 'facilitated', 'documented', 'out-of-scope'];
const OPERATOR_WORK = new Set<Coverage>(['configurable', 'facilitated', 'documented', 'out-of-scope']);

export function coverageHistogram (reqs: Requirement[]): Record<Coverage, number> {
  const counts = Object.fromEntries(COVERAGE_ORDER.map((c) => [c, 0])) as Record<Coverage, number>;
  for (const r of reqs) if (r.coverage in counts) counts[r.coverage]++;
  return counts;
}

function evidencePointers (links: RequirementLinks | undefined): string {
  if (!links) return '—';
  const bits: string[] = [];
  if (links.tests.length) bits.push(`tests: ${links.tests.map((t) => `\`[${t}]\``).join(', ')}`);
  if (links.configs.length) bits.push(`config: ${links.configs.map((c) => `\`${c}\``).join(', ')}`);
  if (links.docs.length) bits.push(`docs: ${links.docs.join(', ')}`);
  if (links.qms.length) bits.push(`qms: ${links.qms.join(', ')}`);
  return bits.join('; ') || '—';
}

const esc = (s: string): string => (s || '').replace(/\|/g, '\\|');

export function renderScopeDoc (
  scope: Scope,
  reqs: Requirement[],
  linksByRef: Record<string, RequirementLinks>,
  vars: Answers,
  generatedAt: string
): string {
  const hist = coverageHistogram(reqs);
  const org = String(vars.organization || 'Your organization');
  const dep = String(vars['deployment-name'] || 'your deployment');
  const L: string[] = [];
  L.push(`# ${org}, ${scope.title}`, '');
  L.push(`> Generated ${generatedAt} for **${dep}** (${vars.jurisdiction || 'jurisdiction not stated'}).`);
  L.push('> This is a working skeleton. Every row marked as your responsibility');
  L.push('> needs your own evidence before an audit. Not legal advice.', '');
  L.push(`**Scope:** ${scope.short || scope.id} · version ${scope.version || 'n/a'}${scope.version_date ? ` (${scope.version_date})` : ''}`);
  if (scope.canonical_url) L.push(`**Canonical text:** ${scope.canonical_url}`);
  L.push('', '## Coverage summary', '');
  L.push('| Coverage | Rows | Meaning |', '|---|---:|---|');
  L.push(`| implemented | ${hist.implemented} | carried by Pryv out of the box |`);
  L.push(`| configurable | ${hist.configurable} | Pryv supports it; **you configure** it |`);
  L.push(`| facilitated | ${hist.facilitated} | Pryv helps; **you do the rest** |`);
  L.push(`| documented | ${hist.documented} | **your organizational process** (see QMS) |`);
  L.push(`| out-of-scope | ${hist['out-of-scope']} | no software contribution for this row |`);
  L.push('', '## Applicable requirements', '');
  L.push('| Ref | Title | Coverage | Pryv effort saved | Evidence pointers |', '|---|---|---|---|---|');
  for (const r of reqs) {
    L.push(`| ${r.ref} | ${esc(r.title)} | ${r.coverage} | ${r.pryv_effort_saved || '—'} | ${esc(evidencePointers(linksByRef[r.ref]))} |`);
  }
  L.push('', '## Your to-do list', '');
  L.push('Rows where work remains on your side (configure, act on a facilitation,');
  L.push('or run an organizational process). Implemented rows are carried by Pryv.', '');
  const todo = reqs.filter((r) => OPERATOR_WORK.has(r.coverage));
  if (!todo.length) {
    L.push('_No operator-side rows for this scope._');
  } else {
    for (const r of todo) {
      const ov = (r.overview || '').trim().replace(/\s+/g, ' ');
      L.push(`- [ ] **${r.ref}, ${r.title}** (${r.coverage})${ov ? `, ${ov}` : ''}`);
    }
  }
  L.push('');
  return L.join('\n');
}

export function renderGapReport (
  scopes: Scope[],
  reqsByScope: Record<string, Requirement[]>,
  vars: Answers,
  generatedAt: string
): string {
  const L: string[] = ['# Gap report, operator responsibilities', '',
    `Generated ${generatedAt} for ${vars.organization} / ${vars['deployment-name']}.`,
    'Rows below are not carried by software alone; they need your process or decision.', '',
    '| Scope | Ref | Title | Coverage |', '|---|---|---|---|'];
  for (const scope of scopes) {
    for (const r of (reqsByScope[scope.id] || [])) {
      if (r.coverage === 'documented' || r.coverage === 'out-of-scope') {
        L.push(`| ${scope.short || scope.id} | ${r.ref} | ${esc(r.title)} | ${r.coverage} |`);
      }
    }
  }
  return L.join('\n') + '\n';
}

export function renderIndex (scopes: Scope[], vars: Answers, generatedAt: string): string {
  const L: string[] = ['# Compliance pack', '',
    `For **${vars.organization}**, ${vars['deployment-name']}`, `Generated ${generatedAt}.`, '',
    '## Your answers', '', '| Field | Value |', '|---|---|'];
  for (const k of ['organization', 'deployment-name', 'jurisdiction', 'controller-or-processor',
    'storage-engine', 'multi-core', 'mfa-enabled', 'audit-enabled']) {
    if (vars[k] !== undefined && vars[k] !== '') L.push(`| ${k} | ${vars[k]} |`);
  }
  L.push('', '## Scope documents', '');
  for (const scope of scopes) L.push(`- ${scope.title} → \`${scope.id}.md\``);
  L.push('', '- Gap report → `gap-report.md`', '- QMS templates → `qms/`', '');
  return L.join('\n');
}
