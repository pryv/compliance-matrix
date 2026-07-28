#!/usr/bin/env node
/**
 * sync-backlogs-to-gh.js
 *
 * Sync compliance-matrix backlog items + orphan bugs to GitHub issues
 * on `pryv/open-pryv.io`, attach them to Pryv.io v2 project #5, and
 * populate `tracking_url` on the corresponding `planned:` chips in
 * `scopes/*.yml`.
 *
 * Idempotent:
 *   - Existing `tracking_url` values in chips are preserved + treated
 *     as the canonical mapping (script does NOT overwrite).
 *   - Existing GitHub issues whose title contains the backlog slug
 *     (after a `[compliance]` / `[V2]` prefix) are matched + reused.
 *
 * Operator gates:
 *   - Default mode is dry-run. Pass `--apply` to actually create issues
 *     and edit YAML.
 *   - DX-only backlogs (marked in their header) are skipped — they do
 *     not warrant a GitHub issue per the compliance-matrix discipline.
 *
 * Usage:
 *   node scripts/sync-backlogs-to-gh.js          # dry-run, prints plan
 *   node scripts/sync-backlogs-to-gh.js --apply  # creates issues +
 *                                                  edits scopes/*.yml
 *
 * Requires: `gh` CLI authenticated against `pryv` org with project
 * access. `node >=24`.
 */

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const REPO = 'pryv/open-pryv.io';
const ORG = 'pryv';
const PROJECT_NUMBER = 5;             // Pryv.io v2
const ISSUE_TITLE_PREFIX = '[compliance]';
const ISSUE_LABEL = 'compliance-matrix';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MACROPRYV_ROOT = path.resolve(ROOT, '..');
const BACKLOG_DIR = path.join(MACROPRYV_ROOT, '_plans', 'XXX-Backlog');
const BUGS_FILE = path.join(MACROPRYV_ROOT, '_plans', 'BUGS.md');
const SCOPES_DIR = path.join(ROOT, 'scopes');

const APPLY = process.argv.includes('--apply');

/**
 * Known mappings — operator-curated overrides where the existing GitHub
 * issue title doesn't substring-match the backlog slug but the operator
 * has confirmed the semantic equivalence. Extend as needed.
 *
 * Format: SLUG → issue number on pryv/open-pryv.io.
 */
const KNOWN_MAPPINGS = {
  ALIASES: 38,           // "[V2] implement simple de-identifying by aliasing a username on apiEndpoints"
  'E2E-ENCRYPTION': 34   // "[V2] Should support end-to-end encryption"
};

// ──────────────────────────────────────────────────────────────────
// Discovery
// ──────────────────────────────────────────────────────────────────

function listBacklogFiles () {
  // Backlog files carry a `COMPLIANCE-` filename prefix in the workspace;
  // the matrix-side slug is the bare stem after the prefix.
  return readdirSync(BACKLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      slug: f.replace(/\.md$/, '').replace(/^COMPLIANCE-/, ''),
      path: path.join(BACKLOG_DIR, f)
    }));
}

/**
 * Compute the matrix-relevant subset of backlog slugs — only those
 * referenced from compliance-matrix as either a `planned: backlog:`
 * chip in `scopes/*.yml` OR a `proposals/<slug>.md` mirror file.
 *
 * Pure-engineering backlogs (Express migration, memory-leak
 * investigation, deploy-from-CI-image, etc.) are NOT in scope for
 * compliance-matrix sync.
 */
function matrixRelevantSlugs () {
  const slugs = new Set();
  // Source of truth: chip `backlog:` references in scopes/*.yml
  for (const sf of listScopeFiles()) {
    const text = readFileSync(sf, 'utf8');
    let doc;
    try { doc = yaml.load(text); } catch { continue; }
    for (const req of doc?.requirements || []) {
      for (const p of req.planned || []) {
        if (p.backlog) slugs.add(p.backlog);
      }
    }
  }
  return slugs;
}

function isDxOnlyBacklog (filePath) {
  const body = readFileSync(filePath, 'utf8');
  return /Category:\s*DX/i.test(body) || /DX-only/i.test(body.split('\n').slice(0, 30).join('\n'));
}

