#!/usr/bin/env node
/**
 * retention.js, enforce data-retention rules against a Pryv deployment.
 *
 * Operator-owned recipe: Pryv ships the primitives (events.get?toTime=cutoff,
 * two-stage events.delete), the scheduler + rules live here.
 *
 *   node src/retention.js --rules retention.yml            # dry-run
 *   node src/retention.js --rules retention.yml --apply     # enforce
 *
 * Credentials via env:
 *   PRYV_API_ENDPOINT  e.g. https://<token>@<username>.pryv.me
 *
 * Account-level deletion (auth.delete) is intentionally NOT performed here,
 * wire it to your admin-key flow only after a reviewed inactivity oracle.
 */
import fs from 'node:fs';
import yaml from 'js-yaml';
import Pryv from 'pryv';

function parseArgs (argv) {
  const o = { rules: 'retention.yml', apply: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--rules') o.rules = argv[++i];
    else if (argv[i] === '--apply') o.apply = true;
    else if (argv[i] === '--help' || argv[i] === '-h') o.help = true;
  }
  return o;
}

const UNIT_SECONDS = { d: 86400, w: 604800, m: 2592000, y: 31536000 };

function maxAgeToCutoff (maxAge, nowSec) {
  const m = /^(\d+)([dwmy])$/.exec(String(maxAge).trim());
  if (!m) throw new Error(`invalid max_age '${maxAge}' (expected e.g. 90d, 2y)`);
  return nowSec - Number(m[1]) * UNIT_SECONDS[m[2]];
}

async function main () {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('node src/retention.js --rules <file.yml> [--apply]');
    process.exit(0);
  }
  const endpoint = process.env.PRYV_API_ENDPOINT;
  if (!endpoint) {
    console.error('PRYV_API_ENDPOINT is required.');
    process.exit(1);
  }
  const { rules } = yaml.load(fs.readFileSync(args.rules, 'utf8'));
  if (!Array.isArray(rules) || !rules.length) {
    console.error(`no rules in ${args.rules}`);
    process.exit(1);
  }

  const conn = new Pryv.Connection(endpoint);
  const nowSec = Math.floor(Date.now() / 1000);
  console.log(`[retention] ${args.apply ? 'APPLY' : 'DRY-RUN'} · ${rules.length} rule(s) · cutoff anchored at ${new Date(nowSec * 1000).toISOString()}`);
  console.log('[retention] note: legal-hold opt-out NOT implemented; no atomic rollback; HFS series need a separate call.');

  const summary = [];
  for (const rule of rules) {
    const started = Date.now();
    const result = { id: rule.id, matched: 0, trashed: 0, deleted: 0, errors: 0 };
    try {
      const toTime = maxAgeToCutoff(rule.max_age, nowSec);
      const res = await conn.api([{
        method: 'events.get',
        params: { streams: rule.streams, toTime, limit: 10000, state: 'all' }
      }]);
      if (res[0]?.error) throw new Error(res[0].error.message);
      const events = res[0].events || [];
      result.matched = events.length;

      for (const ev of events) {
        if (!args.apply) continue;
        // First delete: trashes; second delete on an already-trashed event: hard-deletes.
        const passes = rule.action === 'delete' ? 2 : 1;
        let ok = true;
        for (let p = 0; p < passes; p++) {
          const d = await conn.api([{ method: 'events.delete', params: { id: ev.id } }]);
          if (d[0]?.error) { ok = false; result.errors++; break; }
        }
        if (ok) { if (rule.action === 'delete') result.deleted++; else result.trashed++; }
      }
    } catch (e) {
      result.errors++;
      result.error = e.message;
    }
    result.elapsedMs = Date.now() - started;
    summary.push(result);
    console.log(`[retention] ${rule.id}: matched=${result.matched} trashed=${result.trashed} deleted=${result.deleted} errors=${result.errors} (${result.elapsedMs}ms)${result.error ? ' · ' + result.error : ''}`);
  }

  const totalErrors = summary.reduce((n, r) => n + r.errors, 0);
  console.log(`[retention] done. ${summary.reduce((n, r) => n + r.deleted + r.trashed, 0)} affected, ${totalErrors} error(s).`);
  process.exit(totalErrors ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
