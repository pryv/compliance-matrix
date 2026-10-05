# Compliance-matrix update triggers

When work on Pryv-the-software ships, bug fix, feature, refactor, it
may change what the matrix should claim. This file is the **reverse
index** of the matrix's `planned:` chips + a list of broader trigger
categories. Engineers + agents check this file **after merging** a PR
on any Pryv repo and update the matrix accordingly.

## How to use this file

1. After merging your PR (or before, during PR review), grep this file
   for your backlog slug, your touched file paths, or your feature
   name.
2. If your work appears, follow the linked row + file references and
   update the matrix to reflect the now-shipped reality (typically:
   remove the `planned:` chip; promote the row's coverage / effort /
   facilitation_mode; add a `tests:` entry citing your new
   `[CODE]` test markers; extend `pryv_primitives` if a new primitive
   landed).
3. If your work isn't listed but you suspect it impacts the matrix
   (you touched primitives, schema, ACL, audit, etc.), **add it
   here first** with the affected scope+ref pairs, then update those
   rows.
4. Commit the matrix-side update alongside (or immediately after) your
   PR. Keep them in lockstep so the matrix's `Implemented | High`
   claims always match shipped open-pryv.io master.

This file is **not** auto-generated yet, entries are added by hand
when filing a backlog item. A future small dev could generate the
"planned backlog → rows" section directly from
`dist/compliance.sqlite`'s `planned_changes` table.

## Section A: Backlog items with `planned:` chips in the matrix