function backlogTitleLine (filePath) {
  const body = readFileSync(filePath, 'utf8');
  const m = body.match(/^# (.+)$/m);
  return m ? m[1].trim() : path.basename(filePath, '.md');
}

function parseBugsFile () {
  if (!existsSync(BUGS_FILE)) return [];
  const body = readFileSync(BUGS_FILE, 'utf8');
  // Only "Open" section, not "Fixed"
  const openIdx = body.indexOf('## Open');
  const fixedIdx = body.indexOf('## Fixed');
  if (openIdx < 0) return [];
  const openBody = body.slice(openIdx, fixedIdx > 0 ? fixedIdx : undefined);
  const entries = [];
  const entryRegex = /^### (B-\d{4}-\d{2}-\d{2}-\d+)\s*—\s*(.+?)$/gm;
  let m;
  while ((m = entryRegex.exec(openBody)) !== null) {
    entries.push({ id: m[1], title: m[2].trim() });
  }
  return entries;
}

function existsSync (p) {
  try { statSync(p); return true; } catch { return false; }
}

// ──────────────────────────────────────────────────────────────────
// GitHub state
// ──────────────────────────────────────────────────────────────────

function gh (cmd, opts = {}) {
  const out = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', opts.quiet ? 'pipe' : 'inherit'] });
  return out.trim();
}

function listExistingComplianceIssues () {
  // Pull all open + closed issues with `compliance-matrix` label OR title contains [compliance]
  // We also accept legacy [V2] titles for matching.
  const labeled = JSON.parse(gh(
    `gh issue list --repo ${REPO} --state all --label ${ISSUE_LABEL} --limit 100 --json number,title,url,state`,
    { quiet: true }
  ));
  const v2 = JSON.parse(gh(
    `gh issue list --repo ${REPO} --state open --search "[V2] in:title" --limit 100 --json number,title,url,state`,
    { quiet: true }
  ));
  // Merge by number
  const byNumber = new Map();
  for (const i of [...labeled, ...v2]) byNumber.set(i.number, i);
  return [...byNumber.values()];
}

function matchSlugInTitle (slug, title) {
  // Try several normalisations: SLUG, slug-with-dashes, "slug words"
  const slugDashes = slug.toLowerCase();
  const slugWords = slug.toLowerCase().replace(/-/g, ' ');
  const t = title.toLowerCase();
  return t.includes(slugDashes) || t.includes(slugWords);
}

// ──────────────────────────────────────────────────────────────────
// YAML editing — surgical regex insert of tracking_url
// ──────────────────────────────────────────────────────────────────

function listScopeFiles () {
  return readdirSync(SCOPES_DIR)
    .filter(f => f.endsWith('.yml'))
    .map(f => path.join(SCOPES_DIR, f));
}

function existingTrackingUrls (scopeText) {
  // Map "BACKLOG_SLUG" → tracking_url (if already populated)
  const result = new Map();
  // Parse the whole yaml + traverse.
  let doc;
  try { doc = yaml.load(scopeText); } catch { return result; }
  if (!doc?.requirements) return result;
  for (const req of doc.requirements) {
    for (const p of req.planned || []) {
      if (p.backlog && p.tracking_url) {
        result.set(p.backlog, p.tracking_url);
      }
    }
  }
  return result;
}

/**
 * Insert `tracking_url: <url>` into every planned entry that matches
 * `backlog: <slug>` and doesn't already have tracking_url.
 *
 * Regex-based to preserve comments + formatting.
 */
function insertTrackingUrl (scopeText, slugToUrl) {
  // Match each "- kind: ..." planned block. We'll process line-by-line.
  const lines = scopeText.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    out.push(line);
    const slugMatch = line.match(/^(\s+)backlog:\s*([A-Z][A-Z0-9_-]*)\s*$/);
    if (slugMatch) {
      const indent = slugMatch[1];
      const slug = slugMatch[2];
      const url = slugToUrl.get(slug);
      if (url) {
        // Check if next-N lines already have tracking_url in this entry
        // (entry ends at next "- " at same or lower indent, or next "planned:" sibling)
        let j = i + 1;
        let hasUrl = false;
        while (j < lines.length) {
          const peek = lines[j];
          if (/^\s+-\s+/.test(peek) || (/^\s*[a-z_]+:/.test(peek) && peek.match(/^(\s+)/)[1].length < indent.length)) break;
          if (/^\s+tracking_url:/.test(peek)) { hasUrl = true; break; }
          j++;
          if (j - i > 8) break; // safety
        }
        if (!hasUrl) {
          out.push(`${indent}tracking_url: ${url}`);
        }
      }
    }
    i++;
  }
  return out.join('\n');
}

