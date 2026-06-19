#!/usr/bin/env node
/**
 * copy-qms-template.js — bundle qms/implementer-template/**.md into
 * wab/public/qms-template.json ({ "<relative-path>": "<content>" }) so the
 * in-browser generator can ship the filled QMS without a backend.
 *
 * Runs as predev + prebuild hook (alongside copy-sqlite.js).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WAB_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(WAB_ROOT, '..');
const SRC_DIR = path.join(REPO_ROOT, 'qms/implementer-template');
const DST_DIR = path.join(WAB_ROOT, 'public');
const DST = path.join(DST_DIR, 'qms-template.json');

function walk (dir, base = dir) {
  const out = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) Object.assign(out, walk(full, base));
    else if (entry.name.endsWith('.md')) {
      out[path.relative(base, full)] = fs.readFileSync(full, 'utf8');
    }
  }
  return out;
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`[copy-qms-template] source not found: ${SRC_DIR}`);
  process.exit(1);
}
if (!fs.existsSync(DST_DIR)) fs.mkdirSync(DST_DIR, { recursive: true });

const bundle = walk(SRC_DIR);
fs.writeFileSync(DST, JSON.stringify(bundle));
console.log(`[copy-qms-template] ${path.relative(WAB_ROOT, DST)} (${Object.keys(bundle).length} files)`);
