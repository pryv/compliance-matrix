# Digital Healthcare Act (DVG) + DiGA Ordinance (DiGAV) (DiGA)

- Scope id: `diga` (regulation)
- Jurisdiction: Germany
- Version: DiGAV (Digitale-Gesundheitsanwendungen-Verordnung), current consolidated text (2020-04-21)
- Official text: https://www.gesetze-im-internet.de/digav/index.html
- Layered on: gdpr, mdr
- Requirements: 24 (4 implemented, 1 configurable, 13 facilitated, 6 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/diga

## DiGA 4: § 4 Data protection and information security

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: The digital health application must demonstrate compliance with
requirements on data protection (per GDPR + Bundesdatenschutzgesetz)
and information security (per current state of the art, including
BSI guidelines).

**What Pryv does for you**

The data-protection
half of § 4 derives directly from the GDPR coverage already
authored (see GDPR Art. 5, Art. 25 by-design, Art. 32 security
of processing). The information-security half aligns with the
BSI TR-03161 + BSI C5 baseline; Pryv's primitives (TLS-default
+ AES-256-GCM secrets at rest + audit by default + multi-core
mTLS + MFA + data-residency) carry most of the manufacturer's
"state of the art" claim without additional software work.

**Detail**

For BfArM review, expect to provide:
  - Data-protection concept (Datenschutzkonzept), reuse the
    GDPR rows from this matrix as evidence per concept item.
  - Information-security concept (BSI TR-03161-aligned),
    Pryv's Annex 1 row mappings (below) feed this.
  - Penetration test certificate within 1 year of submission
    for the backend (Pryv) + app sides. Required at listing.

**Evidence**

- derives from: gdpr.Art.5, gdpr.Art.25, gdpr.Art.32
- primitives: access, permissions, audit, letsEncrypt-integration, encryption-at-rest-secrets, MFA, data-residency, system-streams, backup-restore

## DiGA 5: § 5 Interoperability

Coverage: facilitated · effort saved: low · mode: infrastructure · draft

Requirement: The digital health application must support interoperable data
exchange with other systems, in particular electronic patient
records (ePA / TI), based on the semantic and technical standards
named in the BfArM interoperability annex.

**What Pryv does for you**

Pryv's data-types
schemas (canonical `class/format` JSON Schema) give you a
stable in-platform data model that you can map to FHIR R4 (the
standard BfArM expects). The FHIR-mapping layer is app-side or
implemented as a Pryv data-type extension, not shipped today.
See `proposals/fhir-data-type-mapping.md` if filed, or treat as
a per-app integration concern.

**Detail**

BfArM lists specific HL7 FHIR profiles (KBV / gematik) the device
must consume / produce for ePA interoperability. Pryv's event +
stream model is structurally adequate (events carry typed
content; streams provide hierarchical categorization) but the
mapping is an app-layer transformation today.

**Evidence**

- primitives: event, data-types, stream

## DiGA 6: § 6 Robustness

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The digital health application must be robust against failure,
interruption and manipulation, with appropriate processes to
address security incidents.

**What Pryv does for you**

Pryv contributes the
operational baseline: multi-core HA with Raft replication;
cluster-CA mTLS between cores; encrypted bootstrap bundles;
daily-renewed TLS certs; backup + restore; audit-log for
forensic review. The manufacturer's incident-response procedure
(detection, escalation, communication) sits on top of this and
is the regulatory artefact BfArM reviews.

**Evidence**

- primitives: multi-core-mTLS, backup-restore, audit, observability-provider, letsEncrypt-integration

## DiGA 7: § 7 Consumer protection

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Information must be provided to users in a manner that is
comprehensible to laypersons; pricing, intended use, contra-
indications, supported devices + operating systems, data
categories collected, and other minimum elements must be
disclosed in advance.

**What Pryv does for you**

Same artefact set as GDPR
Art. 13 (notice at collection): Pryv stores the text shown to
the user, durably, versioned, per subject, typically on
`access.clientData.privacy_notice` or in a `consent/notice`
event. Drafting the actual text in "lay-comprehensible"
language is the manufacturer's editorial work, not Pryv's.

**Evidence**

