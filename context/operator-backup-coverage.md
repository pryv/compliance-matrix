# Operator backup vs subject DSAR backup: symmetry audit

**Status:** implementer reference + audit of the two backup paths Pryv ships, the operator-side `bin/backup.js` (server-side, raw-row disaster-recovery snapshot) and the subject-facing `@pryv/account-backup` (public-API DSAR / portability tool, currently v0.5.0). Companion to `account-backup-coverage.md`, which covers the subject side per-data-type. Last updated 2026-06-13 against `@pryv/account-backup` v0.5.0; operator-side series coverage re-checked against open-pryv.io 2.0.0-rc.34 (2026-10-03).

---

## TL;DR

Pryv has shipped **three** backup tools with non-overlapping audiences. Two are current (operator + subject CLI); the third (a self-serve Web UI on top of the subject CLI) was operated historically and is currently dormant. An auditor evaluating Art.15 / Art.20 / §1798.110 / Principle 4.9 / nLPD Art.25 coverage should know all three exist and which one satisfies the article in question.

| | Operator backup (`open-pryv.io/bin/backup.js`) | Subject backup (`@pryv/account-backup`) |
|---|---|---|
| Audience | system operator | data subject (or implementer on behalf of subject) |
| Surface | server-side; runs inside the core process | end-user CLI; runs against the public API |
| Auth | direct storage access (no token); restricted by OS-level filesystem perms + admin process | personal token (`Service.login` with username + password + appId) |
| Output | raw storage rows (incl. internal IDs, integrity hashes), disaster-recovery snapshot | per-resource JSON files + sha256 manifest, subject-portable disclosure packet |
| Scope per user | streams, accesses, profile, webhooks, events, attachments, accountData, audit, HFS series | account, streams, accesses (+ revoked/expired), profile, audit-logs, events (chunked by month), per-app profile, HFS series per-event, per-access webhooks, integrity manifest |
| Restore semantics | full re-import via engine-level write paths (PG `INSERT`, SQLite `INSERT`) | re-create via standard public API (`events.create`, `streams.create`, `addPointsToHFEvent`); audit / webhooks / accesses deliberately NOT replayed (system-generated or token-bearing) |
| Compliance role | disaster recovery, migration, regulator-mandated record retention | GDPR Art.15 (access) / Art.20 (portability) / CCPA §1798.110 / PIPEDA Principle 4.9 / Swiss nLPD Art.25 |

## Third tier: operator-hosted subject Web UI (`pryv-account-backup-webapp`)

`pryv-account-backup-webapp` is the current sample web UI for subject-facing backups. Operator hosts the static bundle on their own domain; subjects log in via a web form, click **Start backup**, download a series of ZIP files. The webapp consumes the browser-isomorphic resource fetchers from `pryv-account-backup` v0.7.0+ (`api-resources`, `events-chunked`, `audit-as-events`, `accesses-history`, `attachments`, `hf-data`, `webhooks-export`), no server-side runtime, deploy via `npm run build && copy dist/ to your web server's docroot`.

| | `pryv-account-backup-webapp` (Web UI tier, v0.2.0 against library v0.7.0+) |
|---|---|
| Audience | end user (the subject), no Node / CLI knowledge required |
| Surface | static site bundled by esbuild; vanilla JS + vanilla CSS; ~350 LOC of orchestrator + UI; no backend |
| Auth | subject's Pryv credentials submitted via the web form (operator's TLS); direct `Service.login` (no MFA handling, webapp directs MFA-enabled subjects at the CLI) |
| Distribution | git-clone + `npm install && npm run build`; deploy `dist/` behind operator's HTTPS |
| Compliance role | same as the CLI tier, GDPR Art.15 / Art.20 / §1798.110 / PIPEDA Principle 4.9 / Swiss nLPD Art.25, with significantly lower subject-side friction (no clone / install / CLI run) |
| Coverage caveat | webapp omits **only** `manifest.json` (per-file sha256 tamper-evidence, auditor-facing, CLI-only by design). All read-side resources (attachments / HFS series / webhooks / events / audit / accesses + history / profile) are covered with feature parity from v0.7.0 / webapp v0.2.0. The webapp also produces a portable `sync-state.json` inside the final ZIP, the subject re-uploads it on the next visit for cross-browser / cross-device incremental |

