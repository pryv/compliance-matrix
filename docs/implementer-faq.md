# Implementer FAQ — gap-probing answers

Q&A from the implementer-perspective gap-probing sessions on the
matrix. Each entry pairs (a) the question a Pryv customer might ask
during evaluation with (b) the answer + the matrix-side encoding
that resulted. Each entry links to the commit on
`pryv/compliance-matrix master` that recorded the decision.

The questions are deliberately written from a Pryv customer's
perspective — they probe gaps an implementer would care about, not
abstract regulatory text. Future evaluators reading this FAQ can
short-circuit the same conversation.

## Session 2026-05-19

### Q1 — Do you support customer-managed encryption keys (CMEK / BYOK) for event data at rest?

**Short answer:** **voluntarily missing**. At-rest encryption of
bulk event data is the hosting provider's responsibility (LUKS,
PG TDE, KMS-wrapped backup archives). Customer-managed encryption
keys (CMEK / BYOK) sit at the same infrastructure layer.

**Future direction:** end-to-end encryption where the server itself
never holds plaintext — research direction is proxy re-encryption,
tracked in `_plans/XXX-Backlog/E2E-ENCRYPTION.md`.

**Matrix encoding:**
- `proposals/e2e-encryption.md` — mirror of the upstream backlog;
  lists rows that would shift coverage if E2E ships.
- `hipaa-security.164.312(a)(2)(iv)` `detail` block extended to
  spell out the deliberate-out-of-scope + future direction.

**Commit:** `53a613e`.

### Q2 — Is the audit log tamper-resistant against an admin with root on the Pryv host?

**Short answer:** **voluntarily missing today**. Audit log rows are
append-only by convention in the write path, but there is no
software-side tamper-resistance signal — no hash chain, no per-row
signature, no operator-signed checkpoint, no automated WORM export.
Integrity rests on operator-side filesystem hardening (immutable
mounts, append-only flags, file-integrity monitoring like AIDE /
Tripwire, out-of-band SIEM forwarding to a WORM store).

**Future direction:** chained / hashed / signed audit log (per-row
`prev_hash` + periodic operator-signed checkpoints). Tracked at
`_plans/XXX-Backlog/AUDIT-LOG-CHAINING.md`.

**Matrix encoding:**
- `proposals/audit-log-chaining.md` — mirror of the upstream
  backlog; lists rows that would shift coverage when shipped.
- `hipaa-security.164.312(c)(2)` + `iso-27001.A.8.15` `detail`
  blocks extended to spell out today's posture + planned chain.

**Commit:** `3764978`.

### Q3 — What does "per-user storage isolation" mean per engine? Can a bug let user A's events leak to user B?

**Short answer:** **logical isolation on PG/Mongo, physical on
SQLite.** SQLite gives one file per user — physical filesystem-level
separation; the wrong API call can't open the wrong file. PG and
Mongo share tables / collections with isolation enforced by app-code
`userId` filtering — a bug that forgets the filter leaks across
users. **Both engines are first-class** for legitimate operator
reasons (scale vs strict-audit posture).

**Engine-switch is supported.** `bin/backup.js` dumps user data in
engine-neutral format; `--restore` reads into whichever engine the
target deployment uses. Operators can start strict-on-SQLite, scale
to PG/Mongo later (or vice versa for emergency DR).

**Side question — per-account DB on PG?** Technically yes (PG
supports many DBs per cluster), but **sharp cardinality limit**: PG
handles up to ~5K-10K DBs gracefully; beyond that, autovacuum
degrades + schema migrations have to iterate every DB. Fits B2B
SaaS with hundreds of operator-tenants; pathological for consumer-
scale millions of users. **Not currently a Pryv-supported mode.**

**Matrix encoding:**
- `context/per-engine-isolation.md` — canonical per-engine
  isolation breakdown + engine-switch fact + four operator
  mitigation patterns (PG row-level security, per-schema,
  per-account-DB low-cardinality only, per-tenant deployment).
- `gdpr.Art.25` + `hipaa-security.164.312(a)(1)` `detail` blocks
  cross-link to the context note.

**Commit:** `7e74f59`.

### Q4 — SMS-OTP is deprecated for AAL2+ MFA. Should the matrix's `Implemented | High` rows on authentication-strength downgrade?

**Short answer:** **MFA is pluggable.** The `Service` base class at
`components/business/src/mfa/Service.ts` defines `challenge()` +
`verify()` methods that subclasses override. Two subclasses ship
today (`ChallengeVerifyService`, `SingleService`) targeting
HTTP-callable external providers (SMS by config default), but the
abstraction is generic. Operators can plug in **any HTTP-based MFA
provider** via `services.mfa` config without code change — Twilio
Authy, Auth0 MFA, Duo Web push, etc. Operators writing a `Service`
subclass can implement any provider.

**Gap is documentation, not feature scope.** The primitive
catalogue's "SMS-based by default" phrasing reads as feature scope
when it's a default. NIST AAL framing depends on configured
provider: SMS-only = AAL1; TOTP+push or WebAuthn = AAL2.