- derives from: gdpr.Art.13
- primitives: access, clientData, app-web-auth3, event

## DiGA 8: § 8 Patient safety

Coverage: out-of-scope · draft

Requirement: The digital health application must, in its intended use, not
pose unacceptable risks to patient safety. Medical-device
classification + conformity assessment per MDR remain the
manufacturer's process.

**What Pryv does for you**

Patient-safety classification is the manufacturer's regulatory
task per MDR; Pryv has no software role at this layer.
Derives_from points at the MDR Art. 51 (classification) + Art. 52
(conformity) rows where Pryv is similarly out-of-scope.

**Evidence**

- derives from: mdr.Art.51, mdr.Art.52

## DiGA 14: § 14 Positive supply effects (Nutzennachweis)

Coverage: out-of-scope · draft

Requirement: The manufacturer must demonstrate positive supply effects,
medical benefit and/or patient-relevant structural and procedural
improvements, through a comparative study (typically RCT) or,
under specified conditions, real-world evidence.

**What Pryv does for you**

Clinical evidence is the manufacturer's regulatory work. Pryv is
not in scope at the trial design / statistical analysis layer.
For the data-collection substrate during the study, Pryv events
+ audit log are an option, but the regulatory burden of § 14
sits entirely on the manufacturer's clinical team.

## DiGA A1.1.1: Annex 1.1, Data protection, legal basis declared per processing

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: For each processing purpose, the manufacturer must declare the
Art. 6 + (if applicable) Art. 9 GDPR legal basis used.

**What Pryv does for you**

Pryv pattern:
`access.clientData.legal_basis` captures the Art. 6 basis per
access; for sensitive data,
`clientData.special_category_basis` captures the Art. 9
paragraph. Both travel with the access into the audit log so
the declaration is auditable per processing instance, not just
per system.

**Evidence**

- derives from: gdpr.Art.6, gdpr.Art.9
- primitives: access, clientData

## DiGA A1.1.7: Annex 1.1, Data minimisation

Coverage: implemented · effort saved: high · draft

Requirement: Only data necessary for the intended use shall be processed; data
must be deleted as soon as the purpose is fulfilled.

**What Pryv does for you**

Per-stream permissions are the technical minimisation primitive:
each access carries only the streams + levels needed; the holder
cannot see more than granted. Deletion-when-purpose-fulfilled is
the manufacturer's retention policy, executed via
`system.users.delete` (full erasure) or event/stream-level
deletion (partial).

**Evidence**

- tests: AA01, ACCP
- derives from: gdpr.Art.5
- primitives: permissions, stream

## DiGA A1.2.1: Annex 1.2, Information security, TLS at all interfaces

Coverage: configurable · effort saved: medium · draft

Requirement: All communication interfaces of the digital health application
shall employ Transport Layer Security at current state of the art.

**What Pryv does for you**

TLS is configured, not default: the core terminates it when
`http.ssl.*` is set (the built-in ACME integration issues, renews
and replicates certificates across the cluster when
`letsEncrypt.enabled` is set), otherwise it serves plain HTTP and
your reverse proxy terminates TLS. Inter-core Raft traffic runs
over mTLS with a cluster-private CA once `bin/bootstrap.js` has
written `storages.engines.rqlite.tls` (default plain TCP). The
core sets no TLS version or cipher options of its own, so
"current state of the art" in the core rests on Node.js defaults
(on the Node 24 the image runs: TLS 1.2 floor, TLS 1.3 when the
client supports it); if BfArM expects a TLS 1.3-only or narrower
cipher policy, enforce it at your proxy.

**Evidence**

- tests: ACMEINT, ACMEORCH, CERTUTILS, FORCERENEWIPC
- config keys: http.ssl.keyFile, http.ssl.certFile, letsEncrypt.enabled, storages.engines.rqlite.tls
- derives from: gdpr.Art.32
- primitives: letsEncrypt-integration, multi-core-mTLS

## DiGA A1.2.7: Annex 1.2, Penetration test within 12 months

Coverage: facilitated · effort saved: low · mode: infrastructure · draft

Requirement: A penetration test performed by an independent third party within
12 months before listing application is required; findings of
"critical" severity must be remediated; "high" findings must have
a mitigation plan.

