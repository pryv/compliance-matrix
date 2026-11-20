# HIPAA Breach Notification Rule (HIPAA-Breach)

- Scope id: `hipaa-breach` (regulation)
- Jurisdiction: US
- Version: 45 CFR Part 164 Subpart D (HITECH 2013 Omnibus Final Rule) (2013-01-25)
- Official text: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-D
- Requirements: 13 (9 facilitated, 4 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/hipaa-breach

## HIPAA-Breach 164.400: Applicability

Coverage: facilitated · effort saved: low · mode: infrastructure · draft

Requirement: Subpart D applies to covered entities, business associates,
subcontractors and affiliated entities with respect to unsecured
protected health information.

**What Pryv does for you**

Subpart D applies only
to "unsecured" PHI, PHI that has not been rendered unusable
through encryption or destruction per HHS guidance (NIST SP
800-111 / SP 800-88). Pryv's posture (TLS in transit in the core
or at your proxy, as you configure it; operator-side
encryption-at-rest; per-user backup files that `bin/backup.js`
can encrypt itself) lets you put PHI inside the
safe-harbor where you choose to, narrowing what §400 actually
reaches in your deployment.

**Evidence**

- primitives: encryption-at-rest-secrets, letsEncrypt-integration

## HIPAA-Breach 164.402: Definitions, breach and unsecured PHI

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Defines "breach" (acquisition / access / use / disclosure not
permitted under Subpart E + four risk-assessment factors) and
"unsecured PHI" (not rendered unusable per HHS guidance).

**What Pryv does for you**

Two Pryv contributions to
applying the §164.402 definitions: (1) the audit log is the data
source for the §402 risk-assessment factors, nature of PHI
involved, unauthorized person, whether PHI was actually acquired,
mitigation extent; and (2) Pryv's access + permission model
makes "acquisition / access / use / disclosure not permitted
under Subpart E" a queryable property (was the access within its
granted scope?) rather than an after-the-fact narrative.

**Detail**

§402(2) safe-harbor, "unsecured" excludes PHI made unusable
through encryption guidance. In transit: TLS once configured, in
the core (`http.ssl.*` / `letsEncrypt.*`) or at your proxy (the
core serves plain HTTP without that configuration); at rest:
operator-side encryption (when configured).
AES-256-GCM is the at-rest cipher for the Pryv-managed secrets
(platform DB), aligning with the NIST SP 800-111 AES guidance,
though for ePHI content at rest, the operator-side encryption
(LUKS / PG TDE / dm-crypt) is what governs the §402(2) status.

§402(1) risk-assessment factors → Pryv data sources:
  - Nature + extent of PHI involved → audit row → API method +
    key request fields → infer streams + event types touched.
  - Unauthorized person → audit row → accessId → access holder.
  - Whether PHI was actually acquired or merely accessed → audit
    row → method (read vs. download attachments etc.).
  - Extent to which risk was mitigated → access version chain
    (was access revoked? when?), audit on revocation timestamp.

**Evidence**

- primitives: audit, encryption-at-rest-secrets, access, permissions

## HIPAA-Breach 164.404: Notification to individuals

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Following discovery of a breach of unsecured PHI, covered entity
must notify each individual whose PHI has been breached without
unreasonable delay and in no case later than 60 calendar days
after discovery.

**What Pryv does for you**

The notification process splits into **identification**
(Pryv-shipped, audit-log-driven per-subject roster, packaged
into the one-command `bin/breach-scope.js` report) and **delivery**
(voluntarily missing + operator-owned, Pryv's transactional
mail surface isn't bulk-send; operators compose with their
existing CRM / mail / SMS pipeline). The per-recipient
audit-trace bridge uses operator-authored
`compliance/breach-notification/sent-cmc` events on a
compliance system stream, satisfying the §164.414 burden-
of-proof obligation. Full delivery-side treatment in
`context/breach-notification-delivery-operator-owned.md`.

**Detail**

Per-subject impact query: filter audit rows by (breachedAccessId,
timeWindow) → distinct user ids. That's your §164.404
notification list, with evidence. The shipped
`bin/breach-scope.js` (open-pryv.io `0b2874e0`) packages this
into one command + adds §164.404(c)(1) (`recordCount` per read
audit row) + the `scopedStreamIds` resolved query scope. Note:
`scopedStreamIds` is an upper bound on exposure (the streams
the query could reach), not the streams of the events actually
returned, and the report does not derive PHI data categories
from it; mapping streams to "types of PHI" stays editorial.

