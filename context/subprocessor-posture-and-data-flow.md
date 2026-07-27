# Subprocessor posture + data-flow guarantees

For an operator running Pryv as a processor (or as a controller's
own software, where "subprocessor" still applies to the third
parties their deployment talks to), the Art.28 / Art.30(1)(f)
question is: **which external services does my Pryv deployment
touch, and what data flows to each?**

Pryv-the-software's posture is unusually clean here: **zero
mandatory subprocessors**. Every external service the platform can
talk to is opt-in through configuration. The default deployment
talking to "the operator's cloud provider only" (which Pryv treats
as opaque — operator's choice) has no third-party subprocessors
from the platform's perspective.

## Optional integrations enumerated

Each is a real subprocessor relationship under Art.28(4) when
activated. The operator names them in their DPA register +
discloses them per Art.13(1)(f) where recipients exist.

### Let's Encrypt — TLS certificate issuance

- **Config gate**: `letsEncrypt.enabled: true` (default `false`).
  Operators opting in get automated ACME issuance, renewal,
  cluster-wide cert replication.
- **What flows out**: the deployment's hostnames (for the ACME
  DNS-01 / HTTP-01 challenge). **No user personal data.**
- **Posture**: Let's Encrypt ships as a **dev-platform
  facilitator** — the easy on-ramp for `*.pryv.me`-style
  development clusters where the certificate-issuance friction
  would otherwise dominate setup. **Production deployments
  should treat CA choice as an operator decision** — keep LE
  if its compliance posture matches yours, or swap to a
  commercial CA, internal CA, or air-gapped issuance pipeline.
  The platform's ACME orchestrator (`AcmeOrchestrator`) reads
  `letsEncrypt.directoryUrl` so any ACME-compatible CA can
  replace LE without code changes; the cert-management surface
  (`bin/cert.js`, manual upload via `/system/admin/certs`) is
  the same regardless of issuer.
- **Code anchor**: `components/business/src/acme/` module
  (8 files); `default-config.yml` `letsEncrypt:` block.

### SMTP — transactional mail (per-core configurable)

- **Config gate**: `services.email.smtp.*` (host, port, auth,
  from). Built into open-pryv.io v2 as an in-process module
  (the former standalone service-mail component is now part of
  the unified binary).
- **What flows out**: rendered templated bodies — typically
  user's email address + name + a one-time token (password
  reset, account verification, MFA setup mail). The body
  template is operator-owned (manageable via the planned admin
  panel), so the operator controls exactly which PII their SMTP
  relay sees.
- **Posture**: **operator must configure**. No default SMTP
  endpoint ships. The operator's relay choice IS the
  subprocessor relationship — naming it in the DPA + Art.30
  register is on them.
- **Pryv recommends per-core SMTP configuration** for
  residency-sensitive deployments: the `services.email.smtp.*`
  block is per-core, so an EU core routes its outbound mail
  through an EU SMTP relay independently of a US core's relay.
  Use this when "EU subjects' password-reset emails must not
  touch a US-jurisdiction relay" is a hard requirement. Same
  pattern applies to the SMS endpoints — the
  `services.mfa.sms.endpoints.*` config block is per-core too.
- **Code anchor**: `components/business/src/mail/` module;
  `default-config.yml` `services.email:` block.

### SMS endpoints — MFA delivery

- **Config gate**: `services.mfa.sms.endpoints.*` (URL,
  bearer-token-style auth, per-region routing). Built into
  open-pryv.io v2 as the in-process MFA module (the former
  standalone service-mfa component is now part of the unified
  binary).
- **What flows out**: user's phone number + MFA challenge code +
  template ID. Strictly PII.
- **Posture**: operator must configure; default `services.mfa.mode:
  disabled` ships from `default-config.yml`. Encrypted-at-rest
  via the PlatformDB-encrypted-secrets family (the observability
  + bootstrap-bundle pattern), so the credentials never live on
  disk in plaintext.
- **Code anchor**: `components/mfa/` module.

### Observability vendor (pluggable façade — operator chooses)

- **Architecture**: the observability primitive is a
  **provider-agnostic façade** at
  `components/business/src/observability/index.ts` —
  business-layer callers invoke
  `{init, setTransactionName, recordError, recordCustomEvent,
  startBackgroundTransaction}` without knowing which vendor's
  adapter is attached. Vendor adapters live at
  `providers/<id>/`. **New Relic ships as the first concrete
  adapter** (`providers/newrelic/`); operators are free to
  write or contribute adapters for any APM vendor — Datadog,
  Honeycomb, OpenTelemetry collectors, internal Prometheus
  pipelines, etc. The façade contract doesn't bind operators
  to any specific vendor.