**What Pryv does for you**

Pryv supports the
manufacturer's pentest by providing a reproducible deployment
artefact (Docker image), a structured audit log for
verification, and documentation of the security surface. The
test commissioning + remediation cycle is the manufacturer's.
For repeat customers, Pryv-side findings already remediated
upstream reduce repeat test scope.

**Detail**

The 2026 code-level security review of open-pryv.io (fixes in
2.0.0-rc.40 to 2.0.0-rc.51; public report `SECURITY-AUDIT.md`,
published 2026-10-14,
https://github.com/pryv/open-pryv.io/blob/master/SECURITY-AUDIT.md;
`context/code-security-review-2026.md`) does **not**
satisfy this requirement: it was performed by the maintainers of the
code, not by an independent third party, and it reviewed source code,
not your running application. It helps your penetration test: run a
release that carries the fixes before the test, and hand the tester
the report and release notes so known, fixed platform findings are
not re-reported against your listing.

**Evidence**

- primitives: audit
- context notes: code-security-review-2026

## DiGA A1.3.1: Annex 1.3, Interoperability, FHIR R4 export of treatment-relevant data

Coverage: facilitated · effort saved: low · mode: infrastructure · draft

Requirement: The digital health application must export treatment-relevant
data using HL7 FHIR R4 profiles approved in the BfArM
interoperability annex.

**What Pryv does for you**

Same status as § 5:
Pryv's event model is structurally adequate; the FHIR-mapping
transformation is app-side today. A
"compliance-matrix/proposals/fhir-data-type-mapping.md" entry
tracks the potential Pryv-side mapping primitive for cleaner
downstream coverage.

**Detail**

The implementer's natural extension path is a **FHIR-flavoured
custom event-type catalogue**, a sibling data-model repo
that defines Pryv event types mapping 1-to-1 (or 1-to-many)
to BfArM-approved FHIR resources, published via the standard
`service.eventTypes` extension model (see
`context/custom-event-type-catalogues.md`). The mapping
transformation (Pryv event ↔ FHIR Bundle) still runs
app-side, but the schemas being mapped are first-class
Pryv types validated by the same JSON Schema pipeline as the
legacy catalogue.

**Evidence**

- derives from: diga.5
- primitives: event, data-types, stream
- context notes: custom-event-type-catalogues

## DiGA A1.6.1: Annex 1.6, Patient safety, usability tested with target group

Coverage: out-of-scope · draft

Requirement: Usability of the digital health application shall be tested
against the intended user group prior to listing application;
results documented.

**What Pryv does for you**

Usability testing is the manufacturer's process (UX research +
protocols + documentation). Pryv has no software role at the
usability layer.

## DiGA A1.1.5: Annex 1.1, Data subject rights at the BfArM-specified level

Coverage: implemented · effort saved: high · draft

Requirement: Mechanisms must be provided to allow data subjects to exercise
their rights under GDPR Art. 15-22 directly within the digital
health application or via a clearly named contact.

**What Pryv does for you**

The personal-token Pryv API gives the data subject direct access
to events, streams, accesses, audit data. Implementer wraps it
in a UI section ("Your data + your rights") inside the DiGA app;
no separate portal needed. Each GDPR Art. 15-22 right has a
single API call behind it.

**Evidence**

- tests: AA01, EGSQ, UZEV, PTU1, USAD
- derives from: gdpr.Art.15, gdpr.Art.16, gdpr.Art.17, gdpr.Art.20
- primitives: access, event, stream, audit

## DiGA A1.2.4: Annex 1.2, Authentication of users and devices

Coverage: implemented · effort saved: high · draft

Requirement: Strong authentication of users (and where applicable devices)
must be implemented; passwords alone are not sufficient when
sensitive health data is processed.

**What Pryv does for you**

MFA via the `mfa.*` API methods (live by default since
open-pryv.io 2.0.0-rc.14 with authenticator-app TOTP,
`services.mfa.active`; the legacy `services.mfa.mode` is still
honoured); failed second factors hit a per-account backoff, not a
lockout, since 2.0.0-rc.27 (see HIPAA §164.312(d));
personal-token + access-token model gives separation of user
identity from app identity. The BfArM "strong authentication
where sensitive health data is processed" bar maps to MFA on by
default for DiGA-listed apps.