**Future direction:** ship reference plugins for server-side TOTP +
WebAuthn (the latter needs a `LocalService` abstraction since
WebAuthn ceremonies don't fit the HTTP-roundtrip `Service` shape).
Tracked at `_plans/XXX-Backlog/MFA-MODERN-METHODS.md`, in the
perspective of `_plans/40-OAUTH2-Account-based-signatures-later/`
(broader auth-modernisation arc).

**Matrix encoding:**
- `proposals/mfa-modern-methods.md` — mirror of the upstream
  backlog; three-step modernisation (docs → TOTP → WebAuthn).
- `docs/pryv-primitives.md` MFA section rewritten to spell out
  pluggability + per-provider AAL framing.
- `hipaa-security.164.312(d)` `detail` block extended.

**Commit:** `23c9895`.

### Q5 — How do you handle workforce / role-based access control granularity (e.g., 100 nurses in a hospital deployment)?

**Short answer:** **two composable patterns**.

**Mechanism 1 — group-access with per-caller audit:** a single
access token can be granted to a group (e.g., "nurses"). The group
itself is managed *outside* Pryv (the implementer's IdP / IGA /
hospital IT system maintains membership). When a group member makes
an API call, the request passes the access token PLUS the acting
individual's id via `Authorization: <TOKEN> <CALLERID>`
(space-separated). Pryv records both in audit: the access id (group
identity) and the caller id (individual). Trust model: Pryv trusts
the access-token holder to forward a truthful `callerId`.

Code: `components/business/src/MethodContext.ts` `parseAuth()` +
`components/business/src/accesses/refs.ts` `composeStoredRef`.
The stored `createdBy` / `modifiedBy` becomes `<accessId> <callerId>`
when callerId is present.

**Mechanism 2 — seed access for sub-account derivation:** an app
holding an access can create sub-accesses (one per group member)
lazily. Each sub-access is independently revocable; the seed access
is the parent that can manage all its children (`createdBy === seed`).
Combines fine-grained per-person revocation with group-level
operations. Useful when individual revocation matters more than
audit fidelity, or when group membership churns.

Code: `accesses.ts` `query.createdBy = currentAccess.id` lookups +
`isManaged` parent/child check.

**Neither is "roles + groups inside Pryv".** Pryv deliberately
delegates group membership to external systems; the two patterns
provide the right hooks for either audit-trail-preserving group
exercise (mechanism 1) or independently-revocable per-member
provisioning (mechanism 2).

**Matrix encoding:**
- `context/workforce-access-patterns.md` — full breakdown of both
  patterns + when to use each + trust models + matrix-row mapping.
- `hipaa-security.164.308(a)(3)(ii)(C)` (Termination procedures)
  `detail` extended with the two patterns for hospital-scale
  termination.
- `iso-27001.A.5.16` (Identity management) `detail` extended:
  roles + groups deliberately outside Pryv; IdP is the source of
  truth.

**Commit:** `6c5f070`.

### Q6 — Rate limiting / API throttling / DoS protection. Does Pryv ship throttling?

**Short answer:** **voluntarily missing at the Pryv layer.** In-
process rate limiting was considered + deliberately rejected for
two reasons: (1) multi-core load distribution makes per-core
counters mis-fire (a cross-core shared counter becomes itself a
DoS target); (2) abuse signatures are operator-specific (research
batch imports vs consumer-app per-user limits are wildly
different). The right layer is the reverse proxy / WAF / API
gateway — already deployed by the operator for TLS / geo-routing /
WebSocket upgrades, purpose-built for traffic shaping, and tunable
per actual workload.

**What Pryv contributes:** detection layer, not enforcement.
- Audit log captures every API call (fail2ban watches it for
  auth-failure patterns; SIEM consumes for anomaly detection).
- Observability adapter surfaces per-core request-rate + latency +
  error-rate metrics.
- `accesses.delete` is the kill-switch when abuse is detected.

**What the operator handles:** per-IP rate limits, per-token rate
limits, per-route limits, WAF rules, account-lockout via fail2ban,
DDoS scrubbing, burst / cost protection — all in their existing
reverse-proxy / WAF / API-gateway stack.

**Future direction:** ship reference reverse-proxy configs (nginx,
HAProxy, Cloudflare, Traefik, Caddy) per workload profile
(consumer-app, B2B research, hospital) + matching fail2ban jail
definitions. Tracked at
`_plans/XXX-Backlog/RATE-LIMITING-RECIPES.md`. Doesn't change the
Pryv-side stance; closes the operator-experience gap of "what do
I actually configure?"

**Matrix encoding:**
- `context/rate-limiting-and-dos-protection.md` — full rationale +
  operator mitigation patterns + when the stance might change.
- `iso-27001.A.8.21` (network services security) `detail` extended.
- `hipaa-security.164.308(a)(5)(ii)(C)` (login monitoring) `detail`
  extended with the fail2ban + reverse-proxy pattern.

**Commit:** `271f34d`.

### Q7 — Webhook delivery: HMAC signing, replay protection, TLS-only, retry, token-leakage? (Classic push-with-content security minefield)

**Short answer:** **Pryv webhooks are signal-only by design.** The
webhook POST body carries a notification that something changed —
not the changed data itself. Receivers consume the change by
making an **authenticated GET** back to Pryv (using the access
token they already hold) and reading the current state via
`events.get` / `streams.get`.

This sidesteps most of the classic webhook security minefield by
construction:

| Classic concern | Pryv signal-only consequence |
|---|---|
| HMAC signing | not required — no sensitive content in body to authenticate; forged signal → at worst an extra authenticated GET |
| Replay protection | not required for data integrity — replayed signal → idempotent GET |
| Token leakage in body | impossible — tokens stay with receiver, not in wire payload |
| Body-content tampering | no sensitive content to tamper with |

**What still matters operationally:**
- TLS on delivery (don't leak the *existence* of a change).
- Delivery retries + back-off; receiver awareness of failure
  state so it can fall back to polling.
- Receiver poison-pill protection (timeouts + concurrency caps on
  the Pryv worker side).
- GET-side auth (already secured by `access` + `permissions` +
  `audit`).

**Matrix encoding:**
- `context/webhooks-signal-only.md` — full design + operational
  caveats + the security-implications comparison table.
- `docs/pryv-primitives.md` gets a new `webhooks` primitive entry.
- `hipaa-security.164.312(e)(1)` (transmission security) `detail`
  extended with the signal-only framing.

**Commit:** *(this commit)*.

## Session 2026-05-20

### Q8 — Right-to-erasure end-to-end including the audit log itself: when `auth.delete` runs, does the audit log referencing the deleted subject also disappear?

**Short answer:** **engine-dependent today — undocumented gap;
queued as a bug fix + operator setting** (not a "voluntarily
missing" call). The `gdpr.Art.17` row claims "configurable end-to-
end erasure", but on a PostgreSQL audit deployment the audit rows
referencing the deleted subject silently survive.

**What the code actually does.** The `auth.delete` pipeline
(`components/api-server/src/methods/auth/delete.ts`) runs
`checkIfAuthorized → validateUserExists → validateUserFilepaths →
deleteUserFiles → deleteHFData → deleteAuditData → deleteUser`.
The `deleteAuditData` middleware
(`components/business/src/auth/deletion.ts:104-108`) calls
`userLocalDirectory.deleteUserDirectory(userId)` — i.e. it wipes
the per-user filesystem directory wholesale.

| Audit engine | Storage layout | Outcome of `auth.delete` |
|---|---|---|
| SQLite | per-user file under user-data directory | wiped ✅ |
| PostgreSQL | shared `audit_events` table, rows keyed by `user_id` | **not touched** ⚠️ |

`AuditStoragePG.deleteUser(userId)` exists
(`storages/engines/postgresql/src/AuditStoragePG.ts:60-63`) and
runs `DELETE FROM audit_events WHERE user_id = $1` — but the only
in-tree caller is `RestoreOrchestrator.ts:341` (backup-restore
preflight). The `auth.delete` pipeline does not call it.

**Planned fix (one bundled change).**

1. Add `deleteAuditDataStorage` as its own explicit middleware in
   `auth.delete`, calling `auditStorage.deleteUser(userId)`. Decouples
   "wipe filesystem directory" from "erase audit rows". Both engines
   converge.

2. Operator setting `audit.onUserDelete: erase | keep | pseudonymise`
   (default `erase`).
   - `erase` — runs `auditStorage.deleteUser(userId)`; matches
     today's SQLite default + the GDPR/CCPA/PIPEDA-friendly path.
   - `keep` — skips the call; for HIPAA §164.316(b)(2)(i) 6-year
     retention, MDR Art.10(8) device-history retention, or any
     regime keeping audit under a separate lawful basis (GDPR
     Art.17(3)(b) "compliance with a legal obligation"); the
     implementer documents this in their DPIA.
   - `pseudonymise` — null/hash the audit row's personal
     identifiers (`accessId`, `userId`, params containing personal
     data); keep timestamps + action verbs. Composes with the
     `randomAlias` primitive
     (`proposals/aliases-as-pseudonymization-primitive.md`) — an
     alias-issuing deployment never stores the canonical
     identifier in the audit row at all.

**Future direction note.** The chained-audit-log proposal
(`proposals/audit-log-chaining.md`) must accommodate post-hoc row
deletion / pseudonymisation — likely via "tombstone" rows that
preserve chain continuity while removing the personal data.

**Matrix encoding:**
- `proposals/audit-on-user-delete.md` — mirror of the upstream
  backlog; lists rows that would tighten when shipped.
- `gdpr.Art.17` `detail` block extended with the per-engine
  truth-table + planned consistency fix + operator setting +
  pointer to the `randomAlias` composition.
- `hipaa-security.164.316(b)(2)(i)` (6-year audit retention)
  `detail` block added — calls out the `keep` mode as the
  HIPAA-friendly path + the §164.530(j) separate-lawful-basis
  framing.
- Upstream backlog: `_plans/XXX-Backlog/AUDIT-ON-USER-DELETE.md`.

**Commit:** *(this commit)*.

### Q9 — Data masking. Specifically: read-time per-role redaction, static masking for non-prod environments, audit-log PII leakage, field-level encryption at the schema layer

**Short answer:** **Pryv enforces masking by *projection*, not by
*transformation*.** Stream-level isolation + permission-scoped access
tokens hide whole sub-trees from a given role — that's Pryv's
contribution. Rewriting field values at read time, walking a clone
to apply faker transforms, hash-on-read — all **application-layer
concerns by design**. The audit log is **data-minimal by
construction** (no request body captured). Field-level encryption is
solved today at the infrastructure layer; **E2E encryption is the
natural future primitive** for the transformation-flavour use cases.

Per the four flavours asked:

| Flavour | Classification |
|---|---|
| Read-time per-role redaction (`j***@example.com`) | **voluntarily missing** — application layer by design; Pryv keeps the storage layer deterministic (no "partially redacted" API response) |
| Static masking for non-prod environments | **voluntarily missing** — application layer today; E2E encryption would help indirectly (cryptographically opaque clones) |
| Audit log PII leakage | **filled by existing design** — audit captures action + source + URL query + access ref + integrity hash; **never the request body** (verified at `components/audit/src/Audit.ts:151-166` + `components/middleware/src/setMinimalMethodContext.ts:29`); the `auth=` param is explicitly stripped |
| Field-level encryption at the schema layer | **voluntarily missing today** — operator/infrastructure layer (LUKS / PG TDE / KMS-wrapped backups) or application-layer pre-encryption; E2E encryption is the natural future primitive |

**Why projection-only.** Rewriting one field for one access at read
time would require runtime knowledge of which field is "sensitive"
in the context of that access — a policy decision tied to the
deployment, the regulatory regime, and the consumer's role. Pryv's
position: that policy lives in the calling application where
business context is rich; the storage layer ships the substrate
(stream isolation + permission scoping) that makes the projection
mechanically enforceable. Keeps the API deterministic for auditors
(canonical event or 403, not "partially-redacted").

**Audit-no-content is a non-trivial design property.** It means:
- The audit log itself doesn't accumulate residual personal data
  (favourable under GDPR Art.5(1)(c) data minimisation + Art.17
  erasure).
- HIPAA §164.502(b) minimum-necessary review of the audit log is
  trivial — there's no PHI in the audit row to assess in the first
  place.
- The §164.528 accounting-of-disclosures description column lives
  at the API-shape level (e.g., `events.get` on stream X), not at
  the per-event-content level — sufficient under §164.528 and
  safer than alternative designs that store more.

**Matrix encoding:**
- `context/data-masking-projection-vs-transformation.md` — full
  design rationale + the projection-vs-transformation table.
- `docs/pryv-primitives.md` audit entry — extended with the
  "captures / does NOT capture" + "data-minimal by construction"
  language.
- `scopes/iso-27001.yml` A.8.11 (Data masking) — overview rewritten
  to lead with projection-vs-transformation framing; detail block
  spells out the boundary.
- `scopes/gdpr.yml` Art.30 technical block — adds the audit no-
  content + Art.17 + Art.5(1)(c) implications.
- `scopes/hipaa-security.yml` 164.312(b) detail — adds the
  "audit is not a second copy of PHI" framing for §164.502(b).
- `scopes/iso-27001.yml` A.8.15 detail — flags the no-content
  property as a separate auditor-relevant fact.
- `scopes/hipaa-privacy.yml` 164.528 detail — sharpens the
  "description" field guidance (URL query/path, not body).
- `proposals/e2e-encryption.md` — extended with the static-
  masking-for-non-prod + field-level-encryption use cases that E2E
  would help when shipped.

No new backlog filed: transformation-flavour masking is
intentionally application-layer; the E2E proposal already covers
the future Pryv-native angle.

**Commit:** *(this commit)*.

### Q10 — DSAR full-loop at production scale: is there a Pryv-native "give me everything" tool, and does it ship a complete Art.15 bundle?

**Short answer:** **Yes there's a tool** —
[`pryv-account-backup`](https://github.com/pryv/pryv-account-backup)
(npm `@pryv/account-backup`, v0.2.3) — subjects or implementers
run it with the subject's credentials and get a downloadable
folder. **But the bundle it produces today is partial**: it misses
the audit log + HF series data points + webhooks, and the legacy
`/followed-slices` call is dead in v2. Classified as bug + feature
backlog (`ACCOUNT-BACKUP-DSAR-COMPLETENESS`); the matrix's
`Implemented | High` tier stands because every data piece IS
reachable via existing v2 API endpoints — the gap is in tooling,
not API surface.

**Per the five sub-questions:**

| # | Sub-question | Answer |
|---|---|---|
| 1 | Pryv-native DSAR export primitive? | **Yes — `pryv-account-backup`** (`npm start`). Walks account / profiles / streams / accesses / events / attachments. Subject-driven (no operator credentials needed). Coverage gaps below. |
| 2 | HF series read pattern at scale? | `GET /events/<id>/series` per series-event reads data points (HFS worker). The backup tool does NOT call it today — series containers are exported, data points are not. **Phase 1 backlog fix**. |
| 3 | Attachment download semantics in the bundle? | Backup script downloads bytes inline (10-parallel) via `GET /events/<id>/<attId>?readToken=...`. Inline binaries land in `attachments/` under the bundle folder. Multi-attachment events: only the first attachment makes the round-trip on restore (`src/restore.js` logs "Ignored 2nd attachment"). **Phase 3 backlog fix**. |
| 4 | Cross-core aggregation in multi-core deployments? | Subject's user-account is core-affine — `apiEndpoint` resolves to the home core. CMC counterparty data lives in the counterparty's account on whichever core hosts that subject. Backup runs against one `apiEndpoint`; the subject must run a separate backup against each CMC-shared account they hold. Not a v2-only concern; same for multi-region deployments. |
| 5 | Audit log truncation interaction with `audit.onUserDelete` (Q8)? | Today: audit log isn't fetched by the backup tool at all (Q10 gap #1). After the Q8 + Q10 backlog work both ship: `keep` mode means the bundle includes the long audit history; `pseudonymise` mode means the audit content carries aliases rather than the canonical username; `erase` (default) means the audit content matches whatever wasn't already erased by prior `auth.delete` calls. The subject's right to read their own audit log via `audit.getLogs` already works today — they have an authenticated personal token. |

**Audit of pryv-account-backup vs Art.15(1) sub-paragraphs** — full
table at `context/account-backup-coverage.md`. Highlights:

- (a) purposes — `access.clientData.purpose` ✅
- (b) categories — derivable from `events.json` ✅
- (c) recipients — **partial**: accesses ✅; audit + webhooks ❌
- (d) retention — `access.clientData.retention` + expiry ✅
- (g) source — partial: events ✅; audit cross-ref ❌

**Operational guidance until the backlog ships** (per
`context/account-backup-coverage.md`): augment the
`pryv-account-backup` output by manually fetching `/audit/logs` +
`GET /events/<id>/series` per series-event + `/webhooks`, then
combine with the bundle. The subject's personal token has all
necessary permissions.

**Does Pryv-the-API need additions for this?** Read side: no.
Every gap is reachable from existing v2 endpoints. Two
ergonomics ideas (`GET /export` aggregator + `audit/logs?asExport=true`)
are nice-to-have but not blockers. Restore side: also no — HF
series data + multi-attachment writes both use existing endpoints
that the backup tool just doesn't exercise yet.

**Matrix encoding:**
- `pryv/pryv-account-backup` registered in macroPryv workspace
  (`_scripts/setup_repositories.sh` + MEMORY.md, 2026-05-20).
- `proposals/account-backup-dsar-completeness.md` filed (mirror
  of `_plans/XXX-Backlog/ACCOUNT-BACKUP-DSAR-COMPLETENESS.md`).
- `context/account-backup-coverage.md` — coverage matrix + Art.15(1)
  sub-paragraph map + operational guidance for today.
- `docs/pryv-primitives.md` — new `account-backup-tool` primitive
  entry.
- Rows tagged with `account-backup-tool` primitive + `planned:`
  chips: `gdpr.Art.15` (bug + feature), `gdpr.Art.20` (Art.20
  round-trip feature), `ccpa.1798.110`, `pipeda.Principle.4.9`,
  `swiss-nlpd.Art.25`, `hipaa-privacy.164.524`.

**Commit:** *(this commit)*.

### Q11 — Time synchronization across cores. Audit row ordering, LE cert rotation, access expiry — do I need to run NTP, and does Pryv enforce or detect skew?

**Short answer:** **clock sync is the operator's job** (`chronyd` /
`ntpd` on each host). Pryv uses machine wall-clock + ships
**`meta.serverTime` in every API response** for client-side skew
detection. Server-side, the architecture is **core-affine** —
users live on exactly one core, the data plane never proxies
across cores, and PlatformDB is an indexing + uniqueness service
(not a routing layer). So **cores never need to agree on clock
value or cert validity**; the dangerous failure modes are all
intra-core. Two **small queued additions** (`CLOCK-SKEW-CLUSTER-CHECKS`)
will add server-side skew detection at two natural checkpoints:
bootstrap-join + pre-cert-load.

**Architectural correction recorded** (from this Q):
- A user is **assigned to one core**; subsequent API calls resolve
  to that home core via `/reg/:uid/server` (PlatformDB
  `user-core/<username>` lookup).
- Cores never proxy a user's data calls to each other. The only
  cross-core flow is the registration-time `forwardIfCrossCore`
  handshake (Plan 37) + the CMC counterparty pattern where user
  B's client talks directly to user A's home core (B's client has
  two `apiEndpoint`s, not one core talking to another).
- PlatformDB carries: `user-core/*` lookups, `emailIndex/*`
  uniqueness, DNS records, TLS materials, `access-state/*` (Plan
  55), `cluster_kv/*` (Plan 55). **Not** events / streams /
  accesses / audit / attachments.

**Per the three sub-questions:**

| # | Question | Answer |
|---|---|---|
| 1 | Audit row timestamps coherent across cores? | **Not relevant** — audit rows from a single user land on a single core (core-affine). Per-core monotonic time is the only requirement; cross-core ordering not meaningful by design. |
| 2 | LE cert rotation across cores? | Cores do **not** need to agree on cert validity; each core's TLS stack judges its loaded cert against its own clock at handshake time. The risk model is intra-core: forward-skew past `notAfter` → that core's TLS rejects its own cert; backward-skew before `notBefore` of a freshly-rotated cert → refuses to load it. LE's 60-day issue / 90-day expire gives ~30 days of overlap so it takes weeks of drift to bite. Queued fix: pre-load validity check refuses the swap if local clock falls outside the new cert's window. |
| 3 | Access expiry across cores? | **Not relevant** — an access is core-bound; a user authenticating on core-A then calling core-B cannot happen. One core, one clock judges expiry. |

**Pryv's contribution today:**
- `meta.serverTime` in every API response (Unix timestamp seconds;
  `components/api-server/src/methods/helpers/setCommonMeta.ts:49`).
- Webhook payloads include `serverTime`
  (`components/business/src/webhooks/Webhook.ts:185`).
- That's the **client-side** skew-detection primitive. No
  server-side skew detection today.

**Planned addition** (small dev, two intra-core checkpoints):

1. **Bootstrap-join skew check** — joining core compares its
   `Date.now()` to the issuer's `serverTime` before ack; refuses
   to ack if `|delta| > cluster.clockSkewThresholdSec`
   (default `30s`). Operator fixes NTP, retries.
2. **Pre-cert-load validity check** — worker-side `acme:rotate`
   handler parses the new cert with `x509.X509Certificate`, checks
   `validFromDate / validToDate` vs local clock with the same
   `clockSkewThresholdSec`. Refuses the swap on failure; keeps
   previous cert loaded; logs for operator alert.

After shipping, `iso-27001.A.8.17` (Clock synchronization) moves
from `out-of-scope` to `F: Awareness | Low` — Pryv contributes
detection at two checkpoints + the existing `serverTime` client
helper; operator still runs NTP.

**Audit-log-chaining (Q2 backlog) precondition recorded.** The
chain reconstructs per-core only because the data plane is
per-core; the chain requires per-core monotonic time, not
cluster-wide clock agreement. Added as an explicit constraint to
`_plans/XXX-Backlog/AUDIT-LOG-CHAINING.md` and its proposal
mirror.

**Matrix encoding:**
- New backlog `_plans/XXX-Backlog/CLOCK-SKEW-CLUSTER-CHECKS.md`.
- New proposal `proposals/clock-skew-cluster-checks.md`.
- New architecture context `context/core-affinity-architecture.md`
  (the mental-model correction made during this Q).
- `iso-27001.A.8.17` Clock synchronization overview + detail
  rewritten with the `serverTime` cross-reference + core-affine
  framing + `planned:` chip.
- `docs/pryv-primitives.md` audit entry extended with
  time-semantics + `serverTime` cross-reference.
- `proposals/audit-log-chaining.md` + the macroPryv backlog
  twin both gain the "per-core monotonic time is the
  precondition" constraint section.

**Commit:** *(this commit)*.

### Q12 — Data residency: what actually pins user A's events to region X, and at what guarantee level?

**Short answer:** **core-level guarantee, enforced by the
architecture.** A user is bound at registration to one core (via
PlatformDB's `user-core/<username>` mapping); all their events,
streams, accesses, audit, and attachments live exclusively on that
core's storage. **Cores share no event/stream/audit data with each
other** — the only horizontal data is PlatformDB, which carries
`user-core/*` lookups, `emailIndex/*` uniqueness, DNS records, TLS
materials, `access-state/*`, `cluster_kv/*` — and nothing else.

**No intermediary in the data path**: client ↔ core data flow is
direct over TLS. No Pryv-shipped reverse-proxy, API gateway, CDN,
or backend hop. Each core terminates TLS itself (Plan 35's ACME
integration runs the cert on the same Node process serving the
API + HFS endpoints). Operators *can* place a reverse-proxy in
front of their cores (`docs/nginx-ingress-sample.conf` in
open-pryv.io is a sample), but that's an operator-side choice +
an operator-side compliance concern, not a Pryv-native step. The
residency story therefore extends to "no third party in the
read/write path that could log, cache, or replicate the data"
by default.

**The mechanism**: PlatformDB's `user-core/<username>` mapping is
the residency anchor. Set at registration, immutable in normal
operation. Cross-region data movement is **not** a Pryv-native
primitive — moving a user between cores requires deliberate
operator action (`bin/backup.js` on source + `--restore` on
target). There is no per-event geographic tag, no per-stream
region constraint, no admission check at the API layer. The
architecture itself is the enforcement.

**CMC counterparty consideration** (the one cross-jurisdiction
runtime case): when an EU subject shares a stream with a US
counterparty via Cross-Modular Capability, the US counterparty's
client connects directly to the EU subject's `apiEndpoint` (i.e.,
the EU core). The EU data does **not** replicate to the US core
— it's fetched on-demand by the US client. From the EU subject's
GDPR Art.44 perspective this fetch *is* an international transfer
(data crosses borders to reach the reader), but the data-at-rest
residency is preserved (no copy in the US). The implementer
records the recipient hosting + lawful basis on the access's
`clientData.cross_border_basis` to make the transfer auditable.

**Multi-core vs single-core**: a multi-core deployment is the only
way to get per-user-jurisdiction residency on Pryv. A single-core
deployment in `us-east-1` means every user's data is in
`us-east-1`. Per-user residency is opt-in at the platform topology
level (the operator deploys cores in the relevant regions and
exposes them via `auth.hostings`).

**Why "no separate enforcement layer"**: there's no need for
per-event tags or admission checks because the data simply never
leaves the core. Pryv's compliance posture for data residency is
"no primitive exists to move data between cores", which is a
stronger guarantee than runtime-enforced rules (a runtime rule
can be misconfigured or bypassed; an architectural absence
cannot).

**Matrix encoding:**
- `docs/pryv-primitives.md` `data-residency` entry extended with
  the "Guarantee level — core-level" + "No intermediary in the
  data path" sections.
- `gdpr.Art.44` detail block extended with the architecture-as-
  enforcement framing + CMC counterparty nuance.
- `swiss-nlpd.Art.34` detail block extended with the same.
- `context/core-affinity-architecture.md` (filed in Q11) is the
  full mechanism reference — already cited from the relevant
  rows.

No backlog filed: this is a "filled by existing primitive"
classification — the architecture is the enforcement, and
already documented; the gap was the matrix not surfacing the
guarantee level clearly enough.

**Commit:** *(this commit)*.

### Q13 — Webhook subscription lifecycle: does revoking an access cascade to its webhooks?

**Short answer:** **No — this is a bug, classified + queued for
fix** (`WEBHOOK-CASCADE-ON-ACCESS-DELETE`). Today,
`accesses.delete` removes the access from cache + storage but
does NOT delete webhooks created by that access. The webhook
rows survive with a now-dangling `accessId` and **keep firing**
on matching events until the responder manually walks
`webhooks.get` + `webhooks.delete`.

**Code-verified findings:**
- `deleteAccesses` in `components/api-server/src/methods/
  accesses.ts:723-738` has no webhook cleanup step.
- The webhook repository (`components/business/src/webhooks/
  repository.ts`) ships `deleteOne(webhookId)` +
  `deleteForUser(user)` but no `deleteByAccess(accessId)`.
- `Webhook.send()` at `components/business/src/webhooks/
  Webhook.ts:106-147` checks `state === 'inactive'` but does NOT
  verify the parent access still exists / is still valid before
  firing.

**Sanity-check counter-path** (this is fine): full
user-account erasure via `auth.delete` **does** delete webhooks
through the `storageLayer.webhooks.removeAll` call in
`components/business/src/auth/deletion.ts:113-119`. The user-
erasure path closes the channel cleanly; only `accesses.delete`
in isolation leaks.

**Bounded by Q7's signal-only design**: a dangling webhook keeps
POSTing notifications to its URL but the receiver can't fetch
the data because their access token is dead (401 on the
authenticated GET back). So the **data exposure** is limited to
the existence of a change (metadata: "something happened on
stream X at time T"). However, the URL itself remains an active
outbound channel — non-zero severity in a breach scenario where
the original webhook URL was attacker-controlled.

**Planned fix** (small dev — `WEBHOOK-CASCADE-ON-ACCESS-DELETE`):
1. Add `deleteByAccess(user, accessId)` to the webhook
   repository.
2. Wire into the `deleteAccesses` middleware (call BEFORE the
   access-storage delete — partial-failure safety).
3. Belt-and-braces: `Webhook.send()` does a fire-time
   access-validity cache lookup; on miss, mark `state =
   'inactive'` + persist. Self-heals any future dangling-
   webhook situation.

**Operational workaround until the fix ships** (for responders
handling an immediate compromise):

```
# Walk all webhooks under the personal access:
GET /<apiEndpoint>/webhooks
# For each webhook returned:
DELETE /<apiEndpoint>/webhooks/<webhookId>
# Then revoke the compromised access:
DELETE /<apiEndpoint>/accesses/<accessId>
```

Order matters: delete webhooks BEFORE the access (the personal
token needs to still be valid when walking `webhooks.get`).

**Matrix encoding:**
- `proposals/webhook-cascade-on-access-delete.md` filed.
- `hipaa-security.164.308(a)(3)(ii)(C)` (Termination procedures)
  tagged with `planned: kind: bug, impact: medium`.
- `iso-27001.A.5.16` (Identity management) + `A.5.18` (Access
  rights) tagged with the same.
- Upstream backlog: `_plans/XXX-Backlog/
  WEBHOOK-CASCADE-ON-ACCESS-DELETE.md`.

**Commit:** *(this commit)*.

### Q14 — Custom event-type catalogues: can implementers add their own types without forking `data-types`?

**Short answer:** **yes — filled by an existing primitive.** The
implementer maintains a **sibling data-model repo** (small,
schema-only, no Pryv runtime), publishes a merged catalogue to a
URL, and points the Pryv.io deployment's `service.eventTypes`
config at that URL. The server fetches at startup, validates
against the JSON Schema meta-schema, and **deep-merges** the
fetched catalogue on top of the baked-in defaults
(`components/business/src/types.ts:143-186`
`TypeRepository.tryUpdate` does
`defaultTypes = deepMerge(defaultTypes, fetched)`).

**Custom types are first-class**: same z-schema validation
pipeline, same canonical JSON serialisation in `events.get`,
same portability in `events.json` exports. They're indistinguishable
from upstream `pryv/data-types` types at the API surface.

**Two publication strategies:**

| Strategy | Catalogue content | Trade-off |
|---|---|---|
| Additive | only custom types (e.g. `{ types: { "measurement/vo2max": {...} } }`) | simpler — ride upstream `pryv/data-types` updates automatically via the baked-in default |
| Complete merged | vendor full upstream + add custom (HDS pattern) | deterministic — pin exact catalogue version, selectively cherry-pick upstream updates |

For most implementers the additive strategy is the right default.
Regulated deployments (HDS, DiGA, MDR) where the operator wants
explicit version-pinning for audit purposes lean toward the
complete-merged strategy.

**HDS exemplar**: `hds-macro/data-model` is a real-world
implementer-side data-model repo. Its build merges
`eventTypes-legacy.json` (vendored upstream) +
`eventTypes-hds.json` (HDS-specific additions like
`vulva-mucus-inspect/9d-vector`) into `dist/eventTypes.json`,
published via GitHub Pages at `model.datasafe.dev`. A Pryv.io
deployment serving HDS sets:

```yaml
service:
  eventTypes: https://model.datasafe.dev/eventTypes.json
```

**Validation guarantees**:
- Catalogue must validate against JSON Schema meta-schema at
  fetch time — invalid catalogues are rejected; server refuses
  to start.
- Per-event validation at write time — `events.create` calls
  `typeRepo.lookup(type).validate(content)`; unknown types or
  invalid content → `400`. No silent fallback.

**What the extension model does NOT cover**:
- Server-side computed fields (BMI from height+weight etc.) —
  application layer.
- Custom converters / transformations — application layer (HDS
  ships `converters/` but those are app artefacts, not server
  schemas).
- Custom stream hierarchies — documented in the data-model repo
  as conventions, not server-enforced; stream IDs remain
  free-form.

**Compliance implications**:
- GDPR Art.20 — custom types serialise identically to legacy;
  portability holds between deployments that share the catalogue.
  A receiving Pryv.io deployment without the custom catalogue
  rejects unknown types at write — implementer ensures schema
  alignment between transmitting + receiving operators.
- MDR Annex II §5 — implementer custom schemas live alongside
  legacy `pryv/data-types`; MDR-specific device-record formats
  can be authored once + reused across deployments.
- DiGA Annex 1.3.1 — FHIR-flavoured custom catalogue (each
  BfArM-approved FHIR resource → a Pryv event type) plugs into
  the same extension model. Mapping transformation stays
  app-side; the schemas being mapped are first-class.
- ISO 13485 §7.3 — the data-model repo IS the design-control
  artefact for the data layer (versioned, reviewed, signed off
  per §7.3.4).

**Matrix encoding:**
- New `context/custom-event-type-catalogues.md` — full pattern
  + HDS exemplar + the two-publication-strategies table.
- `docs/pryv-primitives.md` `data-types` entry extended with
  the extension model + cross-reference to the context note.
- `gdpr.Art.20` detail extended with the portability-of-custom-
  types section.
- `diga.A1.3.1` (FHIR-R4 interoperability) detail extended with
  the FHIR-flavoured-custom-catalogue path.

No backlog filed — this is "filled by existing primitive". The
extension model works today.

**Commit:** *(this commit)*.

### Q15 — `bin/backup.js`: does the dump file ship encrypted at rest by Pryv?

**Short answer:** **no — voluntarily missing by design; encryption
of backups is operator-side.** `bin/backup.js` produces an
**unencrypted dump file**; the operator wraps it with their
at-rest encryption layer (LUKS on the backup volume, GPG / age
before offsite ship, S3 SSE-KMS / Azure SSE / customer-managed
keys on bucket-level encryption) at the storage boundary. Same
pattern as the broader bulk-event-data at-rest encryption posture
(per Q1: at-rest encryption of bulk data is voluntarily
operator-side; see `proposals/e2e-encryption.md`).

**Why this classification stands** (vs "missing feature"): the
matrix's `Implemented | High` for HIPAA §164.308(a)(7)(ii)(A) and
`F: Infrastructure | Medium` for ISO 27001 A.8.13 both hold —
Pryv ships the backup primitive (`bin/backup.js` per-user dump
+ `--restore`); the *encryption layer* on the dump file is a
storage-engineering concern handled outside the Pryv runtime.
Implementer documents the chosen encryption scheme in their
backup-plan SOP.

**Concrete operator pipelines** (any one of these satisfies the
"protected at the same security level as the source" expectation
of ISO A.8.13):

- `bin/backup.js --output-dir /backups/<user>/`, with `/backups`
  mounted on a LUKS-encrypted volume.
- `bin/backup.js | gpg --encrypt --recipient backup-keypair`
  before `aws s3 cp`.
- `bin/backup.js --output-dir /tmp/backup/`, then
  `restic backup` (built-in AES-256 encryption + content-
  addressable storage + de-duplication) to S3 / B2 / Azure.
- S3 bucket-level SSE-KMS with a customer-managed CMK + IAM
  least-privilege on the upload role.

**HDS Activity.5** (Outsourced backup) already documents this
explicitly in its row overview — the operator handles transport
+ retention + at-rest encryption; Pryv provides the
backup-generation + restoration primitives.

**Matrix encoding:**
- `hipaa-security.164.308(a)(7)(ii)(A)` detail extended with
  the operator-side encryption framing + cross-reference to the
  e2e-encryption proposal as the broader pattern.
- `iso-27001.A.8.13` detail extended with the same.
- `hds.Activity.5` already had this language — no change needed.

No backlog filed — this is "voluntarily missing by design" +
already reflected in existing row tiers; the gap was the prose
not surfacing the operator-side scope cleanly enough.

**Commit:** *(this commit)*.

### Q16 — Audit log archival + pruning: what's the operator's story for a deployment running 5–10 years?

**Short answer:** **no Pryv-shipped pruning primitive** (consistent
with Pryv-as-end-user-will-enforcement — operators can't reach
into a user's own audit data freely). Audit growth is the
operator's storage-engineering problem to solve, **but Pryv
provides the architectural hook**: the audit log is exposed via
`@pryv/datastore` (`auditDataStore` registered as `_audit` in
`Mall.addStore`), so an operator can write a custom
`auditStorage` engine plugin that tiers hot recent rows + cold
archived rows behind the same `audit.getLogs` API. End users see
one continuous log; the operator chooses how the storage backs
it. Full pattern in
`context/audit-archival-via-custom-datastore.md`.

**Framing correction recorded during this Q**: HIPAA
§164.316(b)(2)(i) is a **minimum** 6-year retention rule, not a
maximum. HIPAA never *requires* destruction at the 6-year mark.
GDPR Art.5(1)(e) / PIPEDA Principle 4.5 / Swiss nLPD Art.6(4)
"no longer than necessary" framings exist but audit's lawful
basis is typically GDPR Art.17(3)(b) "compliance with a legal
obligation" — long retention is legitimate ground.

| Regulation | Audit retention pressure |
|---|---|
| HIPAA §164.316(b)(2)(i) | **minimum** 6 years; no max |
| MDR Art.10(8) | **minimum** 10 years device records |
| GDPR Art.5(1)(e) | "no longer than necessary" — but Art.17(3)(b) gives a separate lawful basis for the retention itself |
| Swiss nLPD Art.6(4) | "no longer than necessary" — same caveat |
| PIPEDA Principle 4.5 | "no longer than necessary" — same caveat |

So pressure to prune is **operational** (storage cost, query
performance over 1B+ row scales), not regulatory.

**The two tiering flavours** (full detail in
`context/audit-archival-via-custom-datastore.md`):

| Flavour | Approach | Available today |
|---|---|---|
| A — custom `auditStorage` engine plugin | Write a `storages/engines/<custom-tiered>/` package matching the existing SQLite + PG engine pattern; the `_audit` Mall registration is unchanged, the storage layer beneath it does the tiering | **yes** — engine-plugin system already exists |
| B — custom `@pryv/datastore` replacing `_audit` | Write a datastore module + register via `custom:dataStores` config with `override: true` to replace the built-in `_audit` registration | **partial** — Mall's `addStore` is a `Map.set(id, store)` and custom entries load before built-ins, so they get silently overwritten. Requires `BUILTIN-STORE-OVERRIDE` enhancement (DX-only, no compliance impact) |

The `BUILTIN-STORE-OVERRIDE` follow-on is filed as a DX
enhancement (not a compliance-shifting backlog item — the
extension path A works today; B would be ergonomics-only).

**Matrix encoding:**
- New context note `context/audit-archival-via-custom-datastore.md`
  documenting the pattern + the no-pruning-primitive rationale
  + the two flavours.
- `hipaa-security.164.316(b)(2)(i)` (Documentation — time
  limit) overview + detail rewritten to surface the
  minimum-not-maximum framing + cite the tiering pattern.
- `iso-27001.A.8.15` (Logging) detail extended with the
  tiering note for long-running deployments.
- `UPDATE-TRIGGERS.md` gains the `BUILTIN-STORE-OVERRIDE` entry
  flagged as DX-only.
- New macroPryv memory:
  `feedback_gap_probing_scope_discipline.md` — distinguishes
  regulator-relevant gaps from DX/operational-sugar. User
  flagged this Q's drift into the override-by-id detail as the
  canonical example of where to stop and check scope.

No `planned:` chips added for the DX enhancement — the matrix
rows are correctly classified today; the extension hook
provides the operator's path.

**Commit:** *(this commit)*.

### Q17 — Breach scoping in under 72 hours: what artefact does Pryv hand my incident-response team at hour 0?

**Short answer:** **today, audit data is queryable per access
+ time window via `audit.getLogs?streams=[access-<id>]&fromTime=
<T>`, but no bundled `bin/breach-scope.js` exists and three
concrete gaps prevent a clean Art.33(1)(b)–(d) artefact.**
Filed as a feature backlog (`BREACH-SCOPE-TOOL`) with a
three-phase implementation plan.

**Gap analysis (user-directed during this Q):**

User confirmed `accessId` is bound to a single subject per the
core-affine architecture (`context/core-affinity-architecture.md`),
so per-access scoping is single-user-scoped by construction.
AccessIds are present in both the audit log + the `@pryv/boiler`
HTTP request log. With that anchor, what's missing for
`bin/breach-scope.js --access <id> --since <ts>`:

| Gap | What's missing | Impact |
|---|---|---|
| **Hard** | Global `accessId → userId` lookup | Without it, responder either walks all users O(N) via `system.users.list` + per-user `audit.getLogs?streams=[access-<id>]&limit=1`, or relies on SIEM-external correlation. Won't fit the 72h budget for large deployments. **Direction**: add `GET /system/accesses/<accessId>` admin API backed by a PlatformDB reverse-index. |
| **Medium** | `recordCount` on audit row for read operations | `events.get`/`streams.get` audit rows capture the input query but NOT the number of records returned. Re-running the historical query is fragile if events have changed since. **Direction**: extend audit-write path to capture `result.events.length` on the row. |
| **Medium** | `affectedStreamIds[]` on audit row | Complex stream queries (`*`, `.children`, `any/and/not` trees) resolve at request time; the resolved list isn't persisted. **Direction**: extend audit row with `content.affectedStreamIds[]`. |
| **Soft** | `bin/breach-scope.js` itself | Once inputs above exist, ~300 lines of glue: audit walk + event-type lookup for category derivation + Markdown / JSON report render. |

**What Pryv already ships toward this artefact**:

- Per-access audit query via stream filter `access-<accessId>`
  (every audit row carries the access stream + access-serial
  variant from Plan 66 + an `action-<methodId>` stream).
- Time-range filter via `fromTime`/`toTime` on `audit.getLogs`.
- Action / method invoked in `content.action`.
- URL query in `content.query` (Q9 — body never captured).
- Integrity payload for mutating operations: `content.record =
  { key, integrity }` — gives a non-repudiable hash anchor for
  HIPAA-Breach §164.414 burden-of-proof.
- `meta.serverTime` per response → reliable clock anchor for
  the time-window picker.
- `Pryv-Access-Id` response header → SIEM-side log enrichment.
- `@pryv/boiler` HTTP log → second audit source for methods
  filtered out of application audit.

**Multi-core consideration (none needed)**: accessId is
single-subject + single-core. The reverse-index lookup runs
against PlatformDB (cluster-replicated) but the audit query
runs against one core's storage. No cross-core aggregation
required for a single compromised access.

**Phasing** (full detail in
`_plans/XXX-Backlog/BREACH-SCOPE-TOOL.md`):
1. `GET /system/accesses/<accessId>` + PlatformDB reverse-index
   — ~1-2 days.
2. Audit row extensions (`recordCount` + `affectedStreamIds`) —
   ~2-3 days (touches per-engine audit conformance).
3. `bin/breach-scope.js` + report shape — ~2-3 days.

**Why this is regulator-relevant** (not DX sugar): the §33
72-hour clock makes "ship a usable scoping artefact quickly"
a regulator-visible capability. The audit-row extensions in
particular fill information that's regulator-required
(§33(1)(b) "approximate number of records affected") and not
recoverable post-hoc without them. Distinguishes from the Q16
`BUILTIN-STORE-OVERRIDE` DX item where the matrix tier
doesn't shift.

**Matrix encoding:**
- `proposals/breach-scope-tool.md` filed.
- `gdpr.Art.33` tagged with `planned: kind: feature, impact:
  medium`.
- `swiss-nlpd.Art.24` (derives_from gdpr.Art.33) tagged with
  same.
- `pipeda.s.10.1` (already had AUDIT-LOG-CHAINING chip) gets
  the breach-scope-tool chip added — both proposals improve
  the RROSH evidence chain.
- `hipaa-breach.164.404(b)` (timeliness) tagged with same.
- `hipaa-breach.164.404(c)` (content) tagged with same.
- `hipaa-breach.164.414` (burden of proof; already had
  AUDIT-LOG-CHAINING chip) gets the breach-scope-tool chip
  added.

**Commit:** *(this commit)*.

### Q18 — CMC counterparties and GDPR Art.26 joint controllers: when User A's operator shares a stream with User B's operator via CMC, what's the controller relationship?

**Short answer: NOT joint controllership.** Pryv's CMC primitive
**requires subject validation** — User A's `consent/accept-cmc`
event is the authorising step for any cross-account data flow.
Each operator remains the **sole controller** for their
respective user's data; the lawful basis for B's operator
processing A's data is A's CMC consent record (GDPR Art.6(1)(a)),
not a controller-to-controller agreement. This is **controller-
to-controller transmission via subject consent** (Art.20(2)
lineage), not Art.26 joint controllership.

**Why this matters**: the matrix's `gdpr.Art.26` row previously
read like CMC was the joint-controller technical substrate.
That's misleading. Operators using CMC don't inherit Art.26
obligations from the CMC architecture; they get them only if
they separately decide to jointly process data outside the
subject-driven flow.

**The CMC flow in code** (verified at
`components/cmc/src/acceptOrchestration.ts`):

1. Requester (B's app) creates a `consent/request-cmc` offer
   event on a capability stream — declares title, description,
   consent text, requested permissions, expiry.
2. Capability URL delivered to A (out-of-band: email / QR /
   deep link).
3. A's app fetches the offer, displays it to A.
4. **A writes `consent/accept-cmc` event on A's account** —
   subject's explicit consent recorded durably.
5. CMC plugin (server-side, on A's core) creates the
   bidirectional access pair + delivers the back-channel
   apiEndpoint to B.
6. B's operator now holds an access token that resolves to
   A's `apiEndpoint`; B's client reads A's data directly from
   A's core (no replication).

The `consent/accept-cmc` event is queryable, auditable, and
revocable — A's subsequent `consent/revoke-cmc` triggers
bidirectional access revocation.

**Art.26 test mapped to CMC**:

| Art.26(1) element | CMC reality |
|---|---|
| "two or more controllers" | yes — Operator-X and Operator-Y |
| "JOINTLY determine purposes" | **no** — A's `consent/request-cmc` content + A's `consent/accept-cmc` decision determine the purpose; operators are infrastructure |
| "JOINTLY determine means" | **no** — A's access permissions are the technical control; operators run the API but neither decides the means |

So Art.26 doesn't apply to the CMC pattern by construction.
What applies instead:

- **Art.6(1)(a) (consent)** — A's `consent/accept-cmc` is the
  lawful basis for B's operator processing A's data.
- **Art.20(2) (controller-to-controller transmission)** — the
  CMC delivery IS this transmission; subject's right to
  transmit with consent.
- **Art.13/14 (transparency)** — each operator has their own
  transparency obligation to their respective user. A's
  operator informs A about who receives the data; B's
  operator informs B about what data they received + the
  lawful basis (A's consent).
- **Art.7(3) (right to withdraw)** — A's `consent/revoke-cmc`
  triggers symmetric bidirectional revocation.

**Where Art.26 actually applies (separately from CMC)**: two
operators running a joint research programme, joint health
platform, or shared-purpose service where both decide on
processing rules independently of subject choices. In that
case the arrangement IS the operator-side contract; Pryv's
contribution is `clientData.joint_controller_arrangement` on
the relevant accesses (point to the written agreement) +
"essence" of the arrangement in `clientData.privacy_notice`
for Art.26(2). Operator-edited metadata, no Pryv primitive
enforces it. This makes `gdpr.Art.26` correctly
`F: Awareness | Low` (was `F: Storage | Low`).

**Matrix encoding:**
- `gdpr.Art.26` overview rewritten to lead with the
  "CMC is NOT a joint-controller pattern by default" framing.
  Detail block spells out the Art.26 test mapped to CMC +
  where Art.26 actually applies.
- Facilitation mode shifted `storage` → `awareness` (the row
  is more about implementer awareness of the regulatory
  distinction than about Pryv storing arrangement metadata).
- `context/cmc-consent-primitives.md` extended with the Q18
  Art.26 finding alongside the existing Art.7 + Art.30
  treatments.

No backlog filed — this is matrix-prose tightening on a
correctly classified-but-misframed row. The CMC primitive
itself works as documented; the matrix just needed to surface
the regulatory framing correctly.

**Commit:** *(this commit)*.

## Session 2026-05-21

### Q21 — Data accuracy at ingest: what does Pryv reject, and where does the implementer take over?

**Short answer:** Pryv enforces **structural** accuracy at ingest
(JSON Schema validation via ajv-draft-04, including
`minimum`/`maximum`/`pattern`/`maxLength` where the catalogue
declares them); **semantic** accuracy (is THIS medication right
for THIS patient?) is implementer-owned by design. The
built-in catalogue uses bounds sparingly — operators tighten
structural guarantees by extending via `service.eventTypes`
URL (Q14 pattern). Rectification is auditable via
`events.update` + `?includeHistory=true`.

**Sub-question matrix:**

| Sub-question | Pryv's answer | Where it lives |
|---|---|---|
| Does Pryv reject payloads that don't match the event-type's JSON Schema? | Yes — ajv-draft-04 validation on every `events.create` AND `events.update`; HTTP 400 with structured field-path error | `components/api-server/src/methods/events.ts:273, 564, 755-774` (`validateEventContentAndCoerce` middleware); `components/utils/src/jsonValidator.ts` (façade); `components/business/src/types/basic_type.ts:60-65` (`callValidator`) |
| Are numerical bounds expressible in event-types? | Yes — `minimum` / `maximum` / `exclusiveMinimum` / `exclusiveMaximum` / `minLength` / `maxLength` all enforced | JSON Schema draft-04 spec |
| Do the **built-in** event-types use bounds? | Sparingly: only `mood/rating` (0..1) and `note/*` (4 MB `maxLength`). Physical-measurement types (`temperature/c`, `mass/kg`, `frequency/bpm`, …) ship as `"type": "number"` with no bounds | `components/business/src/types/event-types.default.json` (5 bound directives total across ~4750 lines) |
| Can implementers add bounds via custom catalogue? | Yes — the Q14 extension model (`service.eventTypes` URL → `deepMerge` over defaults) | `components/business/src/types.ts:143-186` (`TypeRepository.tryUpdate`); HDS exemplar at `hds.com/data-model` declares 28 `minimum` + 23 `maximum` + 7 `pattern` constraints |
| Does `events.update` preserve the prior (inaccurate) value? | Yes — event versioning; `GET /events/:id?includeHistory=true` returns the chain via `mall.events.getHistory()` | `components/api-server/src/methods/events.ts:178-200` |
| Is the rectification itself audited? | Yes — `events.update` is in `AUDITED_METHODS`; audit captures method + access ref + timestamp (not the request body, per Q9 audit-minimality) | `components/audit/src/ApiMethods.ts` |
| Does Pryv detect semantic inaccuracy? | **No, by design** — the platform lacks the patient's clinical record, drug-interaction context, device calibration state, treatment plan; implementer's app layer carries that context | — |

**Why this is the right split** — the regulator-relevance test:
when an Art.5(1)(d) complaint lands ("my health data showed an
impossible value"), the implementer can defensibly say:

1. Pryv rejected anything that violated the declared schema
   (cite the ajv pipeline + the failing-payload HTTP 400
   semantics).
2. The deployment used a bounded catalogue (cite the custom
   `service.eventTypes` URL + the relevant per-type bounds — OR
   acknowledge the deployment is on built-in defaults and
   commit to a catalogue tightening).
3. Semantic checks are the implementer's responsibility and run
   at the app layer before `events.create`; provide the specific
   service / rule responsible.
4. When inaccuracy was detected, `events.update` corrected it
   and the prior value is preserved + the rectification is
   audited.

If the platform attempted to enforce semantic accuracy, it would
require seeing clinical context, drug-interaction databases,
calibration metadata — which would violate Pryv's data-
minimisation posture. The split is consistent with the broader
implementer-owns-clinical-logic architecture (Q9 audit-minimality,
Q12 core-affinity, Q15 backup-encryption-is-operator-side, Q19
revocation-UI-is-implementer-side, Q20 DPIA-section-(d)-is-
implementer-assembled).

**Matrix encoding:**
- `gdpr.Art.5` detail block — Art.5(1)(d) bullet rewritten with
  the structural-vs-semantic split + ajv-draft-04 citation +
  HDS exemplar reference + the implementer-hand boundary.
- `gdpr.Art.16` row gained a `detail:` block (was overview-only)
  covering rectification mechanics + the ajv-validation-on-update
  guarantee + `includeHistory` + audit-trail behaviour + the
  detection-is-implementer-side cross-reference.
- `docs/pryv-primitives.md` `data-types` entry extended with
  the ajv-draft-04 backing + built-in-bounds sparsity + HDS
  exemplar.
- New canonical context note
  `context/data-accuracy-structural-vs-semantic.md` carries the
  full architecture treatment in 4 layers (structural
  validation; range bounds via catalogue extension; semantic
  out-of-scope; rectification trail).

No backlog filed, no proposal, no `planned:` chips —
classification is **"filled by existing primitive"** for the
structural / rectification slice + **"voluntarily missing"** for
the semantic slice. The matrix needed prose tightening, not new
features.

**Commit:** *(this commit)*.

### Q22 — GDPR Art.9 special categories: does Pryv "know" my streams hold health data?

**Short answer:** **No — voluntarily missing at the platform
layer, highly facilitated for vertically-integrated operators**
who control both the Pryv core AND the clients writing to it AND
the stream-tree design AND the event-type catalogue. Pryv ships
no `sensitivity:` flag, no server-side hook refusing writes to
"health" streams, no auto-encryption tier for sensitive data — by
design, because hard-coding "what counts as special-category"
would either over-classify (forcing wellness apps into HIPAA-grade
overhead) or under-classify (missing categories specific to a
regulator Pryv didn't model). But the operator composes a strong
Art.9 enforcement layer from a toolkit of 8 levers.

**Three sub-questions answered:**

1. **Does Pryv know any of this is "health data"?** — No.
   `body/temperature`, `body/heart-rate`, `body/sleep` are
   "a number with a unit" to the platform. The operator's
   classification decision is editorial and lives in three
   operator-owned places: (a) the stream-tree convention
   (`health/*`, `biometrics/*`, etc.), (b) `clientData` metadata
   on accesses, (c) custom catalogue annotations like
   `x-art9-category: health` on event-type schemas (passed
   through Pryv unchanged; client-side code reads + gates on
   them).

2. **Does Pryv require an Art.9(2) exception before accepting
   writes?** — No, but the operator can add this themselves via
   `customExtensions.customAuthStepFn` — a hook into the
   access-grant flow that demands the lit-letter claim before
   minting the access. The claim is then persisted on the
   access's `clientData.special_category_basis` and survives
   version updates.

3. **Does any platform layer treat special-category data
   differently?** — Not automatically, but every relevant layer
   has an operator-side knob:
   - Storage tiering via custom `@pryv/datastore` per subtree.
   - Per-engine isolation (separate PG instance + WAL +
     replicas) per Plan 9.
   - Audit log automatically captures every read/write —
     audit-minimality (Q9) means the audit is safe to retain
     at long horizons.
   - Backup encryption tiering via `bin/backup.js` wrapping
     (Q15 operator-side encryption framing).

**The two-deployment-topology distinction** — central to
classifying this row honestly:

| | Vertically-integrated operator | Open Pryv platform |
|---|---|---|
| Operator runs core + ships clients + designs stream tree | Yes | No (or only partially) |
| Third-party apps register against the platform | Rare | Common |
| Art.9 facilitation strength | **High** — operator composes every lever | **Medium** — operator enforces at the access-permission boundary; third-party app code is opaque beyond that |

Most regulated health deployments built on open-pryv.io are
vertically-integrated by design — the operator wants control over
the client-side classification UX, the consent flow, and the data
custody. The matrix encoding (`coverage: facilitated`,
`facilitation_mode: primitive`, `pryv_effort_saved: medium`) is
deliberately a single tier that holds across topologies; the
deployment-specific facilitation strength is in the detail prose.

**The 8-lever operator toolkit** (full treatment in
`context/special-categories-operator-facilitated.md`):

1. Stream-tree design with reserved sensitive subtrees.
2. `clientData.special_category_basis` recording on accesses.
3. Custom event-type catalogue with sensitivity annotations
   (`x-art9-category`, `x-swiss-nlpd-sensitive`, etc. — passed
   through, client-side enforced).
4. Custom `@pryv/datastore` for per-subtree storage tiering.
5. Per-engine isolation at storage layer (Plan 9 plugins).
6. `customExtensions.customAuthStepFn` access-grant gate.
7. Audit log automatic capture (Pryv-invariant).
8. Backup encryption tiering (operator-side, Q15 pattern).

CMC consent flows (Q18) are a ninth lever for cross-account
sensitive sharing: `consent/accept-cmc` IS the Art.9(2)(a)
explicit-consent record for the cross-account flow.

**Honest limits — when the toolkit doesn't reach:**

- Third-party apps the operator doesn't author. The
  access-permission scope IS the enforcement boundary; if the
  third-party's access is scoped to non-sensitive streams, its
  client-side classification logic is moot.
- Per-field sensitivity within a single event (Pryv permissions
  are per-stream, not per-field). Operator splits the event
  type so sensitive subset is its own event-type.
- Free-form `note/txt` or `picture/attached` events where
  implementers embed Art.9 data without the platform knowing.
  Client-side input validation + operator training; out of
  scope for platform enforcement.

**Why this is the right posture** — the regulator-relevance test:
when the supervisory authority asks "how does your deployment
enforce Art.9 protection?", a vertically-integrated implementer
gives a concrete claim like:

> *"Sensitive data is classified at design time via our
> `data-model` repo's `x-art9-category` annotations; the operator's
> mobile + web clients route writes exclusively to `health/*` /
> `biometrics/*` subtrees; every access touching a sensitive
> subtree carries `clientData.special_category_basis` populated by
> the custom-auth-step hook; the `health/*` subtree is backed by a
> dedicated PostgreSQL instance with at-rest encryption; the audit
> log captures every read/write against sensitive streams; backups
> of the sensitive tier are encrypted with a separate KMS key with
> quarterly rotation."*

Every clause cites a Pryv-side primitive the deployment composes;
none of them is "Pryv enforces Art.9". Same architectural shape
as Q19 (revocation UI is implementer's), Q20 (DPIA section (d) is
implementer-assembled), Q21 (semantic accuracy is implementer's).

**Matrix encoding:**

- `gdpr.Art.9` overview rewritten to lead with the "voluntarily
  missing + highly facilitated for vertically-integrated
  operators" framing; the prior implicit "operator builds it"
  prose was correct but didn't surface the topology distinction.
- `gdpr.Art.9` detail block extended with the 8-lever toolkit
  enumeration + topology framing.
- New canonical context note
  `context/special-categories-operator-facilitated.md` with
  the full operator-toolkit treatment + the two-topology
  comparison table + honest limits.
- No tier shift on `gdpr.Art.9` (`coverage: facilitated`,
  `facilitation_mode: primitive`, `pryv_effort_saved: medium`
  hold across topologies; deployment-specific strength is in
  prose).
- Related rows (`swiss-nlpd.Art.5`, `hipaa-privacy.164.502`)
  unchanged — their existing `derives_from` cross-refs to the
  GDPR row carry the framing along.

No backlog, no proposal, no `planned:` chips. Classification is
**"voluntarily missing + highly facilitated"** — a useful sub-
pattern of "voluntarily missing" worth naming explicitly
alongside the simpler "voluntarily missing + operator-owned" we
saw in Q15 (backup encryption).

**Commit:** *(this commit)*.

### Q23 — GDPR Art.28 processor agreements: what subprocessors come with Pryv, and what flows where?

**Short answer:** **Zero mandatory subprocessors.** Every external
integration is opt-in through config. Let's Encrypt ships as a
**dev-platform facilitator** (production operators should choose
their CA). When integrations ARE activated, **three real
data-flow guarantees** limit what the subprocessor sees:
audit-by-construction (Q9), logger `inspectAndHide` credential
redaction (`[BIH]` test set), observability PII attribute
exclude list.

**Three sub-questions answered:**

1. **Does Pryv emit any artefact listing my deployment's
   subprocessors?** — Not today. The operator reads
   `override-config.yml` + per-host overlays and identifies
   which optional integrations are non-default. **Plan 60 A.9
   (Q20 absorption)** will fix this — `GET /system/admin/config/
   effective` exposes the merged effective config per core as a
   single JSON artefact ready to feed the operator's DPA
   register + Art.30 pipeline.

2. **Does Pryv differentiate PII-handling subprocessors vs.
   non-PII?** — Not as a structured flag, but the integration
   type implicitly classifies:
   - **PII-handling (when configured)**: SMTP (email + name +
     templated bodies), SMS endpoints (phone + MFA code), CMC
     peer cores (cross-account share of subject's events).
   - **Non-PII**: Let's Encrypt (hostnames only), upstream
     catalogue fetch (`service.eventTypes` URL — fetch-only of
     JSON Schema fragments; no personal data crosses the
     boundary).
   - **Filtered PII**: observability vendor (operator's choice
     — the façade is pluggable; New Relic ships as the first
     adapter). With the NR adapter, aggregated metrics + error
     traces flow with a hard-coded attribute-exclude list in
     front. Custom adapters (Datadog, Honeycomb, OpenTelemetry,
     internal Prometheus pipelines, etc.) implement PII
     filtering through their vendor's mechanism; the operator
     owns the equivalence check.

3. **Are there platform guarantees about what flows where?** —
   Yes, three layers, each verified in code + tests:

   **Layer 1 — Audit-by-construction (Q9 finding):**
   `components/audit/src/Audit.ts:151-166` — audit captures
   method + access ref + URL query + integrity hash; never
   request body; `auth=` query-string params stripped before
   write.

   **Layer 2 — Logger `inspectAndHide` credential redaction:**
   `components/boiler/src/logging.ts:253-298`. Every
   `Logger.{info,warn,error,debug}` call passes args through
   `inspectAndHide` before emission. Two mechanisms:
   - Object-key redaction: `password` / `passwordHash` /
     `newPassword` → `'(hidden password)'`.
   - String regex strip (`hideSensitiveValues`): `auth=c[a-z0-
     9-]*` → `'auth=(hidden)'`; serialised JSON password
     fields → `'$1=(hidden)'`.

   Tested by `[BIH1]`-`[BIH6]` in
   `components/api-server/test/boiler-inspectAndHide.test.js`.
   `[BIH6]` specifically asserts the password-redaction shape.
   End-to-end coverage at `system-seq.test.js:533` checks the
   `(hidden password)` substitution against `passwordHash` log
   payloads.

   **Honest scope** — `inspectAndHide` redacts **credentials**
   (auth tokens + password fields), not PII broadly. Email
   addresses, usernames, phone numbers, event payloads are
   NOT auto-redacted from log lines — they only leak if a
   caller explicitly logs them. The guarantee is "no
   credentials leak via logs", not "no PII whatsoever". The
   operator's log-aggregator destination + their broader
   PII-in-logs policy fill the rest of the picture.

   **Layer 3 — Observability PII filter** (when observability
   opt-in, provider-specific): the **observability primitive
   is a pluggable façade** at
   `components/business/src/observability/index.ts` — any APM
   vendor's adapter plugs in via the
   `{init, setTransactionName, recordError, recordCustomEvent,
   startBackgroundTransaction}` contract. **New Relic ships as
   the first concrete adapter**; operators free to write
   adapters for Datadog, Honeycomb, OpenTelemetry, an internal
   Prometheus pipeline, or any vendor the deployment requires.

   The NR adapter's hard-coded attribute exclude list at
   `components/business/src/observability/providers/newrelic/
   newrelic.ts:39-49`:

   ```js
   allow_all_headers: false,
   attributes: {
     exclude: [
       'request.headers.authorization',
       'request.headers.cookie',
       'request.headers.proxy-authorization',
       'request.headers.set-cookie*',
       'request.headers.x-*',
       'request.body'
     ]
   },
   transaction_tracer: { record_sql: 'off' }
   ```

   Plus `high_security: false` default — operator opts into
   account-side HSM if their observability account supports
   it. For the NR adapter, the exclude list is platform-defined
   in the adapter source; the operator can tighten further but
   not loosen the credential-strip guarantees without modifying
   adapter source. For custom adapters, **the operator owns the
   PII-filter equivalence** — every custom adapter must be
   reviewed for its own PII-exposure surface; the façade
   contract doesn't enforce filtering across all providers.

**Subprocessor inventory at deployment level** — five opt-in
integrations, each off by default:

| Config gate | Subprocessor | Data crossing the boundary |
|---|---|---|
| `letsEncrypt.enabled: true` (Plan 35) | LE — or any ACME directory you point `directoryUrl` at | Hostnames for ACME challenges only — no user data. Operator's call whether LE matches their compliance posture; alternative CAs drop in without code changes |
| `services.email.smtp.*` (Plan 39) | Operator's SMTP relay | Email + name + one-time tokens; body templates operator-owned via admin panel |
| `services.mfa.mode: enabled` + `sms.endpoints[*]` (Plan 26) | Operator's SMS provider | Phone number + MFA code |
| `observability.provider: <id>` (Plan 38) | Operator's chosen APM vendor — pluggable façade; New Relic ships as the first adapter; Datadog / Honeycomb / OpenTelemetry / internal Prometheus / etc. drop in as custom `providers/<id>/` adapters | Aggregated metrics + error traces; Layer 3 PII filter is adapter-specific (NR adapter ships a strict exclude list) |
| `service.eventTypes: <URL>` (default points at upstream `pryv/data-types`) | Catalogue host | **Fetch-only of schemas INTO the core; no personal data flows out** — pinning to self-hosted URL severs the dependency entirely |

**Where Pryv-the-software is NOT the Art.28 answer-source**:

- **Cloud provider** (AWS / Azure / Hetzner / on-prem) — opaque
  to Pryv; operator-to-provider relationship.
- **CDN / reverse-proxy** if you deploy one (nginx /
  Cloudflare). Pryv doesn't ship one; operator's deployment
  topology choice (per `RATE-LIMITING-RECIPES` backlog Q6)
  determines whether a CDN vendor is in scope.
- **External monitoring** beyond the observability-provider
  integration (Prometheus + Grafana operator runs themselves,
  log aggregator like Loki / ELK / Splunk). Pryv emits logs;
  the operator routes them.

**Matrix encoding**:

- `gdpr.Art.28` detail extended with the zero-mandatory-
  subprocessor framing + the 5-integration enumeration with
  data-flow per integration + the LE-as-dev-facilitator
  distinction + the three-layer data-flow guarantee table +
  the post-Plan-60-A.9 inventory pipeline cross-reference.
- `gdpr.Art.28` `pryv_primitives:` extended with
  `observability-provider` (was missing; the row already cited
  `letsEncrypt-integration` + `encryption-at-rest-secrets`).
- New canonical context note
  `context/subprocessor-posture-and-data-flow.md` with the
  full per-integration code-anchor analysis + the three
  data-flow layers + the "where Pryv is NOT the answer"
  honest-limits section.
- `gdpr.Art.30(1)(f)` unchanged — the existing register-field
  mapping table already covers "categories of recipients"; the
  subprocessor framing flows through naturally.
- `docs/pryv-primitives.md` `observability-provider` entry
  unchanged (already documents the PII filter; this Q
  cross-references rather than duplicating).

No backlog, no proposal, no chips — classification is
**"filled by existing primitive" + "operator-configured"**
for the integrations themselves + **"voluntarily missing
(absorbed by Plan 60 A.9)"** for the structured-inventory
artefact. The future inventory pipeline already has its slot
in `UPDATE-TRIGGERS.md` (`CONFIG-EFFECTIVE-EXPOSURE` from
Q20); no separate Art.28 backlog needed.

**Commit:** *(this commit)*.

## How to use this FAQ

When evaluating Pryv:
- Read this file end-to-end first; many "does Pryv do X?" questions
  are already answered.
- Each Q&A links to the commit + the matrix files updated; follow
  those for the full encoding.
- "Voluntarily missing" answers point at backlog items for future
  shipping; "pluggable" answers point at the extension surface.

When authoring future Q&A:
- Pose questions as a customer evaluating Pryv would, not as
  abstract regulator-language.
- Capture the answer + which rows / proposals / context notes /
  primitives got updated.
- Cite the commit.