- **Config gate**: `observability.provider: <id>` + the
  vendor-specific encrypted-PlatformDB credentials. Default
  `observability.provider: disabled`.
- ⚑ **Correction of record (2026-07-27): this control was
  ineffective before that date.** The configuration below was
  placed in a file the vendor agent does not look for, so the
  agent silently ran on its own built-in defaults: no attribute
  exclusion at all, SQL recorded in obfuscated form rather than
  suppressed, and application log records forwarded. Any
  deployment that had observability enabled before 2026-07-27
  therefore sent request URLs, the `Host` header, route
  parameters (carrying the username) and log message bodies to
  its vendor, regardless of what this document previously
  claimed. Fixed by moving the configuration to a filename the
  agent discovers, and the posture below is now verified two
  ways: a test asserts what the agent's own configuration loader
  resolves, and the flagship deployment was validated after the
  fix landed (see the evidence note at the end of this entry).
  The earlier text is corrected rather than quietly rewritten,
  because a reviewer who relied on it was misled.
- **What flows out (NR adapter shipped today)**: aggregated
  transaction metrics + error traces. **With PII filters
  explicitly configured in the adapter.** Concrete protection
  block at
  `components/business/src/observability/providers/newrelic/newrelic.cjs:65-158`
  (the `.cjs` extension is load-bearing: the agent discovers
  `newrelic.{js,cjs,mjs}` only, which is what the correction
  above is about):
  ```
  allow_all_headers: false
  attributes.exclude: [
    'request.headers.authorization',
    'request.headers.cookie',
    'request.headers.proxyAuthorization',
    'request.headers.setCookie*',
    'request.headers.x*',
    'request.body',
    'request.uri',
    'request.parameters.*',
    'http.url',
    'request.headers.host',
    'request.headers.referer',
    'request.headers.userAgent'
  ]
  url_obfuscation: enabled, '^/.*' replaced by '*'
  strip_exception_messages.enabled: true
  application_logging.forwarding.enabled: false
  custom_insights_events.enabled: false
  api.custom_attributes_enabled: false
  transaction_tracer.record_sql: 'off'
  ```
  Two properties deserve an auditor's attention. **The names are
  the agent's published attribute names, not HTTP header names**:
  the agent camel-cases multi-word headers, so an exclusion
  written as `request.headers.user-agent` matches nothing and
  fails silently. That mistake was made here and was caught by a
  live attribute inventory rather than by review, which is why
  the posture is now asserted against the agent's own attribute
  filter. **URL obfuscation masks the WHOLE path** rather than
  matching identifier shapes; shape-matching was tried first and
  leaked attachment filenames, user-chosen stream ids and
  webhook path segments.
  Reading the identifier exclusions in the order that matters to
  a reviewer: **request URLs** (`request.uri`, `http.url`) carry
  the username plus event and attachment ids on this API;
  **`request.parameters.*`** covers both route parameters, where
  the username appears as an attribute in its own right, and
  outbound query parameters, which is how a credential passed as
  `?auth=` or `?readToken=` would otherwise be re-emitted on a
  cross-core forward; **`Host`** carries the username as a
  subdomain in DNS-ful topologies. `url_obfuscation` exists
  because attribute exclusion cannot reach the *names* of
  external call segments, which embed outbound paths.
  What still flows: route-pattern transaction names (never
  filled-in values), status codes, timings, the core FQDN, and
  datastore and external call timing.
- **Application logs are a separate channel, and ship OFF.** The
  agent auto-instruments the logging library and would forward
  log records including message text; attribute exclusion does
  not apply to a log message, and the platform's own log
  redaction covers credential-shaped values rather than
  identifiers. Operators may opt in per-process via
  `NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED=true`, and
  own what their messages contain. Log-derived metrics, which
  carry no message content, remain enabled.
- **`high_security` is off by default, and now genuinely
  optional rather than nominal.** Account-side High Security
  Mode is irreversible without vendor support, and a
  client/account mismatch makes the agent refuse to connect, so
  it cannot be a shipped default. The exclusions above do not
  depend on it. The opt-in previously existed on paper only (the
  config resolver never returned the value); it is now settable
  via `observability newrelic set-high-security <true|false>`.
- **Residual that no setting removes: outbound HOST names.** URL
  obfuscation rewrites paths, never hosts, and the span
  attributes `peer.hostname`, `peer.address` and `server.address`
  are present. For internal traffic those are the operator's own
  core FQDNs. **For webhooks they are the endpoint hostname the
  receiving application registered**, correlated by timestamp to
  the transaction that triggered the delivery. If a webhook host
  is itself identifying, it reaches the vendor and there is no
  client-side control for it: the operator's options are to not
  enable observability where webhook hostnames are sensitive, or
  to accept it. Error *message* text is no longer a residual, it
  is redacted (`strip_exception_messages`).
