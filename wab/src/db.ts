import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

export type Coverage = 'implemented' | 'configurable' | 'facilitated' | 'documented' | 'out-of-scope';
export type EffortSaved = 'high' | 'medium' | 'low';
export type FacilitationMode = 'primitive' | 'evidence' | 'storage' | 'infrastructure' | 'awareness';
export type PlannedKind = 'bug' | 'feature' | 'enhancement';
export type PlannedImpact = 'high' | 'medium' | 'low';

export interface PlannedChange {
  kind: PlannedKind;
  summary: string;
  proposal: string;
  backlog: string | null;
  impact: PlannedImpact | null;
  tracking_url: string | null;
  eta_release: string | null;
}

export interface Scope {
  id: string;
  title: string;
  short: string | null;
  type: 'regulation' | 'standard' | 'hosting-cert';
  jurisdiction: string;
  version: string;
  version_date: string;
  canonical_url: string | null;
  curated: boolean;
  layered_on: string[];
  requirement_count: number;
}

export interface Requirement {
  scope_id: string;
  ref: string;
  title: string;
  text: string | null;
  text_url: string | null;
  coverage: Coverage;
  pryv_effort_saved: EffortSaved | null;
  facilitation_mode: FacilitationMode | null;
  overview: string | null;
  detail: string | null;
  technical: string | null;
  draft: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applies_to_versions: string;
  planned: PlannedChange[];
}

let sqlPromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

function loadSqlJs (): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => `${import.meta.env.BASE_URL}${file}`
    });
  }
  return sqlPromise;
}

export function loadDb (): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await loadSqlJs();
      const res = await fetch(`${import.meta.env.BASE_URL}compliance.sqlite`);
      if (!res.ok) throw new Error(`Failed to fetch compliance.sqlite: ${res.status}`);
      const buf = await res.arrayBuffer();
      return new SQL.Database(new Uint8Array(buf));
    })();
  }
  return dbPromise;
}

function rows<T> (db: Database, sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params as any);
  const out: T[] = [];
  while (stmt.step()) out.push(stmt.getAsObject() as unknown as T);
  stmt.free();
  return out;
}

export async function listScopes (): Promise<Scope[]> {
  const db = await loadDb();
  const raw = rows<any>(db, 'SELECT * FROM scopes ORDER BY type, id');
  return raw.map((r) => ({
    ...r,
    curated: !!r.curated,
    layered_on: JSON.parse(r.layered_on_json || '[]')
  }));
}

export async function getScope (id: string): Promise<Scope | null> {
  const all = await listScopes();
  return all.find((s) => s.id === id) ?? null;
}