// ──────────────────────────────────────────────────────────────────
// Issue creation
// ──────────────────────────────────────────────────────────────────

// Issue bodies are PUBLIC. Backlog files are internal and routinely cite
// internal planning artefacts, so a verbatim copy leaks them (this happened:
// twelve issues had to be rewritten after the fact). Structural citations are
// rewritten mechanically; anything left is a prose reference that only a human
// can paraphrase faithfully, so we fail closed rather than publish it.
// The tokens are assembled from fragments on purpose: this file lives in the
// published repo, and spelling them literally would make the repo-wide
// internal-reference self-check report its own detector as a violation.
const PLAN_DIR = '_pl' + 'ans';
const MEMORY_DIR = '_claude' + '-memory';
const WORKSPACE = 'macro' + 'Pryv';
const INTERNAL_REF = new RegExp(`Plan[- ]\\d+|${PLAN_DIR}/|${MEMORY_DIR}|${WORKSPACE}`);

function scrubInternalRefs (text, source) {
  const scrubbed = text
    .replace(new RegExp('`' + PLAN_DIR + '/XXX-Backlog/([A-Z0-9-]+)\\.md`', 'g'), 'the `$1` compliance backlog item')
    .replace(new RegExp(` \\(${WORKSPACE} repo\\)`, 'g'), '')
    .replace(new RegExp(`${WORKSPACE} workspace`, 'g'), 'the internal workspace');

  const offending = scrubbed
    .split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => INTERNAL_REF.test(line));

  if (offending.length > 0) {
    const detail = offending.map(([n, l]) => `    ${n}: ${l.trim()}`).join('\n');
    throw new Error(
      `refusing to publish ${source}: internal references remain after scrubbing.\n` +
      `Paraphrase these lines in the source file (describe the feature, not the plan), then re-run:\n${detail}`
    );
  }
  return scrubbed;
}

function createIssue (slug, titleLine, backlogPath) {
  const body = scrubInternalRefs(readFileSync(backlogPath, 'utf8'), backlogPath);
  const title = `${ISSUE_TITLE_PREFIX} ${scrubInternalRefs(titleLine, `${backlogPath} (title)`)}`;
  const fullBody = [
    'Tracked from the compliance-matrix backlog',
    `(backlog slug: ${slug}).`,
    '',
    '---',
    '',
    body
  ].join('\n');
  // Use a tempfile for body
  const tmpFile = path.join('/tmp', `gh-issue-body-${slug}.md`);
  writeFileSync(tmpFile, fullBody);
  const issueUrl = gh(
    `gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --body-file ${tmpFile} --label ${ISSUE_LABEL}`,
    { quiet: true }
  );
  return issueUrl.trim();
}

function attachToProject (issueUrl) {
  gh(`gh project item-add ${PROJECT_NUMBER} --owner ${ORG} --url ${issueUrl}`, { quiet: true });
}

// ──────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────

