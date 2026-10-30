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

**Re-checked 2026-10-29 for the alias and username-change hardening**
(open-pryv.io `4547b32a`, released in 2.0.0-rc.66). The claim now holds after a backup and restore (`[BKAL1]`)
and on a single core answering DNS (`[ALRT1]`); a custom account field
named `username` or `usernameChangeCount` is refused at boot (`[SDB3]`);
aliases per account are bounded by `accesses.maxAliasesPerAccount`
(`[AL12]`). Every row citing the primitive (the six above plus
`soc2.C1.1`) now states the limit: the alias hides the username from the
holder, it does not stop a holder who guesses the username from
confirming it (lifted only when alias-bound addressing ships; no row
claims it before). `iso-27701.A.7.4.5` overclaim corrected (the alias is
not end-of-processing de-identification). Stale "planned" mentions
corrected in `docs/implementer-faq.md`,
`context/privacy-by-design-and-default.md`,
`context/data-masking-projection-vs-transformation.md`,
`context/data-retention-operator-owned.md` (the alias is not an
account-level anonymisation verb; `audit.onUserDelete: pseudonymise` is
not implemented). No tier change, no chips.

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

### `CLOCK-SKEW-CLUSTER-CHECKS`: SHIPPED 2026-10-05

**Where the work lived**: `open-pryv.io` `5266b697` (released after 2.0.0-rc.34):
`components/business/src/bootstrap/consumer.ts` (join check, flag
`--bootstrap-clock-skew-seconds`), `components/business/src/acme/` +
`components/api-server/src/server.ts` (certificate validity window, config
key `cluster.clockSkewSeconds`). Chip discharged.

| Scope | Ref | Kind | Impact | Applied |
|---|---|---|---|---|
| iso-27001 | A.8.17 | feature | medium | row moved Out-of-scope → F:Awareness \| Low |

Proposal: `proposals/clock-skew-cluster-checks.md` (Status: shipped).

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

**Trigger fired (2026-10-13):** open-pryv.io 2.0.0-rc.47 introduced in-code
budgets keyed on the client address read through `http.trustedProxies` only,
so the page's client-IP paragraph needs that refresh (developer-site work,
outside this repo). The matrix rows were updated under `SECURITY-REVIEW-2026`;
no chip involved.

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

### `SECURITY-REVIEW-2026` (code-level security review of open-pryv.io; fixes SHIPPED in 2.0.0-rc.40 to 2.0.0-rc.51; public report published 2026-10-14; rows walked 2026-10-13 and 2026-10-14): DISCHARGED

**What it is**: a systematic code-level security review of the open-pryv.io
source by its maintainers (2026-06 to 2026-10), each finding confirmed by a
second review and fixed with regression tests. The fixes shipped in
open-pryv.io 2.0.0-rc.40 to 2.0.0-rc.51 (2026-10-07 to 2026-10-14, all
deployed on pryv.me by 2026-10-14); the public record is each release's
`CHANGELOG-v2.md` section and the public report. Context note:
`context/code-security-review-2026.md` (methodology, scope, fix areas, what
it gives the implementer and what stays theirs). No `planned:` chips, no
proposal mirror: shipped work, and no backlog slug of Section A was
discharged by it (see "Backlog slugs checked" below).