- **What remains is pseudonymous, not anonymous.** Precise
  timestamps, route patterns, status codes and the core FQDN
  still describe individual activity and can be re-identified by
  anyone holding a second signal, including the operator's own
  audit log. This telemetry is therefore still personal data and
  the processor relationship with the APM vendor still applies in
  full. "No identifiers are sent" is not the same claim as "this
  is no longer personal data", and this row should not be read as
  the latter.
- **Evidence (2026-07-27)**: validated twice on a live two-core
  deployment, with queries scoped to that deployment and bounded
  after each restart. The final pass enumerated the attributes
  actually held rather than asserting absences: the complete set
  of `request.*` attributes is `request.headers.accept`,
  `request.headers.contentLength`, `request.headers.contentType`
  and `request.method`. Probe sweeps returned zero for a planted
  `User-Agent` marker, a probe username in paths, an attachment
  filename and a query-string credential; forwarded log records
  zero; error messages empty while six errors were recorded with
  their class preserved. The same entity earlier that day showed
  129 transactions carrying request URLs and 172 forwarded log
  records, which is the before-and-after contrast. The
  enumeration matters: the first attempt at the `User-Agent`
  exclusion silently did nothing, and only an inventory of what
  the vendor held revealed it.
- **What flows out (custom adapter)**: vendor-specific.
  **The façade does NOT enforce PII filtering across all
  providers** — every custom adapter implements filtering
  through its vendor's mechanism (Datadog's attribute filters,
  Honeycomb's redaction processor, OTel's span processor
  attribute filter, etc.). The operator writing or installing
  a custom adapter owns the PII-filter equivalence check
  against the NR adapter's posture; the reviewer asking "what
  does my observability vendor see?" needs an answer specific
  to the adapter in use.
- **Posture**: pluggable + opt-in. New Relic adapter ships with
  strict defaults the operator can tighten further but cannot
  loosen without modifying source. Custom adapters require
  operator review.
- **Code anchor**: `components/business/src/observability/`
  module (façade + envBuilder + logForwarder);
  `providers/newrelic/` (first concrete adapter).

### Upstream catalogue fetch (`service.eventTypes`)

- **Config gate**: `service.eventTypes` URL (default points at
  `https://raw.github.com/pryv/data-types/master/dist/event-
  types.json`).
- **What flows OUT**: nothing — this is a **read-only fetch of
  schemas INTO the core**. The catalogue payload is JSON Schema
  fragments, not personal data.
- **What flows IN**: the deployed catalogue from the URL the
  operator points at. If the operator pins to a custom URL
  (Q14 pattern) or hosts the file statically inside their own
  infra, they break the dependency on the upstream
  `pryv/data-types` repo entirely. Production deployments
  concerned about supply-chain coupling typically self-host.
- **Posture**: **fetch is dependency, not subprocessor** — no
  personal data crosses the boundary. Still worth disclosing in
  the operator's DPIA / Art.30 if upstream-pinning matters to
  the audit narrative.
- **Code anchor**: `components/business/src/types.ts:143-186`
  `TypeRepository.tryUpdate`; `default-config.yml` `service:`
  block.

## Data-flow guarantees that limit subprocessor exposure

Even when an integration IS configured, Pryv has three layers
that constrain what data crosses the boundary:

### 1. Audit-by-construction (Q9)

The audit log captures method + access reference + URL query +
integrity hash — **never the request body**, with `auth=` query
parameters stripped. So when audit ships to a tiered audit store
(per the Q16 custom-datastore pattern), the destination sees
metadata, not content. Nuance: content-query search values sent
over HTTP GET are part of the URL query and travel with it — see
`content-query-audit-semantics.md`.

Code anchor: `components/audit/src/Audit.ts:151-166`.

### 2. Logger sanitization (`inspectAndHide`)

Every `Logger.{info,warn,error,debug}` call passes its arguments
through `inspectAndHide` (defined at
`components/boiler/src/logging.ts:253-298`) before emission. Two
mechanisms:

- **Object-key redaction**: keys named `password`, `passwordHash`,
  `newPassword` are replaced with `'(hidden password)'`
  (line 289-290).
- **String-value regex strip** (`hideSensitiveValues`,
  line 301-312):
  - `auth=c[a-z0-9-]*` → `auth=(hidden)` — strips personal-token
    wire shape.
  - `"(password|passwordHash|newPassword)":"..."` →
    `$1=(hidden)` — strips password values in serialised JSON.

