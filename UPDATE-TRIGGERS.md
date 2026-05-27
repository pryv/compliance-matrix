# Compliance-matrix update triggers

When work on Pryv-the-software ships — bug fix, feature, refactor — it
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

This file is **not** auto-generated yet — entries are added by hand
when filing a backlog item. A future small dev could generate the
"planned backlog → rows" section directly from
`dist/compliance.sqlite`'s `planned_changes` table.

## Section A — Backlog items with `planned:` chips in the matrix

When the listed backlog ships on **open-pryv.io** (or whichever
sub-repo holds the work), update the listed matrix rows + remove the
corresponding `planned:` entries. The full proposal mirror under
`compliance-matrix/proposals/<slug>.md` documents the post-ship row
shape ("After shipping" column in each proposal's table).

The mapping below mirrors `dist/compliance.sqlite`
`planned_changes` table — regenerate with:

```
sqlite3 compliance-matrix/dist/compliance.sqlite \
  "SELECT backlog, scope_id, ref, kind, impact, summary FROM planned_changes ORDER BY backlog, scope_id, ref;"
```

### `ACCOUNT-BACKUP-DSAR-COMPLETENESS`

**Where the work lives**: `pryv-account-backup` repo (npm
`@pryv/account-backup`). Phase 1 = audit-log fetch + HF series data
fetch + webhooks fetch + drop v1-only `/followed-slices` + chunk
events. Phase 2 = access history + CMC counterparty metadata. Phase 3 =
restore-path Art.20 round-trip.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.15 | bug | medium | drop "tooling caveat" prose in detail; chip removed |
| gdpr | Art.15 | feature | low | chip removed; events chunking documented |
| gdpr | Art.20 | feature | medium | restore-side tightens after Phase 3 |
| ccpa | 1798.110 | bug | low | chip removed |
| pipeda | Principle.4.9 | bug | low | chip removed |
| swiss-nlpd | Art.25 | bug | low | chip removed |
| hipaa-privacy | 164.524 | bug | low | chip removed |

Proposal: `proposals/account-backup-dsar-completeness.md`

### `ALIASES`

**Where the work lives**: `open-pryv.io` (new `auth.randomAlias`
primitive). Aliases as Pryv-native pseudonymisation.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.4 | feature | medium | mention `auth.randomAlias` as pseudonymisation primitive |
| gdpr | Art.32 | feature | medium | name aliases as switch-on primitive at Art.32 §1(a); coverage stays F:Infrastructure but adds primitive entry |
| hipaa-privacy | 164.514(c) | feature | medium | row likely moves F:Storage → Configurable (alias IS the re-id code) |
| iso-27001 | A.8.11 | feature | medium | row could move F:Primitive → Configurable |
| iso-27701 | A.7.4.5 | feature | low | stronger derives_from |
| ccpa | 1798.140(ae) | feature | low | deployment-pattern recommendation shifts |

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

### `AUDIT-ON-USER-DELETE`

**Where the work lives**: `open-pryv.io`. Bug: `accesses.delete`
pipeline lacks `auditStorage.deleteUser` (PG audit silently survives
`auth.delete`). Feature: operator setting `audit.onUserDelete: erase |
keep | pseudonymise` (default `erase`).

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.17 | bug | medium | drop "engine-dependent gap" prose; chip removed |
| gdpr | Art.17 | feature | low | document operator setting |
| ccpa | 1798.105 | bug | medium | chip removed |
| ccpa | 1798.105 | feature | low | chip removed |
| iso-27701 | A.7.4.5 | bug | medium | chip removed |
| hipaa-security | 164.316(b)(2)(i) | feature | medium | `keep` mode = HIPAA-friendly retention path |

Proposal: `proposals/audit-on-user-delete.md`

### `CLOCK-SKEW-CLUSTER-CHECKS`

**Where the work lives**: `open-pryv.io`
(`components/business/src/bootstrap/applyBundle.ts` +
`components/business/src/acme/`). Two small intra-core checkpoints:
bootstrap-join skew check + pre-cert-load validity check.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.8.17 | feature | medium | row moves Out-of-scope → F:Awareness | Low |

Proposal: `proposals/clock-skew-cluster-checks.md`

### `E2E-ENCRYPTION`

**Where the work lives**: `open-pryv.io` (research direction — proxy
re-encryption; pryv/service-core#516). End-to-end encryption: server
itself never holds plaintext.

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

### `WEBHOOK-CASCADE-ON-ACCESS-DELETE`

**Where the work lives**: `open-pryv.io`
(`components/business/src/webhooks/repository.ts` +
`components/api-server/src/methods/accesses.ts`). Small dev. Bug fix —
`accesses.delete` should cascade to webhooks; today it doesn't.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| hipaa-security | 164.308(a)(3)(ii)(C) | bug | medium | termination procedures story tightens |
| iso-27001 | A.5.16 | bug | medium | dangling-webhook gap closes |
| iso-27001 | A.5.18 | bug | low | removal step now complete |

Proposal: `proposals/webhook-cascade-on-access-delete.md`

### `BREACH-SCOPE-TOOL`

**Where the work lives**: `open-pryv.io`. Three phases —
PlatformDB reverse-index + `GET /system/accesses/<accessId>`,
audit row extensions (`recordCount` + `affectedStreamIds`),
`bin/breach-scope.js` CLI.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.33 | feature | medium | tier could shift F:Evidence Med → F:Evidence High |
| swiss-nlpd | Art.24 | feature | medium | inherits gdpr.Art.33 |
| pipeda | s.10.1 | feature | medium | RROSH evidence chain tightens |
| hipaa-breach | 164.404(b) | feature | medium | tier shifts F:Awareness Low → F:Evidence Medium |
| hipaa-breach | 164.404(c) | feature | medium | tier shifts Out-of-scope → F:Evidence Medium |
| hipaa-breach | 164.414 | feature | medium | combines with AUDIT-LOG-CHAINING for non-repudiation |

Proposal: `proposals/breach-scope-tool.md`

### `QUICKSTART-DOCKER-HTTP-EXAMPLE` (DX-only — no matrix row updates)

**Where the work lives**: `open-pryv.io/INSTALL.md` + `dev-site/src/customer-resources/pryv.io-setup.md` documentation. Three reader-experience papercuts surfaced during a walk-through of the dnsLess + HTTP + Docker quickstart on a fresh box (mbp2, 2026-05-27): (1) env-var placeholders in `production-config.yml` aren't expanded; (2) the Docker image bundles rqlite + SQLite but not PostgreSQL/MongoDB; (3) the "Minimal production config" example omits several required `storages.engines.*` path keys.

**No matrix impact.** Pure installation ergonomics — doesn't change any tier coverage on any scope row. When shipped, INSTALL.md's worked example becomes complete; no matrix scope row changes. Partial mitigation already in dev-site (`bc67e79` on dev-site master, deployed to `pryv.github.io` `12f726f` 2026-05-27) — the customer-facing `pryv.io-setup.md` now flags all three papercuts.

Filed in `_plans/XXX-Backlog/QUICKSTART-DOCKER-HTTP-EXAMPLE.md`.

### `MBP2-MULTICORE-SIMULATION` (DX-only — no matrix row updates)

**Where the work lives**: `macroPryv/_local/scripts/` launcher + workflow doc. A `mbp2-multicore.sh` that boots two `pryvio/open-pryv.io` Docker containers + shared PG + does the full `bin/bootstrap.js` cluster-CA + mTLS + rqlite-peering + dnsLess cross-core-forwarding dance end-to-end on the local LAN test box.

**No matrix impact.** Operational sugar for dev verification of multi-core PRs without a Dokku pre-prod cycle. When shipped, future multi-core changes (Plans 34/35/53/54 follow-ups, eventually upstream changes to bootstrap CLI / mTLS material / rqlite TLS) gain a fast local verification path; no scope row changes.

Filed in `_plans/XXX-Backlog/MBP2-MULTICORE-SIMULATION.md`. Pairs naturally with `PLAN54-LE-STAGING-DRILL-RUNBOOK.md` (the LE drill becomes easier once the multi-core launcher exists).

### `BUILTIN-STORE-OVERRIDE` (DX-only — no matrix row updates)

**Where the work lives**: `open-pryv.io`
(`components/mall/src/index.ts` register-order change +
`config-validation` schema addition).

**No matrix impact.** This is operational sugar, not a
compliance-shifting fix — see
`_plans/XXX-Backlog/BUILTIN-STORE-OVERRIDE.md` for the
explicit DX-only classification. When shipped, update
`context/audit-archival-via-custom-datastore.md` Flavour B
section with the `override: true` config snippet; no scope
row changes.

Filed during Q16; flagged as scope-drift example in
`_claude-memory/feedback_gap_probing_scope_discipline.md`.

### `RATE-LIMITING-RECIPES` (no proposal mirror yet)

**Where the work lives**: `dev-deploy` or new docs repo
(reference nginx / HAProxy / Cloudflare configs). Q6 outcome —
voluntarily missing at Pryv layer; ship reference configs.

No `planned:` chips today (waiting on `proposals/rate-limiting-
recipes.md` to be filed alongside `context/rate-limiting-and-dos-
protection.md`). Likely affected rows when configs ship:

| Scope | Ref | Suggested kind | Note |
|---|---|---|---|
| iso-27001 | A.8.21 | enhancement | cite the recipes |
| hipaa-security | 164.308(a)(5)(ii)(C) | enhancement | cite the recipes |

### `PLATFORMDB-AT-REST-ENCRYPTION`

**Where the work lives**: `open-pryv.io` — `storages/engines/rqlite/`
+ `storages/interfaces/platformStorage/` + INSTALL.md. Two
implementation paths: rqlite native disk encryption (Path 1, ~1d)
or storage-adapter envelope encryption (Path 2, ~2-3d). Operator-
supplied `platformDB.atRestKey` (32-byte base64) — operator-sync
identical to `letsEncrypt.atRestKey`. Surfaced by Plan 71 Q25
(2026-05-21) — multi-region PlatformDB cross-border analysis.

Defence-in-depth against SSD / backup-tape / decommissioned-
hardware forfeiture + filesystem-level read breach + foreign-
jurisdiction subpoena of the storage layer. Does NOT cover runtime
memory dumps or application-level breaches; pairs with
`PLATFORMDB-PII-HASHING` for the replication-stream side.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.32 | feature | medium | concrete encryption-at-rest evidence at PlatformDB layer; chip removed |
| gdpr | Art.46 | enhancement | low | reduces residual passive-forfeiture risk even with SCCs in place; detail prose tightens |
| iso-27001 | A.5.33 | feature | medium | record protection — concrete cryptographic control on PlatformDB |
| iso-27001 | A.8.24 | feature | medium | use-of-cryptography clause gains the PlatformDB instance |

Proposal: `proposals/platformdb-at-rest-encryption.md`.

### `PLATFORMDB-PII-HASHING`

**Where the work lives**: `open-pryv.io` — `components/platform/`
+ `storages/engines/rqlite/` + system-streams config +
registration flow + `bin/migrate.js`. Three configurable postures:
`cleartext` (today, default), `hashed` (HMAC username + email),
`minimised` (HMAC username only; email stripped from PlatformDB
entirely, accepting loss of "find username by email" recovery
flow). Operator opts via new `platform.piiMode` config key.
Surfaced by Plan 71 Q25 (2026-05-21).

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

**Where the work lives**: `open-pryv.io` — CI workflow
(`.github/workflows/ci.yml`) + `Dockerfile` + (optionally) a
release-time SBOM publishing step. Three-phase: in-CI gates (npm
audit + base-image digest pin + rqlite tarball checksum); pipeline
tooling (Syft + Grype for SBOM + image scan; CycloneDX artefact
publishing); provenance + signing (cosign + SLSA attestation).
Surfaced by Plan 71 Q24 (2026-05-21) — supply-chain compliance
gap-probing.

User-recommended candidate tools (Q24): OWASP-ZAP / Snyk / Grype.
Noting OWASP-ZAP is DAST not SCA — Phase 3 candidate as separate
web-app security testing if Pryv wants to extend beyond the
software-supply-chain scope.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| iso-27001 | A.5.21 | feature | medium | drop overstated "published dependency-audit pipeline" prose; add `tests: [CIYAML]` citation; coverage F:Awareness Low → F:Evidence Medium |
| gdpr | Art.32 | feature | low | detail block gains "supply-chain hygiene" sub-bullet under §1(b)/(c) ongoing CIA |
| hipaa-security | 164.308(a)(8) | feature | low | periodic technical evaluation gains a concrete artefact (SBOM + latest scan output) |
| iso-27001 | A.5.23 | feature | low | strengthens cloud-services exit narrative — operator hands SBOM + signed-image proof to the next CSP for migration |
| iso-27001 | A.8.30 | enhancement | low | when operator's "supplier" is Pryv, the SBOM + signed image + CHANGELOG combine into the supplier-monitoring artefact set |
| iso-27001 | A.5.22 | feature | medium | row may need to be ADDED — A.5.22 "Monitoring of supplier services" doesn't currently have matrix coverage; the supply-chain pipeline gives it concrete content |

Proposal: `proposals/supply-chain-scanning-pipeline.md`.

### `VULNERABILITY-DISCLOSURE-PROGRAM`

**Where the work lives**: `open-pryv.io` — rewrite
`SECURITY.md`, enable GitHub Security Advisories private
reporting on the repo, provision `security@<domain>` mailbox +
PGP, publish scope + SLA + safe-harbor language + advisory
history page; federate to sister repos (`dev-site`, `lib-js`,
`data-types`, `app-web-auth3`, `pryv-account-backup`,
`compliance-matrix`). Three-tier: minimum viable VDP (~1 day),
process maturity (~3-5 days cumulative), discoverability +
assurance (~1 day per quarter).

Surfaced by Plan 71 Q32 (2026-05-21) — Art.32(1)(d) testing /
effectiveness evidence gap-probing. Today's `SECURITY.md` is
6 lines + directs reporters at the public issue tracker
(opposite of responsible-disclosure norms).

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.32 | enhancement | medium | §1(d) detail cites the published VDP + GHSA advisory history alongside the existing test-matrix evidence; operator-side Art.32 citability strengthens |
| iso-27001 | A.5.7 | enhancement | medium | "threat intelligence" overview cites Pryv's VDP + GHSA flow + CVE history as the substrate-vulnerability threat-intelligence feed |
| iso-27001 | A.5.24 | enhancement | low | info-sec-incident-management-planning overview cites VDP as the externally-facing intake channel |
| hipaa-security | 164.308(a)(6)(i) | enhancement | low | security-incident-procedures overview cites VDP as the substrate-vulnerability intake channel |
| hipaa-security | 164.308(a)(8) | enhancement | low | periodic-evaluation overview cites VDP + GHSA history as one evidence input |

Proposal: `proposals/vulnerability-disclosure-program.md`.
Backlog: `_plans/XXX-Backlog/VULNERABILITY-DISCLOSURE-PROGRAM.md`.

### `CONFIG-EFFECTIVE-EXPOSURE` (no proposal mirror yet)

**Where the work lives**: `open-pryv.io` — new
`GET /system/admin/config/effective` admin route + SPA
"Configuration" tab. Absorbed by the macroPryv `60-bootstrap-
admin-panel-later` plan in its Phase A.9 + Phase C.3 #13
(planned MVP1 slice). Read-only, per-core, merged effective
config including the YAML-only key families (no SSH-the-box
requirement to read deployment safeguards). Secrets redacted
per a `SECRET_KEYS` constant + JSON-schema `secret: true`
annotations. `?digest=true` short-circuit for cross-core drift
pings.

Surfaced by Plan 71 Q20 (2026-05-21) — DPIA Section (d)
safeguards inventory feed. Also unlocks cross-core drift
detection + operator runbook + post-hoc debugging use-cases.

Likely affected rows when the endpoint ships:

| Scope | Ref | Suggested kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.30(1)(g) | feature | medium | cite endpoint as evidence-emitter for "description of technical security measures"; coverage tier could shift F:Awareness → F:Evidence Med |
| gdpr | Art.32 | feature | low | strengthen evidence narrative around operator-visible safeguards |
| gdpr | Art.35 | feature | medium | DPIA Section (d) safeguards inventory cites the endpoint output; coverage tier shifts F:Awareness Low → F:Evidence Med |
| iso-27001 | A.8.9 | feature | medium | direct match — configuration management evidence; row could move F:Storage / F:Primitive → Configurable |
| hipaa-security | 164.308(a)(8) | feature | medium | evaluation evidence — technical baseline snapshot; coverage strengthens |

No `proposals/<slug>.md` mirror filed yet — the work absorbs
cleanly into Plan 60 A.9 + C.3 #13 spec. File one if Plan 71
Q20 classification later wants `planned:` chips on the matrix
rows above (in which case `_plans/XXX-Backlog/CONFIG-EFFECTIVE-
EXPOSURE.md` becomes a one-line stub pointing at Plan 60 to
satisfy the validator's chip → backlog resolution requirement).

## Section B — Trigger categories (no specific backlog slug yet)

These work patterns commonly impact the matrix even without a queued
`planned:` chip. Add an entry under Section A if your specific PR
falls into one of these and there isn't already a slug for it.

### B.1 — New / renamed open-pryv.io API methods

Affects rows that cite the method name in `tests:` / `config_keys:` /
`detail`. Check the row's tier (`coverage: implemented` typically
needs a `tests:` entry pointing at a new `[CODE]`).

Common touchpoints when API surface changes:
- `gdpr.Art.15`, `gdpr.Art.20`, `ccpa.1798.110`, `pipeda.Principle.4.9`,
  `swiss-nlpd.Art.25`, `hipaa-privacy.164.524` — DSAR / portability /
  individual-access row family.
- `gdpr.Art.16`, `ccpa.1798.106`, `pipeda.Principle.4.6` — rectification.
- `gdpr.Art.17`, `ccpa.1798.105`, `pipeda.Principle.4.5`,
  `swiss-nlpd.Art.32` — erasure.
- `gdpr.Art.18` — restriction (mostly `accesses.update`).
- `hipaa-security.164.312(a)(1)` — access control.
- `hipaa-security.164.312(b)`, `iso-27001.A.8.15` — audit.

### B.2 — New event-type formats (`data-types` repo)

Add to the per-row `pryv_primitives: [data-types]` citations. May
affect:
- `gdpr.Art.20` (portability via canonical schemas).
- `iso-13485` (excluded_items: device classes).
- `hipaa-privacy.164.514` (de-identification — new format flags).

### B.3 — New storage engine (`storages/engines/<new>/`)

Affects:
- `gdpr.Art.17` (engine-dependent erasure semantics; per-user
  granularity).
- `gdpr.Art.32` (data-at-rest semantics).
- `gdpr.Art.5(1)(c)` (data minimisation — engine isolation behaviour).
- `hipaa-security.164.312(a)(1)` (technical safeguards — engine ACL
  enforcement).
- `iso-27001.A.8.10` (information deletion semantics per engine).
- The audit primitive doc (`audit` entry in `docs/pryv-primitives.md`).
- `context/per-engine-isolation.md`.

### B.4 — New `pryv_primitive` (added to `docs/pryv-primitives.md`)

Reverse-check: which rows should cite the new primitive in their
`pryv_primitives: [...]` array? Greppable from
`docs/pryv-primitives.md`.

### B.5 — Open-pryv.io major version bump (2.x → 3.x)

Mass-touch: `applies_to_versions` field on every row that's expected
to change behaviour. Today the default is `*` (every row applies to
every version). When the v3 line opens, many rows will need
`applies_to_versions: ">=2.0.0 <3.0.0"` or equivalent.

### B.6 — New scope (`scopes/<new>.yml`)

Update `MEMORY.md` workspace overview + scope-list documentation;
check `derives_from` cross-references on existing scopes that might
benefit from pointing at the new scope.

### B.7 — Major Pryv-side architectural change

Touches `context/*.md` notes. Recent examples:
- Plan 37 — multi-core data-residency model (touched
  `context/core-affinity-architecture.md`).
- Plan 55 — `cluster_kv` + `access-state` (added to PlatformDB
  catalogue listed in the core-affinity context note).
- Plan 9 — storages as plugins (touched engine references in the
  audit + data-residency primitives).

## Section C — Maintenance reminders

- **Quarterly review**: run a full pass of authored rows and check
  that `pryv_primitives` + `tests:` + `config_keys:` references still
  resolve. The validator catches most stale references at CI time;
  this pass catches semantic drift (e.g., a primitive whose meaning
  evolved).
- **At plan close** for Plan 71: full sweep of this file against the
  current matrix state — confirm every Section A entry is still
  accurate + every shipped item has been removed.
- **At each new gap-probing Q close** (per
  [[feedback-implementer-perspective-gap-probing]]): if the Q
  produced a new backlog slug, add a Section A entry alongside the
  proposal mirror + planned chips.