**Evidence**

- tests: MA15A, MA15C, MA10A, MA11A, MA3A, MA12A
- config keys: services.mfa.mode
- derives from: hipaa-security.164.312(d), iso-27001.A.8.5
- primitives: access, MFA, system-streams

**Planned changes**

- enhancement: Reference WebAuthn plugin meets the BfArM 'strong authentication for sensitive health data' bar without SMS-OTP weakness

## DiGA A1.2.10: Annex 1.2, Logging of security-relevant events

Coverage: implemented · effort saved: high · draft

Requirement: Security-relevant events must be logged with sufficient detail
to support incident investigation and audit; logs must be
protected against tampering.

**What Pryv does for you**

Per-user audit log records the API calls on an account; storage
has its own engine setting (per-user SQLite files by default, or a
PostgreSQL connection pool of its own), so the log is decoupled
from the data path. The
audit-event-stream optional channel additionally emits audit
records into the subject's own streams when surface-side
visibility is required.

**Evidence**

- tests: AT01, AT02, AT51, AT61, AT65
- derives from: iso-27001.A.8.15, hipaa-security.164.312(b)
- primitives: audit, audit-event-stream

## DiGA A1.3.6: Annex 1.3, Use of established healthcare data standards

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Where established standards exist for the data domain (FHIR R4,
LOINC, SNOMED CT, ICD-10, etc.), the application shall use them
to encode treatment-relevant data.

**What Pryv does for you**

Pryv stores whatever event
content the application writes. For LOINC / SNOMED / ICD-10
codings, the implementer encodes the code system + value as
event content fields (typically `event.content.code` +
`event.content.codeSystem`) per the `data-types` schema chosen.
The semantic-standard choice is app-side; Pryv preserves it.

**Evidence**

- primitives: event, data-types, stream

## DiGA A1.4.3: Annex 1.4, Availability and continuity

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The digital health application must be designed to be available
to users during its specified use periods, with documented
procedures for handling unavailability.

**What Pryv does for you**

Pryv-side availability:
multi-core HA (cluster topology + Raft replication); TLS
auto-renewal preventing cert-expiry outages; backup-restore for
catastrophic recovery; observability gives uptime metrics. The
application-layer continuity procedures (offline mode,
degraded-service messaging, support channels) are
manufacturer-side.

**Detail**

Since open-pryv.io 2.0.0-rc.47 and 2.0.0-rc.50 the core also
bounds what one client can consume (batch, paging, upload,
socket.io and preview limits; per-address budgets on the
unauthenticated entry points) and replaces a crashing worker after
a growing delay instead of in a tight loop, so a single misbehaving
client is less likely to make the service unavailable for others.
Since open-pryv.io 2.0.0-rc.87, a flood
of password checks no longer stalls a worker's other requests
(a bounded number run at a time, the rest refused with
`Retry-After`), and on PostgreSQL a runaway database statement of an
API request is stopped after a time limit instead of holding its
connection for as long as it takes. From the release after
2.0.0-rc.88, one account, one access or one socket.io connection
can hold only a bounded number of calls and connections at once on
a worker (the extra ones answer `429 too-many-requests`), and
overly nested or oversized call parameters are refused up front.
The same release bounds the depth and size of an account's stream
tree and the stream ids of one event, closes a connection a client
stopped reading after an idle timeout, and caps the mail a caller
can make a core send (registration codes per client address,
verification mails per account, an hourly breaker per core that
keeps password resets apart from registration codes). On a
multi-core platform, each process caches which core hosts a name
and the embedded DNS limits its lookup answers per client network,
so requests or forged DNS queries for random names no longer each
cost a cluster-wide database read.
See `context/rate-limiting-and-dos-protection.md` and iso-27001
A.8.6. An edge layer in front of the cores remains your part.

**Evidence**

- docs: customer-resources/rate-limiting.md
- derives from: iso-27001.A.5.23, mdr.A1.17
- primitives: multi-core-mTLS, letsEncrypt-integration, backup-restore, observability-provider
- context notes: rate-limiting-and-dos-protection

