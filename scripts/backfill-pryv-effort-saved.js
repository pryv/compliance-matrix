#!/usr/bin/env node
/**
 * backfill-pryv-effort-saved.js — one-shot backfill that adds the
 * `pryv_effort_saved` field to every row whose coverage is one of
 * implemented / configurable / documented and which doesn't already
 * have the field.
 *
 * Strategy:
 *   - implemented rows -> default `high` (Pryv ships the obligation).
 *   - configurable + documented rows -> consult OVERRIDES below (one
 *     entry per ref per scope) for the editorial decision. Rows
 *     missing from OVERRIDES fall back to `medium` (with a warning).
 *   - out-of-scope rows -> no field; skip.
 *   - facilitated rows -> already handled by migrate-facilitation-to-fields.
 *
 * Run:  node scripts/backfill-pryv-effort-saved.js
 *
 * Idempotent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCOPES_DIR = path.join(ROOT, 'scopes');

// Per-row editorial judgement for configurable + documented rows.
// Implemented rows aren't listed here -- they all default to `high`.
// Key: '<scope_id>.<ref>'
const OVERRIDES = {
  // CCPA
  'ccpa.1798.105': 'medium',           // erasure: API + engine-dependent backups
  'ccpa.1798.120': 'medium',           // opt-out: API + UI surface
  'ccpa.1798.121': 'medium',           // limit-use sensitive PI: stream layout + access narrow
  // GDPR
  'gdpr.Art.17': 'medium',             // erasure: API + engine-dependent backups
  'gdpr.Art.18': 'medium',             // restriction via accesses.update; planning needed
  'gdpr.Art.45': 'high',               // adequacy: single auth.hostings config
  'gdpr.Art.34': 'low',                // doc-only: operational notification work
  // HDS
  'hds.cross.data-residency': 'high',  // auth.hostings is the technical control
  // HIPAA-Privacy
  'hipaa-privacy.164.522': 'medium',   // restriction request: accesses.update/delete
  // HIPAA-Security
  'hipaa-security.164.308(a)(5)(ii)(D)': 'medium', // password mgmt + MFA toggle
  'hipaa-security.164.308(a)(7)(ii)(B)': 'low',    // DR: full multi-core bootstrap
  'hipaa-security.164.312(a)(2)(ii)': 'medium',    // emergency access: admin key custody
  'hipaa-security.164.312(a)(2)(iii)': 'high',     // auto-logoff: single session config
  'hipaa-security.164.312(a)(2)(iv)': 'medium',    // encryption: operator at-rest + Pryv secrets
  // ISO 27001
  'iso-27001.A.8.10': 'medium',        // information deletion: like GDPR Art.17
  'iso-27001.A.8.2': 'medium',         // privileged access: admin key custody
  // ISO 27701
  'iso-27701.A.7.4.5': 'medium',       // de-id + deletion: like GDPR Art.17
  'iso-27701.A.7.5.2': 'high',         // transfer destinations: auth.hostings
  // PIPEDA
  'pipeda.Principle.4.5': 'medium',    // limit use/disclosure/retention
  // Swiss nLPD
  'swiss-nlpd.Art.34': 'high'          // disclosure abroad: auth.hostings
};

const scopeFiles = await glob(path.join(SCOPES_DIR, '*.yml'));

let totalAdded = 0;
let totalSkipped = 0;

for (const file of scopeFiles) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const out = [];

  // Extract scope_id from first non-comment line
  const scopeIdMatch = src.match(/^id:\s+(\S+)/m);
  const scopeId = scopeIdMatch ? scopeIdMatch[1] : null;

  let pendingRef = null;        // ref of the current row being parsed
  let added = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);

    // Track current ref via `<indent>- ref: <value>`
    const refMatch = line.match(/^\s+-\s+ref:\s+["']?([^"'\s]+)["']?\s*$/);
    if (refMatch) {
      pendingRef = refMatch[1];
      continue;
    }

    const covMatch = line.match(/^(\s+)coverage:\s+(\S+)\s*$/);
    if (!covMatch) continue;

    const indent = covMatch[1];
    const coverage = covMatch[2];

    // Skip out-of-scope + facilitated (the latter handled by sister script)
    if (coverage === 'out-of-scope') continue;
    if (coverage === 'facilitated') continue;

    // Idempotency: peek next line; if pryv_effort_saved already present, skip
    if ((lines[i + 1] ?? '').match(/^\s+pryv_effort_saved:/)) continue;

    let effort;
    if (coverage === 'implemented') {
      effort = 'high';
    } else if (coverage === 'configurable' || coverage === 'documented') {
      const key = `${scopeId}.${pendingRef}`;
      effort = OVERRIDES[key];
      if (!effort) {
        console.error(`[WARN] no override for ${key} (coverage=${coverage}); defaulting to medium`);
        effort = 'medium';
      }
    } else {
      console.error(`[WARN] unknown coverage='${coverage}' at ${scopeId}.${pendingRef}`);
      continue;
    }

    out.push(`${indent}pryv_effort_saved: ${effort}`);
    added += 1;
  }

  if (added > 0) {
    fs.writeFileSync(file, out.join('\n'));
    console.log(`[BFL]  ${rel}: +${added}`);
    totalAdded += added;
  } else {
    totalSkipped += 1;
  }
}

console.log('');
console.log(`Total added: ${totalAdded} pryv_effort_saved fields (${totalSkipped} file(s) unchanged).`);