§404(c) content elements (description of breach, types of PHI,
steps individual should take, what entity is doing, contact
info) are editorial; Pryv has no opinion on the wording.
Delivery, including rate-limiting + retries + send-receipt
tracking, uses the operator's existing notification stack
(`context/breach-notification-delivery-operator-owned.md`).

**Evidence**

- primitives: audit, access
- context notes: breach-notification-delivery-operator-owned

## HIPAA-Breach 164.406: Notification to media

Coverage: out-of-scope · draft

Requirement: Breach affecting more than 500 residents of a State or
jurisdiction requires notification to prominent media outlets in
that State or jurisdiction.

**What Pryv does for you**

Media notification is an organizational / communications
procedure. No software contribution; the threshold determination
(500 residents) is derivable from the §164.404 per-subject list,
but the notification itself is operational.

## HIPAA-Breach 164.408: Notification to Secretary

Coverage: out-of-scope · draft

Requirement: Covered entity must notify the Secretary of HHS following the
discovery of a breach of unsecured PHI; timing depends on
whether ≥500 individuals are affected.

**What Pryv does for you**

HHS notification (via the OCR online portal) is procedural and
organizational. Pryv's audit + access-version data inform the
content (subjects affected, dates, root cause) but the
submission itself is operator-side.

## HIPAA-Breach 164.410: Notification by a business associate

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Business associate must notify the covered entity of a breach
without unreasonable delay and in no case later than 60 days
after discovery.

**What Pryv does for you**

When you (the implementer)
act as a business associate to a covered entity and store their
PHI on your Pryv deployment, your BA-to-CE notification chain
is operational. The CMC plugin's cross-platform consent +
revocation flow gives you the technical substrate for
inter-organization handshakes; audit data lets you meet the
"without unreasonable delay" element on the data-gathering side.

**Evidence**

- primitives: CMC, audit

## HIPAA-Breach 164.412: Law enforcement delay

Coverage: out-of-scope · draft

Requirement: A delay of notification (to individuals, media, or HHS) is
permitted when a law-enforcement official states that
notification would impede investigation or cause national-
security damage.

**What Pryv does for you**

Procedural, depends on receipt of the law-enforcement
statement (oral with 30-day cap, or written with the official's
time-limit). No software role beyond preserving the audit log
across the delay period (which happens by default).

## HIPAA-Breach 164.414: Administrative requirements and burden of proof

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Covered entity / business associate must maintain documentation
sufficient to demonstrate that all notifications were made or
that the impermissible use / disclosure did not constitute a
breach.

**What Pryv does for you**

