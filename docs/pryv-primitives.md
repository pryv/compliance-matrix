# Pryv primitives — compliance-relevant building blocks

The matrix's coverage claims rely on these primitives. Each is cited from
requirement rows via `pryv_primitives: [<id>, ...]` in the scope YAML.

When a primitive's semantics change in `open-pryv.io`, update this file +
re-verify the citing rows.

## Primitive catalogue

### `access`

A grant of permission to act on a user's data.

- **Types**: `personal` (owner), `app` (third-party app), `shared` (peer).
- **Versioned**: `app` + `shared` accesses are immutable per version.
  `accesses.update` writes a full snapshot of the prior head into history,
  bumps `serial`, applies changes to head. Wire-format `id` is the bare
  `cuid` until first update, then `"<cuid>:<serial>"`. See
  [`../context/access-versioning.md`](../context/access-versioning.md).
- **Carries**: `permissions[]` (per-stream + level), `clientData` (free-form
  metadata), `name`, expiry, telemetry counters.
- **Compliance role**: the access IS the durable, versioned consent /
  authorization contract. `clientData` can carry the consent text shown +
  the lawful-basis + the purposes + retention metadata. Permissions enforce
  the scope technically.

### `permissions`

The set of stream+level tuples carried by an access.

- **Levels**: `none`, `create-only`, `read`, `contribute`, `manage`.
- **Granularity**: per `streamId` (incl. wildcards like `*`).
- **Enforcement**: blocked at the API surface — every read/write request
  is checked against the access's permissions for the relevant streams.
- **Compliance role**: technical purpose-limitation control. The
  consent-granted scope is the scope the API enforces — not a policy /
  documentation control.

### `clientData`

Free-form structured metadata slot present on accesses, streams, and
events.

- **Free-form**: arbitrary JSON. Implementer-defined schema.
- **Versioned**: on accesses, included in every version snapshot (see
  `access`). On events, included in event version history.
- **Compliance role**: the carrier for legally-binding metadata that the
  underlying primitive doesn't have a native field for — consent text,
  purposes, lawful basis, recipients, retention period, originating
  `consent/request-cmc` event id, etc.

### `stream`

A hierarchical container for events, owned by one user.

- **Purpose**: organize events by topic / context / classification.
- **Permissions handle**: access permissions reference streams; `level`
  applies to the stream and its descendants (per Pryv semantics).
- **System streams**: privileged streams (account, password, mfa, etc.)
  managed by the core; not user-creatable. Plugin-managed streams
  (e.g., `:_cmc:*`) follow similar conventions.
- **Compliance role**: data classification + purpose-scoping primitive.

### `event`

The atomic data record.

- **Carries**: type (class/format), content, time, streamIds,
  attachments, `clientData`.
- **Type validation**: `class/format` validated against the data-types
  repo schemas (`https://raw.github.com/pryv/data-types/master/dist/event-types.json`).
- **Versioned**: `events.update` snapshots prior state into event history
  (similar to access versioning).
- **Immutability when needed**: write the event once; never update.
  History-only events are append-only — useful for audit / consent /
  attestation.
- **Compliance role**: where the data subject's actual data lives;
  also the carrier for `consent/*` state-transition events
  (see [`../context/cmc-consent-primitives.md`](../context/cmc-consent-primitives.md)).

### `audit`

Records every API method invocation per user.

- **Stored**: per-user SQLite (see `components/audit/`).
- **Captures**: timestamp, user, access reference (`accessId` +
  `accessSerial`), method, source (transport + ip), URL query string,
  success / error, and an optional integrity checksum of the affected
  event (`{ key, integrity }`) when the method mutates an event.
- **Does NOT capture**: the request body. Event content, attachments,
  user-profile fields submitted in POST/PUT bodies never enter the
  audit row. The `auth=` query parameter is explicitly stripped.
  Consequence: the audit log is data-minimal *by construction* — it
  proves *who did what when* without storing *what data was written*.
  This is a deliberate design property, not a configuration toggle.
- **Read surface**: `audit.get` API method (subject to permissions).
- **Compliance role**: end-to-end accountability chain. With access
  versioning, the audit row points at a specific contract version —
  the consent state at the moment of the call is recoverable. The
  no-content guarantee means the audit log itself raises no
  data-minimisation (GDPR Art.5(1)(c)) or audit-PII-residue concerns
  when the original event is erased.

### `system-streams`

A privileged stream namespace managed by the core (not user-creatable).

- **Members**: account fields (username, email, language), security
  state (password, MFA), etc.
- **Special permissions**: access requires explicit grant of system
  stream permissions (different from regular streams).
- **Compliance role**: technical isolation of privileged data (e.g.,
  authentication state) from ordinary user content. Auditable
  independently.

### `MFA`

Multi-factor authentication via the `mfa.*` API methods
(`mfa.activate`, `mfa.confirm`, `mfa.challenge`, `mfa.verify`,
`mfa.deactivate`, `mfa.recover`). Opt-in per `services.mfa.mode`
operator config.