Applied at the Logger class layer (line 201-216): every
`logger.log()` call runs `message` through `hideSensitiveValues`
AND every additional `context` argument through `inspectAndHide`.
So logs reaching the operator's log aggregator, syslog,
filesystem, observability vendor, or stdout-capturing container
runtime get the sanitization treatment regardless of caller.

Tested by `[BIH1]`-`[BIH6]` in
`components/api-server/test/boiler-inspectAndHide.test.js`.
`[BIH6]` specifically asserts the password-redaction shape:
`{ user: 'alice', password: 'secret123' }` →
`{ user: 'alice', password: '(hidden password)' }`. Additional
end-to-end coverage at `components/api-server/test/system-seq.
test.js:533` asserts the `(hidden password)` substitution on
`passwordHash` log payloads.

**Honest scope**: `inspectAndHide` redacts **credentials**, not
PII broadly. Email addresses, usernames, phone numbers, names,
event payloads — these can still appear in log lines if a
caller explicitly logs them. The guarantee is "no credentials
leak via logs", not "no PII whatsoever leaks via logs". The
operator's log-aggregator destination + their broader PII-in-
logs policy fill the rest of the picture.

### 3. Observability PII filters

The New Relic adapter's hard-coded attribute-exclude list (cited
above) keeps `request.headers.authorization` / `cookie` /
`proxy-authorization` / `set-cookie*` / `x-*` + `request.body` +
SQL statements out of the transaction-tracer payloads sent to
the observability vendor. Combined with `high_security: false`
default (operator opts into account-side HSM if their NR account
supports it), the data crossing to the observability vendor is
aggregated metrics + error stack-traces without credentials or
request bodies.

## How to assemble the subprocessor inventory for your DPA

Today (pre-admin-panel): read `override-config.yml` + per-host
overlays + identify which optional integrations are non-default:
- `letsEncrypt.enabled: true` → LE (or whichever
  `letsEncrypt.directoryUrl` you pointed at).
- `services.email.smtp.host: ...` → your SMTP relay.
- `services.mfa.mode: enabled` + `services.mfa.sms.endpoints[*]`
  → your SMS provider.
- `observability.provider: newrelic` → New Relic (or your
  pluggable provider).
- `service.eventTypes: https://...` → upstream catalogue host (if
  not self-hosted).

Once the planned `GET /system/admin/config/effective` admin
endpoint ships (effective-config exposure), it surfaces all of
this in one machine-readable JSON blob per core. The operator's
DPIA / DPA register / Art.30 records-of-processing pipeline can
consume it directly.

## Where Pryv-the-software is NOT the right Art.28 answer-source

- **Cloud provider** (AWS / Azure / Hetzner / on-prem hardware
  vendor / etc.). Pryv is opaque to the operator's hosting
  choice; their cloud provider's DPA is operator-to-provider, no
  Pryv-side artefact contributes.
- **CDN / reverse-proxy** sitting in front of the core
  (nginx / HAProxy / Cloudflare). Pryv doesn't ship one; the
  operator's deployment topology choice (per the
  `RATE-LIMITING-RECIPES` backlog Q6) determines whether a CDN
  vendor is in scope.
- **External monitoring** beyond the observability-provider
  integration (e.g., Prometheus + Grafana the operator runs
  themselves, log aggregator like Loki / ELK / Splunk). Pryv
  emits logs; the operator routes them. Their log-aggregator
  vendor is their relationship, not Pryv's.

## Matrix encoding

- `gdpr.Art.28` detail extended with the zero-mandatory-
  subprocessor framing + per-integration enumeration + the
  LE-as-dev-facilitator distinction + the three data-flow
  guarantees + the future inventory pipeline.
- `gdpr.Art.30` row stays as-is — the existing register-field
  mapping table is already strong; the subprocessor question
  is sub-Art.30(1)(f) "categories of recipients" and the
  context note covers it.
- `pryv-primitives.md` `observability-provider` entry covers
  the PII filter detail; this note cross-references rather
  than duplicates.
- No backlog filed (the future improvement — machine-readable
  subprocessor inventory — is absorbed by the planned
  bootstrap-admin-panel work).
- No `planned:` chips — Q20's chips against
  `CONFIG-EFFECTIVE-EXPOSURE` already capture the future
  matrix updates.

## See also

- `docs/pryv-primitives.md` — `letsEncrypt-integration`,
  `observability-provider`, `audit-event-stream` primitive
  entries.
- `context/data-masking-projection-vs-transformation.md` —
  audit-by-construction (Q9 finding cross-referenced from
  layer 1 above).
- `compliance-matrix/UPDATE-TRIGGERS.md` — `CONFIG-EFFECTIVE-
  EXPOSURE` Section A entry (future subprocessor inventory
  pipeline).
