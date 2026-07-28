#!/usr/bin/env node
/**
 * generate-template.js: implementer compliance-documentation generator.
 *
 * Given a short questionnaire (answers) and, optionally, an open-pryv.io
 * configuration file, produces a per-scope documentation skeleton plus a
 * filled-in copy of the implementer QMS template, ready for an operator to
 * complete and bring to an auditor.
 *
 * Usage:
 *   node scripts/generate-template.js --answers <answers.yml> \
 *        [--config <open-pryv-config.yml>] [--out <dir>]
 *
 * Inputs:
 *   - answers   : questionnaire answers (schemas/questionnaire.schema.json).
 *   - config    : (optional) open-pryv.io config, auto-derives
 *                 storage-engine / mfa-enabled / audit-enabled / multi-core.
 *   - the matrix: read directly from scopes/*.yml (the source of truth the
 *                 build compiles to dist/compliance.sqlite).
 *
 * Output (under --out, default ./compliance-pack):
 *   index.md            table of contents + answers summary.
 *   <scope-id>.md       per-scope: cover, coverage summary, applicable
 *                         requirements table, evidence pointers, and the
 *                         implementer's own to-do list.
 *   gap-report.md       every documented / out-of-scope row across the
 *                         selected scopes (the operator's responsibility).
 *   qms/                the implementer QMS template with {{placeholders}}
 *                         resolved from the answers.
 *
 * Exit 0 on success, 1 on validation / IO failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- args ----------

function parseArgs (argv) {
  const out = { answers: null, config: null, out: path.join(process.cwd(), 'compliance-pack') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--answers') out.answers = argv[++i];
    else if (a === '--config') out.config = argv[++i];
    else if (a === '--out') out.out = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

const HELP = `generate-template.js: implementer compliance-documentation generator

  node scripts/generate-template.js --answers <answers.yml> [--config <config.yml>] [--out <dir>]

  --answers  questionnaire answers (see scripts/questionnaire.example.yml)
  --config   optional open-pryv.io config; auto-derives storage/mfa/audit/topology
  --out      output directory (default ./compliance-pack)
`;

// ---------- minimal templating: {{#if x}}...{{/if}} then {{x}} ----------

export function render (text, vars) {
  // Conditional blocks first (non-nested; sufficient for the template set).
  let out = text.replace(/\{\{#if ([\w-]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    const v = vars[key];
    return v && v !== 'false' ? body : '';
  });
  // Simple substitutions; unknown placeholders are left visible so the
  // operator can spot what still needs filling.
  out = out.replace(/\{\{([\w-]+)\}\}/g, (m, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return String(vars[key]);
    return m;
  });
  return out;
}

// ---------- open-pryv.io config derivation (best-effort) ----------

function dig (obj, dottedPaths) {
  for (const dotted of dottedPaths) {
    let cur = obj;
    let ok = true;
    for (const part of dotted.split('.')) {
      if (cur && typeof cur === 'object' && part in cur) cur = cur[part];
      else { ok = false; break; }
    }
    if (ok && cur !== undefined) return cur;
  }
  return undefined;
}

export function deriveFromConfig (config) {
  const derived = {};
  const engine = dig(config, ['storages.baseStorage.engine', 'storages.file.engine', 'baseStorage.engine']);
  if (typeof engine === 'string') {
    derived['storage-engine'] = /sqlite/i.test(engine) ? 'SQLite' : (/postgres/i.test(engine) ? 'PostgreSQL' : engine);
  }
  const mfaMode = dig(config, ['services.mfa.mode', 'mfa.mode']);
  if (mfaMode !== undefined) derived['mfa-enabled'] = mfaMode !== 'disabled' && mfaMode !== false;
  const auditActive = dig(config, ['audit.active', 'audit.storage.active', 'audit.syslog.active']);
  if (auditActive !== undefined) derived['audit-enabled'] = !!auditActive;
  const workers = dig(config, ['cluster.apiWorkers', 'rqlite.external']);
  if (workers !== undefined) derived['multi-core'] = Number(workers) > 1 || workers === true;
  return derived;
}

// ---------- coverage helpers ----------

const COVERAGE_ORDER = ['implemented', 'configurable', 'facilitated', 'documented', 'out-of-scope'];
// Rows that put work on the operator's plate (vs. carried entirely by Pryv).
const OPERATOR_WORK = new Set(['configurable', 'facilitated', 'documented', 'out-of-scope']);

function coverageHistogram (rows) {
  const counts = Object.fromEntries(COVERAGE_ORDER.map((c) => [c, 0]));
  for (const r of rows) if (r.coverage in counts) counts[r.coverage]++;
  return counts;
}

function evidencePointers (r) {
  const bits = [];
  if (r.tests && r.tests.length) bits.push(`tests: ${r.tests.map((t) => `\`[${t}]\``).join(', ')}`);
  if (r.config_keys && r.config_keys.length) bits.push(`config: ${r.config_keys.map((c) => `\`${c}\``).join(', ')}`);
  if (r.docs && r.docs.length) bits.push(`docs: ${r.docs.join(', ')}`);
  if (r.qms_docs && r.qms_docs.length) bits.push(`qms: ${r.qms_docs.join(', ')}`);
  if (r.sample_apps && r.sample_apps.length) bits.push(`sample: ${r.sample_apps.join(', ')}`);
  return bits.join('; ') || '—';
}

// ---------- per-scope document ----------

function renderScopeDoc (scope, vars, generatedAt) {
  const rows = scope.requirements || [];
  const hist = coverageHistogram(rows);
  const L = [];
  L.push(`# ${vars.organization}, ${scope.title}`);
  L.push('');
  L.push(`> Generated ${generatedAt} for **${vars['deployment-name']}** (${vars.jurisdiction || 'jurisdiction not stated'}).`);
  L.push('> This is a working skeleton. Every row marked as your responsibility');
  L.push('> needs your own evidence before an audit. Not legal advice.');
  L.push('');
  L.push(`**Scope:** ${scope.short || scope.id} · version ${scope.version || 'n/a'}${scope.version_date ? ` (${scope.version_date})` : ''}`);
  if (scope.canonical_url) L.push(`**Canonical text:** ${scope.canonical_url}`);
  L.push('');
  L.push('## Coverage summary');
  L.push('');
  L.push('| Coverage | Rows | Meaning |');
  L.push('|---|---:|---|');
  L.push(`| implemented | ${hist.implemented} | carried by Pryv out of the box |`);
  L.push(`| configurable | ${hist.configurable} | Pryv supports it; **you configure** it |`);
  L.push(`| facilitated | ${hist.facilitated} | Pryv helps; **you do the rest** |`);
  L.push(`| documented | ${hist.documented} | **your organizational process** (see QMS) |`);
  L.push(`| out-of-scope | ${hist['out-of-scope']} | no software contribution for this row |`);
  L.push('');
  L.push('## Applicable requirements');
  L.push('');
  L.push('| Ref | Title | Coverage | Pryv effort saved | Evidence pointers |');
  L.push('|---|---|---|---|---|');
  for (const r of rows) {
    const title = (r.title || '').replace(/\|/g, '\\|');
    L.push(`| ${r.ref} | ${title} | ${r.coverage} | ${r.pryv_effort_saved || '—'} | ${evidencePointers(r).replace(/\|/g, '\\|')} |`);
  }
  L.push('');
  L.push('## Your to-do list');
  L.push('');
  L.push('Rows where work remains on your side (configure, act on a facilitation,');
  L.push('or run an organizational process). Implemented rows are carried by Pryv.');
  L.push('');
  const todo = rows.filter((r) => OPERATOR_WORK.has(r.coverage));
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

// ---------- main ----------

async function main () {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.answers) {
    console.log(HELP);
    process.exit(args.help ? 0 : 1);
  }

  // Load + validate answers.
  const answers = yaml.load(fs.readFileSync(path.resolve(args.answers), 'utf8'));
  const qSchema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schemas/questionnaire.schema.json'), 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(qSchema);
  if (!validate(answers)) {
    console.error('[FAIL] answers do not match schemas/questionnaire.schema.json:');
    for (const err of validate.errors) console.error(`  ${err.instancePath || '/'} ${err.message}`);
    process.exit(1);
  }

  // Merge config-derived values (config wins over the answers fallback for the
  // four derivable fields).
  let derived = {};
  if (args.config) {
    const config = yaml.load(fs.readFileSync(path.resolve(args.config), 'utf8'));
    derived = deriveFromConfig(config);
    if (Object.keys(derived).length) {
      console.log(`[OK]   derived from config: ${Object.entries(derived).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
  }
  const vars = { ...answers, ...derived };

  // Resolve selected scopes.
  const generatedAt = new Date().toISOString().slice(0, 10);
  const selected = [];
  for (const id of vars.scopes) {
    const f = path.join(ROOT, 'scopes', `${id}.yml`);
    if (!fs.existsSync(f)) {
      console.error(`[FAIL] scope '${id}' not found at scopes/${id}.yml`);
      process.exit(1);
    }
    selected.push(yaml.load(fs.readFileSync(f, 'utf8')));
  }

  // Prepare output dir.
  fs.mkdirSync(args.out, { recursive: true });

  // Per-scope docs.
  for (const scope of selected) {
    const doc = renderScopeDoc(scope, vars, generatedAt);
    fs.writeFileSync(path.join(args.out, `${scope.id}.md`), doc);
  }

  // Gap report (documented + out-of-scope across all selected scopes).
  const gap = ['# Gap report, operator responsibilities', '',
    `Generated ${generatedAt} for ${vars.organization} / ${vars['deployment-name']}.`,
    'Rows below are not carried by software alone; they need your process or decision.', '',
    '| Scope | Ref | Title | Coverage |', '|---|---|---|---|'];
  for (const scope of selected) {
    for (const r of (scope.requirements || [])) {
      if (r.coverage === 'documented' || r.coverage === 'out-of-scope') {
        gap.push(`| ${scope.short || scope.id} | ${r.ref} | ${(r.title || '').replace(/\|/g, '\\|')} | ${r.coverage} |`);
      }
    }
  }
  fs.writeFileSync(path.join(args.out, 'gap-report.md'), gap.join('\n') + '\n');

  // Filled QMS template.
  const tmplRoot = path.join(ROOT, 'qms', 'implementer-template');
  const tmplFiles = await glob('**/*.md', { cwd: tmplRoot, nodir: true });
  let qmsCount = 0;
  for (const rel of tmplFiles) {
    const src = fs.readFileSync(path.join(tmplRoot, rel), 'utf8');
    const dest = path.join(args.out, 'qms', rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, render(src, vars));
    qmsCount++;
  }

  // Index.
  const idx = ['# Compliance pack', '',
    `For **${vars.organization}**, ${vars['deployment-name']}`,
    `Generated ${generatedAt}.`, '',
    '## Your answers', '', '| Field | Value |', '|---|---|'];
  for (const k of ['organization', 'deployment-name', 'jurisdiction', 'controller-or-processor',
    'storage-engine', 'multi-core', 'mfa-enabled', 'audit-enabled']) {
    if (vars[k] !== undefined) idx.push(`| ${k} | ${vars[k]} |`);
  }
  idx.push('', '## Scope documents', '');
  for (const scope of selected) idx.push(`- [${scope.title}](./${scope.id}.md)`);
  idx.push('', '- [Gap report](./gap-report.md)', '- [QMS templates](./qms/README.md)', '');
  fs.writeFileSync(path.join(args.out, 'index.md'), idx.join('\n'));

  console.log(`[OK]   wrote ${selected.length} scope doc(s) + gap report + ${qmsCount} QMS file(s) to ${path.relative(process.cwd(), args.out) || '.'}`);
}

// Run as CLI only when invoked directly (so tests can import the helpers).
const invokedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