export async function listRequirements (scopeId: string): Promise<Requirement[]> {
  const db = await loadDb();
  const raw = rows<any>(
    db,
    'SELECT * FROM requirements WHERE scope_id = ?',
    [scopeId]
  );
  const planned = rows<any>(
    db,
    'SELECT ref, kind, summary, proposal, backlog, impact, tracking_url, eta_release FROM planned_changes WHERE scope_id = ? ORDER BY ref, seq',
    [scopeId]
  );
  const plannedByRef = new Map<string, PlannedChange[]>();
  for (const p of planned) {
    const arr = plannedByRef.get(p.ref) || [];
    arr.push({
      kind: p.kind, summary: p.summary, proposal: p.proposal,
      backlog: p.backlog, impact: p.impact,
      tracking_url: p.tracking_url, eta_release: p.eta_release
    });
    plannedByRef.set(p.ref, arr);
  }
  return raw
    .map((r) => ({ ...r, draft: !!r.draft, planned: plannedByRef.get(r.ref) || [] }))
    .sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Returns a {scope_id: {planned: N, bugs: N}} map for surfacing planned-count
 * chips on the scope-list index page.
 */
export async function plannedCountsByScope (): Promise<Record<string, { planned: number; bugs: number }>> {
  const db = await loadDb();
  const raw = rows<{ scope_id: string; planned: number; bugs: number }>(
    db,
    `SELECT scope_id,
            COUNT(*) planned,
            SUM(CASE WHEN kind='bug' THEN 1 ELSE 0 END) bugs
     FROM planned_changes
     GROUP BY scope_id`
  );
  const out: Record<string, { planned: number; bugs: number }> = {};
  for (const r of raw) out[r.scope_id] = { planned: r.planned, bugs: r.bugs };
  return out;
}

export async function coverageHistogram (scopeId: string): Promise<Record<Coverage, number>> {
  const db = await loadDb();
  const raw = rows<{ coverage: Coverage; c: number }>(
    db,
    'SELECT coverage, COUNT(*) c FROM requirements WHERE scope_id = ? GROUP BY coverage',
    [scopeId]
  );
  const out: Record<Coverage, number> = {
    implemented: 0, configurable: 0, facilitated: 0, documented: 0, 'out-of-scope': 0
  };
  for (const r of raw) out[r.coverage] = r.c;
  return out;
}

export interface RequirementLinks {
  tests: string[];
  docs: string[];
  qms: string[];
  configs: string[];
  specs: string[];
  derives: string[];
}

export interface Primitive {
  id: string;
  summary: string;
  /** Total number of requirements citing this primitive across all scopes. */
  requirement_count: number;
  /** Per-scope citation counts (scope_id → count). */
  scope_counts: Record<string, number>;
}

export interface PrimitiveCoverageRow {
  scope_id: string;
  scope_short: string;
  ref: string;
  title: string;
  coverage: Coverage;
  facilitation_mode: FacilitationMode | null;
  pryv_effort_saved: EffortSaved | null;
  draft: boolean;
}

export async function listPrimitives (): Promise<Primitive[]> {
  const db = await loadDb();
  const meta = rows<{ id: string; summary: string }>(
    db,
    'SELECT id, summary FROM pryv_primitives ORDER BY id'
  );
  const linkRows = rows<{ primitive: string; scope_id: string; c: number }>(
    db,
    `SELECT primitive, scope_id, COUNT(*) c
     FROM primitive_links
     GROUP BY primitive, scope_id`
  );
  const totals = new Map<string, number>();
  const byScope = new Map<string, Record<string, number>>();
  for (const r of linkRows) {
    totals.set(r.primitive, (totals.get(r.primitive) ?? 0) + r.c);
    const m = byScope.get(r.primitive) ?? {};
    m[r.scope_id] = r.c;
    byScope.set(r.primitive, m);
  }
  return meta.map((p) => ({
    id: p.id,
    summary: p.summary,
    requirement_count: totals.get(p.id) ?? 0,
    scope_counts: byScope.get(p.id) ?? {}
  }));
}

export async function getPrimitive (id: string): Promise<Primitive | null> {
  const all = await listPrimitives();
  return all.find((p) => p.id === id) ?? null;
}

/**
 * Requirements that cite a given primitive, joined with scope info.
 * When `scopeIds` is non-empty, restricts to those scopes; otherwise returns
 * all citing requirements. Ordered by scope_id then ref (natural).
 */
export async function listPrimitiveCoverage (
  id: string,
  scopeIds: string[] = []
): Promise<PrimitiveCoverageRow[]> {
  const db = await loadDb();
  let sql = `
    SELECT r.scope_id, COALESCE(s.short, s.title) AS scope_short,
           r.ref, r.title, r.coverage, r.facilitation_mode,
           r.pryv_effort_saved, r.draft
    FROM primitive_links pl
    JOIN requirements r ON r.scope_id = pl.scope_id AND r.ref = pl.ref
    JOIN scopes s ON s.id = r.scope_id
    WHERE pl.primitive = ?
  `;
  const params: unknown[] = [id];
  if (scopeIds.length > 0) {
    sql += ` AND pl.scope_id IN (${scopeIds.map(() => '?').join(',')})`;
    params.push(...scopeIds);
  }
  sql += ' ORDER BY r.scope_id, r.ref';
  const raw = rows<any>(db, sql, params);
  return raw
    .map((r) => ({ ...r, draft: !!r.draft }))
    .sort((a, b) => {
      if (a.scope_id !== b.scope_id) return a.scope_id.localeCompare(b.scope_id);
      return a.ref.localeCompare(b.ref, undefined, { numeric: true, sensitivity: 'base' });
    });
}

export async function requirementLinks (scopeId: string, ref: string): Promise<RequirementLinks> {
  const db = await loadDb();
  const fetch1 = (table: string, col: string): string[] =>
    rows<{ v: string }>(db, `SELECT ${col} v FROM ${table} WHERE scope_id = ? AND ref = ?`, [scopeId, ref])
      .map((r) => r.v);
  return {
    tests:   fetch1('test_links', 'test_code'),
    docs:    fetch1('doc_links', 'path'),
    qms:     fetch1('qms_links', 'path'),
    configs: fetch1('config_links', 'config_key'),
    specs:   fetch1('spec_links', 'reqid'),
    derives: fetch1('derives_links', 'target_ref')
  };
}
