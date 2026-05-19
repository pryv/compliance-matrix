#!/usr/bin/env node
/**
 * migrate-facilitation-to-fields.js — one-shot migration that promotes
 * the prose-prefix `**Facilitation: <mode> (<level>)** — ` convention
 * into structured YAML fields `facilitation_mode:` + `facilitation_level:`.
 *
 * Behaviour:
 *   - For each scopes/*.yml file:
 *     - Find every block matching `coverage: facilitated` whose
 *       overview begins with the prose prefix.
 *     - Insert `facilitation_mode: <mode>` + `facilitation_level: <level>`
 *       lines immediately after the `coverage: facilitated` line.
 *     - Strip the `**Facilitation: ...** — ` prefix from the overview
 *       first line (the rest of the overview prose stays intact).
 *
 * Run from repo root:  node scripts/migrate-facilitation-to-fields.js
 *
 * Idempotent: rows that already have facilitation_mode/level are skipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCOPES_DIR = path.join(ROOT, 'scopes');

const scopeFiles = await glob(path.join(SCOPES_DIR, '*.yml'));

let totalRows = 0;
let totalMigrated = 0;
let totalAlreadyMigrated = 0;
let totalSkipped = 0;

for (const file of scopeFiles) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const lines = src.split('\n');

  let scopeRows = 0;
  let scopeMigrated = 0;
  let scopeAlreadyMigrated = 0;
  let scopeSkipped = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match `<indent>coverage: facilitated` (exact)
    const m = line.match(/^(\s+)coverage: facilitated\s*$/);
    if (!m) {
      out.push(line);
      continue;
    }
    scopeRows += 1;
    const indent = m[1];

    // Look ahead a few lines: does facilitation_mode already exist?
    const nextLine = lines[i + 1] ?? '';
    if (nextLine.match(/^\s+facilitation_mode:/)) {
      scopeAlreadyMigrated += 1;
      out.push(line);
      continue;
    }

    // Find the overview prefix in the next ~30 lines.
    // The overview block we expect:
    //   <indent>overview: |
    //   <indent>  **Facilitation: <mode> (<level>)** — <rest>
    let overviewLineIdx = -1;
    let prefixLineIdx = -1;
    let mode = null;
    let level = null;
    let prefixRest = ''; // text after "** — " on the same line
    for (let j = i + 1; j < Math.min(i + 40, lines.length); j++) {
      const ovMatch = lines[j].match(/^(\s+)overview:\s*\|\s*$/);
      if (ovMatch && ovMatch[1] === indent) {
        overviewLineIdx = j;
        // The prefix line is overview content -- typically j+1
        const pfx = lines[j + 1] ?? '';
        const facMatch = pfx.match(/^(\s+)\*\*Facilitation:\s+(\w+)\s+\((\w+)\)\*\*\s+—\s*(.*)$/);
        if (facMatch) {
          prefixLineIdx = j + 1;
          mode = facMatch[2];
          level = facMatch[3];
          prefixRest = facMatch[4];
        }
        break;
      }
      // Stop scanning once we hit a likely next-record boundary
      if (lines[j].match(/^\s+-\s+ref:/)) break;
    }

    if (mode === null) {
      // facilitated row with no prefix — leave it alone (rare;
      // most likely a row authored before the convention or after
      // a manual override).
      scopeSkipped += 1;
      out.push(line);
      continue;
    }

    // Emit:
    //   <indent>coverage: facilitated
    //   <indent>pryv_effort_saved: <level>
    //   <indent>facilitation_mode: <mode>
    out.push(line);
    out.push(`${indent}pryv_effort_saved: ${level}`);
    out.push(`${indent}facilitation_mode: ${mode}`);
    scopeMigrated += 1;

    // Continue copying intermediate lines until overviewLineIdx (inclusive)
    for (let j = i + 1; j <= overviewLineIdx; j++) {
      out.push(lines[j]);
    }
    // Replace prefix line: keep indentation, drop "**Facilitation: ...** — "
    const prefixIndent = (lines[prefixLineIdx].match(/^(\s+)/) || [, ''])[1];
    if (prefixRest.trim() === '') {
      // Prefix was followed by line break -- emit blank-but-indented line
      // YAML block-scalar happily accepts an empty content line; rare case.
      out.push(`${prefixIndent}`);
    } else {
      // Capitalize first letter of remaining text if it starts lowercase
      // (the prefix typically ended with ' — ' followed by a lowercase
      // sentence continuation; standalone first sentence reads better
      // when capitalized).
      const first = prefixRest.charAt(0);
      const rest = first === first.toUpperCase() ? prefixRest : first.toUpperCase() + prefixRest.slice(1);
      out.push(`${prefixIndent}${rest}`);
    }

    // Advance i past the prefix line we just rewrote
    i = prefixLineIdx;
  }

  if (scopeMigrated > 0) {
    fs.writeFileSync(file, out.join('\n'));
    console.log(`[MIG]  ${rel}: ${scopeMigrated} migrated, ${scopeAlreadyMigrated} already, ${scopeSkipped} skipped (of ${scopeRows} facilitated)`);
  } else if (scopeAlreadyMigrated > 0 || scopeSkipped > 0) {
    console.log(`[OK]   ${rel}: ${scopeAlreadyMigrated} already, ${scopeSkipped} skipped (of ${scopeRows} facilitated)`);
  }

  totalRows += scopeRows;
  totalMigrated += scopeMigrated;
  totalAlreadyMigrated += scopeAlreadyMigrated;
  totalSkipped += scopeSkipped;
}

console.log('');
console.log(`Total: ${totalRows} facilitated rows; ${totalMigrated} migrated, ${totalAlreadyMigrated} already migrated, ${totalSkipped} skipped (no prose prefix).`);
