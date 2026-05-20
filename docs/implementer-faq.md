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
