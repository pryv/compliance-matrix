#!/usr/bin/env node
/**
 * build.js — compile scopes/*.yml into dist/compliance.sqlite.
 *
 * Tables (read-only artifact consumed by the WAB + tooling):
 *   scopes          (id, title, short, type, jurisdiction, version, version_date,
 *                    canonical_url, curated, layered_on_json, requirement_count)
 *   requirements    (scope_id, ref, title, text, text_url, coverage, notes,
 *                    draft, reviewed_by, reviewed_at, applies_to_versions)
 *   spec_links      (scope_id, ref, reqid)
 *   test_links      (scope_id, ref, test_code)
 *   doc_links       (scope_id, ref, path)
 *   qms_links       (scope_id, ref, path)
 *   config_links    (scope_id, ref, config_key)
 *   derives_links   (scope_id, ref, target_ref)
 *   excluded_items  (scope_id, ref, reason)
 *
 * Primary key on (scope_id, ref) for requirements.
 *
 * Run:  npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { glob } from 'glob';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(DIST, 'compliance.sqlite');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
if (fs.existsSync(OUT)) fs.unlinkSync(OUT);

const db = new Database(OUT);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE scopes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short TEXT,
    type TEXT NOT NULL,
    jurisdiction TEXT,
    version TEXT,
    version_date TEXT,
    canonical_url TEXT,
    curated INTEGER NOT NULL DEFAULT 0,
    layered_on_json TEXT NOT NULL DEFAULT '[]',
    requirement_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE requirements (
    scope_id TEXT NOT NULL,
    ref TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT,
    text_url TEXT,
    coverage TEXT NOT NULL,
    overview TEXT,
    detail TEXT,
    technical TEXT,
    draft INTEGER NOT NULL DEFAULT 1,
    reviewed_by TEXT,
    reviewed_at TEXT,
    applies_to_versions TEXT NOT NULL DEFAULT '*',
    PRIMARY KEY (scope_id, ref),
    FOREIGN KEY (scope_id) REFERENCES scopes(id)
  );
  CREATE INDEX idx_req_coverage ON requirements(coverage);
  CREATE INDEX idx_req_draft ON requirements(draft);

  CREATE TABLE spec_links     (scope_id TEXT, ref TEXT, reqid TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE test_links     (scope_id TEXT, ref TEXT, test_code TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE doc_links      (scope_id TEXT, ref TEXT, path TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE qms_links      (scope_id TEXT, ref TEXT, path TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE config_links   (scope_id TEXT, ref TEXT, config_key TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE derives_links  (scope_id TEXT, ref TEXT, target_ref TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE primitive_links (scope_id TEXT, ref TEXT, primitive TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));
  CREATE TABLE sample_links    (scope_id TEXT, ref TEXT, sample TEXT,
                               FOREIGN KEY (scope_id, ref) REFERENCES requirements(scope_id, ref));

  CREATE TABLE excluded_items (scope_id TEXT, ref TEXT, reason TEXT,
                               FOREIGN KEY (scope_id) REFERENCES scopes(id));

  CREATE TABLE meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const insScope = db.prepare(`INSERT INTO scopes
  (id, title, short, type, jurisdiction, version, version_date, canonical_url, curated, layered_on_json, requirement_count)
  VALUES (@id, @title, @short, @type, @jurisdiction, @version, @version_date, @canonical_url, @curated, @layered_on_json, @requirement_count)`);

const insReq = db.prepare(`INSERT INTO requirements
  (scope_id, ref, title, text, text_url, coverage, overview, detail, technical, draft, reviewed_by, reviewed_at, applies_to_versions)
  VALUES (@scope_id, @ref, @title, @text, @text_url, @coverage, @overview, @detail, @technical, @draft, @reviewed_by, @reviewed_at, @applies_to_versions)`);

const insSpec    = db.prepare('INSERT INTO spec_links    (scope_id, ref, reqid) VALUES (?, ?, ?)');
const insTest    = db.prepare('INSERT INTO test_links    (scope_id, ref, test_code) VALUES (?, ?, ?)');
const insDoc     = db.prepare('INSERT INTO doc_links     (scope_id, ref, path) VALUES (?, ?, ?)');
const insQms     = db.prepare('INSERT INTO qms_links     (scope_id, ref, path) VALUES (?, ?, ?)');
const insCfg     = db.prepare('INSERT INTO config_links  (scope_id, ref, config_key) VALUES (?, ?, ?)');
const insDerives = db.prepare('INSERT INTO derives_links (scope_id, ref, target_ref) VALUES (?, ?, ?)');
const insPrim    = db.prepare('INSERT INTO primitive_links (scope_id, ref, primitive) VALUES (?, ?, ?)');
const insSample  = db.prepare('INSERT INTO sample_links (scope_id, ref, sample) VALUES (?, ?, ?)');
const insExcl    = db.prepare('INSERT INTO excluded_items (scope_id, ref, reason) VALUES (?, ?, ?)');
const insMeta    = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)');

const scopeFiles = await glob(path.join(ROOT, 'scopes/*.yml'));

const tx = db.transaction(() => {
  for (const f of scopeFiles) {
    const scope = yaml.load(fs.readFileSync(f, 'utf8'));
    insScope.run({
      id: scope.id,
      title: scope.title,
      short: scope.short || null,
      type: scope.type,
      jurisdiction: scope.jurisdiction || null,
      version: scope.version || null,
      version_date: scope.version_date || null,
      canonical_url: scope.canonical_url || null,
      curated: scope.curated ? 1 : 0,
      layered_on_json: JSON.stringify(scope.layered_on || []),
      requirement_count: (scope.requirements || []).length
    });

    for (const r of scope.requirements || []) {
      insReq.run({
        scope_id: scope.id,
        ref: r.ref,
        title: r.title,
        text: r.text || null,
        text_url: r.text_url || null,
        coverage: r.coverage,
        overview: r.overview || null,
        detail: r.detail || null,
        technical: r.technical || null,
        draft: r.draft === false ? 0 : 1,
        reviewed_by: r.reviewed_by || null,
        reviewed_at: r.reviewed_at || null,
        applies_to_versions: r.applies_to_versions || '*'
      });
      for (const x of r.functional_specs || []) insSpec.run(scope.id, r.ref, x);
      for (const x of r.tests || []) insTest.run(scope.id, r.ref, x);
      for (const x of r.docs || []) insDoc.run(scope.id, r.ref, x);
      for (const x of r.qms_docs || []) insQms.run(scope.id, r.ref, x);
      for (const x of r.config_keys || []) insCfg.run(scope.id, r.ref, x);
      for (const x of r.derives_from || []) insDerives.run(scope.id, r.ref, x);
      for (const x of r.pryv_primitives || []) insPrim.run(scope.id, r.ref, x);
      for (const x of r.sample_apps || []) insSample.run(scope.id, r.ref, x);
    }

    for (const x of scope.excluded_items || []) {
      insExcl.run(scope.id, x.ref, x.reason);
    }
  }

  insMeta.run('built_at', new Date().toISOString());
  insMeta.run('scope_count', String(scopeFiles.length));
});

tx();

const stats = {
  scopes: db.prepare('SELECT COUNT(*) c FROM scopes').get().c,
  requirements: db.prepare('SELECT COUNT(*) c FROM requirements').get().c,
  test_links: db.prepare('SELECT COUNT(*) c FROM test_links').get().c,
  doc_links: db.prepare('SELECT COUNT(*) c FROM doc_links').get().c,
  drafts: db.prepare('SELECT COUNT(*) c FROM requirements WHERE draft=1').get().c
};

db.close();

console.log(`[OK]   built ${path.relative(ROOT, OUT)}`);
console.log(`[OK]   ${stats.scopes} scope(s), ${stats.requirements} requirement(s) (${stats.drafts} draft)`);
console.log(`[OK]   ${stats.test_links} test link(s), ${stats.doc_links} doc link(s)`);