## DiGA A1.5.1: Annex 1.5, Consumer protection, clear pricing + contractual conditions

Coverage: out-of-scope · draft

Requirement: The implementer shall provide users with clear information on
pricing model + contractual conditions (subscription duration,
cancellation terms, renewal mechanics) in advance.

**What Pryv does for you**

Pricing + contract terms are editorial / commercial. No software
role; Pryv stores whatever notice text you present (per A1.1
data-protection notices pattern) but doesn't generate it.

## DiGA A1.5.4: Annex 1.5, Consumer protection, barrier-free access (accessibility)

Coverage: out-of-scope · draft

Requirement: The digital health application shall meet relevant accessibility
requirements (WCAG 2.1 AA equivalent or higher, per BfArM
interpretation), supporting users with disabilities.

**What Pryv does for you**

Accessibility is an app-layer UX concern. Pryv is a backend; the
app's HTML / WAI-ARIA / contrast / keyboard-navigation posture
is the manufacturer's frontend implementation.

## DiGA A1.5.7: Annex 1.5, Consumer protection, clear language + age-appropriate UI

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: User-facing text shall be in clear, plain language; for
applications targeting children or adolescents, the UI shall be
age-appropriate.

**What Pryv does for you**

Plain-language text + age-
appropriate UI are app-layer responsibilities. Pryv contributes
the artefact storage: when different content variants are
served to different age cohorts,
`access.clientData.target_audience` records the variant served,
and `account.clientData.age_verification_method` (per GDPR
Art.8) ties the variant to the verified age. Composition of
the text is editorial.

**Evidence**

- derives from: gdpr.Art.8
- primitives: access, clientData, event

## DiGA A1.6.5: Annex 1.6, Patient safety, alarm / escalation logic when applicable

Coverage: out-of-scope · draft

Requirement: Where the digital health application generates alarms or
escalation messages (urgent clinical signal, abnormal value
crossing a threshold), the logic shall be documented + validated;
escalation paths shall be tested + reliable.

**What Pryv does for you**

Clinical-alarm logic is the manufacturer's software responsibility
(and falls under MDR Art.61 clinical evaluation + Annex I §17.4
verification). Pryv stores the alarm events; the logic that
produces them is app-side.

## DiGA A1.2.2: Annex 1.2, Documentation of architecture + components

Coverage: facilitated · effort saved: medium · mode: awareness · draft

Requirement: Manufacturer shall document the application's architecture
including all components, their role + interactions, and the
security boundary of each.

**What Pryv does for you**

Pryv's architecture is
publicly documented (open-pryv.io README, AGENTS.md,
component-level READMEs), the BfArM-required architecture
document references Pryv as a sub-system. The app-layer
architecture (services, libraries, network topology) is the
manufacturer's documentation.

**Evidence**

- derives from: iso-27001.A.8.27
- primitives: audit

## DiGA A1.2.3: Annex 1.2, Hardening + secure configuration

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: The technical platform shall be hardened per current best
practices; configuration shall minimize attack surface
(disabled services, restricted ports, least-privilege defaults).

**What Pryv does for you**

Pryv ships secure-by-
default (TLS on, mTLS between cores, no anonymous access path,
system-streams isolating privileged data, at-rest secret
encryption). Operator-side hardening (host OS, firewall,
OS-level least-privilege) layers on top per their hardening
guide.

**Evidence**

- derives from: iso-27001.A.8.9
- primitives: letsEncrypt-integration, multi-core-mTLS, system-streams, encryption-at-rest-secrets

## DiGA A1.2.6: Annex 1.2, Incident response capability

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Manufacturer shall have documented incident-response procedures,
with detection + escalation + containment + recovery + post-
mortem phases defined.

**What Pryv does for you**

Pryv contributes detection
(observability anomalies, audit-log patterns) + containment
(accesses.delete revokes implicated tokens) + recovery
(backup-restore + multi-core HA) + post-mortem (audit-log
forensic trail). The manufacturer's IR runbook ties these
primitives together with people + decisions.

**Evidence**

- derives from: hipaa-security.164.308(a)(6)(i), iso-27001.A.5.23
- primitives: audit, observability-provider, access

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
