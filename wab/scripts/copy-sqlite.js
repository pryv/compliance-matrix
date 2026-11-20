#!/usr/bin/env node
/**
 * copy-sqlite.js, copy the built compliance.sqlite and the text exports
 * (dist/text/: llms.txt, regulations/*.md, compliance.json, ...) into
 * wab/public/ so Vite serves them as static assets.
 *
 * Runs as predev + prebuild hooks. If the SQLite isn't built yet, runs the
 * parent repo's build first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WAB_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(WAB_ROOT, '..');
const SRC = path.join(REPO_ROOT, 'dist/compliance.sqlite');
const DST_DIR = path.join(WAB_ROOT, 'public');
const DST = path.join(DST_DIR, 'compliance.sqlite');

if (!fs.existsSync(SRC)) {
  console.log('[copy-sqlite] dist/compliance.sqlite missing, building parent repo first…');
  execSync('npm run build', { cwd: REPO_ROOT, stdio: 'inherit' });
}

if (!fs.existsSync(DST_DIR)) fs.mkdirSync(DST_DIR, { recursive: true });
fs.copyFileSync(SRC, DST);
const size = fs.statSync(DST).size;
console.log(`[copy-sqlite] ${path.relative(WAB_ROOT, DST)} (${(size / 1024).toFixed(1)} KB)`);

// Text and JSON exports for agents (llms.txt, regulations/*.md, ...), served next to the app.
const TEXT_SRC = path.join(REPO_ROOT, 'dist/text');
if (!fs.existsSync(TEXT_SRC)) {
  execSync('npm run export:text', { cwd: REPO_ROOT, stdio: 'inherit' });
}
for (const entry of fs.readdirSync(TEXT_SRC)) {
  const dst = path.join(DST_DIR, entry);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(path.join(TEXT_SRC, entry), dst, { recursive: true });
}
console.log(`[copy-sqlite] text exports: ${fs.readdirSync(TEXT_SRC).join(', ')}`);

for (const wname of ['sql-wasm.wasm', 'sql-wasm-browser.wasm']) {
  const wsrc = path.join(WAB_ROOT, 'node_modules/sql.js/dist', wname);
  const wdst = path.join(DST_DIR, wname);
  if (fs.existsSync(wsrc)) {
    fs.copyFileSync(wsrc, wdst);
    const wsize = fs.statSync(wdst).size;
    console.log(`[copy-sqlite] ${path.relative(WAB_ROOT, wdst)} (${(wsize / 1024).toFixed(1)} KB)`);
  }
}