"Burden of proof" is met
with evidence; Pryv's audit + access-version chain is the
technical evidence layer ("we know exactly what was accessed by
which credential at what time"), and the shipped
`bin/breach-scope.js` bundles the audit walk + integrity hashes
for the affected window into one artefact. The organizational
documentation (incident response records, notification records,
decisions to not notify with rationale) sits on top of that
data.

**Evidence**

- primitives: audit, access

**Planned changes**

- feature: Chained audit log IS the burden-of-proof artefact (row could shift F:Evidence|Med → F:Evidence|High)

## HIPAA-Breach 164.404(b): Implementation specification, timeliness of notification

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Covered entity shall provide the required notification without
unreasonable delay and in no case later than 60 calendar days
after discovery of a breach.

**What Pryv does for you**

The 60-day clock is procedural,
the covered entity owns the incident-response cadence. The
shipped `bin/breach-scope.js` compresses the "discovery" +
"scoping" steps that dominate the timeline: one command on the
subject's home core answers "what was accessed, by whom, when,
how many records", so the clock is dominated by editorial work,
not data-gathering. The discipline of acting on that data
within the 60-day window is the operator's process.

**Evidence**

- derives from: hipaa-breach.164.404
- primitives: audit, observability-provider

## HIPAA-Breach 164.404(c): Implementation specification, content of notification

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Notification to individuals shall include a brief description of
what happened (date of breach + date of discovery), description
of PHI involved, steps individuals should take, what the entity
is doing, and contact procedures.

**What Pryv does for you**

Content of the notification is the covered entity's editorial
artefact; Pryv has no opinion on the wording. The shipped
`bin/breach-scope.js` report machine-derives inputs to two of
the five §404(c) content elements: the what-happened
description (time window, methods invoked, record counts) and
raw material for the PHI-involved description (streams in the
compromised access's query scope). The stream list is an upper
bound on exposure, mapping streams to "types of PHI" is
editorial, and the remaining elements (steps individuals
should take, what the entity is doing, contact procedures)
stay operator-side.

**Evidence**

- derives from: hipaa-breach.164.404
- primitives: audit, access

## HIPAA-Breach 164.404(d): Implementation specification, methods of individual notification

Coverage: out-of-scope · draft

Requirement: Written notice by first-class mail (or email if requested by
individual); telephone or in-person where urgent due to imminent
misuse; substitute notice where contact information insufficient
/ out-of-date (with web-posting + media-notice variants per
threshold).

**What Pryv does for you**

Notification method choice is operational. Pryv has no software
role in actually delivering the notice (Pryv is not a mailer).
When the entity uses Pryv events to record the notice-delivery
attempt (e.g., a `breach-notice/sent` event per affected
individual), the audit chain proves the delivery attempt.

**Evidence**

- derives from: hipaa-breach.164.404

## HIPAA-Breach 164.402(1): Definition of "breach", four-factor risk assessment

Coverage: facilitated · effort saved: high · mode: evidence · draft

Requirement: "Breach" means the acquisition, access, use or disclosure of PHI
in a manner not permitted under Subpart E, which compromises the
security or privacy of the PHI. Compromise is determined via a
four-factor risk assessment: (i) nature + extent of PHI involved,
(ii) unauthorized person, (iii) whether PHI was acquired or
viewed, (iv) extent risk has been mitigated.

**What Pryv does for you**

The four risk-assessment
factors all draw on Pryv data:
  (i) nature + extent: audit-row method + key request fields +
      derived event-type set from the touched streams.
  (ii) unauthorized person: audit-row accessId → access holder
      with clientData.role + clientData.purpose.
  (iii) actually acquired vs merely accessed: method-level
      distinction in audit (events.get vs attachments.get,
      success vs unauthorized error).
  (iv) mitigation extent: access-version chain showing
      revoke / scope-down timestamps relative to the incident.
The risk-assessment write-up is the operator's analytical
artefact; Pryv supplies the structured inputs.

**Evidence**

- derives from: hipaa-breach.164.402
- primitives: audit, access

## HIPAA-Breach 164.402(2): Definition of "unsecured protected health information", safe-harbor

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: "Unsecured PHI" means PHI not rendered unusable, unreadable or
indecipherable to unauthorized persons through use of a
technology or methodology specified in HHS guidance (NIST SP
800-111 for at-rest encryption; NIST SP 800-52 / SP 800-77 /
SP 800-113 / FIPS 140-2 for in-transit encryption; NIST SP 800-88
for destruction).

**What Pryv does for you**

The safe-harbor
narrows what triggers Subpart D notification: PHI that's
actually secured per HHS guidance is outside §164.402's
"unsecured PHI" definition and a leak of it doesn't compel
notification. With TLS configured (in the core via `http.ssl.*`
and the built-in ACME integration, or at your proxy), plus
AES-256-GCM for platform secrets at rest, the in-transit half
sits inside the safe-harbor; without that configuration the
core serves plain HTTP, so make sure no hop carries it. The at-rest
half for ePHI content itself depends on the operator's chosen
at-rest encryption (operator-side LUKS / PG TDE / dm-crypt).

**Detail**

Practical guidance: pair `letsEncrypt.enabled: true` with operator-
side full-disk encryption on every node + encrypted backup archives
to maximize §402(2) safe-harbor reach. NIST SP 800-111-equivalent
at-rest encryption applies whether the PHI is in the primary
engine, an attachment file, or a `bin/backup.js` output.

**Evidence**

- derives from: hipaa-breach.164.402, hipaa-security.164.312(a)(2)(iv), hipaa-security.164.312(e)(1)
- primitives: letsEncrypt-integration, encryption-at-rest-secrets, multi-core-mTLS

**Planned changes**

- feature: End-to-end encryption broadens safe-harbor coverage to bulk event data

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