**Public report: published 2026-10-14** as `SECURITY-AUDIT.md` in the
open-pryv.io repository
(https://github.com/pryv/open-pryv.io/blob/master/SECURITY-AUDIT.md),
revision 1, covering 2.0.0-rc.40 to 2.0.0-rc.51. On 2026-10-14 every row that
said "forthcoming" was switched to the published report (URL and date), and
its fix range extended to 2.0.0-rc.51: `hipaa-security.164.308(a)(8)`
(overview and detail; "run 2.0.0-rc.51 or later"), `gdpr.Art.32`,
`iso-27001.A.8.8`, `A.8.28`, `A.8.29`, `9.2`, `soc2.CC4.1`, `CC7.1`,
`diga.A1.2.7`, `hds.Activity.3`, and the context note (header, fix areas,
counts at revision 1). `grep -rn "SECURITY-AUDIT.md" scopes context` lists
them. The slug is discharged: nothing is pending on the matrix side. The
report is revised with every release that carries a security fix; a new
revision is a Section B walk of that release, and the rows need a change only
if the cited release range or the report's claims change materially.

**Periodic-evaluation evidence (rows walked, no tier shift)**:

| Scope | Ref | What changed |
|---|---|---|
| hipaa-security | 164.308(a)(8) | overview names the review; new detail: the review as a technical-evaluation input, what stays the implementer's (running the fixed release, evaluating the deployment, independence) |
| gdpr | Art.32 | §1(d) evidence list gains "Code-level security review" |
| iso-27001 | A.8.8 | new detail: vulnerabilities in Pryv's own code, the implementer's upgrade duty, image hygiene (no `curl` since rc.42, no `npm` / `npx` since rc.50) |
| iso-27001 | A.8.28 | overview cites the review as secure-coding evidence |
| iso-27001 | A.8.29 | new detail: security testing of the platform code; independent testing stays the implementer's |
| iso-27001 | 9.2 | review listed among artefacts an internal auditor reviews |
| soc2 | CC4.1 | new detail: a separate evaluation of the software component |
| soc2 | CC7.1 | overview: image hygiene; new detail: code-level vulnerabilities and the release the implementer runs |
| diga | A1.2.7 | new detail: the review does NOT satisfy the independent penetration test; how it helps the test |
| hds | Activity.3 | detail cites the review as vulnerability-management evidence |

Walked without change: `iso-27001.A.8.25` (SDLC transparency already
claimed; A.8.28 / A.8.29 carry the review), `iso-27001.A.8.34` (the review
read source code, no operational system was tested), `soc2.CC4.2`
(deficiency communication is the implementer's procedure). The matrix has no
`iso-27001.A.5.35` (independent review) row; the review would not be evidence
for it anyway (performed by the maintainers).

**Section B walks for 2.0.0-rc.46 to 2.0.0-rc.50** (each release's
`CHANGELOG-v2.md` entry read in full). No tier shift; `reviewed_at` left
unchanged so the added prose awaits the next review pass.

- **B.11, rate and resource limits** (rc.47, rc.50; new config keys
  `auth.passwordAttempts.*`, `http.trustedProxies` as the client-address
  source, `access.maxLiveRequestsPerIp`, `access.unopenedRequestTtl`,
  `services.mfa.sessions.maxPendingPerUser`, `limits.batch.maxTotalItems`,
  `uploads.maxFiles`, `socketIO.maxMessageBytes`,
  `eventFiles.previewsMaxInputPixels`, `eventFiles.previewsRenderConcurrency`,
  `services.mfa.methods.sms.sendLimits.perCorePerHour`; rc.46
  `dns.tcpMaxConnections`). **Correction**: `hipaa-security.164.308(a)(5)(ii)(C)`
  said Pryv does not throttle password logins in-process; since rc.47 it
  delays failed passwords per account and budgets them per client address
  across all cores. Rewritten: `context/rate-limiting-and-dos-protection.md`
  (stance is now "edge for general shaping, targeted in-code budgets"),
  FAQ Q6 (dated update), `docs/pryv-primitives.md` open item.

  | Scope | Ref | What changed | Tests added |
  |---|---|---|---|
  | hipaa-security | 164.308(a)(5)(ii)(C) | password-guessing paragraph corrected; config keys added | `CEPB1`, `CEPI1`, `CEPI2`, `CEDB1` |
  | hipaa-security | 164.312(d) | new paragraph: password delay, per-address budget, non-batchable credential methods, per-hash salt | `CEPB1`, `CEPI1`, `CEDB1`, `PWSL1` |
  | iso-27001 | A.8.5 | new paragraph: passwords, SMS send budgets (per core since rc.50), pending MFA sessions per account | `CEPB1`, `CEPI1`, `CEDB1`, `PWSL1`, `MSSL1`, `MSSL11`, `MCPU1` |
  | iso-27001 | A.8.21 | "deliberately operator-side" paragraph rewritten: edge for general shaping, in-code budgets listed, `http.trustedProxies`, embedded DNS hardening | `CEPB1`, `CEPI1`, `CEPI2`, `CEDB1`, `CEDB5`, `RAI1`, `EGLV1`, `MPLM3`, `SION4`, `IVCK1`, `WHTT1`, `PVPX1`, `DNR01` |
  | iso-27001 | A.8.6 | new detail: resource bounds inside the core | `CEDB5`, `CEDB6`, `EGLV1`, `EGLC1`, `MPLM3`, `MPLD1`, `SION1`, `SION4`, `PVPX1`, `PVRQ1`, `WRBO1` |
  | diga | A1.4.3 | new detail: resource bounds and worker restart backoff for availability | (none) |

- **B.11, logging** (rc.47, rc.49, rc.50: credential masking extended to
  `Error` objects and debug output, more credential names, URL user info,
  authorization-code values, validation errors without the rejected value;
  log files `0640`; keyed admin-key fingerprint in the boot log;
  `unexpected-error` answered with a reference). `iso-27001.A.8.15` gains a
  "server logs" paragraph and `config_keys: [logs.file, logs.fileSync]`;
  tests `BLGM1`..`BLGM4`, `RDL5`, `RDL8`, `RDLA`, `RAL1`, `UNXR1`, `PLFP1`,
  `BLFM1`. Walked without change: `hipaa-security.164.312(b)` and
  `soc2.P6.2` (they describe the audit log, which these changes do not
  touch), `iso-27001.A.8.12` (its claim is about credentials kept out of URLs,
  still true and now reinforced; left for the next review pass).
- **B.11, integrity** (rc.50: `integrity.algorithm` limited to `sha256` /
  `sha512`; the values are unkeyed checksums). `hipaa-security.164.312(c)(2)`:
  overview qualifies the hash, new detail paragraph on what it proves,
  `config_keys: [integrity.algorithm]`, test `CVIA1`. Walked without change:
  `hipaa-security.164.312(c)(1)`, `soc2.PI1.5` (they cite the hash as an
  accuracy signal, not as tamper-proof).
- **B.11, response headers** (rc.49: `Cache-Control: no-store` and
  `Vary: Origin` on JSON answers) and request parsing (rc.50: hosted-site
  proxy paths, query-string keys): `iso-27001.A.8.26` gains a third example,
  tests `HTC1`, `HSPE1`, `QPR2`. Walked without change: `soc2.CC6.8`,
  `gdpr.Art.32` (no claim about caching or parsing).
- **B.11, backup and restore** (rc.47 plaintext refusal when a secret is
  given, `--allow-plaintext` / `--require-encrypted`; rc.49 restore refusals of
  unsafe names and symbolic links, files `0600` / directories `0700`; rc.50
  plaintext warning, `--passphrase-file`, refusal of reserved names and of a
  username now held by another account). **Correction**: recipient-key backup
  encryption was described as detecting tampering; the rc.47 note states it
  gives confidentiality, not authenticity. Updated:
  `hipaa-security.164.308(a)(7)(ii)(A)`, `iso-27001.A.8.13` (tests `BKPW1`,
  `BKPF1`, `BKRE1`, `BKRE4`, `BKRS1`, `BKRS4`, `BKRN1`, `RSOW1`), the
  `backup-restore` and `backup-payload-encryption` primitives,
  `context/operator-backup-coverage.md`. Also: the `bin/breach-scope.js
  --output` report is written `0600` (rc.49), cited on `gdpr.Art.33`
  (`BRSC6`). Walked without change: `hds.Activity.5`, `soc2.A1.2`,
  `soc2.PI1.5`, `hipaa-security.164.308(a)(7)(ii)(B)` (no claim about restore
  input checks or file modes).
- **B.1, erasure family** (rc.46 SQLite audit `keep`; rc.47 deletion ends
  delegation and CMC relationships, erases series under every name, destroys
  reset requests; rc.50 webhooks stop, late series dropped, refusal while the
  account is the delegate of an account without email; new routes
  `POST /<username>/delegations/controlled-side/release` (rc.47) and
  `.../controlled-side/status` (rc.50), both control-access only).
  **Correction**: `gdpr.Art.17` and `hipaa-security.164.316(b)(2)(i)` carried
  the "SQLite `keep` caveat", fixed in rc.46. Updated: `gdpr.Art.17` (new
  "What an account deletion reaches" list; tests `DKP1`, `DLN1`, `DLN4`,
  `DLLW1`, `DADL02`, `CN82`, `DLWH1`, `RPLC13`, `DADL08`),
  `hipaa-security.164.316(b)(2)(i)` (`DKP1`), `iso-27001.A.8.10` (`DLN1`,
  `DLN4`, `DLLW1`), `proposals/audit-on-user-delete.md` (follow-up note).
  Walked without change: `ccpa.1798.105`, `pipeda.Principle.4.5`,
  `swiss-nlpd.Art.32`, `soc2.CC6.5`, `soc2.P4.3`, `soc2.C1.2` (they cite the
  erasure call and engine semantics, not the residues fixed here). The DSAR,
  rectification and restriction families cite none of the changed surfaces.
- **B.8**: no change to the token classes of consent-bearing methods. The
  credential methods refused inside batches and over socket.io (rc.47) are
  credential entry points, recorded under the rate-limit rows above; deletion
  records restricted to accesses reading the whole store and the account root
  stream not grantable for writing (rc.50) tighten
  `hipaa-security.164.312(a)(1)` / `soc2.CC6.1` claims that already hold.
- **B.9**: PKCE values must have the RFC 7636 form (rc.50, `PKCF1`, `PKCV1`),
  signed `state` with a non-ASCII signature refused (rc.47, `OE29`); the rows
  already claim mandatory S256 PKCE, no change.
- **B.2, B.3, B.4, B.5, B.6, B.10**: none (no event-type format, engine,
  primitive, major version or scope; no change to the observability schema).
  **B.7**: a join now writes `bootstrap-config.yml` instead of replacing
  `override-config.yml` (rc.50), and one API worker runs the webhooks service
  (rc.50); no row cites either.

**Section B walk for 2.0.0-rc.51** (deployed 2026-10-14; `CHANGELOG-v2.md`
`## 2.0.0-rc.51` read in full). No tier shift; `reviewed_at` unchanged.

- **B.11, backup and restore** (incremental backups form a chain:
  `incrementals/<runId>/`, `chain.json`, `--through-run`,
  `--allow-incomplete`, `--inspect`; per-run encryption envelope and decrypt
  script; a directory damaged by an earlier release's incremental run is
  refused on restore; on SQLite a running core follows a replaced account
  file). The pre-rc.51 incremental behaviour is an operator step (inspect,
  take a new full backup) recorded on the rows. Updated:
  `hipaa-security.164.308(a)(7)(ii)(A)` (overview operator step; detail
  "Incremental backups form a chain"), `hipaa-security.164.308(a)(7)(ii)(B)`
  (restore point per run, refusals, SQLite file follow), `iso-27001.A.8.13`
  (overview operator step; detail "Incremental chain"), `hds.Activity.5`,
  `soc2.A1.2` (detail), `soc2.PI1.5` (completeness of incrementals), the
  `backup-restore` and `backup-payload-encryption` primitives,
  `context/operator-backup-coverage.md` (new section). Tests added: `BKC1`
  to `BKC7`, `BKCC1`, `BKCS1`, `BKCU1`, `BKCE2`, `BKIC1` to `BKIC4`,
  `UASF1`, `UASF2` (per row). `BKC8` and `BKCS2` (decrypt script over a
  chain) live in `open-pryv.io/storages/test/`, outside the validator's test
  glob, so they are cited in prose only where needed and not in `tests:`.
  Walked without change: `gdpr.Art.32` (§1(c) restorability claim holds and
  is now stronger; the backup key models are unchanged).
- **B.1, erasure family** (a restore no longer re-creates an account deleted
  between whole-core runs of a chain; the earlier runs still hold it until
  retired). Updated: `gdpr.Art.17` (backup-chain paragraph; `BKCU1`,
  `BKIC4`). Walked without change: `iso-27001.A.8.10` (defers to Art.17's
  backup notes), `ccpa.1798.105`, `pipeda.Principle.4.5`, `soc2.CC6.5`,
  `soc2.P4.3`, `soc2.C1.2` (they cite engine semantics and backup rotation,
  which still hold: chain retention is part of rotation).
- **B.11, config keys** (`custom.systemStreams.other` with any entry refused
  at boot and by `bin/check-config.js`; tests `ESOT1`, `ESOT2`, `ESOT3`). No
  row cites the `other` section, so no row changed. **Correction** made in
  the same pass: four places named the account-field schema
  `customExtensions.systemStreams`, a key that does not exist (the key is
  `custom.systemStreams.account`, the only custom system streams a core now
  accepts): `docs/implementer-faq.md` Q29,
  `context/client-data-conventions.md`,
  `context/cross-border-platformdb-implications.md`,
  `context/special-categories-operator-facilitated.md` (the last one also no
  longer suggests baking the data stream tree into system streams).
- **MFA** (a login refused after its MFA session opened ends that session;
  two concurrent failed activations keep the enrolment pending before them).
  Updated: `iso-27001.A.8.5` (the pending-session cap paragraph and the
  enrolment paragraph; `MLSX1`, `MACC2`). Walked without change:
  `hipaa-security.164.312(d)` (no claim about pending MFA sessions or failed
  activations).
- **Not row-relevant**: SQLite audit and event reads walk the time index
  (issue #156: a large audit read no longer stalls the API worker; results
  unchanged; an availability fix no row claimed against); Docker Hub
  `latest` follows release tags (`iso-27001.A.8.32` cites image
  SHA-pinning, unaffected); `bin/backup.js --help`.

**Not yet walked: 2.0.0-rc.40 to 2.0.0-rc.45.** Their changes are cited above
only as review evidence; the Section B walk of the behaviour they changed is
still to do. Candidates, from their release notes: B.11 config keys
(`caching.accessMaxAgeSeconds`, `webhooks.allowedPrivateHosts`,
`webhooks.requestTimeoutMs`, `services.mfa.methods.sms.*` code and send
limits, `services.mfa.allowLoginWhenMethodInactive`,
`storages.engines.rqlite.httpBindAddr`, `auth.trustedApps` origin matching,
boot refusal of placeholder secrets, a multi-core node without Raft TLS
refusing to start, the image running as a non-root user, `pryv-config.yml`
written `0600`); B.8 / access control (delegated tokens no longer see the
owner's tokens, MFA changes need a genuine login and a step-up, the
`webhooks` feature permission, single-event reads applying the `events.get`
exclusions); password reset hashing, single use and session revocation
(rc.43). Likely rows: `iso-27001.A.8.5` / `A.5.17` / `A.8.20` / `A.8.21`,
`hipaa-security.164.312(d)` / `164.312(a)(1)` / `164.312(e)(1)`,
`soc2.CC6.1` / `CC6.6`, `gdpr.Art.32`, `context/webhooks-signal-only.md`.
Incidental coverage from the 2.0.0-rc.56 walk (2026-10-20, Section B.11):
`webhooks.allowedPrivateHosts` is now named on `iso-27001.A.8.20`,
`gdpr.Art.32` and `context/cmc-consent-primitives.md`, only as the grammar
`cmc.allowedPrivateHosts` shares, and `iso-27001.A.8.20` states that webhook
deliveries apply the same address rules. The webhook destination guard
itself (its key in `config_keys:`, its tests, `context/webhooks-signal-only.md`)
is still to walk with the rest of rc.40 to rc.45.

**Backlog slugs checked, no chip changed**: `AUDIT-LOG-CHAINING` (the only one
of the review-adjacent slugs still carrying chips; nothing shipped toward a
chain), `RATE-LIMITING-RECIPES`, `BREACH-SCOPE-TOOL`, `PLATFORMDB-PII-HASHING`,
`PLATFORMDB-AT-REST-ENCRYPTION`, `VULNERABILITY-DISCLOSURE-PROGRAM` (all
already shipped or superseded, chips discharged earlier). Two follow-ups for
the `RATE-LIMITING-RECIPES` page on the developer site: its "How Pryv reads
the client IP" paragraph must now cover `http.trustedProxies` (the per-address
budgets ignore `X-Forwarded-For` from an unlisted proxy), and its route table
can note the in-code budgets the proxy limits now sit in front of.

### `GROUP-ACCOUNTS-CMC` (SHIPPED in open-pryv.io 2.0.0-rc.53 `61fb28dd`, 2026-10-15; all 15 chips discharged, rows walked 2026-10-15): DISCHARGED

**Where the work lives**: `open-pryv.io/components/cmc/` (membership
role and offer constraints, the member-access mint, the offboarding sweep and
its ledger, the patient-side stamp on child accesses), the `events.create`
response, `components/delegation/` (detach ends the memberships a delegate
approved), data-types `consent/*` formats, `@pryv/cmc`, the reference
account app (consent notice, audit attribution, memberships view) and a
reference static member app. Delivered by a scheduled open-pryv.io release,
not a backlog file, so the chips carry no `backlog:` key. Public issue:
https://github.com/pryv/open-pryv.io/issues/158. Tracking card:
https://github.com/orgs/pryv/projects/5?pane=issue&itemId=271216458&issue=pryv%7Copen-pryv.io%7C158
(the `tracking_url` of every chip). Falls under **B.1** (new response field on
`events.create`, new error ids, new config keys), **B.2** (two new
`consent/*` formats, a new `request.membership` field) and **B.8** (a new
consent-bearing trigger with its own token-class gate, a new access role);
the pre-release walks are recorded under each category below.

A team sharing one Pryv account (practice, research team, bridge) reaches
patient data through CMC without an implementer backend: members are their
own accounts and join through a membership request the group accepts; the
group's core mints a short-lived, server-stamped access per member on the
patient's core from the patient's delegable grant, and sweeps those accesses
when the membership ends. Context: `context/workforce-access-patterns.md`
Pattern 3, `context/cmc-consent-primitives.md` "Group accounts",
`context/delegation-model.md` (delegates as membership administrators),
implementer-FAQ Q5 (third mechanism). Proposal:
`proposals/group-accounts-cmc.md`.

**Chips added 2026-10-14** (detail paragraphs marked "Planned, not yet
released"; no tier shift; no `tests:` or `config_keys:` added, since nothing
has shipped; `reviewed_at` unchanged):

| Scope | Ref | Kind | Impact | What will change |
|---|---|---|---|---|
| hipaa-security | 164.308(a)(3)(ii)(C) | feature | medium | member termination swept by the platform on every patient account |
| hipaa-security | 164.308(a)(4)(ii)(B) | feature | low | membership accept as the recorded authorization act |
| hipaa-security | 164.308(a)(4)(ii)(C) | feature | low | establish / narrow / remove through the membership; review from the group account |
| hipaa-security | 164.312(a)(1) | feature | low | new derived access path and its three bounds |
| hipaa-security | 164.312(a)(2)(i) | feature | medium | member identified by their own account, server-stamped (new `detail` also states Pattern 1's `callerId` caveat, shipped) |
| hipaa-security | 164.312(b) | feature | low | per-member attribution on both trails |
| iso-27001 | A.5.15 | feature | low | access-control rule for member accesses |
| iso-27001 | A.5.16 | feature | low | member identity lifecycle |
| iso-27001 | A.5.18 | feature | low | rights follow the membership (new `detail`) |
| iso-27001 | A.6.5 | feature | low | technical removal at departure (new `detail`) |
| gdpr | Art.7 | feature | low | delegable grant stated to the patient; member accesses under the grant; withdrawal ends them |
| gdpr | Art.29 | feature | low | each member's processing scoped and attributed under the grant the controller (or its processor) holds from the data subject (new `detail` also states Pattern 1, shipped) |
| gdpr | Art.32 | feature | low | access-control bullet |
| soc2 | CC6.2 | feature | low | issue after approval, remove with the membership |
| soc2 | CC6.3 | feature | low | least privilege per member and patient, still no roles |

**At release**: discharge every chip above; rewrite each "Planned" paragraph
as shipped with the release name, commit and `[CODE]` test codes; add
`cmc.memberAccess.*` and `cmc.retryLoop.enabled` to `config_keys:` where the
row cites behaviour they govern (164.308(a)(3)(ii)(C), 164.312(a)(1)); walk
the rows listed in the proposal under "Rows to walk at release without a
chip"; turn the "PLANNED" headings of the three context notes into shipped
text; turn the planned paragraph under implementer-FAQ Q5 into shipped
text. Consistency with
`ACCOUNT-DELEGATION` and `CARER-CONSENT-LINEAGE`: this work uses the
delegate accept they shipped (a delegate may accept a membership, which
carries the lineage and ends at detach unless kept) and does not lift the
owner-only refusal on `consent/request-cmc` (members, not delegates, publish
the group's patient invites); neither entry needs a change unless the
release alters those rules.

**SHIPPED** in open-pryv.io 2.0.0-rc.53 (release commit `61fb28dd`,
2026-10-15; feature commits `0f21ea91` member role and membership offer,
`0c176116` member access mint, `96e6e07e` offboarding, `a9c2fd59` every
access deletion through the route's deletion, `155367dd` integration suite,
`196de2c5` docs; review rounds `6823813d`, `34de3219`, `fb9cc5db`,
`c73d9847`, `ab48bb19`, `718a5dab`, `1fce65a5`). The withdrawal cascade it
depends on shipped in 2.0.0-rc.52 (`96af58ad`, 2026-10-14). Tests: in-process
integration `[CMCGA]` (`components/api-server/test/cmc-group-accounts.test.js`,
`[GA01]`..`[GA42]`), unit `[CMCMB]` (`[MB*]`, member role and offer), `[CMCMA]`
(`handleMemberAccess.test.js`; rows cite `[CMCMA]` and its two codes that
no other suite uses, `[MA41]`, `[MA50]`), `[CMCMR]` (`[MR*]`, offboarding),
the adapter cascade `[MAAC]`, revoke-notice queueing `[HR25]`, `[HR26]`,
`[DH25]`, `[DH26]`, `[RQ20]`..`[RQ29]`, late-notice protection `[CIR26]`,
`[CIR27]`, delegation guard exemption `[DDG04]`. Shipped differences from
the design the chips described: the mint is refused to the group's personal
and delegate tokens (membership accesses only); one mint in flight per
membership and patient, per worker process; named data streams only; a
member access never outlives its membership; every CMC and delegation
teardown is now the `accesses.delete` deletion (deletion records). Not
released at the walk, so the rows name them by release rather than as
shipped: the reference account app's consent notice, memberships view and
audit display (app-web-user-account, first release after 0.21.0), `@pryv/cmc`
3.21.0, the reference member app.

Rows walked 2026-10-15 (chips discharged, "Planned" paragraphs rewritten as
shipped with the release, commit and test codes; `CMC` added to
`pryv_primitives` where missing; no tier shift; `reviewed_at` left unchanged
so the rewritten prose awaits the next review pass):

| Scope | Ref | What changed | Tests added | Config keys added |
|---|---|---|---|---|
| hipaa-security | 164.308(a)(3)(ii)(C) | termination swept by the group's core on every patient account, residual retry and bound, group-account deletion | `CMCGA`, `CMCMR`, `GA20`..`GA23`, `GA40`, `GA41` | `cmc.retryLoop.enabled`, `cmc.memberAccess.maxTtl`, `cmc.memberAccess.sweepIntervalMs` |
| hipaa-security | 164.308(a)(4)(ii)(B) | membership accept as the recorded authorization act; offer constraints; no self-approval | `CMCMB`, `GA01`, `GA02`, `MB30`..`MB32`, `MB34` | |
| hipaa-security | 164.308(a)(4)(ii)(C) | establish / narrow (incl. team-stream deletion) / review from the group account; deletion record; records owner-only | `CMCMR`, `GA01`, `GA22`, `GA41`, `GA42`, `MR27`, `MR33` | |
| hipaa-security | 164.312(a)(1) | member access path and its bounds as shipped; Known gap rewritten as fixed in 2.0.0-rc.52 | `MAAC`, `CMCGA`, `CMCMA`, `GA01`, `GA10`..`GA12`, `GA14`, `GA15`, `GA24`, `GA31`, `MB10`, `MB12`, `MB13` | `cmc.memberAccess.*` (six keys), `cmc.retryLoop.enabled` |
| hipaa-security | 164.312(a)(2)(i) | server-stamped member identity; name-only fallback against older patient cores | `GA10`, `GA13`, `MB10`..`MB12` | `cmc.memberAccess.allowNameOnly` |
| hipaa-security | 164.312(b) | per-member attribution on both trails; deletion records; account app display named by release | `GA10`, `GA20`, `GA22`, `GA30`, `MA41` | |
| iso-27001 | A.5.15 | access-control rule for member accesses as shipped | `CMCGA`, `CMCMA`, `GA12`, `GA14`, `GA15`, `GA20`, `GA24`, `MB10` | `cmc.memberAccess.defaultTtl`, `minTtl`, `maxTtl` |
| iso-27001 | A.5.16 | third pattern shipped | `CMCGA`, `GA01`, `GA10`, `GA20`, `GA21`, `GA23` | |
| iso-27001 | A.5.18 | rights follow the membership | `CMCMR`, `GA01`, `GA10`, `GA20`, `GA22`, `GA41`, `MR25` | |
| iso-27001 | A.6.5 | technical removal at departure, residual bound | `CMCMR`, `GA20`..`GA23` | `cmc.retryLoop.enabled`, `cmc.memberAccess.maxTtl` |
| gdpr | Art.7 | group-account consent paragraph shipped (consent notice named by account-app release); §3 withdrawal: soft-delete teardowns since rc.53, Known gap rewritten as fixed in rc.52, revoke notices re-sent (issue 157), account-deletion notices not; ten formats | `MAAC`, `GA10`, `GA24`, `GA30`, `MB10`, `HR25`, `DH25`, `RQ20`..`RQ23`, `CIR26`, `CIR27` | `cmc.retryLoop.enabled` |
| gdpr | Art.29 | member processing scoped and attributed under the subject's grant | `CMCGA`, `GA01`, `GA10`, `GA12`, `GA15`, `GA20` | |
| gdpr | Art.32 | access-control bullet shipped; offers cannot ask the plugin-managed streams; invite closed from its own scope | `GA10`, `GA12`, `GA14`, `GA20`, `CN71`, `CN72`, `MB35`, `VC09` | |
| soc2 | CC6.2 | credential issued after approval, returned once, removed with the membership | `CMCGA`, `GA01`, `GA10`..`GA12`, `GA20`, `GA22`, `GA23`, `MA50` | |
| soc2 | CC6.3 | least privilege per member and patient; membership least privilege | `CMCMA`, `GA02`, `GA12`, `GA14`, `GA15`, `GA20`, `MB21`, `MB34` | |

Rows walked without a chip (the proposal's list, plus the rows the
teardown and notice changes touch):
- `gdpr.Art.8`: two "hard delete" / "best-effort" statements on a
  delegation detach rewritten (deletion record since rc.53; notice re-sent).
- `gdpr.Art.17`: account deletion extended (a deleted group account's member
  accesses deleted on the patient cores first; account-deletion notices sent
  once, not re-sent); tests `GA40`, `MR28` added.
- `hipaa-security.164.312(d)`, `soc2.CC6.1`: unchanged (members authenticate
  as their own accounts through the existing sign-in).
- `iso-27701.A.7.4.7`: unchanged (the new events are CMC records, already
  covered).
- DSAR and accounting-of-disclosures families (`gdpr.Art.15`, `soc2.P5.1`,
  `P6.7`, `hipaa-privacy.164.524`, `164.528`, `pipeda.Principle.4.9`,
  `ccpa.1798.110`, `swiss-nlpd.Art.25`): unchanged.
- Erasure family other than `gdpr.Art.17` (`ccpa.1798.105`,
  `pipeda.Principle.4.5`, `swiss-nlpd.Art.32`, `soc2.CC6.5`, `P4.3`,
  `C1.2`): unchanged (their text does not detail relationship teardown).
- B.2 rows (`gdpr.Art.20`, `hipaa-privacy.164.514`, `soc2.PI1.1`, `PI1.2`,
  `P7.1`): unchanged.
- `iso-27701.A.7.3.4` (consent withdrawal, "symmetric teardown"):
  unchanged (no hard-delete or delivery claim).

Context notes: `context/workforce-access-patterns.md` (Pattern 3 rewritten as
shipped with the differences above and a "Versions" paragraph; Pattern 2's
Known gap rewritten as fixed in rc.52; tables), `context/cmc-consent-primitives.md`
(ten formats; offers cannot ask the plugin-managed streams; "Group accounts"
as shipped; teardown record shape since rc.53; revoke-notice delivery, issue
157; code references), `context/delegation-model.md` (delegates as membership
administrators as shipped; detach deletion and notice). Implementer-FAQ Q5:
third mechanism as shipped. Section B: release walks recorded under B.1, B.2,
B.8 and B.11. Section C: the 2026-10-14 Known-gap clause discharged.
Consistency with `ACCOUNT-DELEGATION` and `CARER-CONSENT-LINEAGE`: their
rules hold; the one addition is the delegation grant guard's exemption for
`consent/request-cmc` written through a delegate-approved membership
`[DDG04]`, which does not let a delegate publish an offer; their entries'
dated "hard delete" wording is history and stays.

### `ACCOUNT-AUTO-DELETION` (PLANNED: implemented on an open-pryv.io feature branch, not released; chips added 2026-10-29)

**Where the work lives**: open-pryv.io branch `feat/account-auto-deletion`
(not merged): `components/business/src/autoDeletion/` (`config.ts` the
`account.autoDeletion` block and its boot check, `state.ts` per-account
setting / bookkeeping / encrypted beneficiary identity, `deadline.ts` the
schedule engine, `sweep.ts` the per-core sweep),
`components/business/src/accesses/accountActivity.ts` (activity = personal +
app accesses, delegate use counted and reported),
`components/api-server/src/methods/accountAutoDeletion.ts` (`account.getAutoDeletion`
/ `account.setAutoDeletion`, `GET` / `PUT /{username}/account/auto-deletion`),
`components/api-server/src/methods/helpers/autoDeletionSweep.ts` (the sweep
in the designated API worker, the `account.autoDeletion.erase` audit row),
`auth.login` recording `lastUsed`, three mail templates
(`account-deletion-scheduled`, `-reminder`, `-blocked`, en / fr). Operator
page `customer-resources/account-auto-deletion` on the dev-site2 branch of the
same name (not published). Delivered by a scheduled open-pryv.io release, not
a backlog file, so the chips carry no `backlog:` key; no public issue yet.
Falls under **B.1** (two new API methods, a new `features.autoDeletion`
service-info entry, new error ids, an audited method), **B.7** (a new
per-core background loop that erases accounts), **B.11** (new config block
`account.autoDeletion.*`, new mail switches `services.email.enabled.
accountDeletion*`), and **B.2** only in the sense of a new audit event type
`audit-log/account-auto-deletion` written by the server (not a data-types
catalogue entry).

An account is deleted at a date its holder chose, or after a period without
use (latest `lastUsed` of its personal and app accesses, a delegate's included,
shared accesses never), by the holder's own schedule or by an operator
inactivity preset (default none). Reminder mails at 60, 30, 7 and 1 days, a
7-day minimum notice after the first notice actually sent, a preset clock that
starts the day it first applies (no surprise deletion of dormant accounts),
password to arm or shorten, delegates refused on set, `delete` offered only
where self-deletion is allowed, the deletion guards and erasure of
`auth.delete`, WARN log before and after, audit row where the audit outlives
the account, `dryRun`, `maxDeletionsPerPass`. The second action, **transfer
to a beneficiary, is designed and NOT implemented**: its chips (marked
"transfer") stay until its own release. Context:
`context/data-retention-operator-owned.md` ("Account-level auto-deletion
(planned, not yet released)" and "Planned: transfer to a beneficiary", which
holds the Art.6 / Art.13 / Art.14(5)(b) reading, unconfirmed). Implementer-FAQ
Q31 carries a planned note. Proposal: `proposals/account-auto-deletion.md`.

**Chips added 2026-10-29** (detail paragraphs marked "Planned, not yet
released" or "Planned, designed and not implemented"; no tier shift; no
`tests:`, `config_keys:` or `docs:` added, since nothing is on open-pryv.io
master or the published docs site; `reviewed_at` unchanged):

| Scope | Ref | Kind | Impact | What will change |
|---|---|---|---|---|
| gdpr | Art.5 | feature | medium | §1(e): account-level storage limitation configurable (preset, holder schedule, reminders, minimum notice); event level stays operator-owned |
| gdpr | Art.5 | feature | low | transfer: §1(c) beneficiary data minimised, encrypted, erased with the transfer |
| gdpr | Art.6 | feature | low | transfer: basis for the operator's processing of beneficiary data (6(1)(f) reading, unconfirmed) |
| gdpr | Art.13 | feature | low | §2(a): a preset is a retention period for the privacy notice; holder told by confirmation and reminders |
| gdpr | Art.13 | feature | low | transfer: holder notice on when / how the operator may read beneficiary name and date of birth |
| gdpr | Art.14 | feature | low | transfer: beneficiary informed atSetup or atTrigger (Art.14(5)(b) reading, unconfirmed) |
| gdpr | Art.17 | feature | medium | erasure scheduled by the data subject (§1(a)/(b)), same path and guards as `auth.delete` |
| gdpr | Art.25 | feature | low | retention-by-default bullet: default never, preset, dry run, no surprise deletion |
| gdpr | Art.32 | feature | low | password step-up and delegate refusal on arming; transfer: identity encrypted at rest, claim token hashed |
| ccpa | 1798.105 | feature | low | consumer-scheduled deletion (no §1798.105(d) hook) |
| pipeda | Principle.4.5 | feature | medium | inactive-account retention enforceable by configuration |
| swiss-nlpd | Art.32 | feature | low | erasure scheduled by the person |
| soc2 | CC6.5 | feature | low | scheduled whole-account destruction, same path |
| soc2 | P4.2 | feature | medium | account-level retention enforced by the platform; tier review at release |
| soc2 | P4.3 | feature | low | scheduled disposal, same path |
| soc2 | C1.2 | feature | low | scheduled disposal, same path |
| iso-27701 | A.7.4.5 | feature | medium | "as soon as no longer necessary" enforceable for inactive accounts |
| iso-27001 | A.8.10 | feature | low | deletion when no longer required, schedulable |
| hipaa-security | 164.316(b)(2)(i) | feature | low | scheduled erasure follows `audit.onUserDelete`; `keep` writes an erasure audit row |

Walked without a chip: `iso-27001.A.7.14` (secure disposal or re-use of
equipment, `out-of-scope`): physical media, unaffected; the information-deletion
row is `A.8.10`, chipped instead. `iso-27701.A.7.4.7` (records of PII
processing): unchanged, the new methods are audited like any other and
add no record family the row has to name. (The sample README cited `hipaa-privacy.164.530(j)`,
which has no row in the matrix; it now cites `hipaa-security.164.316(b)(2)(i)`.)

**At the deletion release**: discharge every chip not marked "transfer";
rewrite each "Planned, not yet released" paragraph as shipped with the
release name, commit and test codes (`[ACXP]`, `[ACSW]`, `[ACRM]`, `[ACST]`,
`[ACAC]`, `[LGLU]`, `[ACCF]`, `[CVAD]`, `[CKCF7]`, `[ADKS]`, `[ADKR]`; the
proposal lists the numbered codes); add `account.autoDeletion.*`,
`accessTracking.isActive` and `services.email.enabled.accountDeletion*` to
`config_keys:` where the row cites the behaviour they govern; cite the
operator page in `docs:` once published; decide on a primitive entry in
`docs/pryv-primitives.md`; review the tier of `soc2.P4.2` and the §1(e) label
of `gdpr.Art.5`; turn the planned sections of the context note, FAQ Q31 and
`samples/scheduled-retention-job/README.md` into shipped text. **At the
transfer release**: discharge the "transfer" chips (gdpr Art.5 second chip,
Art.6, Art.13 second chip, Art.14, the transfer half of Art.32) and walk the
delegation rows listed in the proposal (a controller can be set by a claim).

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

**Walked 2026-10-05 for open-pryv.io master `0ebed334`** (the release after
2.0.0-rc.35, shipped as 2.0.0-rc.36). No new API method, no tier shift, no
`planned:` chips involved (none was queued on the rows below); `reviewed_at`
left unchanged so the added prose awaits the next review pass.
- **New values of an existing server-owned accept-event field**
  (https://github.com/pryv/open-pryv.io/issues/146, merge `1420fe72`; commits
  `4b6d3b3c`, `b9a0121f`, `7218a655`, `1bcd66b8`, `88838020`):
  `consent/accept-cmc` `content.withdrawal` is now written on every teardown
  path as `{ at, by, accessId, revokeEventId? }`, `by: 'accesses.delete' |
  'revoke-cmc' | 'peer-revoke'` (a delegation detach keeps `'delegation-detach'`
  with its `relId`); never overwritten. New failure reason
  `cmc-revoke-delete-failed`: a `consent/revoke-cmc` whose local delete fails
  ends `failed` and is retried instead of reading completed. Client side:
  `@pryv/cmc` `listAcceptedRelationships` leaves withdrawn relationships out by
  default since 3.18.0 (new `includeWithdrawn` parameter). Tests
  `[CN58]`, `[CN59]`, `[CN60]`, `[DH16]`, `[HR32]`, `[HR34]`, `[CD26]`.
- **New `/reg/access` request field `cmcInvites[].accessName`**
  (https://github.com/pryv/open-pryv.io/issues/147): names the data grant per
  consent invite. Tests `[RCI10]`, `[RCI11]`.
- **New `/reg/access` request field `actAsManagedOnly`**
  (https://github.com/pryv/open-pryv.io/issues/148): the access may only be
  granted for an account the user manages; enforced by the authentication page,
  not the core. Tests `[RAM01]`, `[RAM02]`, `[RAM03]`.
- **Removed `/reg/access` outcome `REDIRECTED`** (security hardening, merge
  `1aa22e1a`, commit `62ab4f7e`; BREAKING for a page that posted it, none
  shipped did): refused with `400 invalid-parameters`, no `redirectUrl` stored.
  Test `[MC04D]`.

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.7 | §3 teardown note: the withdrawal marker on every path (`by` values, server-owned, never overwritten, history under forceKeepHistory only, best-effort), failed revoke retried, `@pryv/cmc` lister default; §2 invites paragraph: `accessName` | `CN58`, `CN59`, `CN60`, `DH16`, `HR32`, `HR34`, `CD26`, `DCH25`, `RCI10`, `RCI11` |
| gdpr | Art.8 | "The parent consents to an app for the child": `actAsManagedOnly`, enforced by the authentication page | `RAM01`, `RAM02`, `RAM03` |
| iso-27701 | A.7.3.4 | cross-account withdrawal recorded on the principal's own accept event | `CN58`, `CN59`, `CN60` |
| hipaa-privacy | 164.508 | "right to revoke" mapping: the revocation recorded on the individual's accept event | `CN58`, `CN59`, `CN60` |
| iso-27001 | A.8.26 | second example: the `REDIRECTED` outcome removed from the sign-in flow | `MC04D` |

Walked without change: `pipeda.Principle.4.3` (withdrawal via
`accesses.delete`, still true), `gdpr.Art.21` and `gdpr.Art.25` default 12
(withdrawal API by default, still true), `hipaa-privacy.164.502(g)` (an app a
representative authorizes; `actAsManagedOnly` is a request-side restriction the
page enforces, not a new grant path). The B.1 row families (DSAR,
rectification, erasure, restriction, access control, audit, and the SOC 2
parallels) cite none of these surfaces. Context notes updated:
`context/cmc-consent-primitives.md` (auth request: `accessName`; gates section;
Art.7 withdrawability: the marker on every path; Art.7(3)),
`context/delegation-model.md` (`actAsManagedOnly`). FAQ Q19 notes the marker.
B.2 (no new event-type format: `consent/accept-cmc` gains values of an
existing content field), B.3, B.4, B.6, B.8 (no token-class change), B.9, B.10,
B.11: none.

**Walked 2026-10-08 for open-pryv.io branch feat/email-verification-sibling-event
(unreleased at the walk; released in open-pryv.io 2.0.0-rc.44)**. No new API method, no
new config key, no new audit method id, no tier shift, no `planned:` chips
involved; `reviewed_at` left unchanged so the added prose awaits the next review
pass. Row `tests:` extended on 2026-10-08 once the code reached open-pryv.io
master (`22f7369a`): gdpr.Art.7 and soc2.P6.1 + [SIB01, SIB11] (an access reading
the email gets the proof state; one without the grant, star included, gets
neither), gdpr.Art.20 + [ATM03, SIB08, SIB10] (account-event times, type-filtered
reads, the derived event cannot be written). What changed in the API:
- **Disclosure change on an existing grant**: an access that can read
  `:system:email` ("Read Email", or a personal token) can request by type
  (`types: ['verification/email']`; a read without it is unchanged), in that
  stream, a read-only, server-derived event `:system:emailVerification` of type
  `verification/email`, content `{ verified, method, verifiedAt }` (`verified`
  true only for `email-link`, `email-code`, `operator`; `registration` and
  `legacy` read false). Never stored, cannot be written, no history. Apps
  granted "Read Email" before the release can request the proof state of the primary
  address without new consent; other addresses are never exposed; operators can
  rename the field's `name` in `custom.systemStreams` so the consent text says
  so. Tests `[SIB01]`..`[SIB08]`, `[SIB12]`, `[SIB13]` (what a reader sees),
  `[SIB09]`, `[SIB10]` (no history, not writable), `[SIB11]` (no email
  permission: neither event), `[SIB17]`..`[SIB19]` (internal readers
  unaffected).
- **Account events carry the time their value was set** (they carried the read
  time): `modifiedSince` and time filters apply to them, their integrity hash is
  stable across reads. Tests `[ATM01]`..`[ATM07]`, `[SIB2A]` / `[SIB15]`,
  `[SIB16]`, `[SIB20]`, `[SIB21]`.
- **`events.get` `skip` / `limit`** now apply to account-stream-only queries.
- **`eventsChanged` notifications** (socket.io) on `account.verifyEmail`,
  `emails.setPrimary` and account-field updates. Test `[SIB14]`.

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| soc2 | P6.1 | overview: a grant is a set of streams whose content can grow with a release; "Read Email" can now also request the primary address proof state by type, earlier grants included, rename hint | SIB01, SIB11 |
| gdpr | Art.7 | detail (§1 demonstrability): what a grant on `:system:email` returns since this release (on request by type), without new consent; rename hint | SIB01, SIB11 |
| gdpr | Art.20 | detail: account fields export as typed events; the derived `verification/email` event (on request by type) is not portable, a write of it is refused; account event times make incremental exports exact (B.2 row) | ATM03, SIB08, SIB10 |

Also updated: `docs/pryv-primitives.md` `system-streams` entry (account events
carry the time of their value; the derived verification event on
`:system:email`).

Walked without change:
- **DSAR / subject access** (`gdpr.Art.15`, `soc2.P5.1`,
  `hipaa-privacy.164.524`, `pipeda.Principle.4.9`, `ccpa.1798.110`,
  `swiss-nlpd.Art.25`): the subject's personal token now also reads the proof
  state; "reads everything via the standard API" still holds. The Art.15
  incremental-export claim (`modifiedSince`) now also holds for account events,
  which were re-fetched on every call before (over-fetch, not a gap).
- **Transparency** (`gdpr.Art.12`, `Art.13`, `Art.14`): the information
  artefacts are the implementer's; the disclosure change is encoded on the
  consent row (Art.7) and P6.1.
- **Accounting of disclosures** (`soc2.P6.2`, `soc2.P6.7`,
  `hipaa-privacy.164.528`, `164.528(b)`): every read is still an audited
  `events.get` against an attributable access. Note for the matrix owner, not
  written into the rows: an accounting that describes a disclosure at API-shape
  level ("`events.get` on `:system:email` with `types: verification/email`") covers the primary
  address's proof state from this release on.
- **Minimum necessary** (`hipaa-privacy.164.514(d)`, `164.502(b)`): the bound
  is the granted stream, unchanged; the stream's content grew (see P6.1).
- **Access control** (`hipaa-security.164.312(a)(1)`, `soc2.CC6.1`,
  `soc2.CC6.3`): the derived event inherits the email stream's read permission
  and cannot be written; no new grant path.
- **Inbox-proved email for federated sign-in** (`soc2.CC6.1`,
  `hipaa-security.164.308(a)(5)(ii)(D)`, `iso-27001.A.5.17`): the proof check moved into
  a shared helper used by both features; behaviour unchanged.
- **Rectification** (`gdpr.Art.16`, `gdpr.Art.19`, `soc2.P5.2`): account-field
  updates now also notify `eventsChanged`; the prose (update methods, webhook
  signal, out-of-band notice to recipients) still holds.
- **Consent rows** (`iso-27701.A.7.3.4`, `hipaa-privacy.164.508`,
  `pipeda.Principle.4.3`): withdrawal and recording unchanged.
- **Integrity** (`hipaa-security.164.312(c)(2)`, `soc2.PI1.3`): account events'
  hash is now stable across reads; the rows' claim (hash anchored by audited
  creates and updates) is unchanged.
B.3, B.4, B.6, B.8 (no token-class change), B.9, B.10, B.11 (no new config key,
header, platform DB or backup behaviour): none.

**Walked 2026-10-13 for open-pryv.io 2.0.0-rc.46 to 2.0.0-rc.50**: the
erasure family (account deletion now ends relationships, erases series under
every name, stops webhooks; SQLite audit `keep` honoured) and two new
control-access-only routes (`delegations/controlled-side/release`, `/status`).
Rows and tests under `SECURITY-REVIEW-2026` in Section A.

**Pre-release walk 2026-10-14 for group accounts over CMC (designed, NOT
released; `GROUP-ACCOUNTS-CMC` in Section A)**. No new method name: the
surface is CMC triggers written through `events.create`. What the release is
designed to add: a `memberAccess` field on the `events.create` response for a
`consent/member-access-cmc` write (`{ apiEndpoint, accessId, name, expires,
attribution }`, returned once, never stored), new error ids
(`cmc-member-access-*`, `cmc-membership-permissions-invalid`,
`cmc-member-stamp-invalid`, `cmc-member-revoke-residual`,
`cmc-member-channel-not-supported`), a new access role
(`clientData.cmc.role: 'member'`), a server-written `clientData.cmc` stamp on
child accesses of a CMC grant, and config keys `cmc.memberAccess.*`. Rows of
the B.1 families walked:
- **Access control** (`hipaa-security.164.312(a)(1)`, `soc2.CC6.1`,
  `soc2.CC6.3`): 164.312(a)(1) and CC6.3 get a chip (new derived access
  path, least privilege per member); CC6.1 walked without change (no new
  authentication path, the member accesses ride the same per-stream
  enforcement).
- **Audit** (`hipaa-security.164.312(b)`, `iso-27001.A.8.15`, `soc2.P6.2`):
  164.312(b) gets a chip (per-member attribution); A.8.15 and P6.2 walked
  without change (every member read is an audited call under an
  attributable access, which they already state).
- **DSAR / subject access** (`gdpr.Art.15`, `soc2.P5.1`, `soc2.P6.7`,
  `hipaa-privacy.164.524`, `pipeda.Principle.4.9`, `ccpa.1798.110`,
  `swiss-nlpd.Art.25`) and **accounting of disclosures**
  (`hipaa-privacy.164.528`): walked without change; the subject's personal
  token lists member accesses like any access, and each disclosure to a
  member is an audited read under the member's own access.
- **Rectification** (`gdpr.Art.16`, `ccpa.1798.106`,
  `pipeda.Principle.4.6`, `soc2.P5.2`) and **restriction** (`gdpr.Art.18`):
  not touched.
- **Erasure** (`gdpr.Art.17`, `ccpa.1798.105`, `pipeda.Principle.4.5`,
  `swiss-nlpd.Art.32`, `soc2.CC6.5`, `soc2.P4.3`, `soc2.C1.2`): walked
  without change; account deletion is designed to sweep member accesses as
  well, a completeness detail of the existing "deletion ends relationships"
  claim. Re-walk at release.
Plus the workforce rows of `context/workforce-access-patterns.md` (chips
listed in Section A). B.3, B.4 (no new primitive: the work extends `CMC`,
`access`, `delegation`), B.5, B.6, B.9, B.10: none. B.11: the new config keys
are walked at release.

**Release walk 2026-10-15 for open-pryv.io 2.0.0-rc.53** (release commit
`61fb28dd`; the cascade fix it builds on shipped in 2.0.0-rc.52, `96af58ad`).
The pre-release walk above holds, with these shipped differences: the mint
trigger is refused to every token but a membership access (the group's
personal and delegate tokens included); the in-flight limit is one mint per
membership and patient relationship, per worker process (the rate limit is
per worker process too); a member asks for named data streams only (never
`*` nor a `:_cmc:` stream); a member access never outlives its membership.
Error ids as shipped: `cmc-member-access-not-member`,
`-relationship-not-found`, `-scope-outside-membership`,
`-permissions-not-subset`, `-expiry-out-of-range`, `-rate-limited`,
`-in-flight` (at write), `-grant-not-delegable`, `-peer-rejected`,
`-peer-unreachable`, `-membership-gone`, `-not-retryable` (on the trigger),
`cmc-membership-permissions-invalid`, `cmc-member-stamp-invalid`,
`cmc-member-revoke-residual`, `cmc-member-channel-not-supported`, and,
outside group accounts, `cmc-offer-stream-not-offerable`,
`cmc-invalidate-link-scope-mismatch`, the retry record reason
`cmc-retry-stale`. Behaviour changes of existing methods, now stated by the
rows: every CMC and delegation teardown is the `accesses.delete` deletion
(deletion records with `includeDeletions`, webhooks deleted, alias
released), replacing the "hard delete" wording in `gdpr.Art.7`,
`gdpr.Art.8`, `context/cmc-consent-primitives.md`,
`context/delegation-model.md`; an app token deletes only the `shared`
accesses it created and no update removes `clientData.cmc`
(`hipaa-security.164.312(a)(1)`); revoke notices are re-sent by the retry
loop (https://github.com/pryv/open-pryv.io/issues/157), account-deletion
notices are not (`gdpr.Art.7`, `gdpr.Art.8`, `gdpr.Art.17`, the two context
notes). Families re-walked: access control and audit rows rewritten (table
under `GROUP-ACCOUNTS-CMC` in Section A); DSAR and accounting of disclosures
walked without change (a deletion record adds to what a subject's token
lists, it removes nothing); erasure: `gdpr.Art.17` extended (a deleted group
account's member accesses are deleted on the patient cores first `[GA40]`,
`[MR28]`; account-deletion notices are sent once, not re-sent), the other
erasure rows walked without change (their text does not detail relationship
teardown); `soc2.CC6.1` walked without change.

**Walked 2026-10-26 for open-pryv.io 2.0.0-rc.58** (tag on `b88af4d4`,
https://github.com/pryv/open-pryv.io/issues/161): external ids, one account
per third-party record id, platform-wide, without the platform seeing the id.
No Section A slug covers it and no `planned:` chip was queued on the rows
below; no tier shift; `reviewed_at` left unchanged. Public description:
[External ids](https://pryv.github.io/customer-resources/external-ids/)
(source `dev-site2/src/content/docs/customer-resources/external-ids.md`).
New surface:
- **Account methods, personal token only** (`403` for an app or shared
  access, `[XIDC2]`): `account.externalIds.claim`
  (`POST /<username>/account/external-ids`), `.list` (namespaces and claim
  dates, never a value), `.replace` (`PUT .../<namespace>`), `.release`
  (`DELETE .../<namespace>`). Error `409 external-id-already-claimed`
  (`value-taken` / `namespace-taken`), never naming the holder `[XIDC3]`.
- **Lookup without credentials**: `auth.extIdCores`
  (`POST /reg/ext-id/cores`) answers the core holding an id, never the
  account; unknown namespace and unclaimed id are the same 404 `[XIDLU1]`.
  Lookups and refused claims share a per-address budget (10 a minute per
  core, `429 too-many-attempts`) `[XIDLU2]`, `[XIDLU3]`.
- **Admin**: `system.extIdNamespaces.list` / `.get` / `.set` / `.delete`
  under `/system/admin/ext-id-ns` (admin key; 404 without it; salt
  server-generated, never returned; delete refused `409
  external-id-namespace-in-use` while ids are linked, unless `force`)
  `[XIDA1]`, `[XIDA2]`, `[XIDD1]`, `[XIDD3]`.
- **Flow fields**: `externalId` on `/reg/access` and `POST /users` (hint
  mode; `forced` refused for now), `externalIdDeclined` on an `ACCEPTED`
  outcome, `externalIdLinked` in the registration answer `[XIDFA1]`..
  `[XIDFR6]`.
- **Audit method ids**: `account.externalIds.claim` / `.list` / `.release`
  / `.replace` are audited on the account; `system.extIdNamespaces.set` /
  `.delete` are audited without a user (syslog only); `.list`, `.get` and
  `auth.extIdCores` are not audited (like `auth.cores`). The blinded value
  is in no response, error, log line or audit record `[XIDG1]`, `[XIDFG1]`
  (`redactUrl` also masks a `blindedValue` query parameter).
- **New data category**: on the home core, a local table (account, blinded
  value, claim date), never replicated; in the platform DB, `ext-id-ns/`
  rows (label, default mode, salt) and `ext-id/<nsToken>/<valueToken>` rows
  mapping a token of the value to a core id (tokens keyed by the platform
  pepper in hashed PII mode) `[XIDN4]`, `[2C50]`, `[2C51]`.
- **No new config key.**

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.4 | pseudonymisation mapping names external ids; primitive cited | none |
| gdpr | Art.17 | "What an account deletion reaches": external ids released at once, no trace kept; a failed release is healed by the reconcile; primitive cited | `XIDD2` |
| gdpr | Art.25 | new "cross-service identity by design" paragraph (blinded by the caller, core not account, personal token only, never logged, budgeted lookup; key custody and plaintext record id stay yours); primitive cited | `XIDC1`, `XIDC2`, `XIDG1`, `XIDLU1`, `XIDLU2` |
| gdpr | Art.32 | pseudonymisation bullet: the external-id index and what a core learns with and without the namespace key; primitive cited | `XIDN4`, `XIDG1` |
| ccpa | 1798.105 | deletion releases external ids; primitive cited | `XIDD2` |
| iso-27001 | A.8.11 | record ids masked before they reach Pryv; key custody; primitive cited | `XIDC1`, `XIDC7`, `XIDG1`, `XIDN4` |
| iso-27001 | A.8.13 | backup paragraph (B.11 below); primitive cited | `XIDB1` |
| hipaa-privacy | 164.514(c) | external ids keep the re-identification means with the caller; the blinded value is derived from the record id, so §514(c) compliance rests on key custody and is the implementer's determination; primitive cited | `XIDC1`, `XIDG1`, `XIDN4` |

Walked without change:
- **DSAR / subject access** (`gdpr.Art.15`, `gdpr.Art.20`, `soc2.P5.1`,
  `hipaa-privacy.164.524`, `pipeda.Principle.4.9`, `ccpa.1798.110`,
  `swiss-nlpd.Art.25`): the subject's personal token lists which namespaces
  are linked and when; the value is never returned, so there is no
  identifier to port. Neither backup tool carries the account's links yet
  (recorded in `context/operator-backup-coverage.md`).
- **Rectification** (`gdpr.Art.16`, `ccpa.1798.106`, `soc2.P5.2`):
  `account.externalIds.replace` is the subject's own correction of a wrong
  link; rows describe data rectification, not touched.
- **Erasure, other rows** (`pipeda.Principle.4.5`, `swiss-nlpd.Art.32`,
  `soc2.CC6.5`, `soc2.P4.3`, `soc2.C1.2`): their text does not enumerate
  what a deletion reaches.
- **Access control** (`hipaa-security.164.312(a)(1)`, `soc2.CC6.1`,
  `soc2.CC6.3`): no new grant path; the methods take the personal token
  only and the lookup returns no account and no data.
- **Audit** (`hipaa-security.164.312(b)`, `iso-27001.A.8.15`, `soc2.P6.2`):
  the new account methods are audited like any API call; the rows' claims
  hold.
- **Minimisation** (`gdpr.Art.5` §1(c), §1(f)): §1(f) is covered at
  Art.32; the reviewed Art.5 row is left for the next review pass.
- **Rate limiting** (`iso-27001.A.8.6`, `A.8.21`,
  `hipaa-security.164.308(a)(5)(ii)(C)`): the new budget is recorded in
  `context/rate-limiting-and-dos-protection.md`; the client-IP paragraph of
  the developer-site rate-limiting page is unchanged (same
  `http.trustedProxies` rule).
Also updated: `docs/pryv-primitives.md` (new `external-id-index` entry;
`data-residency` PlatformDB list; `backup-restore` entry),
`context/core-affinity-architecture.md` (B.7),
`context/operator-backup-coverage.md` (B.11),
`context/rate-limiting-and-dos-protection.md`. B.2, B.3, B.5, B.6, B.8 (no
change to the consent-bearing methods), B.9, B.10: none.

**Walked 2026-10-26 for open-pryv.io 2.0.0-rc.59** (release commit
`927919ba`) **and, ahead of release, the next one** (merged on
open-pryv.io master, unreleased at this walk, expected 2.0.0-rc.60;
the rows say "the release after 2.0.0-rc.59 (expected 2.0.0-rc.60)").
External ids, second wave; extends the rc.58 walk above. No Section A
slug, no `planned:` chip, no tier shift; `reviewed_at` left unchanged.
Public description: the same developer-site guide, sections "Forced
mode" (live for rc.59) and "Releasing an id claimed by the wrong
account" (published with the next release).
- **Forced mode (2.0.0-rc.59)**: `externalId.mode: 'forced'` (or a
  namespace whose `defaultMode` is `forced`) accepted on `/reg/access`
  and `POST /users`. At `ACCEPTED` the server checks that the posted
  token is an app access of the posted username, on that account's own
  core, and that the account holds the id; otherwise `400
  external-id-mismatch` (`token-invalid` / `not-holder`, nobody holding
  the id is `not-holder` too), the request stays `NEED_SIGNIN`
  `[XIDFF1]`..`[XIDFF4]`, `[XIDFFS]`, `[XIDFF7]`; a check that cannot
  run is `503 external-id-check-unavailable` `[XIDFF9]`; the page
  hand-off and `externalIdDeclined` refused (`400 invalid-parameters`)
  `[XIDFF5]`; a `credentialHandoff` request is checked before the
  server creates the secret `[XIDFF6]`; `not-holder` refusals count in the lookup
  budget `[XIDFF8]`; registration refuses an id another account holds
  (`409`, before anything is reserved) and links an unclaimed one
  `[XIDFR7]`..`[XIDFR9]`.
- **New admin method, core to core (2.0.0-rc.59)**: `system.extIdHolds`
  (`POST /system/ext-id/holds`, admin key, `{ holds: boolean }`, 404
  for an account of another core), **not audited** `[XIDH1]`..`[XIDH3]`,
  `[XIDFC1]`..`[XIDFC4]`.
- **New admin method (next release)**: `system.extIdRelease`
  (`POST /system/admin/ext-id/release { namespace, blindedValue,
  reason }`, admin key; `{ released: true, notified: 'mail' |
  'audit-only' }`, never naming the account; `404` when nobody holds
  it; `307 { server }` from a core that does not hold it), audited
  without a user (syslog) `[XIDAR1]`..`[XIDAR6]`, `[XIDS19]`.
- **New audit method id (next release)**: `account.externalIds.adminRelease`,
  written in the holder's own trail (namespace and reason, never the
  value) when audit is active `[XIDAR1]`, `[XIDG1]`.
- **New mail and config keys (next release)**: the `external-id-released`
  mail to the holder (variables `USERNAME`, `NAMESPACE_LABEL`, `REASON`);
  `services.email.enabled.externalIdReleased` (default `true`) and
  `services.email.externalIdReleasedTemplate` (default
  `external-id-released`); deployments seeded earlier add the template
  with `bin/mail.js templates set`. A failed send never undoes the
  release `[XIDAR3]`.
- **Per-user backup and core rename (next release)**: under B.11 below.

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.12 | new detail paragraph: the admin release is told to the holder by mail and in its audit trail; the reason is the implementer's wording; `config_keys` `services.email.enabled.externalIdReleased`, `services.email.externalIdReleasedTemplate`; primitive cited | `XIDAR1`, `XIDAR3` |
| gdpr | Art.17 | external-ids bullet: the per-user backup carries the ids from the next release, a restore links them again unless claimed since; erasure reaches them with backup retirement | `XIDBK1`, `XIDBK2` |
| gdpr | Art.25 | cross-service identity paragraph: forced mode (record-bound credential), the residual and its remedy (admin release, holder told) | `XIDFF1`, `XIDFF3`, `XIDFF4`, `XIDAR1`, `XIDAR3` |
| gdpr | Art.32 | new "Record-bound sign-in" bullet (forced mode, core-to-core holder check); Restoration bullet: per-user backup carries the ids, protect it as a credential store | `XIDFF1`, `XIDFF2`, `XIDFF3`, `XIDFF4`, `XIDFFS`, `XIDFF7`, `XIDFF9`, `XIDH1`, `XIDFC1`, `XIDFC4`, `XIDFR7`, `XIDBK1` |
| hipaa-security | 164.312(b) | new "External ids" paragraph: what is audited where (account methods, admin release twice, holder answer and lookup not audited); primitive cited | `XIDAR1`, `XIDG1` |
| iso-27001 | A.8.15 | new "External ids" paragraph (same audit split); primitive cited | `XIDAR1`, `XIDG1` |
| iso-27001 | A.8.13 | external-ids paragraph (B.11 below) | `XIDB2`, `XIDB3`, `XIDB4`, `XIDBK1`, `XIDBK2` |

Walked without change:
- **Integrity / minimisation** (`gdpr.Art.5` §1(f)): covered at Art.32
  (new bullet); the reviewed Art.5 row is still left for the next review
  pass.
- **Information to the subject, other rows** (`gdpr.Art.13`,
  `gdpr.Art.14`): they cover notices at collection; the release notice
  is an operator-action communication, recorded at Art.12.
- **Records of processing** (`gdpr.Art.30`, reviewed): its register
  derivation from the audit trail holds; the new audit method is
  recorded on the audit rows.
- **Audit, other rows** (`soc2.P6.2`): no disclosure is added; the admin
  release removes a link, it shares nothing.
- **Access control and authentication** (`hipaa-security.164.312(a)(1)`,
  `164.312(d)`, `soc2.CC6.1`, `iso-27001.A.5.15`, `A.5.16`): the
  sign-in and its credentials are unchanged; forced mode only restricts
  which account an auth request may complete for, recorded on
  `gdpr.Art.32`. `system.extIdHolds` and `system.extIdRelease` take the
  admin key, like the other `system.*` methods.
- **Rectification** (`gdpr.Art.16`, `ccpa.1798.106`, `soc2.P5.2`): a
  subject who cannot link their record because another account holds it
  is helped by the admin release; the rows describe data rectification,
  not touched.
- **Erasure, other rows** (`ccpa.1798.105`, which derives from
  `gdpr.Art.17`; `pipeda.Principle.4.5`, `swiss-nlpd.Art.32`,
  `soc2.CC6.5`, `soc2.P4.3`, `soc2.C1.2`): unchanged by the backup
  addition, recorded on `gdpr.Art.17`.
- **De-identification** (`hipaa-privacy.164.514(c)`, `iso-27001.A.8.11`,
  `gdpr.Art.4`): no change to what the platform stores; the per-user
  backup copies the blinded values the core already held.
- **Subprocessors** (`gdpr.Art.28`): the new mail goes through the
  SMTP relay already listed (username, namespace label, reason).
Also updated: `docs/pryv-primitives.md` (`external-id-index`: sign-in
modes, admin release, backups, core rename, residual remedy, compliance
role; `backup-restore` entry), `context/core-affinity-architecture.md`
(core-to-core calls, rename; B.7),
`context/operator-backup-coverage.md` (B.11),
`context/rate-limiting-and-dos-protection.md` (`not-holder` refusals in
the budget). B.2, B.3, B.5, B.6, B.8 (forced mode adds a check on
`/reg/access` acceptance, not a token-class change on a consent-bearing
method), B.9, B.10: none. **Re-walk at the release**: replace "the
release after 2.0.0-rc.59 (expected 2.0.0-rc.60)" with the released
name in `gdpr.Art.12`, `Art.17`, `Art.25`, `Art.32`,
`hipaa-security.164.312(b)`, `iso-27001.A.8.13`, `A.8.15`,
`docs/pryv-primitives.md`, `context/core-affinity-architecture.md`,
`context/operator-backup-coverage.md`, and discharge the Section C
clause (per-user backup).

**Re-walked 2026-10-26 at the release**: the next release is
open-pryv.io 2.0.0-rc.60 (release commit `f3db0564`, deployed on
pryv.me the same day), with no change to its content since the walk
above. Every row and note listed above now names 2.0.0-rc.60; the
Section C clause (per-user backup) is discharged.

**Test codes added 2026-10-27**: the open-pryv.io two-core suite now
runs its cores as a real multi-core platform; `[2C56]` (holder of core
B accepted on core A, checked on B) and `[2C57]` (non-holder of B
refused on A) cover forced mode across cores end to end. Cited in
`gdpr.Art.32` (the record-bound sign-in bullet; the tests list only
accepts codes starting with a letter, so the `2Cxx` codes stay in prose). No
claim changes: the behaviour shipped in 2.0.0-rc.59; also checked by
hand on pryv.me (2.0.0-rc.61) the same day.

**Pre-release walk 2026-10-29 for account auto-deletion (implemented on a
branch, NOT released; `ACCOUNT-AUTO-DELETION` in Section A)**. New methods
`account.getAutoDeletion` / `account.setAutoDeletion` (personal token, both
audited; set refused to delegation-derived accesses, password required to arm
or shorten), `features.autoDeletion` in service info, new error ids
`auto-deletion-*`, a server-written audit action `account.autoDeletion.erase`.
Rows of the B.1 families walked:
- **Erasure** (`gdpr.Art.17`, `ccpa.1798.105`, `pipeda.Principle.4.5`,
  `swiss-nlpd.Art.32`; SOC 2 `CC6.5`, `P4.3`, `C1.2`): all chipped (scheduled
  erasure through the same path).
- **Access control** (`hipaa-security.164.312(a)(1)`, `soc2.CC6.1`,
  `soc2.CC6.3`): walked without change (no new access path; the new
  delegate refusal and password step-up are recorded under `gdpr.Art.32`).
- **Audit** (`hipaa-security.164.312(b)`, `iso-27001.A.8.15`, `soc2.P6.2`):
  walked without change (two more audited methods; the erasure audit row is
  recorded under `hipaa-security.164.316(b)(2)(i)`).
- DSAR, rectification and restriction families: unchanged.

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

**Walked 2026-10-08 for open-pryv.io branch feat/email-verification-sibling-event
(unreleased at the walk; released in open-pryv.io 2.0.0-rc.44)**, with data-types branch `feat/verification-email-type`
(dictionary version 1.2.0): new types `verification/email` (the read-only,
server-derived proof state of the primary account address, `{ verified,
method, verifiedAt }`) and `email/string` (the account address). No tier
shift, no `planned:` chips involved. Full change list and the disclosure
note under B.1 (same date).
- `gdpr.Art.20`: detail extended (account fields export as typed events; the
  derived event is skipped on import, the receiving deployment derives its
  own; account event times make `modifiedSince` exports exact). Already cites
  `data-types`.
- Walked without change: `iso-13485` excluded items (no device class),
  `hipaa-privacy.164.514(a)` (neither type is a de-identification format;
  `email/string` types an identifier the account already held),
  `soc2.PI1.1` (the catalogue gains two definitions; prose is generic),
  `soc2.PI1.2` and `soc2.P7.1` (ingest validation: `verification/email` is
  never written by a client, so it is not an input).

**Pre-release walk 2026-10-14 for group accounts over CMC (designed, NOT
released; data-types work in progress)**: new formats
`consent/member-access-cmc` (a member's request for an access on a patient
account; server-owned outcome fields) and `consent/member-revoke-cmc`
(server-written offboarding sweep; client writes refused), and
`request.membership` (boolean) on `consent/request-cmc`. Walked without
change: `gdpr.Art.20` (protocol records on the group account, not subject
data to port; they export with the account like any event),
`iso-13485` excluded items (no device class), `hipaa-privacy.164.514(a)` (no
de-identification format), `soc2.PI1.1`, `PI1.2`, `P7.1` (the formats are
validated by the CMC plugin on write, as the other `consent/*` formats). The
consent-record rows these formats feed are walked under B.8.
`context/cmc-consent-primitives.md` notes the two planned formats beside the
eight shipped ones. Re-walk at release, when data-types publishes them.

**Release walk 2026-10-15 for open-pryv.io 2.0.0-rc.53**: the server bundles
event-type catalogue 1.3.0 with both formats and `request.membership`, plus
the fields of the late-notice protection (`acceptEventId` and `revokedAt` on
`consent/revoke-cmc`, `superseded` on its arrival, `deliveryQueued` on the
trigger). The pre-release walk holds: `gdpr.Art.20`, `iso-13485`,
`hipaa-privacy.164.514(a)`, `soc2.PI1.1`, `PI1.2`, `P7.1` walked without
change. `context/cmc-consent-primitives.md` lists the ten formats; the
`gdpr.Art.7` technical note says ten.

**Walked 2026-10-20 for data-types 1.3.1 and 1.3.2** (description changes
only; no new format, no schema change). 1.3.1: `consent/invalidate-link-cmc`
also withdraws a single-use invite nobody accepted yet (server behaviour of
open-pryv.io 2.0.0-rc.56, walked under B.8). 1.3.2: `consent/revoke-cmc`
names the server-written fields of a delivered notice and says `superseded`
is set by the receiving core only (server behaviour unreleased at this walk,
open-pryv.io `d4fa7acc` on master). open-pryv.io 2.0.0-rc.56 still bundles
catalogue 1.3.0; the bump to 1.3.1 / 1.3.2 lands in the next release. No row
cites either description: `gdpr.Art.7` (technical note: ten formats in
catalogue 1.3.0 bundled with 2.0.0-rc.53, still true),
`context/cmc-consent-primitives.md` (format table updated under B.8 for the
behaviour, not the description), `gdpr.Art.20`, `iso-13485`,
`hipaa-privacy.164.514(a)`, `soc2.PI1.1`, `PI1.2`, `P7.1` walked without
change. Re-walk the catalogue version cited in `gdpr.Art.7` and the context
note at the release that bundles 1.3.2.

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

Most recent: `external-id-index` (2026-10-26, open-pryv.io 2.0.0-rc.58),
cited on `gdpr.Art.4` / `Art.17` / `Art.25` / `Art.32`, `ccpa.1798.105`,
`iso-27001.A.8.11` / `A.8.13`, `hipaa-privacy.164.514(c)`. See the B.1 walk
of the same date. Second wave (2.0.0-rc.59 and the next release, same
date): also cited on `gdpr.Art.12`, `hipaa-security.164.312(b)`,
`iso-27001.A.8.15`.

Before it: `delegation` (2026-09-15), cited on `gdpr.Art.7` / `Art.8` /
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
- Account auto-deletion (implemented on an open-pryv.io branch, not
  released, walked 2026-10-29): a new per-core background loop in the
  designated API worker that erases accounts on a schedule; recorded in
  `context/data-retention-operator-owned.md` ("Account-level auto-deletion
  (planned, not yet released)"), whose "voluntarily missing" framing now
  holds for records inside an account only. See `ACCOUNT-AUTO-DELETION` in
  Section A.
- External ids (open-pryv.io 2.0.0-rc.58, 2026-10-26): a new PlatformDB row
  family (`ext-id-ns/`, `ext-id/` mapping a blinded id to a core id) and a
  home-core local table holding the account; added to the PlatformDB
  catalogue of `context/core-affinity-architecture.md` with the stated
  boundary (what a core learns with and without the namespace key). See the
  B.1 walk of the same date. Second wave (2.0.0-rc.59 and the next
  release): the forced-mode holder check is a core-to-core call
  (`system.extIdHolds`, a boolean), the admin release acts on the
  holding core only (`307` elsewhere), and a core rename moves the
  core's `ext-id/` rows; recorded in the same context note.
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

**Walked 2026-10-06 for open-pryv.io 2.0.0-rc.38** (tag commit `37819f45`;
merges `7aab1e85` for the CMC changes and `461f3c4c` for the concurrent-update
fix). No token-class change, but two new refusals on consent-bearing writes
and new server-owned fields, so the B.8 rows were walked. No new API method
(B.1), no tier shift, no `planned:` chips involved (none was queued on these
rows); `reviewed_at` left unchanged so the added prose awaits the next review
pass.
- **Relationship `features` resolved by the server**
  (https://github.com/pryv/open-pryv.io/issues/149): `chat` /
  `systemMessaging` come from the offer (each true unless set to `false`),
  the accept may only narrow them, the resolved pair is stamped on the
  accept trigger, both relationship accesses and the requester's inbox
  mirror, and kept on update. With chat off: no per-peer chat stream and no
  chat permission on either side. An accept that does not arrive through the
  capability can only narrow an existing relationship. Tests `[FE01]` to
  `[FE06]`, `[HA43]`, `[HA44]`, `[HA45]`, `[IA18]` to `[IA23]`, `[CD28]`,
  `[APB16]`, `[CN62]`, `[CN63]`, `[CN64]`, `[CN66]`, `[CN68]`, `[AN05]`,
  `[VA04]`, `[VA05]`.
- **Counterparty feature gate** (new refusal): a counterparty's direct write
  of `message/chat-cmc` (create, edit, retype) answers `403 forbidden`,
  `cmc-chat-disabled`, when the relationship's `features.chat` is false;
  alerts / acks likewise (`cmc-system-messaging-disabled`). Relationships
  accepted earlier keep their chat stream; one recording no features stays
  permissive. Tests `[CH07]` to `[CH11]`, `[CN65]`.
- **Self-accept refused** (new refusal,
  https://github.com/pryv/open-pryv.io/issues/150): an accept of the
  account's own offer fails with `cmc-self-accept-forbidden` before anything
  is provisioned; deleting a legacy self-relationship records the withdrawal
  on its accept event and delivers nothing. Tests `[HA46]`, `[HA47]`,
  `[HA48]`, `[CN67]`, `[CN69]`, `[DH23]` (`[DH24]`: an ordinary relationship
  is not mistaken for one).
- **Server-written event fields survive a concurrent client update**
  (`461f3c4c`): `events.update`, trash and attachment deletion merge onto the
  event as stored at write time (a shared-secret trash excepted, which is a
  compare-and-set; atomic on the built-in PostgreSQL and SQLite
  stores, a read then an update on a custom data store without the merge);
  CMC `status` / `failure` server-owned on every CMC type; non-object content
  on a CMC event refused. Tests `[ESR1]` to `[ESR8]`, `[ESR6A]` to `[ESR6C]`,
  `[UEA1]` to `[UEA3]` (SQLite store), `[APB13]` to `[APB15]`.

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.7 | §3 note: server-written records survive a concurrent write; new §1 paragraph: features resolved from the offer and recorded, self-accept refused | `HA43`, `HA44`, `IA18`, `IA22`, `CD28`, `APB16`, `HA46`, `HA48`, `CN67`, `CN69`, `DH23`, `ESR1`, `ESR4`, `ESR5`, `APB13` |
| gdpr | Art.25 | default 10: channels bounded by the consent (narrow-only, no chat stream without chat); chat on unless the offer turns it off | none (prose cites `HA43`, `HA44`, `CN62`, `CN63`) |
| gdpr | Art.32 | access-control bullet: counterparty feature gate; new integrity-of-stored-records bullet | `CN63`, `CN65`, `CH07`, `CH10`, `ESR1`, `ESR4`, `ESR6A` |
| hipaa-security | 164.312(a)(1) | relationship accesses bounded by the negotiated channels | `CN62`, `CN63`, `CN65`, `CH07`, `CH10` |
| hipaa-security | 164.312(c)(1) | new detail: concurrent-write merge and its limits; overview: event history only with `versioning.forceKeepHistory: true` | `ESR1`, `ESR2`, `ESR3`, `ESR4`, `ESR6A` |
| soc2 | PI1.3 | concurrent writes do not drop data; event history only with `versioning.forceKeepHistory: true` | `ESR1`, `ESR4`, `ESR5`, `ESR6A` |
| iso-27701 | A.7.2.4 | the accept records the resolved features; no consent to one's own offer; record survives concurrent update | `HA43`, `CD28`, `HA46`, `CN67`, `ESR1` |

Walked without change: `gdpr.Art.5` (purpose limitation and minimisation are
stated per stream permission; features are one more instance, no claim
shifts), `iso-27701.A.7.3.4` and `hipaa-privacy.164.508` (withdrawal mapping
unchanged; the self-relationship deletion path is a legacy edge),
`iso-27701.A.7.4.2` and `soc2.P3.1` (the permission-shaped limit already
stated covers the chat permission), `soc2.CC6.1` / `CC6.3` and
`iso-27001.A.5.15` (no token-class change, the gate is CMC-internal and
cited on the HIPAA access-control row), `hipaa-security.164.312(c)(2)`,
`soc2.PI1.5` (the fix is a lost-update guard, not a tamper-detection
mechanism or stored-information completeness), `iso-27001.A.8.26` (no new
application-security requirement surface), `gdpr.Art.26` (two distinct
accounts is already the premise). Context note updated:
`context/cmc-consent-primitives.md` (offer `features` comment; new sections
"Relationship features" and "An account cannot consent to itself"; Art.7
demonstrability bullet; server-owned fields and the concurrent-update merge;
code references). Release names corrected in the same pass: the work walked on
2026-10-05 (B.1 above) shipped as open-pryv.io 2.0.0-rc.36 and `@pryv/cmc`
3.18.0, so "the release after 2.0.0-rc.35 (expected ...)" now reads
2.0.0-rc.36 in `gdpr.Art.7`, `gdpr.Art.8`, `iso-27001.A.8.26`,
`iso-27701.A.7.3.4`, `hipaa-privacy.164.508`,
`context/cmc-consent-primitives.md`, `context/delegation-model.md` and FAQ
Q19. B.2 (no new event-type format; `consent/accept-cmc` `content.features`
is now validated by the CMC plugin; data-types 1.1.3 declares it on
`consent/accept-cmc`, the runtime check stays the plugin's), B.3, B.4, B.6, B.9,
B.10: none. B.11: no new config key, header, platform DB or backup change;
the integrity rows it lists were walked here.

**Correction made in the same pass: event history is opt-in.** Rows said or
implied that an event update always keeps the prior value. In open-pryv.io
both built-in stores keep event history only with
`versioning.forceKeepHistory: true`, and the default configuration ships
`false` (accesses are always versioned; that part was right). The audit log
records who changed which event and when (for an update, the event key and
the integrity hash as written), never the prior value. New context note
`context/event-history.md`. Tier change: `hipaa-privacy.164.526` `implemented`
to `configurable` (effort `high`, one setting, config key
`versioning.forceKeepHistory`), because §164.526(c)(1) asks for the
amendment to be appended to or linked from the amended record, which the
default configuration does not keep. Reworded, no tier change: `gdpr.Art.5`
(overview, §1(d)), `gdpr.Art.7` (overview), `gdpr.Art.12`, `gdpr.Art.13`,
`gdpr.Art.16`, `ccpa.1798.106`, `pipeda.Principle.4.6`,
`swiss-nlpd.Art.6`, `swiss-nlpd.Art.19`, `hds.Activity.6`,
`hipaa-privacy.164.508`, `164.530(i)`,
`hipaa-security.164.312(c)(2)` (now cites the integrity hash in the audit
row, `[WNWM]`), `164.316(b)(1)`, `164.316(b)(2)(iii)`, `iso-13485.4.2.4`, `iso-13485.7.3.10`, `iso-27701.A.7.2.4`,
`A.7.4.3`, `soc2.PI1.3`, `PI1.5`, `P5.2`, `P7.1`; context notes
`cmc-consent-primitives.md`, `data-accuracy-structural-vs-semantic.md`;
`docs/pryv-primitives.md` (event), `docs/facilitation-typology.md`, FAQ
accuracy entry.

**Walked 2026-10-13 for open-pryv.io 2.0.0-rc.46 to 2.0.0-rc.50**: no change
to the token classes of consent-bearing methods. The credential methods
refused inside batch calls and over socket.io (rc.47) are credential entry
points, recorded on the authentication / rate-limit rows. See
`SECURITY-REVIEW-2026` in Section A.

**Pre-release walk 2026-10-14 for group accounts over CMC (designed, NOT
released; `GROUP-ACCOUNTS-CMC` in Section A)**. A new consent-bearing trigger
with its own gate, and a new access role:
- `consent/member-access-cmc` (mints an access on a patient account through
  the group's grant) may be written only by a membership access
  (`clientData.cmc.role: 'member'`) or the group's personal token
  (`cmc-member-access-not-member` otherwise), within the membership's team
  streams, with permissions inside the patient's offer, bounded expiry, a
  rate limit and one mint in flight per membership.
- The membership access is NOT exempt from the personal-token gate:
  `consent/accept-cmc` and `consent/scope-update-cmc` on the group account
  stay owner / delegate only, so a member cannot accept patient invites or
  widen grants on the group's behalf.
- Membership offers (`request.membership: true`) are constrained at write
  and at accept (team streams only, `read` / `contribute`, no feature
  permissions, never delegable, never `:_cmc:inbox`).
- Delegation rules unchanged: a delegate token may accept a membership
  (lineage, ends at detach unless kept), and stays refused on
  `consent/request-cmc` / `consent/scope-update-cmc`.
Rows: `gdpr.Art.7` and `gdpr.Art.32`, `hipaa-security.164.312(a)(1)`,
`soc2.CC6.2`, `soc2.CC6.3`, `iso-27001.A.5.15`, `iso-27001.A.5.16` get a
chip (Section A); `hipaa-security.164.312(d)` and `soc2.CC6.1` walked
without change (members authenticate as their own accounts through the
existing sign-in; no new authentication mechanism). Context notes:
`context/cmc-consent-primitives.md` (new sections "Who can read the grants an
account received" and "Group accounts"), `context/delegation-model.md`.
Re-walk at release.

**Release walk 2026-10-15 for open-pryv.io 2.0.0-rc.53**: shipped as above,
with three differences the rows now state. The mint gate admits a membership
access only: the group's personal token is refused too
(`cmc-member-access-not-member`), so the first bullet's "or the group's
personal token" did not ship. The delegation grant guard exempts
`consent/request-cmc` written through a membership a delegate approved, and
nothing else, so members publish the group's patient invites `[DDG04]`; a
delegate cannot approve a membership requested from their own account
`[MB34]`. Offers of any kind (not only memberships) can no longer ask the
streams the plugin manages on the accepter's account (`:_cmc:inbox`,
`:_cmc:_internal`, chats / collectors, the `:_cmc:apps` root) `[CN71]`,
`[MB35]`, `[VC09]`. Rows rewritten as listed under `GROUP-ACCOUNTS-CMC` in
Section A; `hipaa-security.164.312(d)` and `soc2.CC6.1` walked again without
change.

**Walked 2026-10-20 for open-pryv.io 2.0.0-rc.56** (tag `2.0.0-rc.56`, commit
`d8556b84`; merges `61a94e69` for the store-prefixed-id guards, `2975ead2` for
the counterparty destination guard, `e5a6df0d` for stream moves, `0886dab5`
for the deletion-record retention, `fb6da02d` for platform names). A security
release. No token-class change on consent-bearing methods, but several guards
the rows cite had a gap this release closes, so the access-control rows were
walked; rows that stated a protection the gap contradicted now say, neutrally,
from which release it holds. No tier shift, no `planned:` chips involved,
`reviewed_at` left unchanged.
- **Store-prefixed stream ids** (every guard judges the canonical spelling:
  `:local:<id>` and the account store's prefix): plugin-managed regions of
  `:_cmc:` and `:_delegation:*` closed to user writes for every token, the
  owner's included, also as the parent of a created or moved stream, and
  plugin-managed streams cannot be moved or trashed `[CNRP1]` to `[CNRP7]`,
  `[CRPP1]`, `[CRPP2]`, `[DSC05]`, `[CSU01]`, `[CSU02]`, `[DSU01]`,
  `[DSU02]`, `[CNM2A]`, `[CNM2C]`; account-field guards (primary email only
  through `account.update`, non-editable and hidden fields, level caps on
  account-stream permissions) on events and on access creation and update,
  the creator's own permission check included `[ASA1]` to `[ASA7]`; the
  capability re-read before an accept mints `[IA24]`, `[IA25]`.
- **Retry worker processes only server-written records** (author, stream and
  type checked; foreign records retired `cmc-retry-foreign-record`) `[RQ32]`,
  `[CNM2B]`; a retried accept the server authored is refused `[RQ30]`,
  `[RQ31]`.
- **Stream moves** need manage on the whole moved subtree for an app or shared
  access, trashed descendants included; a parent inside the moved subtree is
  refused for every access; the permission walk stops on a stored cycle
  `[STMV]` (`[SMV1]` to `[SMV12]`).
- **Single-use invite withdrawal**
  (https://github.com/pryv/open-pryv.io/issues/160):
  `consent/invalidate-link-cmc` withdraws an open single-use invite; a
  withdrawal racing an accept wins; a consumed one stays a no-op; the offer
  stays readable through the withdrawn link until expiry `[CN100]` to
  `[CN103]`, `[IS13]`, `[CMCIL-C]`, `[CMCIL-C2]`.

| Scope | Ref | What changed | Tests added |
|---|---|---|---|
| gdpr | Art.32 | access-control bullet: single-use invite withdrawal, stream-move rule, account-field guards (with what the earlier releases allowed); delegate-account bullet: namespace closed by every spelling and as a parent, CMC regions likewise, retry worker; new "Calls to a counterparty" bullet (B.11) | `CN100`, `CN102`, `CNRP1`, `CNRP6`, `CNRP7`, `DSC05`, `DSU02`, `CNM2A`, `CNM2B`, `RQ32`, `ASA1`, `ASA6`, `SMV1`, `SMV10` (+ B.11 codes) |
| gdpr | Art.7 | §3 note: a revoke notice to a refused destination is not queued; the retry loop acts only on server-written records | `HR41`, `RQ33`, `RQ32` |
| iso-27001 | A.5.15 | new paragraphs: plugin-managed and account streams judged by every spelling (correction: earlier releases held for canonical ids only); stream-move rule | `CNRP1`, `CNRP6`, `CNRP7`, `DSC05`, `ASA3`, `ASA6`, `SMV1`, `SMV4`, `SMV10` |
| iso-27001 | A.8.2 | new detail: account-field guards; correction, earlier releases let an access holding `contribute` on the email field change the primary email, and a `*` app grant an account field | `ASA1`, `ASA2`, `ASA3`, `ASA6` |
| iso-27001 | A.8.3 | new detail: stream-move rule; correction, earlier releases let a lower-granted child move into the target parent's permissions | `SMV1`, `SMV2`, `SMV3`, `SMV4`, `SMV5`, `SMV10` |
| hipaa-security | 164.312(a)(1) | new paragraphs: plugin-managed and account streams by every spelling, retry worker, stream moves (with the earlier gap) | `CNRP1`, `CNRP6`, `CNRP7`, `DSC05`, `ASA1`, `ASA2`, `ASA3`, `ASA6`, `CNM2B`, `RQ32`, `SMV1`, `SMV4` |
| soc2 | CC6.1 | new paragraph: privileged streams by every spelling (with the earlier gap) | `ASA1`, `ASA2`, `ASA6`, `CNRP6`, `CNRP7` |
| soc2 | CC6.3 | new paragraph: least privilege when streams move; correction, the overview's "cannot touch out-of-scope data" did not hold for stream moves before rc.56 | `SMV1`, `SMV2`, `SMV3`, `SMV4`, `SMV10` |

Context notes: `context/cmc-consent-primitives.md` (table row and paragraph
on `consent/invalidate-link-cmc`; new sections "Plugin-managed regions are
closed by every spelling of an id" and "Calls to a counterparty: destination
guard"; revoke-notice delivery residual; code references),
`context/delegation-model.md` (namespace guard posture: rc.56 closure and the
earlier gap), `docs/pryv-primitives.md` (stream primitive: move rule,
plugin-managed streams by every spelling).

Walked without change: `soc2.CC6.2`, `iso-27001.A.5.16`,
`hipaa-security.164.312(d)` (no authentication change);
`iso-27001.A.5.18` (lifecycle of access rights unchanged; the move rule is
recorded on A.5.15 / A.8.3); `iso-27701.A.7.3.4`, `hipaa-privacy.164.508`
(withdrawal of a consent given is unchanged: withdrawing an unaccepted invite
is the requester's act, before any consent exists; it is recorded on
`gdpr.Art.32` and the CMC context note); `gdpr.Art.8` (no change to the
carer / delegate consent paths); `gdpr.Art.25` default 10 (consent still
required; the invite withdrawal narrows exposure, already covered by Art.32);
`hipaa-security.164.312(c)(1)` and `soc2.PI1.3` (the retry-worker fix stops a
crafted record being acted on, recorded as access control; no stored-record
integrity claim shifts). B.1: no new API method; `consent/invalidate-link-cmc`
gains the single-use case and new error ids (`cmc-reserved-stream`,
`delegation-reserved-stream`, `cmc-retry-foreign-record`,
`cmc-retry-system-authored`, `cmc-handler-destination-refused`,
`cmc-capability-destination-refused`) are cited where the rows need them.
B.3, B.4, B.6, B.9, B.10: none.

**Not row-relevant**: usernames and the platform's DNS names share one
namespace (registration, `check_username`, username change, admin
pre-registration and delegated account creation refuse core ids,
`dns.staticEntries` keys and runtime DNS record names; a new DNS record or
core id under an account's name is refused; `[RR13]`, `[RR14]`, `[PLH7]`,
`[PLH8]`, `[BNCX4]`): a reachability fix no row claims against. The backup
rows' "a restore refuses names the platform routes itself" (`[BKRN1]` on
`hipaa-security.164.308(a)(7)(ii)(A)`, `iso-27001.A.8.13`, the
`backup-restore` primitive) holds and now covers these names too: walked
without change. `streams.update` refusing a `parentId` inside the moved
subtree for every access (`[SMV10]`) is cited with the move rule.

**Next release (unreleased on open-pryv.io master at this walk, not claimed by
any row)**: the receiver-owned fields of a received revoke notice
(`superseded`, `backChannelAccessId`, `dataGrantAccessId`,
`revokedAccessIds`) written by the receiving server only (`d4fa7acc`); event
type catalogue 1.3.1 and 1.3.2 (description changes, B.2 below); upgrade
advice wording; licence headers on three scripts; a test made independent of
its neighbour. `context/cmc-consent-primitives.md` says a late notice "is
marked `content.superseded` on arrival", which holds before and after; re-walk
`gdpr.Art.7` and that note at the release that carries `d4fa7acc` in case the
server-owned wording is wanted.

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

**Walked 2026-10-13 for open-pryv.io 2.0.0-rc.46 to 2.0.0-rc.50**: PKCE values
must have the RFC 7636 form (rc.50, `[PKCF1]`, `[PKCV1]`) and a signed `state`
with a non-ASCII signature is refused (rc.47, `[OE29]`); no row change (the
rows already claim mandatory S256 PKCE). See `SECURITY-REVIEW-2026` in
Section A.

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

**Walked 2026-10-06 for open-pryv.io 2.0.0-rc.38**: no new config key,
response header, platform DB or backup behaviour. Its event-update integrity
fix (server-written fields survive a concurrent client update, merge
`461f3c4c`) is recorded with the CMC changes under B.8 (`gdpr.Art.32`,
`hipaa-security.164.312(c)(1)`, `soc2.PI1.3`).

**Walked 2026-10-13 for open-pryv.io 2.0.0-rc.46 to 2.0.0-rc.50** (the
security-review releases): rate and resource limits, logging, integrity,
response headers, backup and restore. Recorded with the rows and test codes
under `SECURITY-REVIEW-2026` in Section A, including two corrections
(password logins are throttled in-process since rc.47; recipient-key backup
encryption gives confidentiality, not authenticity). Releases 2.0.0-rc.40 to
2.0.0-rc.45 are not walked yet (see "Not yet walked" in that entry).

**Walked 2026-10-14 for open-pryv.io 2.0.0-rc.51**: incremental backup chain
(`incrementals/<runId>/`, `chain.json`, `--through-run`, `--allow-incomplete`,
`--inspect`, per-run envelope and decrypt script, erased accounts dropped on
restore) and `custom.systemStreams.other` refused at boot. Recorded with the
rows and test codes under `SECURITY-REVIEW-2026` in Section A ("Section B walk
for 2.0.0-rc.51").

**Walked 2026-10-15 for open-pryv.io 2.0.0-rc.53** (group accounts,
`GROUP-ACCOUNTS-CMC` in Section A). New keys `cmc.memberAccess.defaultTtl`,
`minTtl`, `maxTtl`, `ratePerMinute`, `maxInFlightPerMembership`,
`allowNameOnly`, `sweepIntervalMs`; `cmc.retryLoop.*` now declared in
`default-config.yml` with **`cmc.retryLoop.enabled` defaulting to `true`**
(behaviour change: the loop that re-sends revoke notices, retries member
sweeps and runs the periodic ledger pass runs on every core) and a new
`cmc.retryLoop.startScheduler`. Added to `config_keys:` where a row cites
the behaviour they govern: `hipaa-security.164.308(a)(3)(ii)(C)`,
`164.312(a)(1)`, `164.312(a)(2)(i)` (`allowNameOnly`), `iso-27001.A.5.15`,
`A.6.5`, `gdpr.Art.7` (`retryLoop.enabled`). Transport, header,
application-security, platform DB and backup rows: not affected (a core that
ran with the loop off retires its old retry records as `cmc-retry-stale`
instead of replaying them; an operational note, no row claim).

**Walked 2026-10-20 for open-pryv.io 2.0.0-rc.56** (tag `2.0.0-rc.56`, commit
`d8556b84`). Two new config keys; no new response header, platform DB or
backup behaviour. The access-control half of the release is under B.8 (same
date). No tier shift, no `planned:` chips involved.
- **`cmc.allowedPrivateHosts`** (default `[]`; merge `2975ead2`). Calls to a
  counterparty (consent deliveries, chat, revocations, scope updates, the
  capability read of an accept, delegation notices, OAuth revocation notices)
  are refused before any connection toward a loopback, private, link-local or
  otherwise reserved address (the webhook address rules, checked again at
  connect time), over `http:` unless `cluster.allowInsecurePeerUrl`, or with
  credentials in the URL; a redirect or an answer over 1 MiB is refused; the
  platform's own host names are always allowed (never an IP literal by that
  rule); the key lists private peers (host names, IPs, CIDR ranges, same
  grammar as `webhooks.allowedPrivateHosts`, checked at boot); a refused
  delivery is permanent and never queued. Tests: business `[PFR1]` to
  `[PFR11]`, cmc `[CO20]` to `[CO23]`, `[HC13]`, `[HR41]`, `[RQ33]` (and
  `[HA08b]`, `[HA08c]`, `[HMA16b]`, `[MR44b]`, cited in prose only: the
  matrix `tests:` field takes upper-case codes).
  - `iso-27001.A.8.26`: third example block (outbound calls); `config_keys`
    `cmc.allowedPrivateHosts`; tests `PFR1`, `PFR2`, `PFR4`, `PFR5`, `PFR6`,
    `PFR10`, `CO21`, `CO22`, `RQ33`.
  - `iso-27001.A.8.20`: outbound-side paragraph; `config_keys`
    `cmc.allowedPrivateHosts`, `cluster.allowInsecurePeerUrl`; tests `PFR1`,
    `PFR2`, `PFR3`, `PFR4`, `CO22`.
  - `soc2.CC6.6`: new detail (the boundary holds outbound); `config_keys`
    `cmc.allowedPrivateHosts`; tests `PFR1`, `PFR2`, `PFR3`, `PFR5`, `CO22`.
  - `soc2.CC6.7`: counterparty calls refuse `http:`; `config_keys`
    `cluster.allowInsecurePeerUrl`; test `PFR4`.
  - `hipaa-security.164.312(e)(1)`: "Calls to a counterparty" paragraph
    (deliveries carry a data grant's endpoint; earlier releases applied
    neither check); `config_keys` `cluster.allowInsecurePeerUrl`,
    `cmc.allowedPrivateHosts`; tests `PFR1`, `PFR4`, `CO22`.
  - `gdpr.Art.32`: new "Calls to a counterparty" bullet; `config_keys`
    `cmc.allowedPrivateHosts`, `cluster.allowInsecurePeerUrl`; tests `PFR1`,
    `PFR2`, `PFR4`, `PFR5`, `PFR6`, `CO22`.
  - `gdpr.Art.7`: a revoke notice to a refused destination is not re-sent
    (B.8 table); `config_keys` `cmc.allowedPrivateHosts`.
  - `context/cmc-consent-primitives.md`: new section "Calls to a
    counterparty: destination guard".
  - Walked without change: `soc2.CC6.8` (malicious-software prevention; the
    guard protects the network, not content), `iso-27001.A.8.24`,
    `hipaa-security.164.312(e)(2)(i)`, `164.312(e)(2)(ii)` (no change to the
    cryptography Pryv applies; the `http:` refusal is recorded on the
    transmission rows above), `context/subprocessor-posture-and-data-flow.md`
    (outbound calls go to the counterparties the implementer's users choose,
    no new subprocessor).
- **`accesses.deletionRecords.retentionDays`** (default 0 = kept until the
  account is deleted; merge `0886dab5`). Above 0 the master purges, once a
  day, the deletion records of accesses deleted more than that many days ago,
  with their version rows and access-index rows; past it an audit row or an
  event's author shows such an access by id only, and
  `/system/accesses/:accessId` no longer resolves it; a bad value stops the
  boot. Tests `[ADPG]` (`[ADP1]`, `[ADP2]`), `[ADRP]` (`[ADR1]` to `[ADR5]`).
  - `hipaa-security.164.312(b)`: deletion records resolve audit rows while
    kept; `config_keys`; tests `ADP1`, `ADR5`.
  - `hipaa-security.164.316(b)(2)(i)`: new "Access deletion records"
    paragraph (a retention below six years shortens attribution);
    `config_keys`; test `ADP1`.
  - `gdpr.Art.33`: the breach-scope lookup resolves revoked accesses unless
    purged; `config_keys`; test `ADP1`.
  - `gdpr.Art.25`: "Still in your hands" retention bullet; `config_keys`;
    tests `ADP1`, `ADR5`.
  - `gdpr.Art.15`: deleted accesses listed while their records are kept;
    `config_keys`.
  - `gdpr.Art.5` (§1(e)): "no TTL / auto-delete primitive" now reads "for
    account data", with the one narrow built-in purge named. `reviewed_at`
    left unchanged.
  - Context notes: `context/data-retention-operator-owned.md` (background
    loops list; it named two loops as the only ones, now lists the CMC retry
    loop too), `context/account-backup-coverage.md` (Art.15(1)(c) recipients
    of the past).
  - Walked without change: `iso-27001.A.8.15` (the audit rows themselves are
    kept, each with its access id), `iso-27001.A.5.18`, `soc2.CC7.2`,
    `soc2.P6.6`, the breach rows of `hipaa-breach`, `pipeda` and
    `swiss-nlpd`, `context/breach-notification-delivery-operator-owned.md`
    (they cite `bin/breach-scope.js` or the reverse index without claiming
    that revoked accesses resolve; `gdpr.Art.33` carries the caveat).

**Walked 2026-10-26 for open-pryv.io 2.0.0-rc.58** (external ids, full
surface under B.1 of the same date). No new config key or response header.
Platform DB and backup behaviour:
- **New platform DB rows** `ext-id-ns/<namespace>` and
  `ext-id/<nsToken>/<valueToken>` (value: a core id); new PlatformDB
  primitives `claimCoreRow` / `getCoreRow` / `deleteCoreRowIfValue` /
  `getAllCoreRows`; a home-core local table (PostgreSQL `external_ids`,
  SQLite `external-ids.db`).
- **Backups**: the namespace rows travel in the platform data stream with
  their salts (an older restore skips them); a restore keeps a live
  namespace whose salt differs and reports it
  (`extIdNamespaceSaltMismatch`) `[XIDB1]`. The `ext-id/` rows are not
  backed up; the per-user backup does not carry the account's links in
  this release.
- **New operator tool**: `bin/reconcile-user-cores.js --ext-ids
  [--old-pepper <BASE64>] [--dry-run]` (token refresh after a pepper
  rotation or a PII-mode switch, stale rows deleted, missing rows claimed
  again, ids of deleted accounts released, refusal with exit code 3 when
  the local table is empty and the index holds the core's ids);
  `bin/platform-pii-rotate.js` refreshes the core's ids itself.
Rows: `iso-27001.A.8.13` (new paragraph, `XIDB1`), the `backup-restore`
primitive, `context/operator-backup-coverage.md` (new symmetry row and gap
note). Walked without change: `hipaa-security.164.308(a)(7)(ii)(A)` / `(B)`,
`hds.Activity.5`, `soc2.PI1.5`, `soc2.A1.2` (they describe the per-user
backup and its encryption, which are unchanged; the missing per-user links
are recorded in the context note), the integrity rows (`gdpr.Art.32`
§1(b), `iso-27001.A.8.14` / `A.8.22`: no change to the platform DB
integrity check), the transport and application-security rows (no new
header or transport setting). Erasure (`gdpr.Art.17`, `ccpa.1798.105`)
recorded under B.1.

**Walked 2026-10-26 for open-pryv.io 2.0.0-rc.59 and the next release**
(external ids, second wave; full surface under B.1 of the same date).
- **2.0.0-rc.59**: no new config key, header, platform DB or backup
  behaviour. The forced-mode holder check is a core-to-core call that
  uses the admin key and refuses `http:` unless
  `cluster.allowInsecurePeerUrl`, and gives no admin key to a home core
  URL that is not a usable core URL `[XIDFC4]`; recorded on
  `gdpr.Art.32` (which already lists the key).
- **Next release, new config keys**:
  `services.email.enabled.externalIdReleased` and
  `services.email.externalIdReleasedTemplate` (the holder notice of the
  admin release); added to `gdpr.Art.12` `config_keys`.
- **Next release, backup**: the per-user backup of `bin/backup.js`
  carries each account's ids (`users/<userId>/external-ids.jsonl[.gz]`:
  namespace, blinded value, claim date), incremental chains included;
  the restore links them again after the platform rows; an id held
  meanwhile by another account or core stays with its holder (`lost`),
  an id of an absent namespace is `skipped`; a backup written earlier
  restores without ids; an account rolled back by `--verify-integrity`
  keeps its restored ids `[XIDB2]`..`[XIDB4]`, `[XIDBK1]`, `[XIDBK2]`,
  `[XIDS18]`. Sensitivity: a blinded value can claim its id, so the
  per-user backup must be protected like a claim credential. Rows:
  `iso-27001.A.8.13` (paragraph extended), `gdpr.Art.32` Restoration
  bullet, `gdpr.Art.17` (B.1), the `backup-restore` and
  `external-id-index` primitives, `context/operator-backup-coverage.md`
  (row and gap note).
- **Next release, platform DB**: a core rename moves the core's
  `ext-id/` rows (only those naming it) and reports the number
  (`externalIds`) `[ADRN2]`, `[XIDP7]`; `context/core-affinity-architecture.md`.
Walked without change: `hipaa-security.164.308(a)(7)(ii)(A)` / `(B)`,
`hds.Activity.5`, `soc2.PI1.5`, `soc2.A1.2` (they describe the per-user
backup and its encryption in general; the backup now holding more of the
account changes no claim, and the sensitivity note is on
`iso-27001.A.8.13`), the integrity, transport and application-security
rows (no change).

**Walked 2026-10-29 for 2.0.0-rc.66** (alias and
username-change hardening, open-pryv.io `4547b32a`).
- **New config keys**: `accesses.maxAliasesPerAccount` (default 1000,
  aliases one account may hold; past it `randomAlias` is refused
  `invalid-operation`, `[AL12]`): added to `gdpr.Art.32` `config_keys`
  (pseudonymisation bullet), the `randomAlias` primitive.
  `auth.usernameChangeLimit` (default 2, `0` disables; declared in
  `default-config.yml` for the first time, the behaviour is unchanged):
  the `randomAlias` primitive; no row cites username changes, none
  changed.
- **Config refusal**: custom account stream ids `username` /
  `usernameChangeCount` refused at boot (`[SDB3]`): `gdpr.Art.32`,
  the `randomAlias` primitive, the ALIASES proposal.
- **Backup**: the per-user manifest carries the account's aliases and
  the restore reserves them; series under former usernames exported and
  restored under the username (`[BKAL1]`, `[BKAL3]`). Rows:
  `iso-27001.A.8.13` (paragraph added), `gdpr.Art.32` pseudonymisation
  bullet, the `backup-restore` and `randomAlias` primitives,
  `context/operator-backup-coverage.md` (new row; the stale
  `pseudonymise` note corrected).
- **Platform DB**: name to core rows written for aliases and changed
  usernames on a single core too; `bin/reconcile-user-cores.js` now
  applies on a single core (one run after upgrading; refuses an empty
  users index, exit 3); the platform integrity check now reports user
  ids unknown to the users index (it could not before; blind on SQLite).
  `context/core-affinity-architecture.md` not changed (routing model
  unchanged). One-time repair `bin/gather-former-series.js` for series of
  accounts renamed earlier: no row change.
Walked without change: `hipaa-security.164.308(a)(7)(ii)(A)` / `(B)`,
`hds.Activity.5`, `soc2.PI1.5`, `soc2.A1.2` (per-user backup in general),
the integrity rows (`gdpr.Art.32` §1(b), `iso-27001.A.8.14` / `A.8.22`:
the users-index check now reports orphans, no claim relied on it), the
transport and application-security rows. Once 2.0.0-rc.66 was tagged
(2026-10-30), the codes cited in prose joined the rows' `tests:` arrays:
`gdpr.Art.32` (`ALRT1`, `BKAL1`, `AL12`, `SDB3`, `AL08`),
`hipaa-privacy.164.514(c)` (`BKAL1`, `ALRT1`), `iso-27001.A.8.13`
(`BKAL1`, `BKAL3`). The validator resolves them against an open-pryv.io
checkout holding 2.0.0-rc.66 or later.

**Pre-release walk 2026-10-29 for account auto-deletion (implemented on a
branch, NOT released; `ACCOUNT-AUTO-DELETION` in Section A)**. New per-core
block `account.autoDeletion.*` (`enabled`, `dryRun`, `inactivity.defaultDays`
/ `minDays` / `maxDays`, `userOverride`, `allowUserOptOut`,
`date.minLeadDays`, `reminders.leadDays` / `minNoticeDays`, `sweepIntervalMs`,
`maxDeletionsPerPass`, `transfer.claimWindowDays`,
`transfer.identitySecretsKey` (a YAML-only secret, unused until the transfer
ships)); boot check: an inactivity preset with `accessTracking.isActive: false`
refuses the boot, a preset without mail or `service.account` is a warning.
Mail switches `services.email.enabled.accountDeletionScheduled` /
`accountDeletionReminder` / `accountDeletionBlocked`. Closest precedent
`accesses.deletionRecords.retentionDays` (a built-in purge with an opt-in
period). Not security-transport keys: the rows they govern are the retention
and erasure rows chipped in Section A; `config_keys:` are added there at
release. No transport, header, platform DB or backup change.

## Section C: Maintenance reminders

- **Quarterly review**: run a full pass of authored rows and check
  that `pryv_primitives` + `tests:` + `config_keys:` references still
  resolve. The validator catches most stale references at CI time;
  this pass catches semantic drift (e.g., a primitive whose meaning
  evolved).
- **At each gap-probing sweep close**: full review of this file
  against the current matrix state, confirm every Section A entry
  is still accurate + every shipped item has been removed.
- **At each new gap-probing Q close** (an implementer-perspective
  question answered against the matrix): if the Q produced a new
  backlog slug, add a Section A entry alongside the proposal mirror
  + planned chips.

### Temporary "Known gap" clauses (remove when the fix ships)

Clauses that disclose a shipped behaviour expected to change with a
fix. Each one must be removed (or rewritten as the fixed behaviour,
with the release name and test codes) in the walk of the release that
ships the fix.

| Added | Where | Gap | Remove when |
|---|---|---|---|
| (none open) | | | |

Discharged: the 2026-10-26 clause on external ids missing from the
per-user backup (observed on open-pryv.io 2.0.0-rc.58 and rc.59; in
`iso-27001.A.8.13`, the `external-id-index` and `backup-restore`
primitives and `context/operator-backup-coverage.md`). Fixed in
2.0.0-rc.60 (`f3db0564`); each place now names that release as the fix
and keeps the gap for rc.58 and rc.59 only, citing `[XIDB2]`..`[XIDB4]`,
`[XIDBK1]`, `[XIDBK2]` (re-walk recorded under B.1, 2026-10-26).

Discharged: the 2026-10-14 clause on CMC withdrawal of delegable grants
(derived accesses surviving every teardown path but `accesses.delete`,
observed on open-pryv.io 2.0.0-rc.51; in `gdpr.Art.7`,
`hipaa-security.164.312(a)(1)`, `context/workforce-access-patterns.md`
Pattern 2 and `context/cmc-consent-primitives.md`). Fixed in 2.0.0-rc.52
(`96af58ad`); each clause was rewritten on 2026-10-15 as the fixed
behaviour, naming the release, `[MAAC]`, `[CMCHS-APPGRANT]`, `[GA24]` and
`bin/access-scope-audit.js` for accesses an earlier withdrawal left behind
(walk recorded under `GROUP-ACCOUNTS-CMC` in Section A).
