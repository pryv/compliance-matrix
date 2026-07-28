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

**Where the work lives**: `open-pryv.io`
(`components/business/src/mfa/`). Reference TOTP / WebAuthn plugins +
AAL-tier mapping docs.

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

### `QUICKSTART-DOCKER-HTTP-EXAMPLE` (DX-only: no matrix row updates)

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

**Where the work lives**: `dev-deploy` or new docs repo
(reference nginx / HAProxy / Cloudflare configs). Q6 outcome,
voluntarily missing at Pryv layer; ship reference configs.

**Tracking card**: https://github.com/orgs/pryv/projects/5?pane=issue&itemId=219705775&issue=pryv%7Copen-pryv.io%7C117

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.8.21 | enhancement | low | row cites concrete reference configurations instead of the architectural rationale alone |
| hipaa-security | 164.308(a)(5)(ii)(C) | enhancement | low | log-in monitoring gains a companion enforcement artefact on the auth endpoints |

Proposal: `proposals/rate-limiting-recipes.md` (filed 2026-07-28,
alongside `context/rate-limiting-and-dos-protection.md`). Chips live on
both rows above.

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

### `SUPPLY-CHAIN-SCANNING-PIPELINE`

**Where the work lives**: `open-pryv.io`, CI workflow
(`.github/workflows/ci.yml`) + `Dockerfile` + (optionally) a
release-time SBOM publishing step. Three-phase: in-CI gates (npm
audit + base-image digest pin + rqlite tarball checksum); pipeline
tooling (Syft + Grype for SBOM + image scan; CycloneDX artefact
publishing); provenance + signing (cosign + SLSA attestation).
Surfaced 2026-05-21 by supply-chain compliance gap-probing.

User-recommended candidate tools (Q24): OWASP-ZAP / Snyk / Grype.
Noting OWASP-ZAP is DAST not SCA, Phase 3 candidate as separate
web-app security testing if Pryv wants to extend beyond the
software-supply-chain scope.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.5.21 | feature | medium | drop overstated "published dependency-audit pipeline" prose; add `tests: [CIYAML]` citation; coverage F:Awareness Low → F:Evidence Medium |
| gdpr | Art.32 | feature | low | detail block gains "supply-chain hygiene" sub-bullet under §1(b)/(c) ongoing CIA |
| hipaa-security | 164.308(a)(8) | feature | low | periodic technical evaluation gains a concrete artefact (SBOM + latest scan output) |
| iso-27001 | A.5.23 | feature | low | strengthens cloud-services exit narrative, operator hands SBOM + signed-image proof to the next CSP for migration |
| iso-27001 | A.8.30 | enhancement | low | when operator's "supplier" is Pryv, the SBOM + signed image + CHANGELOG combine into the supplier-monitoring artefact set |
| iso-27001 | A.5.22 | feature | medium | row may need to be ADDED, A.5.22 "Monitoring of supplier services" doesn't currently have matrix coverage; the supply-chain pipeline gives it concrete content |

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