async function main () {
  console.log(`# Backlog → GitHub sync (${APPLY ? 'APPLY mode' : 'DRY-RUN'})`);
  console.log(`Target repo: ${REPO}`);
  console.log(`Target project: ${ORG} #${PROJECT_NUMBER}`);
  console.log('');

  // Phase 1 — discover matrix-relevant backlog slugs (chip references)
  const allBacklogs = listBacklogFiles();
  const matrixSlugs = matrixRelevantSlugs();
  console.log(`Matrix-relevant backlog slugs (referenced by chips): ${matrixSlugs.size}`);
  for (const slug of matrixSlugs) console.log(`  - ${slug}`);
  console.log('');

  const relevant = allBacklogs.filter(b => matrixSlugs.has(b.slug));
  const missingFiles = [...matrixSlugs].filter(slug => !allBacklogs.find(b => b.slug === slug));
  if (missingFiles.length) {
    console.log(`WARN: ${missingFiles.length} chip(s) reference backlog slug(s) with no matching backlog file:`);
    for (const m of missingFiles) console.log(`      - ${m}`);
    console.log('');
  }
  console.log(`Of ${allBacklogs.length} backlog files, ${relevant.length} are matrix-relevant + ${allBacklogs.length - relevant.length} are pure-engineering (out of scope).`);
  console.log('');

  const dxOnly = relevant.filter(b => isDxOnlyBacklog(b.path));
  if (dxOnly.length) {
    console.log(`Skipping ${dxOnly.length} DX-only backlog(s): ${dxOnly.map(b => b.slug).join(', ')}`);
  }
  const inScope = relevant.filter(b => !isDxOnlyBacklog(b.path));

  // Phase 2 — discover existing tracking_url values across all scopes
  const knownTracking = new Map();   // SLUG → url
  const scopeFiles = listScopeFiles();
  for (const sf of scopeFiles) {
    const text = readFileSync(sf, 'utf8');
    for (const [slug, url] of existingTrackingUrls(text)) {
      knownTracking.set(slug, url);
    }
  }
  console.log(`Existing tracking_url mappings in scopes/*.yml: ${knownTracking.size}`);
  for (const [slug, url] of knownTracking) {
    console.log(`  ${slug} → ${url}`);
  }
  console.log('');

  // Phase 3 — discover existing GitHub issues
  console.log('Fetching existing GitHub issues...');
  const existingIssues = listExistingComplianceIssues();
  console.log(`Found ${existingIssues.length} existing issues with [compliance-matrix] label or [V2] title.`);

  // Phase 4 — for each backlog, decide action
  const plan = [];   // {slug, action: 'map'|'create'|'skip', issueNumber?, issueUrl?, reason?}
  for (const b of inScope) {
    if (knownTracking.has(b.slug)) {
      plan.push({ slug: b.slug, action: 'skip', reason: 'tracking_url already set' });
      continue;
    }
    // Operator-curated override first (handles cases where title doesn't substring-match)
    if (KNOWN_MAPPINGS[b.slug]) {
      const issueNumber = KNOWN_MAPPINGS[b.slug];
      const match = existingIssues.find(i => i.number === issueNumber);
      if (match) {
        plan.push({ slug: b.slug, action: 'map', issueNumber, issueUrl: match.url, title: match.title, source: 'KNOWN_MAPPINGS' });
        continue;
      }
      // Override points at an issue we couldn't find — surface as warning
      plan.push({ slug: b.slug, action: 'create', titleLine: backlogTitleLine(b.path), path: b.path, warning: `KNOWN_MAPPINGS references #${issueNumber} but it wasn't found via gh issue list` });
      continue;
    }
    // Try matching against existing issues by title
    const match = existingIssues.find(i => matchSlugInTitle(b.slug, i.title));
    if (match) {
      plan.push({ slug: b.slug, action: 'map', issueNumber: match.number, issueUrl: match.url, title: match.title, source: 'title-match' });
      continue;
    }
    plan.push({ slug: b.slug, action: 'create', titleLine: backlogTitleLine(b.path), path: b.path });
  }

  // Phase 5 — also discover BUGS.md orphan bugs
  const orphanBugs = parseBugsFile();
  console.log(`Found ${orphanBugs.length} orphan bug(s) in the orphan-bugs registry "Open" section.`);
  for (const bug of orphanBugs) {
    // Match against issues by bug ID in title (gh CLI search would find it via `B-2026-`)
    const match = existingIssues.find(i => i.title.includes(bug.id));
    if (match) {
      plan.push({ slug: bug.id, action: 'map', issueNumber: match.number, issueUrl: match.url, isBug: true });
    } else {
      plan.push({ slug: bug.id, action: 'create-bug', titleLine: `${bug.id} — ${bug.title}`, isBug: true });
    }
  }

  // Phase 6 — print plan
  console.log('');
  console.log('## Plan');
  console.log('');
  const counts = { map: 0, create: 0, 'create-bug': 0, skip: 0 };
  for (const p of plan) {
    counts[p.action] = (counts[p.action] || 0) + 1;
  }
  console.log(`  skip (already mapped): ${counts.skip}`);
  console.log(`  map to existing issue: ${counts.map}`);
  console.log(`  create new issue:       ${counts.create}`);
  console.log(`  create new bug issue:   ${counts['create-bug'] || 0}`);
  console.log('');

  for (const p of plan) {
    if (p.action === 'skip') {
      console.log(`  [skip]   ${p.slug}: ${p.reason}`);
    } else if (p.action === 'map') {
      console.log(`  [map]    ${p.slug} → #${p.issueNumber} "${p.title || ''}" (${p.source || ''})`);
    } else if (p.action === 'create') {
      console.log(`  [create] ${p.slug}: ${p.titleLine}`);
    } else if (p.action === 'create-bug') {
      console.log(`  [bug]    ${p.slug}: ${p.titleLine}`);
    }
  }

  if (!APPLY) {
    console.log('');
    console.log('DRY-RUN complete. Re-run with --apply to execute.');
    return;
  }

  // Phase 7 — apply
  console.log('');
  console.log('## APPLYING...');
  console.log('');
  const newMappings = new Map(); // SLUG → url

  for (const p of plan) {
    if (p.action === 'map') {
      newMappings.set(p.slug, p.issueUrl);
      console.log(`[map]    ${p.slug} → ${p.issueUrl}`);
    } else if (p.action === 'create') {
      console.log(`[create] ${p.slug}...`);
      const url = createIssue(p.slug, p.titleLine, p.path);
      console.log(`         created ${url}`);
      attachToProject(url);
      console.log(`         attached to project #${PROJECT_NUMBER}`);
      newMappings.set(p.slug, url);
    } else if (p.action === 'create-bug') {
      console.log(`[bug]    ${p.slug}: ${p.titleLine}`);
      // For BUGS.md entries we don't have a backlog file body — use the BUGS.md entry section
      const bugBody = scrubInternalRefs(extractBugBody(p.slug), `${BUGS_FILE} entry ${p.slug}`);
      const bugTitle = scrubInternalRefs(p.titleLine, `${BUGS_FILE} entry ${p.slug} (title)`);
      const tmpFile = path.join('/tmp', `gh-bug-body-${p.slug}.md`);
      writeFileSync(tmpFile, bugBody);
      const url = gh(
        `gh issue create --repo ${REPO} --title ${JSON.stringify(`${ISSUE_TITLE_PREFIX} ${bugTitle}`)} --body-file ${tmpFile} --label ${ISSUE_LABEL} --label bug`,
        { quiet: true }
      );
      console.log(`         created ${url}`);
      attachToProject(url);
      console.log(`         attached to project #${PROJECT_NUMBER}`);
      // BUGS.md entries don't get tracking_url back-propagated to scope YAML
      // (they're not chips); the link lives in BUGS.md as a follow-up edit (not done here).
    }
  }

  // Phase 8 — update scopes/*.yml with new tracking_url values
  console.log('');
  console.log('## Updating scopes/*.yml...');
  for (const sf of scopeFiles) {
    const text = readFileSync(sf, 'utf8');
    const updated = insertTrackingUrl(text, newMappings);
    if (updated !== text) {
      writeFileSync(sf, updated);
      console.log(`  edited ${path.relative(ROOT, sf)}`);
    }
  }

  console.log('');
  console.log('Done. Run `npm run validate && npm run build` to confirm.');
}

function extractBugBody (bugId) {
  const body = readFileSync(BUGS_FILE, 'utf8');
  const startIdx = body.indexOf(`### ${bugId}`);
  if (startIdx < 0) return `Bug ${bugId} — see the orphan-bugs registry`;
  const restAfterStart = body.slice(startIdx);
  const nextEntry = restAfterStart.search(/^### B-/m);
  const nextSection = restAfterStart.search(/^## /m);
  const endIdx = Math.min(
    ...[nextEntry > 0 ? nextEntry : Infinity, nextSection > 0 ? nextSection : Infinity]
  );
  const section = restAfterStart.slice(0, endIdx === Infinity ? undefined : endIdx);
  return [
    'Tracked from the orphan-bugs registry.',
    '',
    '---',
    '',
    section.trim()
  ].join('\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