**Why it matters for the symmetry audit:**

- This is the **most ergonomic** path for an actual DSAR, a subject who can't be expected to install Node or run a CLI can still self-serve.
- It is **operator-hosted**, so it moves the "who runs the export" responsibility back to the operator while keeping the output bundle subject-portable.
- It consumes the **same library code** the CLI consumes (browser-isomorphic resource fetchers from v0.7.0), no drift category between flavors. The seven core fetchers all expose the same `(connection, writer, stateStore-or-array, options, cb, log)` shape; the orchestrator drives both flavors uniformly.

**Operational guidance for implementers:**

- If you need a self-serve DSAR for a non-technical subject population, the webapp repo is a production-ready scaffold, fork, rebrand CSS custom properties, redeploy.
- `profile_private.json` carries the subject's MFA enrolment (method, `content` such as the SMS phone number, TOTP parameters) but no usable MFA secret: since open-pryv.io 2.0.0-rc.27 (`7ce9ea6f`) the private-profile read leaves out the encrypted TOTP secret, the replay step and the recovery-code hashes. Treat the downloaded ZIPs as confidential personal data (secure transport, documented destruction); they are not MFA-bypass material and no recovery-code rotation is needed after disclosure.
- Subjects who need third-party-auditor tamper-evidence (e.g. handing the bundle to an external compliance auditor) should still use the CLI flavor, only the CLI emits the per-file sha256 `manifest.json`.

### Historical tier (archived 2026-06-15): `pryv/example-service-bluebutton`

Operator-hosted Express service that wrapped `@pryv/account-backup` 1.0.x behind a Web UI. Last substantive release v1.2.0 on 2022-10-11. The public Pryv-operated instance at `https://bluebutton.pryv.me/` was dormant by 2026-06; the repo was archived on 2026-06-15 as part of the v0.6.0 ship and replaced by `pryv-account-backup-webapp`. Listed here for historical context, operators with existing bluebutton deployments should plan a migration to the new webapp.

## Per-resource symmetry (v2 deployments; subject backup at v0.7.0)