When the listed backlog ships on **open-pryv.io** (or whichever
sub-repo holds the work), update the listed matrix rows + remove the
corresponding `planned:` entries. The full proposal mirror under
`compliance-matrix/proposals/<slug>.md` documents the post-ship row
shape ("After shipping" column in each proposal's table).

The mapping below mirrors `dist/compliance.sqlite`
`planned_changes` table, regenerate with:

```
sqlite3 compliance-matrix/dist/compliance.sqlite \
  "SELECT backlog, scope_id, ref, kind, impact, summary FROM planned_changes ORDER BY backlog, scope_id, ref;"
```

### `ACCOUNT-BACKUP-DSAR-COMPLETENESS` (SHIPPED 2026-05-27 + 2026-06-13 + 2026-06-15 + 2026-06-15: all chips discharged)

**Where the work lived**: `pryv-account-backup` repo + new `pryv-account-backup-webapp` repo. Initial DSAR-completeness work shipped in v0.4.0 (commits `1a05482` v0.3.0 + `30b1661` C.4 partial + `ea6ae6a` v0.4.0), 5 bug chips (Art.15 / 1798.110 / 164.524 / Principle.4.9 / Art.25) + 1 feature chip (Art.20 restore) discharged. The chunked-events follow-up shipped in v0.5.0 (commits `d1eaf48` + merge `e59d5b3`, 2026-06-13), last remaining feature chip on `gdpr.Art.15` discharged. v0.5.0 also bundled `accesses-all.json` (deletions + expired) + opt-in per-access version history. The library + browser-isomorphic rewrite + audit-as-events forward-compatibility shipped in v0.6.0 (foundation `6cfc7fc` / merge `3e10cb1` / PR #15; isomorphism `e957ce2` / PR #16; AGENTS.md `df785b0` / PR #17; webapp `e57aeec9` + `81dccc4`; dev-site PR #184), 2026-06-15. The attachments / HFS / webhooks browser-isomorphic refresh + portable `sync-state.json` shipped in v0.7.0 (CLI library) + webapp v0.2.0, 2026-06-15, closes the v0.6.0 webapp coverage gap; both flavors now cover every read-side resource. No new chips chipped, this is coverage symmetry on top of v0.6.0's already-discharged work.

Proposal: `proposals/account-backup-dsar-completeness.md` (kept; the file's Status: SHIPPED header now references the v0.4.0 + v0.5.0 + v0.6.0 + v0.7.0 chain).

**Why v0.6.0 matters even though no chips were chipped:** the dedicated `/audit/logs` route was **removed** from open-pryv.io on 2026-06-15 (commit `19d1c11f` on master). v0.5.0 and earlier call it directly and now produce empty `audit_logs.json` files (or 404 errors) against any deployment running that build. v0.6.0 fetches audit via the standard events API on `:_audit:*` streams, supports `modifiedSince` AND continues to work post-removal. **Sub-repos that produce DSAR bundles MUST pin their subject-side backup tooling to v0.6.0+; v0.5.0 and earlier are now production-broken for the audit-log section of the bundle.**

**Why v0.7.0 matters:** the webapp tier (`pryv-account-backup-webapp` v0.2.0) is now coverage-symmetric with the CLI on every read-side resource (attachments / HFS series / webhooks / accesses-history). The only CLI-only artefact is `manifest.json` (per-file sha256, auditor-facing). The portable `sync-state.json` also lands inside the final ZIP, subject keeps it alongside the backup and re-uploads on the next visit for cross-browser / cross-device incremental.

### `ACCOUNT-BACKUP-CHUNKED-EVENTS-FETCH`: SHIPPED 2026-06-13

**Where the work lived**: `pryv-account-backup` v0.5.0 (merge SHA `e59d5b3`; feature commit `d1eaf48`). Events fetch now chunks by UTC month, one `events-YYYY-MM.json` per month in the subject's discovered event-time range. Two `limit=1` probes (ascending floor + descending ceiling) bound the window; restore concatenates legacy `events.json` + new chunked files in sorted order.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.15 | feature | low | **discharged** |

Proposal: `proposals/account-backup-dsar-completeness.md` (shared with the v0.4.0 work; Status header updated to reflect the v0.5.0 ship).

### `ALIASES`

**Where the work lives**: `open-pryv.io` (new `auth.randomAlias`
primitive). Aliases as Pryv-native pseudonymisation.

**Status (2026-06-30)**: SHIPPED in `open-pryv.io` `4054c67a` (`accesses.create
{randomAlias:true}` + `account.changeUsername`; tested on PostgreSQL + SQLite,
`[AL01]`-`[AL05]` in `components/api-server/test/accesses-alias.test.js`).

**Rows walked, entry discharged (verified 2026-07-28).** All six rows cite the
shipped primitive; `randomAlias` is in the primitive catalogue (`docs/pryv-primitives.md`)
and carried in each row's `pryv_primitives`. No `planned:` chips were ever queued for
this slug, so none needed discharging.

| Scope | Ref | Walked | Where the shipped primitive is cited |
|---|---|---|---|
| gdpr | Art.4 | ✅ | pseudonymisation term maps to `accesses.create {randomAlias:true}` |
| gdpr | Art.32 | ✅ | primitive named as shipped in the §1(a) narrative |
| hipaa-privacy | 164.514(c) | ✅ | alias cited as the re-identification-code mechanism |
| iso-27001 | A.8.11 | ✅ | named as what Pryv does natively for masking-by-projection |
| iso-27701 | A.7.4.5 | ✅ | stale "planned / backlog `ALIASES`" prose corrected 2026-07-28 |
| ccpa | 1798.140(ae) | ✅ | deployment-pattern recommendation cites the alias |

Proposal: `proposals/aliases-as-pseudonymization-primitive.md`

### `AUDIT-LOG-CHAINING`

**Where the work lives**: `open-pryv.io` (new chained / signed
audit-log primitive). Per-row `prev_hash` + periodic signed
checkpoints. Precondition: per-core monotonic time (see
`CLOCK-SKEW-CLUSTER-CHECKS`).

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.30 | feature | low | tamper-evident Article 30 register |
| hipaa-security | 164.312(b) | feature | low | cite chain primitive |
| hipaa-security | 164.312(c)(1) | feature | medium | row could shift F:Primitive Med → F:Primitive High |
| hipaa-security | 164.312(c)(2) | feature | medium | row moves F:Evidence Low → F:Evidence Med |
| iso-27001 | A.8.15 | feature | low | cite chain |
| iso-27001 | A.5.24 | feature | medium | F:Evidence Med → F:Evidence High |
| hipaa-breach | 164.414 | feature | medium | F:Evidence Med → F:Evidence High |
| pipeda | s.10.1 | feature | low | strengthen RROSH evidence narrative |

Proposal: `proposals/audit-log-chaining.md`

### `CONTAINER-ENCRYPTED-VOLUME`: SHIPPED 2026-06-23

**Where the work lives**: new `pryv/container-encrypted-volume` repo (v0.1.0), a
companion layered onto the stock open-pryv.io image, NOT in open-pryv.io core.
Modular encryption-at-rest for the full user-data surface (events / attachments /
series / audit / platform DB): pluggable LUKS/gocryptfs backend + env/file/exec/
clevis/aws-kms key providers, opt-in via `CEV_ENABLED`.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| hipaa-security | 164.312(a)(2)(iv) | primitive | high | added `encryption-at-rest-user-data`; effort medium→high; user-data at rest now switch-on Pryv software (was operator-implements). Coverage stays `configurable` (a step above `facilitated`). |
| gdpr | Art.32 | primitive | medium | added `encryption-at-rest-user-data` to the composite measure; coverage unchanged (`facilitated`). |

No pre-existing `planned:` chips to discharge: this is a new shipped primitive.
Proposal: `proposals/container-encrypted-volume.md` (Status: shipped).

### `CLOCK-SKEW-CLUSTER-CHECKS`

**Where the work lives**: `open-pryv.io`
(`components/business/src/bootstrap/applyBundle.ts` +
`components/business/src/acme/`). Two small intra-core checkpoints:
bootstrap-join skew check + pre-cert-load validity check.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.8.17 | feature | medium | row moves Out-of-scope → F:Awareness | Low |

Proposal: `proposals/clock-skew-cluster-checks.md`

### `CONTENT-INDEXING` (SHIPPED 2026-06-11: no chips were queued)

**Where the work lived**: `open-pryv.io` (`1295c0b` on master, deployed)
+ `lib-js` (`pryv` 3.6.0 on npm) + `pryv-datastore` v1.1.0
(`DataStore.supports`). `events.get` gained `content` / `clientData`
JSON-condition parameters (strict-type semantics, both engines);
new platform-wide `storages.contentIndexes` config key (PostgreSQL
partial-index acceleration; queryability itself is always on);
`features.contentQueries` capability flag in service-info; store
capability discovery via `pryv-datastore:supports` clientData.
Test markers: `[CQRY]` `[CQAC]` `[CQIX]` `[CQSA]` `[CQ11]` `[CQLJ]`.

**Trigger pass outcome (B.1 walk)**: no tier shifts, the DSAR /
portability / erasure row families cite `events.get` generically and
their claims are unchanged by the new filter parameters. The one
matrix-relevant consequence is **audit semantics**: content-query
search values sent over HTTP GET are recorded as-is in the audit
row's URL query (deliberate, the query is the auditable action).
Encoded in `context/content-query-audit-semantics.md` + caveats added
to `gdpr.Art.28` (data-flow layers) / `gdpr.Art.30` (technical) /
`hipaa-security.164.312(b)` / `iso-27001.A.8.15` /
`docs/pryv-primitives.md` audit entry /
`context/privacy-by-design-and-default.md` /
`context/subprocessor-posture-and-data-flow.md`.
`proposals/e2e-encryption.md` upstream pointer refreshed (content
queries are the paired search-under-encryption concern).

### `E2E-ENCRYPTION`

**Where the work lives**: `open-pryv.io` (research direction, proxy
re-encryption; pryv/service-core#516). End-to-end encryption: server
itself never holds plaintext.

**Partial step 2026-07-23:** client-side encryption toolkit shipped to
lib-js `feature/encryption` (`@pryv/encryption`: aes-256-gcm +
asymmetric ecies-aes-256-gcm + encrypted attachments + legacy reader;
formats specified in data-types), pending merge. Application-layer,
client-managed keys, row coverage unchanged; see the proposal's
status note.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| hipaa-security | 164.312(a)(2)(iv) | feature | medium | reframed entirely: encryption is default |
| gdpr | Art.32 | feature | low | new caveats around audit/search semantics |
| hipaa-breach | 164.402(2) | feature | low | safe-harbor coverage broadens |
| iso-27001 | A.8.24 | feature | low | new mode: customer-key flow |
| ccpa | 1798.150 | feature | low | §1798.150 trigger zone narrows further |
| pipeda | Principle.4.7 | feature | low | safeguards reframed |

Proposal: `proposals/e2e-encryption.md`

### `MFA-MODERN-METHODS`

**TOTP portion SHIPPED 2026-09-02 (open-pryv.io `b606b328`)** — server-side TOTP
(RFC 6238) is built in and the default MFA method (in-process `TotpService` +
`MfaMethod` registry + config normalizer; SMS unchanged; secrets encrypted at
rest). **Released in `2.0.0-rc.14` and deployed to pryv.me production (both
cores) 2026-09-02**; browser-validated (enrol + login-with-TOTP) on production.
Slug stays OPEN for the remaining scope: WebAuthn plugin + the full
"writing an MFA provider" docs (dev-site doc source merged but not yet published
— pre-existing dev-site build blocker, unrelated to MFA). The rows below stay `Implemented | High` and
gain a stronger evidence chain (in-process TOTP → NIST 800-63B AAL2 without a
third-party service); the row-detail refresh + WebAuthn are outstanding.

**Hardening released in `2.0.0-rc.27` (2026-09-28, tag commit `0bd31d17`)**:
the per-account limiter is a **backoff, not a lockout** (open-pryv.io
`6231a37c`, default `aa445c43`; `services.mfa.attempts.backoff`: 3 free
failures within 900 s, then delays doubling from 2 s up to 300 s, 429
`too-many-attempts` + `Retry-After`; a password holder cannot lock the real
user out; `maxSeconds: 0` disables; platform-wide policy; the former
`attempts.perAccount` / `lockoutSeconds` keys are no longer read and trigger a
boot warning); the per-session ceiling counts parallel attempts (`1d91696c`);
TOTP codes are consumed with a storage compare-and-set, so one code releases
exactly one token (`43293101`, `6231a37c`); `services.mfa` is validated at boot
(`214b0b2b`); the private profile shows the MFA enrolment without secrets and
refuses writes to it (`25239783`, `7ce9ea6f`), so subject account backups carry
no usable MFA secret. Walked 2026-09-28: `hipaa-security.164.312(d)`,
`hipaa-security.164.308(a)(5)(ii)(C)`, `iso-27001.A.8.5`, `iso-27001.A.8.21`
gained the backoff evidence (tests `[MA12A]` `[MBKF1]` `[PCS1]` `[MCHK1]`);
rows stay `Implemented | High` (A.8.5, 164.312(d)) and the chips stay (WebAuthn
still outstanding). `RATE-LIMITING-RECIPES` chips unchanged: they cover password
login and the rest of the API, which still rely on the edge.

**Where the work lives**: `open-pryv.io`
(`components/business/src/mfa/`). WebAuthn plugin + AAL-tier mapping docs
remain; TOTP done.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| hipaa-security | 164.312(d) | enhancement | medium | row tightens; cite reference plugins |
| hipaa-security | 164.308(a)(5)(ii)(D) | enhancement | low | reduce SMS-OTP dependence |
| iso-27001 | A.8.5 | enhancement | medium | strengthen A.8.5 evidence chain |
| iso-27001 | A.5.17 | enhancement | low | broaden authentication-information catalogue |
| diga | A1.2.4 | enhancement | medium | meet BfArM "strong authentication" bar without SMS-OTP |

Proposal: `proposals/mfa-modern-methods.md`

### `BREACH-SCOPE-TOOL` (SHIPPED 2026-07-28, open-pryv.io `0b2874e0`)

**Where the work lived**: `open-pryv.io`. Shipped as the
PlatformDB reverse-index + `GET /system/accesses/:accessId`,
audit row extensions (`recordCount` + `scopedStreamIds`; the
field proposed as `affectedStreamIds` shipped under the
scope-not-yield name), the `bin/breach-scope.js` CLI, and
`bin/backfill-access-index.js` for pre-existing deployments.

**Discharged**: all `planned:` chips removed; rows updated as
applied below.

| Scope | Ref | Outcome (applied) |
|---|---|---|
| gdpr | Art.33 | F:Evidence Medium → F:Evidence High |
| swiss-nlpd | Art.24 | F:Evidence Medium → F:Evidence High (inherits gdpr.Art.33) |
| pipeda | s.10.1 | F:Evidence Medium → F:Evidence High |
| hipaa-breach | 164.404(b) | F:Evidence Low → F:Evidence Medium |
| hipaa-breach | 164.404(c) | Out-of-scope → F:Evidence Low (report feeds 2 of 5 content elements; no PHI-category derivation) |
| hipaa-breach | 164.414 | unchanged (the Medium → High move stays with AUDIT-LOG-CHAINING) |
| soc2 | P6.6 | F:Evidence Medium → F:Evidence High (this row's chip predated its listing here) |

Proposal: `proposals/breach-scope-tool.md` (Status: shipped)

### `QUICKSTART-DOCKER-HTTP-EXAMPLE` (DX-only: no matrix row updates) — SHIPPED 2026-09-04

**Status: shipped 2026-09-04.** Delivered as the published `customer-resources/quickstart-docker` page on the rebuilt developer docs site (now served at the pryv.github.io root); the complete dnsLess + HTTP-only + Docker walkthrough addresses all three papercuts. No matrix row changed (DX-only, as noted below).

**Where the work lives**: `open-pryv.io/INSTALL.md` + `dev-site/src/customer-resources/pryv.io-setup.md` documentation. Three reader-experience papercuts surfaced during a walk-through of the dnsLess + HTTP + Docker quickstart on a fresh box (mbp2, 2026-05-27): (1) env-var placeholders in `production-config.yml` aren't expanded; (2) the Docker image bundles rqlite + SQLite but not PostgreSQL; (3) the "Minimal production config" example omits several required `storages.engines.*` path keys.

**No matrix impact.** Pure installation ergonomics, doesn't change any tier coverage on any scope row. When shipped, INSTALL.md's worked example becomes complete; no matrix scope row changes. Partial mitigation already in dev-site (`bc67e79` on dev-site master, deployed to `pryv.github.io` `12f726f` 2026-05-27), the customer-facing `pryv.io-setup.md` now flags all three papercuts.

Filed under internal backlog slug `QUICKSTART-DOCKER-HTTP-EXAMPLE`.

### `MBP2-MULTICORE-SIMULATION` (DX-only: no matrix row updates)

**Where the work lives**: orchestration workspace's `_local/scripts/` launcher + workflow doc. A `mbp2-multicore.sh` that boots two `pryvio/open-pryv.io` Docker containers + shared PG + does the full `bin/bootstrap.js` cluster-CA + mTLS + rqlite-peering + dnsLess cross-core-forwarding dance end-to-end on the local LAN test box.

**No matrix impact.** Operational sugar for dev verification of multi-core PRs without a Dokku pre-prod cycle. When shipped, future multi-core changes (bootstrap CLI / mTLS material / rqlite TLS follow-ups) gain a fast local verification path; no scope row changes.

Filed under internal backlog slug `MBP2-MULTICORE-SIMULATION`. Pairs naturally with the `LE-STAGING-DRILL-RUNBOOK` backlog (the LE drill becomes easier once the multi-core launcher exists).

### `REG-ACCESS-CLIENT-AUTHURL` (DX-only: no matrix row updates; SHIPPED 2026, open-pryv.io `464ce266`)

**Where the work lives**: `open-pryv.io`
(`components/api-server/src/routes/reg/access.ts` + request schema +
new `access:trustedAuthUrls` config key).

**No matrix impact.** Per-request auth-popup URL selection, gated on an
operator-controlled allow-list, developer ergonomics for app authors
testing against locally-served auth UIs. The allow-list keeps the auth-UI
trust decision server-side, so no tier shifts on any scope row. When
shipped, no scope row changes.

Filed under internal backlog slug `REG-ACCESS-CLIENT-AUTHURL`
(implementer-requested, 2026-06-11).

### `BOILER-JSON-LOG-FORMAT` (DX-only: no matrix row updates)

**Where the work lives**: `open-pryv.io` (`components/boiler/src/logging.ts`
console transport) + potentially the `@pryv/boiler` npm package.

**No matrix impact.** Structured JSON console output for log aggregators,
operational/alerting sugar. Audit evidence flows through the audit
subsystem, not console logs, so no tier shifts on any scope row. When
shipped, no scope row changes.

Filed under internal backlog slug `BOILER-JSON-LOG-FORMAT`
(implementer-requested, 2026-06-11).

### `BUILTIN-STORE-OVERRIDE` (DX-only: no matrix row updates)

**Where the work lives**: `open-pryv.io`
(`components/mall/src/index.ts` register-order change +
`config-validation` schema addition).

**No matrix impact.** This is operational sugar, not a
compliance-shifting fix, see the `BUILTIN-STORE-OVERRIDE`
backlog entry for the explicit DX-only classification. When
shipped, update `context/audit-archival-via-custom-datastore.md`
Flavour B section with the `override: true` config snippet;
no scope row changes.

Filed during Q16; flagged as a scope-drift example in internal
gap-probing scope-discipline notes.

### `RATE-LIMITING-RECIPES`

**Status (2026-10-05): nginx + fail2ban shipped; chips discharged.** The developer
site page [Rate limiting and DoS protection](https://pryv.github.io/customer-resources/rate-limiting/)
(source `dev-site2/src/content/docs/customer-resources/rate-limiting.md`, verified end
to end against a running core) is now cited as `docs:` on iso-27001 A.8.6 and A.8.21,
hipaa-security 164.308(a)(5)(ii)(C) and 164.308(a)(6)(i), and diga A1.4.3. Coverage
tiers are unchanged (the contribution stays facilitated). Dedicated HAProxy /
Cloudflare / Traefik / Caddy snippets remain a backlog item with no chips: they
would add no row shift. When the client-IP attribution changes (trusted-proxy list),
refresh the page's "How Pryv reads the client IP" paragraph.

**Where the work lives**: the developer site (`dev-site2`, customer resources).
Q6 outcome, voluntarily missing at Pryv layer; ship reference configs.

**Tracking card**: https://github.com/orgs/pryv/projects/5?pane=issue&itemId=219705775&issue=pryv%7Copen-pryv.io%7C117

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.8.21 | enhancement | low | row cites concrete reference configurations instead of the architectural rationale alone |
| hipaa-security | 164.308(a)(5)(ii)(C) | enhancement | low | log-in monitoring gains a companion enforcement artefact on the auth endpoints |

Proposal: `proposals/rate-limiting-recipes.md` (filed 2026-07-28,
alongside `context/rate-limiting-and-dos-protection.md`). The chips that lived
on both rows above were discharged on 2026-10-05 (the rows now cite the page).

### `PLATFORMDB-AT-REST-ENCRYPTION`: **superseded by container-encrypted-volume**

**Status (2026-07-28): superseded, no code of its own.** This item
was surfaced 2026-05-21 (multi-region PlatformDB cross-border
analysis), BEFORE `container-encrypted-volume` (CEV) existed
(shipped v0.1.0 on 2026-06-23). CEV delivers encryption-at-rest for
the full user-data surface, events, attachments, series, audit,
**and PlatformDB**: for a containerised deployment, covering
exactly this item's threat model (SSD / backup-tape /
decommissioned-hardware forfeiture, filesystem-level read breach,
foreign-jurisdiction subpoena of the storage layer). The proposed
rqlite-native / envelope-encryption paths would be redundant work.
Chip discharged on `gdpr.Art.32`; row prose cites CEV covering
PlatformDB. GitHub issue #79 closed 2026-07-28.

**Residuals not covered by CEV** (out of scope, deliberately):
CEV is opt-in (`CEV_ENABLED`, coverage `configurable`) and covers
data inside the container, a core running rqlite outside a CEV
container falls back to operator FDE. It is storage-medium-only
(no defense of a running container or the rqlite **replication
stream**); that residual is the app-level exposure tracked by
`PLATFORMDB-PII-HASHING` (already shipped for the PII columns).

Proposal: `proposals/platformdb-at-rest-encryption.md` (marked
superseded). CEV proposal: `proposals/container-encrypted-volume.md`.

### `PLATFORMDB-PII-HASHING`: **shipped**

**Status (2026-06-16)**: shipped on `pryv/open-pryv.io` master
(commits `2c11478d` → `1417b01a`). Posture 1 (`hashed`, both
columns) is fully implemented; Posture 2 (`minimised`, strip email)
is deferred and not in the operator-facing enum yet. Chip removed
from `gdpr.Art.32` in `scopes/gdpr.yml`. Proposal mirror at
`proposals/platformdb-pii-hashing.md` carries the same Status
header.

**Where the work lives**: `open-pryv.io`, `components/platform/`
+ `storages/engines/rqlite/` + system-streams config +
registration flow + new `bin/platform-pii-migrate.js` +
`bin/platform-pii-rotate.js`. Operator opts via
`platform.piiMode: cleartext | hashed`. Surfaced 2026-05-21 by
multi-region PlatformDB cross-border analysis.

**Legal framing**: hashing is pseudonymisation, NOT anonymisation
under EDPB / WP29 Opinion 05/2014. Art.46 mechanism still
required for cross-border replication; this work is
**defence-in-depth + Art.32(1)(a) pseudonymisation evidence**,
not an Art.46 escape. Tokenisation (option C from Q25 brainstorm)
is the structural answer if "no PII leaves home region" is a
hard requirement; not yet backlogged.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.32 | feature | medium | concrete pseudonymisation evidence on PlatformDB layer; chip removed |
| gdpr | Art.5(1)(f) | feature | low | confidentiality strengthened at the cluster-replicated identification layer |
| gdpr | Art.46 | enhancement | low | residual exposure reduced even with SCCs; SCCs + pseudonymisation combined narrative materially stronger than SCCs alone |
| iso-27001 | A.8.11 | feature | medium | data-masking control gains the PlatformDB-layer instance |
| iso-27001 | A.8.24 | feature | medium | use-of-cryptography (HMAC) at the platform layer |

Proposal: `proposals/platformdb-pii-hashing.md`.

### `SUPPLY-CHAIN-SCANNING-PIPELINE`: SHIPPED

**Shipped**: open-pryv.io master merge `9e2ee7ff` (feature
commits `3ecb1e9a` + `afe6832c`) delivers the pipeline:
`scripts/audit-prod-deps` fails CI on high or critical
advisories in the runtime (`--omit=dev`) npm tree with a
documented allowlist (`security-audit` job); a CycloneDX SBOM of
the source tree is emitted and Grype-scanned on every CI run,
failing on critical (`sbom` job); on release tags the published
image gets its own CycloneDX SBOM, a keyless cosign signature
and a SLSA build-provenance attestation (`docker` job,
tag-gated); the base image is digest-pinned and the rqlite
tarball checksum-verified in the Dockerfile; nodemailer's major
bump cleared the standing runtime advisories. Chips discharged
from `gdpr.Art.32`, `iso-27001.A.5.21` (F:Awareness Low →
F:Evidence Medium) and `soc2.CC7.1` (F:Evidence Low →
F:Evidence Medium); `iso-27001.A.5.22` added as a new row;
prose refreshed on `iso-27001.A.5.23`, `iso-27001.A.8.30`,
`hipaa-security.164.308(a)(8)` and `soc2.CC9.2`. Honest bound
kept in the rows: the pinned base image still carries OS-level
CVEs; the tag-gated signing path is structurally verified and
first exercised by the next release tag.

**Where the work lives**: `open-pryv.io`, CI workflow
(`.github/workflows/ci.yml`) + `Dockerfile` + (optionally) a
release-time SBOM publishing step. Three-phase: in-CI gates (npm
audit + base-image digest pin + rqlite tarball checksum); pipeline
tooling (Syft + Grype for SBOM + image scan; CycloneDX artefact
publishing); provenance + signing (cosign + SLSA attestation).
Surfaced 2026-05-21 by supply-chain compliance gap-probing.

Candidate tools (implementer FAQ Q24): OWASP-ZAP / Snyk / Grype.
OWASP-ZAP is DAST, not SCA: a candidate for separate web-app security testing, beyond the
software-supply-chain scope.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.5.21 | feature | medium | drop overstated "published dependency-audit pipeline" prose; add `tests: [CIYAML]` citation; coverage F:Awareness Low → F:Evidence Medium |
| gdpr | Art.32 | feature | low | detail block gains "supply-chain hygiene" sub-bullet under §1(b)/(c) ongoing CIA |
| hipaa-security | 164.308(a)(8) | feature | low | periodic technical evaluation gains a concrete artefact (SBOM + latest scan output) |
| iso-27001 | A.5.23 | feature | low | strengthens cloud-services exit narrative, operator hands SBOM + signed-image proof to the next CSP for migration |
| iso-27001 | A.8.30 | enhancement | low | when operator's "supplier" is Pryv, the SBOM + signed image + CHANGELOG combine into the supplier-monitoring artefact set |
| iso-27001 | A.5.22 | feature | medium | row may need to be ADDED, A.5.22 "Monitoring of supplier services" doesn't currently have matrix coverage; the supply-chain pipeline gives it concrete content |

Applied deltas vs. the table above: `soc2.CC7.1` also carried a
chip (added with the SOC 2 scope after this table was written)
and shifted F:Evidence Low → F:Evidence Medium; the
`tests: [CIYAML]` citation was not added (no such test code
exists; the CI workflow is cited in prose instead); A.5.22 was
added as a new row; 164.308(a)(8), A.5.23 and A.8.30 received
prose refinements without tier changes.

Proposal: `proposals/supply-chain-scanning-pipeline.md`.

### `VULNERABILITY-DISCLOSURE-PROGRAM`: SHIPPED

**Shipped**: a coordinated disclosure policy now ships in
`SECURITY.md` on `open-pryv.io` (private GitHub Security
Advisories flow + `security-dev@pryv.com` mailbox + published
scope + response-time SLA + safe-harbor language + 90-day
coordinated disclosure + GHSA/CVE issuance + a recognition /
hall-of-fame section); private vulnerability reporting is
enabled on all published repositories; and a federated
`SECURITY.md` pointer lands on the sister repos (`dev-site`,
`lib-js`, `data-types`, `app-web-auth3`, `pryv-account-backup`,
`compliance-matrix`). PGP key and security.txt were
deliberately not pursued (GitHub private reporting + mailbox
are the confidential channels); no paid bounty. The chips
below have been discharged and the row prose updated to cite
the shipped VDP.

Surfaced 2026-05-21 by Art.32(1)(d) testing / effectiveness
evidence gap-probing (the prior `SECURITY.md` was 6 lines
directing reporters at the public issue tracker).

| Scope | Ref | Kind | Impact | Discharged row change |
|---|---|---|---|---|
| gdpr | Art.32 | enhancement | medium | §1(d) detail cites the published VDP + GHSA advisory history alongside the existing test-matrix evidence |
| iso-27001 | A.5.7 | enhancement | medium | "threat intelligence" overview cites Pryv's VDP + GHSA flow as the substrate-vulnerability threat-intelligence feed |
| iso-27001 | A.5.24 | enhancement | low | info-sec-incident-management-planning overview cites VDP as the externally-facing intake channel |
| hipaa-security | 164.308(a)(6)(i) | enhancement | low | security-incident-procedures overview cites VDP as the substrate-vulnerability intake channel |
| hipaa-security | 164.308(a)(8) | enhancement | low | periodic-evaluation overview cites VDP + GHSA history as one evidence input |
| soc2 | CC7.4 | enhancement | low | incident-response overview cites VDP as the external intake channel |

Proposal: `proposals/vulnerability-disclosure-program.md`.

### `CONFIG-EFFECTIVE-EXPOSURE`

**Where the work lives**: `open-pryv.io`, new
`GET /system/admin/config/effective` admin route + SPA
"Configuration" tab. Absorbed by the bootstrap-admin-panel
work (planned MVP1 slice). Read-only, per-core, merged effective
config including the YAML-only key families (no SSH-the-box
requirement to read deployment safeguards). Secrets redacted
per a `SECRET_KEYS` constant + JSON-schema `secret: true`
annotations. `?digest=true` short-circuit for cross-core drift
pings.

Surfaced 2026-05-21 by DPIA Section (d) safeguards inventory
feed gap-probing. Also unlocks cross-core drift
detection + operator runbook + post-hoc debugging use-cases.

**Tracking card**: https://github.com/orgs/pryv/projects/5?pane=issue&itemId=219705795&issue=pryv%7Copen-pryv.io%7C118

Affected rows when the endpoint ships:

| Scope | Ref | Kind | Impact | Chip | After shipping |
|---|---|---|---|---|---|
| gdpr | Art.30 | feature | medium | ✅ | cite endpoint as evidence-emitter for the §1(g) "description of technical security measures" |
| gdpr | Art.32 | feature | low | ✅ | strengthen evidence narrative around operator-visible safeguards |
| gdpr | Art.35 | feature | medium | ✅ | DPIA safeguards inventory cites the endpoint output; coverage tier could shift F:Awareness Low → F:Evidence Med |
| iso-27001 | A.8.9 | feature | medium | ✅ | direct match, configuration management evidence; row could move F:Storage / F:Primitive → Configurable |
| hipaa-security | 164.308(a)(8) | feature | medium | ✅ | evaluation gains a technical baseline snapshot instead of a per-cycle reconstruction |

Proposal: `proposals/config-effective-exposure.md` (filed 2026-07-28).
The chips carry no `backlog:` key: the work has no standalone backlog
file and is delivered by the bootstrap + admin-panel effort, and
`planned.backlog` is optional in the schema. The earlier note here
claimed a backlog stub was required to satisfy the validator; that is
not the case (`scripts/validate.js` only resolves `backlog` when it is
set).

⚑ **Lookup note.** The `164.308(a)(8)` ref is **quoted** in
`scopes/hipaa-security.yml` (`- ref: "164.308(a)(8)"`), unlike most refs in
that file. A `grep '^  - ref: 164.308'` will not find it and can lead to the
false conclusion that the row is missing. Several HIPAA refs in the 164.310+
range are quoted the same way.

### `SHARED-SECRETS` (SHIPPED: rows walked 2026-07-22)

**Where the work lives**: `open-pryv.io/components/shared-secrets/` +
`POST /:username/shared-secrets`, `/shared-secrets/retrieve`,
`/shared-secrets/status`; client helper `pryv.SharedSecrets` in lib-js.
Falls under **B.1 (new API methods)**.

Hands a secret to a third party by one-time key instead of embedding it
in a URL. Motivation is squarely a security-of-processing one: credential
hand-off during auth / consent flows previously put an access token in a
query parameter, where it persists in browser history, referrer headers
and server access logs. The key is redeemable exactly once, expires on a
mandatory TTL, and the server stores only its SHA-256, so a database
dump cannot reconstruct a live credential. The payload is scrubbed as
soon as the secret stops being pending, including from event history.

**Row walk done (2026-07-22)**: new `shared-secrets` primitive added to
`docs/pryv-primitives.md` (B.4); rows updated:

| Scope | Ref | What changed |
|---|---|---|
| gdpr | Art.32 | `shared-secrets` added to `pryv_primitives`; new "Credential hand-off: IMPLEMENTED" per-aspect bullet in detail (one-shot key + mandatory TTL + SHA-256-only storage + payload scrub + optional signature) |
| iso-27001 | A.5.17 | primitive added; new detail paragraph "Transmitting authentication information to a third party" incl. the `secretSharing: forbidden` opt-out |
| iso-27001 | A.8.12 | primitive added; overview extended, access logs / browser history / referrers stop accumulating live credentials |
| hipaa-security | 164.312(e)(1) | primitive added; `tests:` gains `SHS02` / `SHS12` / `SHS13`; new detail paragraph "Credential hand-off between parties" (TLS protects the pipe, shared-secrets protects the credential) |
| soc2 | CC6.1 | primitive added; `tests:` gains `SHS02` / `SHS09` / `SHS13`; new detail paragraph "Credential transmission to third parties" |

`gdpr.Art.5(1)(f)` needed no separate edit: the Art.5 row's §1(f) bullet
defers to Art.32 by design ("covered separately at Art.32"), so the
Art.32 update carries it. No coverage-tier shifts, every walked row
already sat at the right tier; the feature strengthens the evidence and
primitive citations within it.

No `proposals/<slug>.md` mirror: the work is **shipped**, not planned, so
it carries no `planned:` chips.

**Extended 2026-09-18 (primitive now backs the `/reg/access` auth-request
credential hand-off).** The shared-secrets primitive's stated motivation was
credential hand-off during auth / consent flows (an access token used to sit in
a URL query parameter, persisting in history / referrers / access logs). That
flow is now wired to the primitive: `POST /reg/access` takes an optional
`credentialHandoff: 'shared-secret'`, the `ACCEPTED` poll then carries a one-time
`handoff` key and a token-less `apiEndpoint` instead of the token, and the app
retrieves the credential exactly once. The server converts an inline accept into
a secret (authenticated as the app token, on the user's core), and the auth UI
can create the secret itself (the token then never reaches the core that answered
the request); config `access:handoffTtl` bounds the secret. Delivered on
open-pryv.io `master` `7c53ebb0`, lib-js `master` `edc6540`,
app-web-user-account `main` `b88f222`, dev-site2 `main` `1594b8d` (released in
open-pryv.io 2.0.0-rc.23, lib-js 3.13.0 and app-web-user-account 0.2.0; docs
published 2026-09-18).
No new primitive and no coverage-tier shift: this STRENGTHENS the same rows
already walked above (gdpr Art.32, iso-27001 A.5.17 / A.8.12,
hipaa-security 164.312(e)(1), soc2 CC6.1) by realising the credential-hand-off
aspect their detail bullets already describe. Tests to cite at the next
scope-YAML evidence refresh: `reg-access.test.js` `[RA95]`-`[RA108]` (server) and
the client SDK / auth-UI hand-off suites. New API surface falls under **B.1**;
`access:handoffTtl` is a new config key.

### `ACCOUNT-DELEGATION` (SHIPPED: rows walked 2026-09-15)

**Where the work lives**: `open-pryv.io/components/delegation/` (plugin:
reserved `:_delegation:*` stream-id namespace + guard hooks; NOT a storage
engine) plus the `delegations.*` method family + routes in
`components/api-server/src/methods/delegations.ts` /
`routes/delegations.ts`, `accessInfo` surfacing in `methods/utility.ts`, and
audit registry entries in `components/audit/`. Commits: skeleton `46ae0c23`,
attach handshake `1a797815`, delegate token + audit / accessInfo `6f220187`,
authoritative genuine-login detach `6c618f24`, create-from-delegate
`42c4b7d8`, internal-read hardening + same-core audit parity `e75f2155`,
wildcard-read exclusion `00edf2a1`. Falls under **B.1 (new API methods)**,
**B.4 (new primitive)**, **B.7 (architectural change)**, and **B.8
(token-class enforcement)**.

An account can be controlled by one or more **delegate accounts**; a delegate
holds an owner-equivalent personal token over the controlled account with one
exception, it can never remove a delegation. Detach is authoritative and gated
on a **genuine login of the controlled account** (a `type:'personal'` token
carrying no forge-protected `clientData.delegation` marker; the marker is
forge-guarded on create and update). Controlled-account-initiated invite /
accept handshake; create-from-delegate (optional email/password seed);
same-core and cross-core (same platform); per-delegate audit attribution on
the controlled account; additive `accessInfo.delegation` field. The whole
`:_delegation:*` namespace is plugin-owned and guarded (no user
create/write/delete, internal subtree read-guarded, excluded from wildcard
reads).

**Row walk done (2026-09-15)**: new `delegation` primitive added to
`docs/pryv-primitives.md` (B.4); new context note
`context/delegation-model.md` (B.7); rows updated:

| Scope | Ref | What changed |
|---|---|---|
| gdpr | Art.8 | delegation is now the technical control for the parental-holder-of-responsibility case; `facilitation_mode` storage → **primitive**, `pryv_effort_saved` low → **medium**, `draft` true → **false**; `permissions` + `delegation` added to `pryv_primitives`; overview/detail rewritten (owner-reclaim at majority via genuine-login detach; age-blindness statement kept accurate) |
| hipaa-privacy | 164.502(g) | delegation cited as the personal-representative mechanism (owner-equivalent token, audited, revocable by genuine login); `facilitation_mode` storage → **primitive**, `pryv_effort_saved` low → **medium**, `draft` true → **false**; `delegation` + `audit` added to `pryv_primitives` |
| gdpr | Art.7 | `delegation` added to `pryv_primitives`; detail gains a withdrawability paragraph (delegate cannot remove a delegation; holder detaches via genuine login) |
| gdpr | Art.32 | `delegation` added; new "Delegate-account control: IMPLEMENTED" per-aspect bullet |
| hipaa-security | 164.312(a)(1) | `delegation` added; detail gains a "Delegate-account token class" paragraph |
| hipaa-security | 164.312(d) | `delegation` added; detail gains a "Delegate tokens authenticate AS the controlled account" paragraph (accessInfo attribution + genuine-login revocation) |
| soc2 | CC6.1 | `delegation` added; detail gains a "Delegate-account access path" paragraph |
| soc2 | CC6.2 | `delegation` added; detail gains a "Delegate-credential issuance + de-provisioning" paragraph |
| soc2 | CC6.3 | `delegation` added; detail gains a "Delegate-account access removal" paragraph (broad grant caveat + authoritative removal + per-delegate audit) |
| iso-27001 | A.5.15 | `delegation` added; detail gains a "Delegate-account token class" paragraph |
| iso-27001 | A.5.16 | `delegation` added; detail gains a "Delegate-account identity lifecycle" paragraph |

Only Art.8 + 164.502(g) shifted tier/mode (they gained a concrete technical
control where they were storage-only conventions); the B.8 access-control /
authN rows already sat at the right tier and gained the new token class as an
additional cited primitive + a detail paragraph.

No `proposals/<slug>.md` mirror and no `planned:` chips: the work is
**shipped**, not planned.

**Follow-up: apps granted access for a controlled account (rows walked
2026-09-18).** open-pryv.io master `91b06363` (lineage attribute, accessInfo
`grantedVia`, audit attribution, detach revocation, `/reg/access` `actAs` +
`delegation` hint), `ef0a3f75` + `5943ca0b` (owner-only OAuth2 consent and CMC
accept / scope-update / offer). Released in **2.0.0-rc.23**; the rows
say so. Section B walk:

- **New access-info field** (B.1): `accessInfo.delegation.grantedVia: 'app'`
  for an access granted through a delegation.
- **New audit content kind** (audit family of B.1): records produced by such
  an access carry `content.delegation`, as for the delegate token.
- **New access attribute** (B.7): server-stamped
  `clientData.delegation = { kind: 'delegated-child', relId, delegate,
  viaAccessId }`, non-forgeable, kept across updates, propagated to the
  accesses such an app creates, revocable like any access, deleted at detach
  (BREAKING for apps that relied on keeping it).
- **Grant refusals** (B.8 token class + B.9 OAuth2): a delegate token or an
  access granted through a delegation is refused on OAuth2 consent (`403
  access_denied`) and on writing `consent/accept-cmc`,
  `consent/scope-update-cmc`, `consent/request-cmc` (`400 invalid-operation`,
  `delegation-grant-requires-owner`).

Context notes: `context/delegation-model.md` (new section "Accesses granted
through a delegation"), `context/cmc-consent-primitives.md` (gates section),
`docs/pryv-primitives.md` (`delegation` entry). Rows (detail paragraph added,
`tests:` extended; **no tier shift**, `reviewed_at` left unchanged so the
added prose awaits the next review pass):

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.7 | consent a delegate gives: record on the subject's account, withdrawable, revoked with the delegation; owner-only OAuth2 / CMC grant paths | `DCH12`, `DCH13`, `DCH14`, `OE27` |
| gdpr | Art.8 | the parent consents to an app for the child; record on the child's account, audited with the delegate named, revoked at detach | `DCH01`, `DCH02`, `DCH05`, `DCH12` |
| gdpr | Art.32 | "Delegate-account control" bullet: apps get an app access, lineage, revocation, refusals | (none added) |
| hipaa-privacy | 164.502(g) | representative authorizes apps for the individual; representative named on every record; revoked with the representative | `DCH01`, `DCH05`, `DCH12` |
| hipaa-security | 164.312(a)(1) | "Apps granted access through a delegation" paragraph | `DCH01`, `DCH03`, `DCH12`, `DCH14`, `OE27` |
| hipaa-security | 164.312(b) | audit records of such apps name the delegate | `DCH05` |
| hipaa-security | 164.312(d) | `grantedVia` identifies an app acting for a controlled account; hint vs authoritative; cannot detach | `DCH02`, `DCH03`, `DCH11` |
| soc2 | CC6.2 | app credentials issued under a delegate's authority end with it | `DCH01`, `DCH12` |
| soc2 | CC6.3 | least privilege for delegated app grants; modify / revoke / cascade | `DCH06`, `DCH08`, `DCH09`, `DCH12` |
| iso-27001 | A.5.15 | delegated app grants: scoped, non-forgeable mark, removed with the delegation; refusals | `DCH01`, `DCH03`, `DCH12`, `DCH14`, `OE27` |
| iso-27001 | A.5.16 | lifecycle of app identities a delegate authorizes | `DCH02`, `DCH12` |

No `planned:` chips and no proposal mirror: shipped work. Stamping the lineage
on the CMC accept path (which lifts the `consent/accept-cmc` refusal) has since
**shipped** in open-pryv.io 2.0.0-rc.30 (`9ba9c78c`): see `CARER-CONSENT-LINEAGE`
just below, whose rc.30 rows were walked on 2026-10-01 (`[DCH14]` replaced by
`[DCH15]`..`[DCH18]` on `gdpr.Art.7`, `hipaa-security.164.312(a)(1)` and
`iso-27001.A.5.15`). Lifting the OAuth2 refusal (`[OE27]`) and the
`consent/request-cmc` / `consent/scope-update-cmc` refusals is still not
scheduled.

### `CARER-CONSENT-LINEAGE` (SHIPPED in open-pryv.io 2.0.0-rc.30 `9ba9c78c`, rc.31 `b77320df`, rc.32 `6496ffbb`; all chips discharged, rows walked 2026-10-01)

**Where the work lives**: `open-pryv.io/components/cmc/` (accept handler,
a stamping hook for `content.approvedBy`), `components/delegation/` (lineage
helper, detach sweep, `keepAccessIds`), `components/api-server/src/methods/events.ts`
(the delegation guard set), `components/api-server/src/routes/reg/access.ts`
(`cmcInvites`). Delivered by scheduled platform releases, not a backlog file,
so the chips carry no `backlog:` key. Public issues:
https://github.com/pryv/open-pryv.io/issues/143 (rc.30),
https://github.com/pryv/open-pryv.io/issues/144 (rc.31),
https://github.com/pryv/open-pryv.io/issues/145 (rc.32).

**rc.30 part: SHIPPED** in open-pryv.io 2.0.0-rc.30 (release commit
`9ba9c78c`; feature commits `87bbdfb1`, `d495d5d4`, `29836b29`, merge
`bc7410e0`). A delegate token may write `consent/accept-cmc` for the managed
account; the data grant carries `clientData.delegation` (reported by
`access-info`), the accept event carries the server-stamped
`content.approvedBy`; detach deletes the grant (hard delete, as every CMC
revoke) and forwards `consent/revoke-cmc` to the requester (best-effort); an
accept in progress when the delegation ends fails with
`cmc-handler-delegation-ended`. Request and scope-update stay owner-only. The
subject-side record of a consent ended by a detach is the accept event
(`approvedBy`, `dataGrantAccessId`) plus the audit row of
`delegations.detachDelegate`; the per-grant withdrawal marker comes with the
reviewed detach.

Rows walked 2026-10-01 (chips of rc.30 discharged, `[DCH14]` replaced by
`[DCH15]`..`[DCH18]` in `tests:`, `[OE27]` kept; no tier shift; `reviewed_at`
left unchanged so the added prose awaits the next review pass):

| Scope | Ref | What changed | Tests |
|---|---|---|---|
| gdpr | Art.7 | rc.30 chip discharged; delegate-given cross-account consent paragraph (lineage, `approvedBy`, ends at detach with notice, subject-side record); withdrawal paragraph notes that CMC teardown paths hard-delete the grant, so the record is the `consent/*` events plus the audit trail | `DCH15`, `DCH16`, `DCH17`, `DCH18` (replacing `DCH14`) |
| gdpr | Art.8 | rc.30 chip discharged; "The parent accepts a cross-account consent for the child" paragraph | `DCH15`, `DCH16`, `DCH18` added |
| gdpr | Art.32 | (no chip) Delegate-account control bullet: CMC accept left the refused paths | (none) |
| hipaa-security | 164.312(a)(1) | chip discharged; "Apps granted access through a delegation" paragraph covers CMC data grants | `DCH15`..`DCH18` (replacing `DCH14`) |
| iso-27001 | A.5.15 | chip discharged; same correction as 164.312(a)(1) | `DCH15`..`DCH18` (replacing `DCH14`) |

Walked without change (their text does not state the CMC accept refusal and
their claim does not shift): `hipaa-privacy.164.502(g)`,
`hipaa-security.164.312(b)`, `soc2.CC6.2`, `soc2.CC6.3`, `iso-27001.A.5.16`.
Context notes updated: `context/delegation-model.md` (new "Cross-account
consents a delegate gives" paragraph in "Accesses granted through a
delegation"; refusal list narrowed) and `context/cmc-consent-primitives.md`
(gates section; Art.7 withdrawability record shape for the CMC hard-delete
paths). Section B: B.8 walked (gated set changed, see the 2026-10-01 entry
there); B.1: new error id `cmc-handler-delegation-ended`, new accept-event
field `content.approvedBy`, no new method.

**rc.31 part: SHIPPED** in open-pryv.io 2.0.0-rc.31 (release commit
`b77320df`; reference account app app-web-user-account 0.10.0 `374d29e`,
superseded by 0.11.0). `delegations.detachDelegate { username,
keepAccessIds? }`: the account holder keeps named consent grants the delegate
gave, nothing kept by default; an id that is not a consent grant of the
relationship being removed refuses the whole call before any write (`400`,
`delegation-invalid-keep-list`). A kept grant loses `clientData.delegation`
and its accept event records `content.ownerConfirmedAt`; a dropped grant is
deleted and notified as at rc.30 and its accept event records
`content.withdrawal = { at, by: 'delegation-detach', relId }`. `approvedBy`,
`ownerConfirmedAt` and `withdrawal` are server-owned (dropped on create, kept
on update, never added by an update, any token). Page rule in the reference
account app: nothing preselected, an undelivered consent cannot be kept, a
listing failure removes nothing.

**rc.32 part: SHIPPED** in open-pryv.io 2.0.0-rc.32 (release commit
`6496ffbb`, merge `f262854b`; reference account app 0.11.0 `791e3ae`).
`POST /reg/access` accepts `cmcInvites` (1 to 8 entries, stored normalised,
echoed on 201 and NEED_SIGNIN); outcomes posted as `cmcInvites` with
`ACCEPTED`, stored as `cmcInviteOutcomes` (never read from the body), served
as `cmcInvites` in every ACCEPTED answer; reserved `reasonId`s
`REFUSED_MANDATORY_CONSENT` and `MANDATORY_CONSENT_FAILED` on REFUSED. The
reference account app decides, accepts, then grants, and answers declines with
`consent/refuse-cmc`.

Rows walked 2026-10-01 for rc.31 and rc.32 (every remaining chip discharged:
no `planned:` entry for this proposal is left in `scopes/`; no tier shift;
`reviewed_at` left unchanged so the added prose awaits the next review pass;
page tests of app-web-user-account are cited in prose only, since `tests:`
resolves against open-pryv.io):

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.7 | rc.31 + rc.32 chips discharged; new withdrawability paragraph (review at detach, nothing kept by default, undelivered consents cannot be kept, `ownerConfirmedAt` / `withdrawal`, server-owned record, `delegation-invalid-keep-list`); new §2 paragraph on consent invites in the authorisation request (decided one by one, decide-accept-grant order, reserved `reasonId`s, outcomes are hints stored under a name the poster cannot write; Art.7(4) `mandatory` left to you); §3 teardown note points at the withdrawal marker; page tests `[DKP7]`, `[DKP8]`, `[ACI2]`, `[ACI14]` in prose | `DCH21`..`DCH24`, `DDK07`, `APB08`..`APB12`, `RCI1`..`RCI9` |
| gdpr | Art.8 | rc.31 chip discharged; "Owner reclaim at majority covers the parent's consents" paragraph; `for: 'target'` invites sentence. `pryv_effort_saved` medium → high (named in the chip as possible) NOT applied: left to the row's next review | `DCH21`..`DCH24`, `DDK07`, `RCI1` |
| gdpr | Art.32 | (no chip) Delegate-account control bullet: a CMC grant is deleted with the delegation unless the holder keeps it | (none) |
| hipaa-security | 164.312(a)(1) | (no chip) "Apps granted access through a delegation": the keep-list exception to "detach deletes every access granted through the delegation" | `DCH21`, `DCH23` |
| iso-27001 | A.5.15 | (no chip) same exception | `DCH21`, `DCH23` |

Walked without change: `soc2.CC6.2`, `soc2.CC6.3`, `iso-27001.A.5.16`,
`hipaa-privacy.164.502(g)` (their detach claims are about app accesses a
delegate authorizes, which the keep list cannot keep: they still end with the
delegation), `hipaa-security.164.312(b)` (the detach is audited as before).
Context notes updated: `context/delegation-model.md` (review at detach,
server-owned record, what remains after detach, consent invites for a managed
account), `context/cmc-consent-primitives.md` (consent invites in the auth
request; gates section; Art.7 withdrawability: the withdrawal marker),
`context/cross-border-platformdb-implications.md` (the core-local `/reg/access`
state may now hold invite capability URLs).

Section B walks: **B.1** done. rc.31: new parameter
`delegations.detachDelegate.keepAccessIds`, new error id
`delegation-invalid-keep-list` (`DelegationErrorIds.INVALID_KEEP_LIST`), new
server-owned accept-event fields `content.ownerConfirmedAt` and
`content.withdrawal`, no new method. rc.32: new `/reg/access` request field
`cmcInvites` and ACCEPTED outcome field (stored `cmcInviteOutcomes`), reserved
`reasonId`s, no new method. The B.1 row families were checked: only
`hipaa-security.164.312(a)(1)` (access control) carries a claim the keep list
touches (above); the DSAR, rectification, erasure, restriction and audit
families, and the SOC 2 parallels, cite neither surface. B.2 (no new
event-type format: `consent/accept-cmc` gains content fields), B.3, B.4, B.6,
B.9, B.10: none. B.8: the gated set is unchanged since rc.30.

**Tracking card**: https://github.com/orgs/pryv/projects/5?pane=issue&itemId=259442555
(was the `tracking_url` of every chip of this slug).

Proposal: `proposals/carer-consent-lineage.md`.

### `EMAIL-VERIFICATION` (SHIPPED: rows walked 2026-09-15)

**Where the work lives**: `open-pryv.io/components/business/src/emails/`
(`challenge.ts`, `mailCapability.ts`, `registrationPolicy.ts`, `container.ts`)
+ `POST {register}/email-challenge`, `/email-challenge/verify`; the existing
`POST /:username/account/verify-email`; the `/verify-email` page in
app-web-user-account. Falls under **B.1 (new API methods)**, **B.2 (new config
keys)** and the changed-default case.

Two flows. An address on an existing account is proved by a mailed link, and
that flow is now **on by default** (`services.email.enabled.verifyEmail`), with
a soft landing so a deployment missing the page URL or a mail setup keeps
booting with a warning instead of refusing. Separately, an operator may require
a **code-proved address before an account is created**
(`account.emailVerification.requireAtRegistration`, default off): a one-time
code is mailed, exchanged for a single-use proof bound to that address, and the
proof must accompany `POST /users`. Only the hash of a code or token is stored.
A proved address carries `verificationMethod: 'email-code'` or `'email-link'`,
which is what third-party sign-in linking requires before it will attach an
external identity to an account.

**Row walk done (2026-09-15): no row impact, no tier shifts.** Searched every
file under `scopes/` for `verifyEmail`, `emailVerification`,
`verificationMethod`, `account.verifyEmail` and for proved-address / sign-in
linking language: **no row cites this surface**, so there is nothing to
re-cite or re-tier. The rows B.1 nominates for identity and logical access
(`hipaa-security.164.312(a)(1)`, `soc2.CC6.1`, `soc2.CC6.3`) make claims about
per-stream permission enforcement on an authenticated caller, not about how
strongly the account holder's identity was established when the account was
created — a different claim, which no row currently makes.

**Flagged for the matrix owner, deliberately NOT written here:** this feature
would support a new identity-assurance claim (an operator can require a proved
address at sign-up; account addresses are proved by default), which is the kind
of evidence `soc2.CC6.1` / `hipaa-security.164.312(a)(1)` could cite. Adding an
auditor-facing claim is a row-design decision, so it is surfaced rather than
taken. Test codes available to cite if it is taken up: `[EMCR1-12]`
(registration gate over HTTP), `[EMCH1-13]` (challenge accounting and
throttles), `[EMLK1-2]` (link format), `[CV-GA1-4]` / `[CKCF1-3]` (the
default-on validator), `[SSOLI7]` (a code-proved address links on first
sign-in). Config keys: `account.emailVerification.*`,
`services.email.enabled.verifyEmail`, `services.email.emailChallengeTemplate`.

No `proposals/<slug>.md` mirror: the work is **shipped**, not planned, so it
carries no `planned:` chips.

## Section B: Trigger categories (no specific backlog slug yet)

These work patterns commonly impact the matrix even without a queued
`planned:` chip. Add an entry under Section A if your specific PR
falls into one of these and there isn't already a slug for it.

### B.1: New / renamed open-pryv.io API methods

Affects rows that cite the method name in `tests:` / `config_keys:` /
`detail`. Check the row's tier (`coverage: implemented` typically
needs a `tests:` entry pointing at a new `[CODE]`).

Common touchpoints when API surface changes:
- `gdpr.Art.15`, `gdpr.Art.20`, `ccpa.1798.110`, `pipeda.Principle.4.9`,
  `swiss-nlpd.Art.25`, `hipaa-privacy.164.524`, DSAR / portability /
  individual-access row family.
- `gdpr.Art.16`, `ccpa.1798.106`, `pipeda.Principle.4.6`, rectification.
- `gdpr.Art.17`, `ccpa.1798.105`, `pipeda.Principle.4.5`,
  `swiss-nlpd.Art.32`: erasure.
- `gdpr.Art.18`: restriction (mostly `accesses.update`).
- `hipaa-security.164.312(a)(1)`: access control.
- `hipaa-security.164.312(b)`, `iso-27001.A.8.15`, audit.
- **SOC 2** parallels the families above: `soc2.P5.1` + `soc2.P6.7`
  (subject access / accounting of disclosures), `soc2.P5.2`
  (rectification), `soc2.CC6.5` + `soc2.P4.3` + `soc2.C1.2` (erasure /
  disposal), `soc2.CC6.1` + `soc2.CC6.3` (logical access control),
  `soc2.P6.2` (record of disclosures, audit).

### B.2: New event-type formats (`data-types` repo)

Add to the per-row `pryv_primitives: [data-types]` citations. May
affect:
- `gdpr.Art.20` (portability via canonical schemas).
- `iso-13485` (excluded_items: device classes).
- `hipaa-privacy.164.514` (de-identification, new format flags).
- `soc2.PI1.1`, `soc2.PI1.2`, `soc2.P7.1` (processing-integrity /
  data-quality rows cite the `data-types` validation pipeline).

**Refreshed 2026-06-22:** `calendar/ical-event` (new `calendar` class)
added to `pryv/data-types`. Primary matrix impact: `gdpr.Art.20`,
portability to the iCalendar (RFC 5545) standard via the calendar
adapter, which is also advertised in the new `/service/info`
`adapters` field (a thin list of adapter base URLs; each adapter
serves its own `manifest.json`).

### B.3: New storage engine (`storages/engines/<new>/`)

Affects:
- `gdpr.Art.17` (engine-dependent erasure semantics; per-user
  granularity).
- `gdpr.Art.32` (data-at-rest semantics).
- `gdpr.Art.5(1)(c)` (data minimisation, engine isolation behaviour).
- `hipaa-security.164.312(a)(1)` (technical safeguards, engine ACL
  enforcement).
- `iso-27001.A.8.10` (information deletion semantics per engine).
- `soc2.CC6.5`, `soc2.C1.2`, `soc2.P4.3` (engine-dependent disposal /
  destruction rows).
- The audit primitive doc (`audit` entry in `docs/pryv-primitives.md`).
- `context/per-engine-isolation.md`.

### B.4: New `pryv_primitive` (added to `docs/pryv-primitives.md`)

Reverse-check: which rows should cite the new primitive in their
`pryv_primitives: [...]` array? Greppable from
`docs/pryv-primitives.md`.

Most recent: `delegation` (2026-09-15), cited on `gdpr.Art.7` / `Art.8` /
`Art.32`, `hipaa-privacy.164.502(g)`, `hipaa-security.164.312(a)(1)` /
`164.312(d)`, `soc2.CC6.1` / `CC6.2` / `CC6.3`, `iso-27001.A.5.15` / `A.5.16`.
See the `ACCOUNT-DELEGATION` entry in Section A.

### B.5: Open-pryv.io major version bump (2.x → 3.x)

Mass-touch: `applies_to_versions` field on every row that's expected
to change behaviour. Today the default is `*` (every row applies to
every version). When the v3 line opens, many rows will need
`applies_to_versions: ">=2.0.0 <3.0.0"` or equivalent.

### B.6: New scope (`scopes/<new>.yml`)

Update `MEMORY.md` workspace overview + scope-list documentation;
check `derives_from` cross-references on existing scopes that might
benefit from pointing at the new scope.

### B.7: Major Pryv-side architectural change

Touches `context/*.md` notes. Recent examples:
- Apps granted access for a controlled account (server-stamped
  `delegated-child` lineage attribute on accesses, revoked at detach;
  `context/delegation-model.md` gained a section, 2026-09-18). See the
  follow-up under `ACCOUNT-DELEGATION` in Section A.
- Account delegation (owner-equivalent control of one account by another,
  genuine-login-gated authoritative detach; added
  `context/delegation-model.md`, 2026-09-15). See the `ACCOUNT-DELEGATION`
  entry in Section A.
- Multi-core data-residency model (touched
  `context/core-affinity-architecture.md`).
- `cluster_kv` + `access-state` (added to PlatformDB catalogue
  listed in the core-affinity context note).
- Storages-as-plugins refactor (touched engine references in the
  audit + data-residency primitives).
- CMC gates on access-state-mutating triggers, personal-token on
  `consent/accept-cmc` + `consent/scope-update-cmc` (mint + widen);
  access-permission gate (`AccessLogic.canDeleteAccess` honouring
  `selfRevoke`) on `consent/revoke-cmc`. Touched
  `context/cmc-consent-primitives.md`'s "Gates on access-state-mutating
  consent triggers" section + the Art.7 demonstrability + withdrawability
  claims in the same file.

### B.8: Token-class enforcement on consent-bearing API methods

When a method's accepted token classes change (e.g. a method gated to
personal-only, or relaxed to allow shared/app), refresh:
- `context/cmc-consent-primitives.md` if the gate touches CMC triggers
  (consent-bearing). The Art.7 demonstrability + Art.32 security claims
  cite the gate.
- GDPR Art.7 + Art.32 scope rows in `scopes/gdpr.yml`.
- HIPAA-Security §164.312(a)(1) (access control) + §164.312(d)
  (person/entity authentication) in `scopes/hipaa-security.yml`.
- SOC 2 CC6.1 + CC6.2 + CC6.3 (logical access) in `scopes/soc2.yml`.
- ISO 27001 A.5.15 (access control) / A.5.16 (identity management) in
  `scopes/iso-27001.yml`.

Most recent: 2026-06-24, CMC gates refined in two waves:
1. (`open-pryv.io 7fb6e165`) `consent/{accept,scope-update,revoke}-cmc`
   initially gated to personal tokens only via the
   `cmc-accept-requires-personal-token` hook; `@pryv/cmc@3.8.0` shipped
   `requestAccept` / `requestAcceptUrl`; `app-web-auth3` shipped
   `/cmc-accept`.
2. (`open-pryv.io efe66b69`) Revoke un-gated from the personal-token
   set; instead `handleRevoke` runs `triggerAccess.canDeleteAccess(target)`
   (honours `selfRevoke` feature permission). Rejection:
   `cmc-revoke-forbidden`. `handleSystemScopeUpdate` gained the chain
   check (`canUpdateAccess` + `canCreateAccess`), defense in depth on
   top of the events.create gate. `@pryv/cmc@3.9.0` shipped
   `requestScopeUpdate` / `requestScopeUpdateUrl`; the old
   provider-side `requestScopeUpdate` renamed to `proposeScopeUpdate`
   (breaking, see lib-js CHANGELOG); `app-web-auth3` shipped
   `/cmc-scope-update`. No `requestRevoke` lib helper or `/cmc-revoke`
   page, revoke goes through the standard access-permission gate
   directly.

Compliance-side note updated in `context/cmc-consent-primitives.md`.

**2026-09-15, account delegation adds a new token class**: the delegate
personal token (owner-equivalent over another account, but unable to remove a
delegation; detach gated on a genuine login of the controlled account). Rows
refreshed: `gdpr.Art.7` + `Art.32`, `hipaa-security.164.312(a)(1)` +
`164.312(d)`, `soc2.CC6.1` / `CC6.2` / `CC6.3`, `iso-27001.A.5.15` / `A.5.16`.
See the `ACCOUNT-DELEGATION` entry in Section A + `context/delegation-model.md`.

**2026-09-18, delegation-derived tokens refused on grant paths**: a delegate
token, or an access granted through a delegation, may not write
`consent/accept-cmc`, `consent/scope-update-cmc` or `consent/request-cmc`
(`delegation-grant-requires-owner`), nor consent through OAuth2 (`403
access_denied`), because those grants would outlive the delegation. Rows
refreshed: `gdpr.Art.7` + `Art.32`, `hipaa-security.164.312(a)(1)`,
`iso-27001.A.5.15`; `context/cmc-consent-primitives.md` gates section. See the
follow-up under `ACCOUNT-DELEGATION` in Section A.

**2026-10-01, `consent/accept-cmc` leaves the delegation-gated set**
(open-pryv.io 2.0.0-rc.30, `9ba9c78c`): a delegate token may now write
`consent/accept-cmc` for the managed account, because the data grant it mints
records the delegation lineage (`clientData.delegation`) and the accept event
records the delegate (`content.approvedBy`, server-stamped); the grant is
deleted at detach and the requester notified. The gated set is now
`consent/request-cmc` + `consent/scope-update-cmc`
(`delegation-grant-requires-owner`) plus OAuth2 consent (`403 access_denied`).
An app or shared access the delegate granted is still refused on accept by the
CMC personal-token gate. Rows refreshed: `gdpr.Art.7`, `gdpr.Art.8`,
`gdpr.Art.32`, `hipaa-security.164.312(a)(1)`, `iso-27001.A.5.15`;
`context/cmc-consent-primitives.md` gates section;
`context/delegation-model.md`. See `CARER-CONSENT-LINEAGE` in Section A.

### B.9: OAuth2 authorization server (`open-pryv.io/components/oauth2/`)

New in `open-pryv.io 2.0.0-rc.8` (squash `8abb86a4`): a standards-based
OAuth2 authorization-code + PKCE authorization server, discovery
(`GET /.well-known/oauth-authorization-server`), `GET /oauth2/authorize`,
`POST /oauth2/token` (`authorization_code` / `refresh_token` /
`client_credentials`), curated-only client registration via
`bin/oauth-client.js`, exact-match redirect-URI validation (loopback-port
carve-out; fragments rejected), mandatory PKCE (S256), short-TTL access
tokens + single-use rotating refresh tokens, and a granular consent screen
whose durable record is a cross-account CMC data-grant.

Config lives under the `oauth:` block (`oauth.accessTokenTTL`,
`oauth.refreshTokenTTL`, `oauth.refreshTokenAbsoluteTTL`,
`oauth.clientRegistration.mode`, `oauth.requireAppAccountMfa`,
`oauth.grantTypesSupported`, `oauth.audAllowList`).

**Consent granularity extended 2026-09-17** (open-pryv.io
`feature/consent-permission-optionality`, released in 2.0.0-rc.21):
an `optIn` annotation joins `mandatory` in the consent lexicon, and the
ORIGINAL auth-request path (`POST {serviceInfo.access}`) gains both a consent
form and the server-side grant validation it never had. Rows refreshed:
`gdpr.Art.7` (§4 granular consent + the new validated legacy path, `tests:`
gains `RA71`, `RA72`, `PS11`, `PS13`) and
`context/cmc-consent-primitives.md` (new "Per-permission annotations"
section). ⚑ The cited test codes exist on that branch only, so this matrix
change lands with the merge, not before it.

Rows refreshed on this landing (delegated-app authN/authZ + consent):
- `hipaa-security.164.312(d)` (person/entity authentication) +
  `164.312(a)(1)` (access control).
- `soc2.CC6.1` / `CC6.2` / `CC6.3` (logical access, credential issuance,
  access modification/removal).
- `iso-27001.A.5.15` (access control) / `A.5.16` (identity management) /
  `A.5.17` (authentication information).
- `gdpr.Art.32` (security of processing) + `gdpr.Art.7` (conditions for
  consent, granular consent screen as a second demonstrability path).
- `context/cmc-consent-primitives.md` (consent-record inventory).

**Audit family refreshed 2026-07-21** (was deliberately deferred while
`components/oauth2/src/audit.ts` was a no-op stub): `oauth.*` audit
emission shipped in open-pryv.io `07b6d3b6` (merge of the audit-wiring
branch; consent lifecycle / code exchange incl. replay / token
lifecycle, user-less events syslog-only) and refresh-token
reuse-detection with chain revocation + `oauth.token.reuse_detected` in
`829f7238`. Rows updated accordingly: `hipaa-security.164.312(b)`,
`iso-27001.A.8.15`, `soc2.P6.2`, `gdpr.Art.30` (all now cite `OE07`
and/or describe the authorization-activity coverage). New config key:
`oauth.refreshReuseGraceSeconds` (replay grace window, default 10 s,
0 = strict).

**DPoP sender-constrained tokens landed 2026-07-21** (open-pryv.io
`9a874599`): RFC 9449 proof-of-possession, a client proves it holds a
key on each request, the issued token is bound to that key's thumbprint,
so a stolen DPoP token is useless without the private key. Opt-in and
additive (Bearer unchanged); ES256 only in v1. `hipaa-security.164.312(d)`
(person/entity authentication) now describes it; the same authentication /
logical-access family remains a refresh candidate as the property
strengthens token-theft resistance, walk `soc2.CC6.1`, `iso-27001.A.5.17`,
`gdpr.Art.32` when next touched. New config key: `oauth.dpop.clockSkewSeconds`
(proof freshness window, default 120 s). ⚠️ Deployment note captured in the
row + config: DPoP requires a trusted proxy that overwrites X-Forwarded-Host
/ -Proto. Client helper (lib-js) + operator revoke-by-key-thumbprint are
follow-ups, not yet shipped. *(Both landed since, see the next entry.)*

**DPoP client + operator revocation landed 2026-07-22/23**: the two
follow-ups above plus client-revoke live propagation:
- **lib-js DPoP client** shipped in `pryv` 3.10.0 (`SignedConnection`,
  `OAuth2Client({dpop: true})`), the client side of the
  `hipaa-security.164.312(d)` story is no longer pending.
- **Operator revoke-by-key** (open-pryv.io `4c0a5ade`): platform-wide
  tombstone by RFC 7638 thumbprint; live DPoP-bound tokens rejected on all
  cores within `oauth.dpop.keyRevokeCheckSeconds` (default 30 s); advisory
  per-client key inventory (`list-keys`). Recorded in
  `hipaa-security.164.312(d)`.
- **Client revocation reaches live tokens** (open-pryv.io `7b6321aa`):
  `revoke <clientId>` now cuts existing access tokens cluster-wide within
  `oauth.clientRevokeCheckSeconds` (default 30 s), incl. a socket.io sweep,
  previously issued tokens lived out their TTL. Recorded in `soc2.CC6.3`.
  Next-touch refresh candidates for the removal/termination family:
  `hipaa-security.164.308(a)(3)(ii)(C)`, `iso-27001.A.5.18`, `gdpr.Art.32`.

**Owner-only consent, 2026-09-18**: `POST /oauth2/authorize/accept` refuses a
token obtained through account delegation (`403 access_denied`, nothing
minted, `[OE27]`), since the OAuth access carries no delegation lineage and
would outlive the delegation. Rows refreshed: `gdpr.Art.7`,
`hipaa-security.164.312(a)(1)`, `iso-27001.A.5.15` (with the B.8 entry of the
same date). Released in open-pryv.io 2.0.0-rc.23.

### B.10 Observability emitted-surface changes

**Where the work lives**: `open-pryv.io`
`components/business/src/observability/`, and specifically
`schema.ts`. Any change to what may be emitted is a subprocessor
data-flow change and must walk the rows citing the
`observability-provider` primitive.

⚑ **The allow-list IS the control.** Telemetry is constructed from the
compile-time vocabulary in `schema.ts`; a field absent from it has no
code path to any backend. So the review question is narrow and
answerable: does this change add a metric name, an attribute key, an
enum value, or a new vocabulary entry? If yes, it needs the three-layer
proof (constants pinned by tests, the emitter's validation decisions
asserted for accepted *and* refused inputs, and wire-level enumeration
from a running deployment). If no, the posture is unchanged. Never
accept a posture claim proved only against our own exported object:
that is what produced the 2026-07-27 correction.

**Trigger pass outcome (2026-07-28)**: the vendor agent was removed and
the integration rebuilt as an allow-list emitter over OTLP/HTTP
(open-pryv.io `cf4cac7`). This supersedes the 2026-07-27 pass below
rather than extending it: enumerating what must not escape a collector
that sees everything is a control whose strength depends on that
collector's defaults, so the collector is gone. Emitted surface is now
per-method call counts, durations and error counts (labelled with a
registered method id, a status class and an `ErrorIds` code), service
and instance identity, and sanitized stack traces for server-side
faults; error messages, URLs, headers, parameters, bodies, usernames
and log records have no schema key. The outbound-host residual
(`peer.hostname` / `server.address`) is gone with the agent.

**Anonymity controls added the same day (operator ruling: privacy
outranks observability).** Error reports are aggregated by fault and
stamped at the reporting interval rather than the instant of failure,
and the instance id is the machine hostname, never derived from
`core.url` / `dns.domain` (user-facing hosts are `<username>.<domain>`
in DNS-ful deployments, so a URL-derived value was one config change
from putting a username on every datapoint). Reports carry a hard-coded
message chosen by error code. Verified by `[OBSP]`, which sweeps the
serialized payload for ten identifier strings pushed through the real
entry point, and `[OBSL]`, which proves the schema refuses an unsafe
stack even if the sanitizer produced one. **The claim to cite is
"anonymous by construction, with a residual correlation risk at very
low traffic volumes"**, never an unqualified guarantee.

Rows and docs refreshed:
`context/subprocessor-posture-and-data-flow.md` § "Observability
backend" (retains the dated correction of record) and its § 3 data-flow
guarantee, `docs/pryv-primitives.md` (`observability-provider` entry),
`docs/implementer-faq.md` (Layer 3 block, the subprocessor-category
bullet and the integrations table), `gdpr.Art.28` Layer 3 detail and
its integrations table, plus vendor-naming in
`context/rate-limiting-and-dos-protection.md`, `iso-27001.A.8.16`,
`mdr` PMS and `hipaa-security.164.308(a)(1)(ii)(D)`.

**No tier shifts.** `gdpr.Art.28` stays `facilitated`: the posture is
strengthened, not newly covered. The prose passages that describe only
the subprocessor relationship and "default disabled"
(`hipaa-security.164.314(a)(2)(ii)(B)`, the `gdpr.Art.28` DPO-visibility
note, `swiss-nlpd.Art.9`) remain accurate unchanged.

**Config keys**: `observability.otlp.endpoint` plus the PlatformDB rows
`otlp-endpoint` and `otlp-headers` (encrypted at rest). The agent-era
keys (`observability.newrelic.*`, `newrelic-license-key`,
`newrelic-high-security`, and the `NEW_RELIC_*` environment opt-ins)
are removed.

**Superseded pass (2026-07-27), kept for the audit trail**: the shipped
New Relic adapter had been inert since observability first shipped, so
enabled deployments ran on vendor defaults (no attribute exclusion,
obfuscated rather than suppressed SQL, application log records
forwarded). Fixed in open-pryv.io `4fc63d87` with identifier exclusions,
whole-path URL obfuscation, log forwarding off and a working
`high_security` opt-in. That fix was deployed and wire-validated before
the rebuild replaced it.

### B.11 New security-relevant config keys, response headers, platform DB and backup behaviour

**When it fires**: an open-pryv.io release adds a config key that
changes a security property (transport, headers, integrity checks), or
changes how responses are served, how the platform DB (rqlite) stores
and recovers its data, or what `bin/backup.js` carries. Walk the
transport rows (`hipaa-security.164.312(e)(*)`, `iso-27001.A.8.20` /
`A.8.24`, `soc2.CC6.6` / `CC6.7`, the encryption-in-transit bullet of
`gdpr.Art.32`), the application-security rows (`iso-27001.A.8.26`,
`soc2.CC6.8`), the availability / integrity rows (`gdpr.Art.32` §1(b),
`iso-27001.A.8.14` / `A.8.22`, `soc2.A1.2`,
`hipaa-security.164.308(a)(7)(ii)(B)`), and the backup rows
(`hipaa-security.164.308(a)(7)(ii)(A)`, `iso-27001.A.8.13`,
`hds.Activity.5`, `soc2.PI1.5`, the `backup-restore` primitive,
`context/operator-backup-coverage.md`). Add any new key to the rows'
`config_keys:` and its `[CODE]` tests to `tests:`.

**Walked 2026-10-03 for open-pryv.io 2.0.0-rc.34** (tag `2.0.0-rc.34`,
commit `9d0de352`). The rc.34 changes themselves shift no tier; ten
rows are re-tiered by the corrections listed after this list. No
`planned:` chips involved.
- **`hostedSites.<name>.hsts`** (`auto` | `always` | `never`; HSTS on
  hosted-site answers behind a TLS-terminating proxy; `[HSHT]`):
  `hipaa-security.164.312(e)(2)(ii)`, `iso-27001.A.8.20`, `soc2.CC6.7`,
  `gdpr.Art.32`. The core never adds HSTS to API answers on a separate
  API host.
- **Attachments with an active content type served in a sandbox**
  (`Content-Security-Policy: sandbox; default-src 'none'`; `[ACTY]`):
  `iso-27001.A.8.26`, `soc2.CC6.8`, `gdpr.Art.32`.
- **rqlite 10.5.1** (crash-safe, checksummed snapshot store; a node
  stops on a node-local SQLite error; one-way data directory upgrade;
  HTTP port 4001 unauthenticated, keep it closed): `gdpr.Art.32`,
  `iso-27001.A.8.14`, `iso-27001.A.8.22`, `soc2.A1.2`,
  `hipaa-security.164.308(a)(7)(ii)(B)`. The 2.0.0-rc.33 periodic
  platform DB integrity check (`storages.platform.integrityCheckIntervalMs`)
  is cited on `gdpr.Art.32` at the same time.
- **Backups carry high-frequency series data** (earlier backups held
  none; InfluxDB series now restore; manifest `coreVersion` real;
  `[BKSR]`, `[BKVR]`): `hipaa-security.164.308(a)(7)(ii)(A)` / `(B)`,
  `iso-27001.A.8.13`, `hds.Activity.5`, `soc2.A1.2`, `soc2.PI1.5`,
  `gdpr.Art.32`, the `backup-restore` primitive,
  `context/operator-backup-coverage.md`,
  `context/per-engine-isolation.md`, the implementer FAQ's engine-switch
  answer. The two backup rows that cited audit-API tests (`[AT04]`,
  `[AT05]`, `[AT06]`) as backup evidence now cite the backup tests.

**Corrections made in the same pass** (claims the code at 2.0.0-rc.34
did not support):
- **TLS was described as default-on TLS 1.3 with no plaintext path.**
  The core serves HTTPS only when `http.ssl.*` is configured
  (`letsEncrypt.*` keeps that certificate issued); otherwise it serves
  plain HTTP for a reverse proxy to front, and it sets no TLS version
  of its own (Node.js defaults). Re-tiered `implemented | high` to
  `configurable | medium` (multi-step setup, and behind a proxy Pryv
  carries none of the TLS): `hipaa-security.164.312(e)(1)`, `164.312(e)(2)(i)`,
  `164.312(e)(2)(ii)`, `iso-27001.A.8.20`, `soc2.CC6.6`, `soc2.CC6.7`,
  `diga.A1.2.1`, `hds.Activity.3.cryptography`. Wording only:
  `gdpr.Art.32`, `iso-27001.A.8.24` / `A.8.27`, `soc2.CC6.1`,
  `hds.Activity.3`, `hipaa-breach.164.400` / `164.402` / `164.402(2)`,
  `ccpa.1798.150`, the `letsEncrypt-integration` primitive,
  `context/privacy-by-design-and-default.md`.
- **Backups were described as unencrypted by design.** `bin/backup.js`
  has opt-in built-in encryption since 2.0.0-rc.5
  (`--recipient-pubkey` / `--encrypt-passphrase`):
  `hipaa-security.164.308(a)(7)(ii)(A)`, `iso-27001.A.8.13`, FAQ Q15
  and the places citing it.
- **Multi-core replication was described as protecting user data.**
  Only the platform DB is replicated; user data is core-affine:
  `hipaa-security.164.308(a)(7)(ii)(B)`, `iso-27001.A.8.13` / `A.8.14`,
  `soc2.CC7.5` / `A1.2`.
- **Operator backup integrity was attributed to `pg_dump` / SQLite WAL.**
  Corrected in `context/operator-backup-coverage.md`.
- **Malware rows re-tiered** `out-of-scope` to `facilitated | low |
  infrastructure` (attachment sandbox): `iso-27001.A.8.7`,
  `hipaa-security.164.308(a)(5)(ii)(B)`.

## Section C: Maintenance reminders

- **Quarterly review**: run a full pass of authored rows and check
  that `pryv_primitives` + `tests:` + `config_keys:` references still
  resolve. The validator catches most stale references at CI time;
  this pass catches semantic drift (e.g., a primitive whose meaning
  evolved).
- **At each gap-probing sweep close**: full review of this file
  against the current matrix state, confirm every Section A entry
  is still accurate + every shipped item has been removed.
- **At each new gap-probing Q close** (per
  [[feedback-implementer-perspective-gap-probing]]): if the Q
  produced a new backlog slug, add a Section A entry alongside the
  proposal mirror + planned chips.