**Pluggable** — `components/business/src/mfa/Service.ts` defines an
abstract `Service` base class with `challenge()` and `verify()`
methods. Two subclasses ship today, both targeting HTTP-callable
external providers:

- `ChallengeVerifyService` — two-step external provider (separate
  challenge + verify endpoints).
- `SingleService` — one-step external provider (single endpoint
  does both).

The shipped subclasses are configured with SMS provider templates
by default (Twilio-style HTTP endpoints with `{{ username }}`
placeholder substitution), but the abstraction is generic over
any HTTP-callable provider. Operators can:

- **Config-only:** point `services.mfa` URLs at any HTTP MFA
  provider matching the challenge/verify or single-step shape
  (Twilio Authy, Auth0 MFA API, Duo Web webhook, etc.).
- **Code-level:** extend `Service` to implement any provider —
  internal or external.

In-process ceremonies (server-side TOTP, WebAuthn) currently
require a `Service`-subclass implementation. Reference plugins for
TOTP + WebAuthn are tracked at
`_plans/XXX-Backlog/MFA-MODERN-METHODS.md` (matrix-side mirror at
`proposals/mfa-modern-methods.md`).

- **Compliance role**: authentication strength control (ISO 27001
  A.8.5, HIPAA-Security 164.312(d), GDPR Art.32 multi-aspect, DiGA
  Annex 1.2.4, PIPEDA Principle 4.7). Which NIST AAL the deployment
  can claim depends on the configured provider; AAL2 requires TOTP
  + push or WebAuthn (SMS-only is AAL1 under NIST SP 800-63B Rev 3).

### `audit-event-stream`

A separate, append-only audit channel emitted into the user's own
streams (configurable). Distinct from the per-method audit DB.

- **Compliance role**: subject-visible audit trail; HIPAA-Security
  164.312(b) "Audit controls" subject-side.

### `webhooks`

Per-access HTTP POST notifications subscribed via the `webhooks.*`
API methods. **Signal-only by design.** The webhook body contains
a notification that something changed for the subscribing access;
it does **not** contain the changed data.

To consume the change, the receiver makes an **authenticated GET**
back to Pryv (using the access token it already holds) and reads
the current state via the standard `events.get` / `streams.get`
flow.

- Security consequence: the webhook surface itself does not carry
  PHI / PII / sensitive content, so the receiver's incoming-POST
  surface is **not a data-leak vector**. A forged or replayed
  webhook signal at worst causes the receiver to make an extra
  authenticated GET (which returns the same data Pryv would have
  served via push). No tokens in webhook bodies (because the
  receiver already holds its own token to make the GET).
- This sidesteps the classic webhook security minefield (HMAC
  signing, per-delivery nonces, replay windows) for the data-
  integrity dimension. TLS-on-delivery + delivery retry semantics
  still matter operationally.
- **Compliance role**: notification primitive for any row about
  "real-time change detection" / event-driven integrations
  (GDPR Art.32, HIPAA-Security 164.312(e)(1) transmission security,
  ISO 27001 A.8.20 + A.8.21 network services, monitoring patterns).
  See `context/webhooks-signal-only.md` for the full design
  rationale.

### `backup-restore`

`bin/backup.js` produces per-user backups; `--restore` rebuilds a user
from a backup file.

- **Per-user granularity** (key for engine-dependent erasure semantics
  in GDPR Art.17 + ISO 27001 A.8.10).
- **Compliance role**: data restorability (GDPR Art.32 §1(c)) +
  per-user erasure path for SQLite engine.

### `account-backup-tool`

`pryv-account-backup` (npm `@pryv/account-backup`) is the
subject-driven export tool. End-user / implementer runs
`npm start`, supplies service-info URL + username + password,
and gets a `./backup/<apiEndpoint>/` folder.

- **Captures today**: account info, public + private profiles, app
  profiles, streams tree, accesses list, events (single-shot
  `?fromTime=<MIN>&toTime=<MAX>`), attachments (opt-in).
- **Does NOT capture today**: audit log (`/audit/logs`), HF series
  data points (`GET /events/<id>/series`), webhooks; access version
  history not directly exported; still calls the v1-only
  `/followed-slices` (404 in v2). See
  [`../context/account-backup-coverage.md`](../context/account-backup-coverage.md)
  for the full coverage matrix.
- **Compliance role**: GDPR Art.15 (right of access) + Art.20 (data
  portability) substrate. Subject-runnable — no operator dependency
  for routine DSARs (the subject has their own credentials).
- **Restore path** is explicitly "experimental" — `npm start restore`
  re-imports events but loses HF series data + multi-attachment
  events on the way through.
- **Backlog**: `ACCOUNT-BACKUP-DSAR-COMPLETENESS` (matrix
  proposal: `proposals/account-backup-dsar-completeness.md`).

### `encryption-at-rest-secrets`

AES-256-GCM encrypted storage for operator-supplied secrets in the
platform DB (rqlite). HKDF-derived key from `auth.adminAccessKey`,
per-key purpose label.