| Resource | Operator `bin/backup.js` | Subject `@pryv/account-backup` v0.7.0 (CLI + webapp) | Notes |
|---|---|---|---|
| streams | ✅ raw rows (`storageLayer.streams.exportAll`) | ✅ `/streams[?state=all]` | symmetric coverage; subject sees wire shape, operator sees row shape |
| accesses (current) | ✅ raw rows | ✅ `/accesses` → `accesses.json` | wire format on subject side carries `clientData.cmc` for CMC counterparties (see CMC row) |
| accesses (deletions + expired) | ✅ raw rows (`exportAll` includes soft-deleted) | ✅ **0.5.0+** `/accesses?includeDeletions=true&includeExpired=true` → `accesses-all.json` | adds `accessDeletions[]` array |
| accesses (per-access history) | ✅ raw history rows | ✅ **0.5.0+** opt-in: `accesses-history/<accessId>.json` per access, fetched via `GET /accesses/<id>?includeHistory=true`. CLI prompts; off by default (O(N) calls) | symmetric coverage when the operator opts in |
| profile (private + public + per-app) | ✅ raw rows | ✅ `/profile/private` + `/profile/public` + per-app `/profile/app` | symmetric |
| webhooks | ✅ raw rows (no token replay risk on operator side) | ✅ **CLI + webapp** (v0.7.0+): per-access `/webhooks` aggregated to `webhooks.json` keyed by `accessId` | symmetric, both flavors; expired (401/403) tokens skipped silently and non-fatally |
| events | ✅ raw rows from events table (cross-user filter by `user_id`), streamed a batch at a time (`events.exportAllStreamed`, falling back to `exportAll` on an engine that does not offer it) | ✅ **0.5.0+** chunked monthly: `events-YYYY-MM.json` (one file per UTC month in the discovered range; probed via `limit=1` ascending + descending) | subject side avoids single-shot timeout at production scale |
| attachments | ✅ binary stream from `eventFiles.getAttachmentStream(userId, eventId, fileId)` | ✅ **CLI + webapp** (v0.7.0+): opt-in binary stream from `GET /events/<id>/<attId>?readToken=…` piped chunk-by-chunk through the `StorageWriter` | symmetric, both flavors |
| audit | ✅ per-user audit store (`auditStorage.forUser(userId).exportAllEventsStreamed()`, falling back to `exportAllEvents()`) | ✅ `GET /audit/logs?fromTime=…&toTime=…` → `audit_logs.json` | same data; audit-store is also exposed as streams under the `:_audit:` store prefix (e.g., `:_audit:access-<accessId>`), both backups capture it via different paths |
| HFS series data points | ✅ **since open-pryv.io 2.0.0-rc.34**: per-user series namespace (`seriesConnection.exportDatabase(seriesNamespace(username))`, helper in `components/business/src/series/namespace.ts`), restorable into any series engine. ❌ Backups taken with earlier releases carry **no** series data on any engine (backup and restore addressed the series under a different key than the one they are stored under, with no warning), and InfluxDB series backups could not be restored: take a new backup after upgrading | ✅ **CLI + webapp** (v0.7.0+): per-event `GET /events/<id>/series` → `hf-data/<eventId>.json` | symmetric, both flavors, for operator backups taken on 2.0.0-rc.34 or later; tested by `[BKSR]` |
| account / system-streams account-tree | ✅ raw rows from user-account storage | ✅ `/account` (the standard system-streams account tree) | symmetric for visible system streams |
| MFA enrolment metadata | ✅ raw private-profile row (`profile.exportAll`), so the full stored `mfa` record: method, `content`, the TOTP secret (AES-256-GCM envelope under the operator's TOTP key), the replay step, the recovery codes (SHA-256 digests for every code generated since open-pryv.io `ef66853e`; codes generated earlier keep their original stored form until the user regenerates them) and the `mfaThrottle` failed-attempt tally; a restore therefore brings MFA back working | ✅ `profile_private.json` carries the read view of `profile.mfa`: `{ method, content, totp: { confirmedAt, algorithm, digits, periodSeconds } }` (open-pryv.io `7ce9ea6f`, 2.0.0-rc.27) | **asymmetric by design**: the subject gets their own MFA enrolment (method, phone number and template values for SMS, TOTP parameters) but no usable MFA secret; the operator backup keeps the server-side state needed to restore. **Operator security note:** the subject bundle is confidential personal data (secure transport, documented destruction) but not MFA-bypass material. The operator backup holds the encrypted TOTP secrets, so keep the TOTP key (`services.mfa.methods.totp.secretsKey`, or the `auth.adminAccessKey` it is otherwise derived from) stored apart from the backups |
| CMC counterparty metadata | ✅ via `clientData.cmc.counterparty` + `clientData.cmc.apiEndpoint` on each shared access row | ✅ via `clientData.cmc.counterparty` + `clientData.cmc.apiEndpoint` on each shared access (passed through `composeWireAccess`) | **no gap**, federation counterparty `{username, host}` and back-channel `apiEndpoint` round-trip in both tools. Jurisdiction-per-host inference is the implementer's responsibility, no host-to-country registry in the API |
| Integrity manifest | ⚠️ no per-file hash. `manifest.json` records the format version, `coreVersion`, backup type and timestamps, and per-user item counts per collection (streams, accesses, profile, webhooks, events, audit, series, attachments). Corruption is caught on read by the gzip CRC-32 of each compressed file (compression on by default, `--no-compress` turns it off) and, for an encrypted backup, by the AES-256-GCM tag of every chunk, which also detects tampering. Event records keep each attachment's `integrity` digest (`integrity.isActive.attachments`, on by default), but restore does not re-check attachments against it | ✅ `manifest.json` (sha256 per file, tool version, ISO timestamp, `manifest.verify(rootDir, cb)`) | **asymmetric**, the operator backup offers no portable per-file proof (use an encrypted backup for tamper detection, or hash the output yourself); the subject backup needs portable proof for a third-party auditor |

## Article coverage by tool

| Article / clause | Satisfied by | Notes |
|---|---|---|
| GDPR Art.15(1)(a), purposes of processing | Subject backup (`accesses-all.json` 0.5.0+ for consent-state-at-time-of-access provenance) | revoked + expired tokens carry the historical "what permission did this app have, when" view |
| GDPR Art.15(1)(c), recipients of data | Subject backup (`audit_logs.json` + `accesses-all.json` + `webhooks.json`) | audit log carries actual disclosures; accesses-all carries the recipient-token universe; webhooks carry outbound delivery configuration |
| GDPR Art.15(1)(f), third-country transfers | Subject backup (`clientData.cmc.counterparty.host` on each shared access; implementer infers jurisdiction from host) | no built-in jurisdiction-per-host registry, operator policy concern |
| GDPR Art.20, portability | Subject backup (read side complete; restore side experimental, audit/webhooks/accesses deliberately not replayed; HFS + multi-attachment round-trip work 0.4.0+) | operator backup not a portability tool; rows aren't subject-shape |
| GDPR Art.30, records of processing | Operator backup (raw row history for the operator's own Art.30 register) | not a subject-disclosure tool |
| CCPA §1798.110, right to know | Subject backup | same as Art.15 |
| CCPA §1798.115, right to know about sale/sharing | Subject backup (`accesses-all.json` includes shared-access history) | |
| PIPEDA Principle 4.9, access | Subject backup | |
| Swiss nLPD Art.25, right to information | Subject backup | |
| HIPAA-privacy §164.524, access to PHI | Subject backup | |
| Disaster recovery / regulator-mandated retention | Operator backup | restore-into-fresh-engine; cross-cluster migration |

## Where the asymmetries are intentional

- **Integrity manifest**: `bin/backup.js` reads through the storage layer (it does not use `pg_dump` or copy SQLite files) and writes no per-file hash: its manifest carries per-user item counts, gzip's CRC-32 catches accidental corruption of compressed files, and an encrypted backup's per-chunk AES-256-GCM tags also catch tampering. The subject backup emits per-file sha256 because the subject's auditor needs portable proof.
- **Restore-side gaps on subject backup**: audit logs, webhooks, and accesses are explicitly excluded from restore in 0.5.0. Reason: audit is system-generated (injecting it would produce false audit history); webhooks are keyed by `accessId` which changes on a fresh destination; access tokens are server-minted and not replayable. Subject backup IS the historical record for these.
- **Wire shape vs row shape**: operator backup writes raw storage rows including internal serial columns (`createdBySerial`, `modifiedBySerial`, `headId`); subject backup uses `composeWireAccess`-equivalent shapes so the subject sees the same field names as the API documentation.

## Where the asymmetries are unintentional (known gaps)

None known after 0.5.0, per-access version history shipped behind an opt-in CLI flag; MFA enrolment metadata is covered (re-verified for open-pryv.io 2.0.0-rc.27: `profile.get` returns the enrolment without its secrets, see the MFA row above; the MFA asymmetry between the two backups is deliberate, not a gap).

**Operator-side scale (addressed 2026-09-17).** The subject-side tool has chunked its events
fetch since 0.5.0 specifically to survive production-scale accounts, while the operator tool
held each collection in memory in full. That was a practicability limit rather than a coverage
gap, but it pointed the same way: a right of access that the operator's own tool cannot run to
completion on a large account is not usefully fulfillable. Events and audit now stream through
the export a batch at a time on both engines, so operator-backup memory is bounded by the
writer's chunk size rather than by the size of the account. Measured on 200 000 audit rows:
peak RSS 603 MB streamed versus 786 MB buffered on SQLite, 505 MB versus 778 MB on PostgreSQL,
with byte-identical output. No coverage, format, or restore semantics changed.

The only items deliberately left out are the restore-side gaps documented in the intentional-asymmetries section (audit/webhooks/accesses can't be replayed safely).

## Reading order for an auditor

1. **Start with this note** to understand which tool to ask the operator to run for a given right-of-access / portability request.
2. **`account-backup-coverage.md`** for the subject-side per-data-type checklist + the if-you-must-answer-a-DSAR-before-the-backlog-ships fallback procedure.
3. **`proposals/account-backup-dsar-completeness.md`** for the shipped-vs-queued evidence trail.

## Related primitives

- `proposals/account-backup-dsar-completeness.md`: Status: SHIPPED through v0.5.0.
- `proposals/audit-on-user-delete.md`: audit-retention modes intersect with audit-in-DSAR (`keep` mode means more rows to export; `pseudonymise` mode means the exported audit carries alias not identifier).
- `docs/pryv-primitives.md`: audit entry confirms audit-in-DSAR is data-minimal by construction.