- **Compliance role**: protects secrets (Let's Encrypt account keys,
  observability provider licence keys, future CMC keys) at rest.

### `letsEncrypt-integration`

Built-in ACME client that issues + renews certificates, replicates
across cluster via rqlite, hot-swaps via cluster IPC.

- **Compliance role**: TLS guaranteed-fresh; encryption-in-transit
  (GDPR Art.32, HIPAA-Security 164.312(e), ISO 27001 A.8.24).

### `data-residency`

Per-user data-residency choice across a Pryv platform that spans multiple
hostings (different countries / cloud regions / on-premise locations).

- **Hostings model**: a Pryv platform can publish a `hostings` config that
  groups its cores into zones → hostings. Each core carries a `hosting`
  label set at bootstrap time (`bin/bootstrap.js --hosting <region-label>`).
- **Discovery API**: `auth.hostings` (under `/reg/hostings`) returns the
  available zones / hostings / cores hierarchy so a registration UI can
  show the choice to the end-user.
- **Assignment**: at registration, the end-user (or the implementer's app
  acting on their behalf) picks a hosting. The chosen core hosts that
  user's data permanently. `system.users.get` exposes the per-user
  `hosting` field so the implementer can show "your data is in <region>"
  in the app.
- **Two policies the implementer chooses between**:
  1. **End-user choice** — implementer's registration UI presents the
     available hostings; user picks. Useful for consumer apps where
     subjects assert their own residency preference (e.g., "store my
     data in Switzerland").
  2. **Operator / regulatory routing** — implementer's app auto-routes
     to a hosting based on contract / jurisdiction / regulatory rules
     (e.g., EU subjects → EU hosting; French health data → HDS-certified
     French hosting). End-user doesn't see the choice.
- **Compliance role**:
  - **GDPR Art.3 / Ch.V** — data-residency choice satisfies "where is the
    data" both as territorial-scope determination and as transfer control
    (no Art.44-50 international transfer if user data never leaves the
    chosen hosting).
  - **HDS (France)** — French health data routed to an HDS-certified
    hosting + French jurisdiction.
  - **Swiss nLPD** — Swiss data routed to a CH hosting + CH jurisdiction.
  - **HIPAA-Security** (when applicable) — US data routed to a HIPAA-aware
    hosting.
- **Single platform, multiple hostings**: this is the key — it's one
  logical Pryv platform (one `auth.hostings` namespace, one user
  registration surface) backed by multiple physically-distributed cores.
  The implementer doesn't run separate deployments per jurisdiction.

### `multi-core-mTLS`

Bootstrap CLI issues passphrase-encrypted bundles; new cores join over
mTLS-protected Raft. PlatformDB pre-registration + DNS auto-publish.

- **Compliance role**: high availability (GDPR Art.32 §1(b) "ongoing
  CIA"); inter-core authentication separate from end-user auth.

### `observability-provider`

`PRYV_OBSERVABILITY_PROVIDER` env (New Relic adapter shipped first).
Filtered attributes (strips authorization / cookie / x-* / body).

- **Compliance role**: monitoring (ISO 27001 A.8.16) without leaking
  PII to the provider.

### `CMC`

`components/cmc/`. Federation fabric: cross-platform consent flows,
typed `consent/*` event lifecycle, capability accesses, bidirectional
shared accesses, scope-update via composite-id `accesses.update`.

- **Compliance role**: cross-account / cross-organization consent +
  data sharing primitive. Critical for any data-governance scope.
- **Details**: [`../context/cmc-consent-primitives.md`](../context/cmc-consent-primitives.md).

### `data-types`

Canonical `class/format` JSON Schemas at
`https://raw.github.com/pryv/data-types/master/dist/event-types.json`.
Includes `consent/*`, `notification/*-cmc`, `message/chat-cmc`.

- **Compliance role**: standardised data semantics; auditable type
  conformance.

### `app-web-auth3`

The customer-facing consent / auth / register / password-reset web
page template. Forked + rebranded per platform.

- **Compliance role**: the consent UX surface. The technical consent
  record lives on the back-end (access + `consent/request-cmc`); the
  UI must surface it correctly per Art.7(2) (presented in clear plain
  language, distinguishable, etc.).

## How to cite primitives in a scope YAML

```yaml
requirements:
  - ref: Art.7
    title: Conditions for consent
    coverage: implemented
    pryv_primitives: [access, permissions, clientData, audit, CMC]
    notes: |
      Access (with permissions + clientData) is the durable consent record.
      CMC carries cross-account consent state transitions. Audit chain
      proves the consent state at any time.
```

The validator checks every `pryv_primitives` entry resolves to a heading
in this document.

## Open items (need primitive doc additions later)

- `accesses.delete` semantics + cascade (events stay or go?).
- `events.update` history + which fields are mutable.
- `streams.delete` + `mergeEventsWithParent` semantics.
- `system.users.delete` end-to-end erasure flow incl. backups.
- Rate-limiting + throttling primitives (relevant to denial-of-service
  controls in ISO 27001 A.8.6).
