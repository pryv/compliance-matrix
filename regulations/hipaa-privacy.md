# HIPAA Privacy Rule (HIPAA-Privacy)

- Scope id: `hipaa-privacy` (regulation)
- Jurisdiction: US
- Version: 45 CFR Part 160 + Part 164 Subparts A + E (as amended through the HITECH 2013 Omnibus Final Rule) (2013-01-25)
- Official text: https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E
- Requirements: 35 (7 implemented, 2 configurable, 21 facilitated, 5 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/hipaa-privacy

## HIPAA-Privacy 164.502: Uses and disclosures of PHI, general rules

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: A covered entity may not use or disclose protected health
information, except as permitted or required by the Privacy Rule.

**What Pryv does for you**

Pryv's permission model
is the technical enforcement layer for Article 502: an app or
counterparty can only read or write streams its access permits.
The "permitted or required by the Privacy Rule" determination,
which use cases are TPO, when authorization is required, what
minimum-necessary means in your workflow, is your programmatic
decision; Pryv enforces whatever scope you grant.

**Detail**

Workforce, apps, and counterparties act on PHI only by holding an
access whose `permissions[]` allows the specific stream + level.
Disclosures to third parties (via shared accesses or CMC capability
flows) inherit the same enforcement model. The audit log makes
every use / disclosure attributable to a specific access at a
specific time, which is the substrate for §164.528 accounting.

**Evidence**

- primitives: access, permissions, audit

## HIPAA-Privacy 164.506: Uses and disclosures for treatment, payment, healthcare operations (TPO)

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Permits use and disclosure of PHI for the entity's own TPO, and
under defined conditions for another entity's TPO.

**What Pryv does for you**

TPO is the largest category
of permitted uses. Pryv lets you mint accesses tagged with the
TPO purpose in `clientData` (e.g., `purpose: "treatment"`); the
permission model enforces the scope. The TPO-vs-not
classification of any specific workflow is your programmatic
judgement; Pryv carries it forward into the audit trail.

**Detail**

A common pattern: separate accesses per purpose (one
"treatment-app" access; one "billing-app" access; one
"ops-analytics" access), each independently revocable and
auditable. `access.clientData.purpose` makes the
classification an artefact rather than a verbal claim.

**Evidence**

- primitives: access, permissions, clientData

## HIPAA-Privacy 164.508: Uses and disclosures requiring authorization

Coverage: implemented · effort saved: high · draft

Requirement: Uses and disclosures not otherwise permitted require a written
authorization from the individual that meets defined content
requirements.

**What Pryv does for you**

The authorization Pryv mints when your subject grants an access IS
the §164.508 authorization record, versioned, immutable per
version, with the granted scope (permissions) and the authorization
text (clientData or a `consent/request-cmc` event) inseparable.
The access keeps every previous version; a request event keeps
its previous versions only with `versioning.forceKeepHistory:
true` (off by default), so do not edit it after sending unless
that is on.
Withdrawal is a single API call. For cross-account / cross-entity
authorizations, the CMC plugin carries the negotiation state.

**Detail**

Section 508(c) elements (description, identification, signature
equivalent, expiration, right to revoke, etc.) map naturally to
access + clientData fields:
  - description of information disclosed → `permissions[]`
  - description of authorized recipients → access type +
    counterparty (CMC pair)
  - signature equivalent → the act of granting the access through
    the auth flow (auditable)
  - expiration → `access.expires`
  - right to revoke → `accesses.delete` + audit row at revocation;
    for a cross-account (CMC) authorization, the individual's own
    accept event also records the revocation, whichever party
    ended it (`content.withdrawal`, open-pryv.io
    2.0.0-rc.36) `[CN58]`, `[CN59]`, `[CN60]`
  - re-disclosure statement → `clientData.redisclosure_notice`
Implementer responsibility: ensure the consent UX presents the
§508(c) elements at the grant moment.

**Evidence**

- tests: AA01, ACCP, CN58, CN59, CN60
- primitives: access, clientData, CMC, event

## HIPAA-Privacy 164.510: Uses and disclosures requiring opportunity to agree or object

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Disclosures to family / friends or for facility-directory purposes
may proceed if the individual is given the opportunity to agree or
object, and the entity reasonably infers no objection.

**What Pryv does for you**

The opportunity-to-agree-or-
object construct is operational. Pryv lets you record the
offered choice and the individual's response as durable
artefacts (clientData on the relevant access, or a
`consent/notice-cmc` / custom event), so the §164.510
reasonable-inference becomes a record rather than recollection.

**Evidence**

- primitives: access, clientData, event

## HIPAA-Privacy 164.512: Uses and disclosures for which authorization or opportunity not required

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Twelve categories of permitted disclosures without authorization
(public health, law enforcement, etc.), each with specific
conditions.

**What Pryv does for you**

Section 512 disclosures are
operationally driven by the circumstances (subpoena, public-
health request, etc.). Pryv's contribution is durability: every
such disclosure must still go through an access, and the audit
log captures it. Recording the §512 category and rationale in
`access.clientData.legal_basis` makes the disclosure
justification recoverable later.

**Detail**

Recommended pattern: mint a purpose-specific access per §512
invocation (`clientData.disclosure_category: "law_enforcement"`,
`clientData.statute: "..."` etc.), execute the disclosure, and
revoke the access. The audit trail then shows the full lifecycle
attached to the legal-basis claim.

**Evidence**

- primitives: access, clientData, audit

## HIPAA-Privacy 164.514(a): De-identification of PHI

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: PHI that has been de-identified (Safe Harbor method or
Expert Determination) is no longer subject to the Privacy Rule.

**What Pryv does for you**

Pryv stores whatever event
content you write; de-identification is a transformation you
perform on the data before storage (or before disclosure).
Custom event types + the per-stream design let you keep an
identified and a de-identified copy under separate permission
scopes, simplifying §514(a) workflows.

**Detail**

A typical pattern: identified events on a `clinical/*` stream tree
with restricted access; a parallel `research/*` stream tree
holding de-identified projections, accessible to a broader analyst
group. The de-identification logic itself (e.g., Safe Harbor's
18-identifier list) is your application code; Pryv stores the
output.

**Evidence**

- primitives: stream, event, data-types

## HIPAA-Privacy 164.514(d): Minimum necessary use, disclosure, and requests

Coverage: implemented · effort saved: high · draft

Requirement: Covered entity must make reasonable efforts to limit PHI to the
minimum necessary to accomplish the intended purpose.

**What Pryv does for you**

Per-stream permissions are the minimum-necessary primitive: each
access carries only the streams + levels needed for its purpose,
so by construction the holder cannot see more PHI than granted.
Your stream layout + permission-design choices determine the
granularity at which "minimum necessary" can be enforced
technically.

**Detail**

Practical guidance:
  - Design stream topology so distinct purposes live on distinct
    subtrees (treatment / billing / research / ops).
  - Mint per-purpose accesses with `permissions[]` pointing at the
    smallest necessary subtree.
  - Avoid blanket `*` permissions except for personal-token /
    admin roles where unrestricted access is the stated need.

**Evidence**

- tests: AA01, ACCP
- primitives: access, permissions, stream

## HIPAA-Privacy 164.520: Notice of privacy practices

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Covered entity must provide a notice that adequately describes its
uses and disclosures of PHI and the individual's rights.

**What Pryv does for you**

The notice itself is your
editorial content. Pryv preserves the notice text shown to each
subject, typically on `access.clientData.privacy_notice` or as
a dedicated event, so the same words presented are recoverable
per subject per time. The customer-facing `app-web-auth3`
template is the surface where the notice typically appears.

**Evidence**

- primitives: access, clientData, app-web-auth3, event

## HIPAA-Privacy 164.522: Right to request restriction; confidential communications

Coverage: configurable · effort saved: medium · draft

Requirement: Individual has the right to request restrictions on uses and
disclosures and to receive confidential communications by
alternative means or at alternative locations.

**What Pryv does for you**

A granted restriction is a scope-down on the relevant access
(`accesses.update` to narrower permissions) or a revocation
(`accesses.delete`). The access-version chain proves what state
was in force before the restriction and from when it applies.
Confidential-communications choices (alternate address, phone)
live in `account.clientData` or a dedicated event.

**Detail**

Note that §522(a)(1)(vi) (post-HITECH) made restrictions on
disclosures to a health plan for out-of-pocket-paid services
mandatory on request. The Pryv pattern is the same, mint /
narrow the access tied to the health-plan workflow, but you
must apply it without operational discretion when this specific
condition is met.

**Evidence**

- tests: AA02, ACCP
- config keys: access.permissions
- primitives: access, permissions, clientData

## HIPAA-Privacy 164.524: Right of access by the individual

Coverage: implemented · effort saved: high · draft

Requirement: Individual has a right of access to inspect and obtain a copy of
their PHI in a designated record set, in the form and format
requested if readily producible.

**What Pryv does for you**

Your subject, holding a personal token, reads everything via the
standard Pryv API, events, streams, accesses (with history),
audit records, attachments, in the canonical event-type schemas.
Wrap that in a subject-portal app and you have §164.524 covered
end-to-end. The 30-day response timeline is your process target,
not a software latency.

**Detail**

Form-and-format: events return as canonical JSON validated against
`data-types` schemas, structured, machine-readable, and arbitrary
JSON-consumer-friendly. Attachments download in their stored
MIME-type. If a subject requests a specific format Pryv doesn't
natively produce (e.g., CDA C-CDA), your portal layer transforms.

**Evidence**

- tests: AA01, EGSQ, UZEV
- specs: EVENT.BASE, STREAM.BASE
- primitives: access, stream, event, audit, data-types, account-backup-tool

## HIPAA-Privacy 164.526: Right to amend

Coverage: configurable · effort saved: high · draft

Requirement: Individual has a right to have a covered entity amend PHI or a
record about the individual in a designated record set.

**What Pryv does for you**

`events.update` is the amendment primitive, and the audit log
records who amended which event and when. The prior content is
kept, so the amendment trail shows what changed, only on a
deployment with `versioning.forceKeepHistory: true` (off by
default; see `context/event-history.md`): set it, or record each
amendment as a new event linked to the one it amends. Configurable
rather than implemented: §164.526(c)(1) asks you to append the
amendment to, or link it from, the record it amends, and on the
default configuration an update overwrites that record; one
setting (or that modelling convention) gives you the trail. The
§164.526 process (request → decision → action → notice) is yours
to run.

**Detail**

For denied amendments where the individual files a statement of
disagreement (§526(d)), store the statement as a separate event
on a designated-record-set stream linked back to the original
via `clientData.amends_event_id`, so the disagreement travels
with the data on subsequent disclosures.

**Evidence**

- tests: PTU1
- specs: EVENT.BASE
- config keys: versioning.forceKeepHistory
- primitives: event
- context notes: event-history

## HIPAA-Privacy 164.528: Accounting of disclosures

Coverage: implemented · effort saved: high · draft

Requirement: Individual has a right to receive an accounting of disclosures of
PHI made by the covered entity in the 6 years prior to the
request, with specified exceptions.

**What Pryv does for you**

Pryv's audit log is the §164.528 substrate: API calls on an
account, attributed to an access (with version), are recorded
(high-frequency series and preview reads are not: account for
those disclosures by other means if you use them). Filtering by
access category, TPO accesses, §164.512 disclosures, etc., lets
you derive the §164.528-eligible subset (which excludes TPO).
Six-year retention of the audit log is your operator-side
configuration.

**Detail**

The accounting must include: date, recipient, brief description
of PHI disclosed, purpose. Each field has a Pryv source:
  - date → audit row timestamp
  - recipient → access holder (`access.id`) or counterparty (for
    shared / CMC accesses)
  - description → API method + URL query parameters recorded
    in audit, not the path (for example the id in
    `events.getOne`; the rows of `accesses.update` and
    `accesses.delete` name the access from the release after
    open-pryv.io 2.0.0-rc.89). **The audit log does NOT capture
    the request body**, so the description is "what was disclosed" at the
    API-shape level (e.g., `events.get` on a given stream),
    not the per-event content, sufficient under §164.528 and
    favourable for data minimisation (the audit row carries
    no residual PHI when the underlying event is later erased).
    See `docs/pryv-primitives.md` audit entry for the full
    capture catalogue.
  - purpose → `access.clientData.purpose` recorded at grant time
A record that cannot be written is a disclosure the trail cannot
account for: it is logged and, from the release after open-pryv.io
2.0.0-rc.89, counted (see hipaa-security 164.312(b)); it is not
recovered.
To whom access was open, and until when, is on the trail too: from
the same release each app or shared access the server itself
creates, changes or deletes leaves a record naming it (see
hipaa-security 164.312(b)).
Pre-computing per-subject accounting reports periodically (and
storing them on a dedicated stream) is a useful operational
pattern for fast response to requests.

**Evidence**

- tests: AT01, AT51, AT61, AT65
- primitives: audit, access, clientData

## HIPAA-Privacy 164.530(a): Privacy officer / contact person

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Covered entity must designate a privacy official and a contact
person responsible for receiving complaints.

**What Pryv does for you**

Designation is organizational.
Pryv's contribution is indirect: the audit log gives the
privacy official a concrete artifact to review when investigating
complaints or auditing internal use.

**Evidence**

- primitives: audit

## HIPAA-Privacy 164.530(b): Training

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Covered entity must train all members of its workforce on its
privacy policies and procedures.

**What Pryv does for you**

Training itself is your
programme. Pryv's contribution to operationalizing it: the
audit log + observability data make training-effectiveness
measurable (e.g., does role X exercise access patterns matching
policy after training?). The training content + record-keeping
are yours.

**Evidence**

- primitives: audit, observability-provider

## HIPAA-Privacy 164.530(c): Safeguards

Coverage: facilitated · effort saved: medium · mode: awareness · draft

Requirement: Covered entity must have appropriate administrative, technical,
and physical safeguards to protect the privacy of PHI.

**What Pryv does for you**

Section 530(c) is the
Privacy Rule's pointer to the Security Rule and to physical /
administrative safeguards. See the HIPAA-Security rows for the
technical safeguards Pryv contributes; §164.310 (Physical) for
the operator's hosting environment. Together those rows
constitute the §530(c) answer for this Pryv deployment.

**Evidence**

- derives from: hipaa-security.164.308(a)(1)(i), hipaa-security.164.312(a)(1), hipaa-security.164.312(e)(1)
- primitives: access, permissions, audit, letsEncrypt-integration, encryption-at-rest-secrets

## HIPAA-Privacy 164.530(f): Mitigation

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Covered entity must mitigate, to the extent practicable, any
harmful effect of a use or disclosure in violation of its policies
or the Privacy Rule.

**What Pryv does for you**

Audit log + access version
chain let you scope what was disclosed to whom and when, the
first step in any mitigation. `bin/backup.js --restore` is
available if mitigation involves rolling back data state;
`accesses.delete` is the primitive to revoke access from the
offending counterparty.

**Evidence**

- primitives: access, audit, backup-restore

## HIPAA-Privacy 164.502(b): Minimum necessary uses, disclosures, requests

Coverage: implemented · effort saved: high · draft

Requirement: Covered entity must make reasonable efforts to limit PHI to the
minimum necessary to accomplish the intended purpose, with
enumerated exceptions (treatment disclosures, disclosures to the
individual, authorized disclosures, required-by-law disclosures).

**What Pryv does for you**

Same primitive mapping as §164.514(d) minimum-necessary: per-
stream permissions are the technical control; the holder cannot
see more PHI than the granted scope permits. §502(b)(2)
exceptions are programmatic, the implementer leaves those
accesses unscoped per the exception's permission, and the audit
log records the broader access for accountability.

**Evidence**

- tests: AA01, ACCP
- derives from: hipaa-privacy.164.514(d), gdpr.Art.5
- primitives: access, permissions, stream

## HIPAA-Privacy 164.502(e)(1): Disclosures to business associates

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Covered entity may disclose PHI to a business associate (BA) and
may allow a BA to create, receive, maintain, or transmit PHI on
its behalf only with satisfactory assurances (typically via a
written contract, the BAA) that the BA will appropriately
safeguard the information.

**What Pryv does for you**

The technical disclosure is
mediated by the access primitive, mint a BA-specific access
with `clientData.role = "business_associate"` + `clientData.baa_id
= "<contract-ref>"`, scoped to the subjects / streams covered
by the BAA. Cross-platform BA arrangements (where the BA runs
their own Pryv) inherit the CMC capability pattern for cross-
account flow.

**Evidence**

- derives from: hipaa-security.164.314(a)(1), gdpr.Art.28
- primitives: access, clientData, CMC

## HIPAA-Privacy 164.530(d): Complaints to the covered entity

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Covered entity must provide a process for individuals to make
complaints concerning the entity's policies + procedures or its
compliance with the Privacy Rule; document complaints received
and disposition.

**What Pryv does for you**

A complaint-intake workflow
stores each complaint as an event on a designated
`complaints/*` stream with `clientData.disposition` tracking
outcome. The audit log captures the timestamp + actor on each
disposition update, making the §530(d)(2) documentation
requirement an automatic byproduct of normal record-keeping.

**Evidence**

- primitives: event, stream, audit

## HIPAA-Privacy 164.530(e): Sanctions

Coverage: out-of-scope · draft

Requirement: Covered entity must have and apply appropriate sanctions against
members of its workforce who fail to comply with the privacy
policies + procedures.

**What Pryv does for you**

Sanctions are an HR / disciplinary process. No software role at
the sanction-decision layer; the audit log gives the underlying
evidence ("did this person actually access X?") that HR
processes evaluate.

## HIPAA-Privacy 164.530(g): Refraining from intimidating + retaliatory acts

Coverage: out-of-scope · draft

Requirement: Covered entity may not intimidate, threaten, coerce, discriminate
against, or take other retaliatory action against any individual
for exercising any right under the Privacy Rule.

**What Pryv does for you**

Anti-retaliation is an organizational policy + culture commitment;
no software role.

## HIPAA-Privacy 164.530(i): Policies and procedures

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Covered entity must implement policies and procedures with respect
to PHI that are designed to comply with the standards,
implementation specifications, and other requirements of this
Subpart E.

**What Pryv does for you**

Same pattern as HIPAA-
Security §164.316(a): policies-as-data on a
`compliance/policies/*` stream get retention + audit, and
versioning once `versioning.forceKeepHistory: true` is set (off by
default). The drafting + approval + review-cycle procedure is the
privacy officer's. Cross-link to §164.316(a) preserves the
Security Rule's parallel obligation.

**Evidence**

- derives from: hipaa-security.164.316(a)
- primitives: event, stream, audit, backup-restore

## HIPAA-Privacy 164.510(b): Disclosures for involvement in care + for notification purposes

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Covered entity may, in accordance with §510(b)(2) standards,
disclose to a family member, other relative, close personal
friend or other person identified by the individual, PHI directly
relevant to that person's involvement with the individual's care
or payment for care.

**What Pryv does for you**

The §510(b) "directly
relevant" determination + relationship verification are
clinical-workflow concerns. Pryv pattern: mint a time-bounded
access for the involved person with permissions narrowed to
"directly relevant" streams + `clientData.relationship`
capturing the §510(b)(1) basis (family member name, role,
individual's opportunity-to-object record).

**Evidence**

- derives from: hipaa-privacy.164.510
- primitives: access, clientData, event

## HIPAA-Privacy 164.512(b): Uses + disclosures for public-health activities

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Covered entity may disclose PHI for public-health activities to
public-health authorities authorized by law to collect or receive
such information, including reporting of disease, injury,
vital events, conduct of public-health surveillance.

**What Pryv does for you**

Public-health-authority
recipient is recorded on the access's
`clientData.recipient_authority` + `clientData.statute` for the
§512(b) statutory basis. Audit log anchors the disclosure to a
specific timestamp + event range. The "authorized by law"
determination is the covered entity's legal judgement.

**Evidence**

- derives from: hipaa-privacy.164.512
- primitives: access, clientData, audit

## HIPAA-Privacy 164.512(f): Uses + disclosures for law enforcement purposes

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Covered entity may disclose PHI for law-enforcement purposes
under specific conditions: court order / warrant, administrative
request, identification + location, victim of crime, decedent,
etc.

**What Pryv does for you**

§512(f) categories drive
vocabulary for `clientData.law_enforcement_basis` (e.g.,
`"f_1_i_court_order"`, `"f_2_ii_subpoena"`, `"f_4_victim"`).
Per-instance disclosure access minted + revoked; audit log
preserves the chain. The decision of whether the request
qualifies under §512(f) is legal counsel's, not Pryv's.

**Evidence**

- derives from: hipaa-privacy.164.512
- primitives: access, clientData, audit

## HIPAA-Privacy 164.524(b): Right of access, requests + responses

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Covered entity may require individuals to make access requests
in writing (within reasonable limitations); must act on request
within 30 days (with one 30-day extension permitted with
written notice).

**What Pryv does for you**

Request-intake workflow
stores each request as an event on a designated
`access-requests/*` stream with `clientData.due_by` computed
from receipt timestamp. The 30/30-day operational cadence is
the covered entity's process; once the response is ready, the
individual exercises §524 directly via the standard Pryv API
(see the §164.524 parent row).

**Evidence**

- derives from: hipaa-privacy.164.524
- primitives: access, event

## HIPAA-Privacy 164.524(c): Right of access, provision of access

Coverage: implemented · effort saved: high · draft

Requirement: Covered entity must provide access in the form + format requested
if readily producible; in a readable hard-copy form or other
form as agreed; must provide a summary if the individual agrees
in advance + agrees to applicable fees.

**What Pryv does for you**

The Pryv API delivers events in canonical JSON (data-types
schemas), "readily producible" in the §524(c) sense.
Implementer's portal can transform to PDF / printed format
where requested. Summaries are application-layer constructions
from the same source events.

**Evidence**

- tests: EGSQ, UZEV
- derives from: hipaa-privacy.164.524
- primitives: event, stream, data-types

## HIPAA-Privacy 164.502(g): Personal representatives

Coverage: facilitated · effort saved: medium · mode: primitive

Requirement: Covered entity must treat a personal representative as the
individual with respect to uses + disclosures of PHI, subject to
enumerated exceptions (abuse / neglect concerns, endangerment).

**What Pryv does for you**

Pryv's account-delegation primitive
(`open-pryv.io/components/delegation/`) is the technical
mechanism for "treat the personal representative as the
individual": the representative holds an **owner-equivalent
delegate token** over the subject's account, full owner
authority over the data, with the single exception that a
delegate can never remove its own delegation. Every action the
representative takes is **audited per delegate on the subject's
account**, so uses and disclosures made under the
representative's authority are attributable. The individual
**revokes** the representative by a genuine login on their own
account and detaching (the authoritative teardown; a delegate
cannot block it), which is the technical shape of §164.502(g)'s
exceptions (abuse / neglect / endangerment) once the covered
entity makes that clinical / legal determination. Same-core and
cross-core (same platform) both carry the audited attribution;
see `context/delegation-model.md`.

The representative can also authorize an app for the individual
through the auth request: the app receives an ordinary app
access on the individual's account (never the representative's
owner-equivalent token), stamped by the server with a
non-forgeable lineage attribute naming the representative, and
its uses and disclosures are audited on the individual's account
with the representative named on every record. Revoking the
representative revokes every app access granted that way
(open-pryv.io 2.0.0-rc.23).

A lighter-weight alternative where full owner-equivalence is not
wanted: the representative holds a scoped `app` / `shared`
access instead, with `clientData.representative_relationship` +
`clientData.legal_basis` capturing the relationship and
`accesses.update` / `accesses.delete` narrowing or removing it.
The "abuse / neglect / endangerment" determination is clinical /
legal judgement either way.

**Evidence**

- tests: DCH01, DCH05, DCH12
- derives from: hipaa-privacy.164.502
- primitives: access, delegation, clientData, audit
- context notes: delegation-model

## HIPAA-Privacy 164.512(a): Uses + disclosures required by law

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Covered entity may use or disclose PHI to the extent that such
use or disclosure is required by law and the use or disclosure
complies with and is limited to the relevant requirements of
such law.

**What Pryv does for you**

"Required by law" disclosures
still ride on accesses; record the statutory basis in
`clientData.statute` so the audit chain ties the disclosure to
the legal authority. The compliance burden of the cited law is
separate.

**Evidence**

- derives from: hipaa-privacy.164.512
- primitives: access, clientData, audit

## HIPAA-Privacy 164.514(b): De-identification, Implementation specifications

Coverage: out-of-scope · draft

Requirement: Two methods: (1) Expert determination that the risk is very small;
(2) Safe Harbor, removal of 18 enumerated identifiers + no
actual knowledge that residual information could re-identify.

**What Pryv does for you**

Choice of method + execution are app-side. Pryv stores the
output of either method as ordinary events on the de-identified
streams.

**Evidence**

- derives from: hipaa-privacy.164.514(a)

## HIPAA-Privacy 164.514(c): De-identification, Re-identification

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Covered entity may assign a code or other means of record
identification to allow information de-identified under §514(b)
to be re-identified by the covered entity, provided the code
is not derived from / related to information about the
individual + the entity does not use / disclose the code for
any other purpose.

**What Pryv does for you**

`accesses.create {randomAlias:true}` provides the re-identification
code directly: it mints a platform-unique `r-XXXXXXXX` alias that is
random by construction (does not encode PHI), so it satisfies
§514(c)(1)(ii) out of the box. The platform holds the alias-to-user
mapping and the aliased access exposes only the alias, the covered
entity re-identifies by resolving the alias, and the code is used for
no other purpose. Since open-pryv.io `4547b32a` (2.0.0-rc.66) the alias survives a backup and restore (`[BKAL1]`)
and routes on a single core answering DNS (`[ALRT1]`). The alias
keeps the username from the recipient, and since open-pryv.io
2.0.0-rc.69 the token is accepted under its alias only, so a
recipient who suspects whose record it is cannot confirm the guess
with the token (`[AL13]`, `[OPSE5]`; earlier releases accepted it
under every name of the account). The data stays linked to the
account, so the alias does not by itself make it de-identified
under §514(b): that determination stays yours. When the workflow instead needs an explicit
code-to-PHI map, keep it on a dedicated `re-id-map/*` system-
stream-adjacent subtree with access permitted only to the
re-identification administrator role; the code generation method
(random / hash-of-non-PHI) must not encode PHI per §514(c)(1)(ii).
To link an account to a record id your EHR already uses (a patient
id), external ids (open-pryv.io 2.0.0-rc.58, `external-id-index`)
keep the re-identification means with you, not the platform: your
service sends `HMAC(K_namespace, recordId)` under a key it holds,
and Pryv stores only a token of that value mapped to a core, never
the record id nor the key, and never returns the value `[XIDC1]`,
`[XIDG1]`, `[XIDN4]`. The blinded value is derived from the record
id, so it is not by itself a code "not derived from" information
about the individual (§514(c)(1)): whether your design meets
§514(c) rests on your key custody (the key, the means of
re-identification, is not disclosed nor used for another purpose,
§514(c)(2)) and is your determination.

**Evidence**

- tests: XIDC1, XIDG1, XIDN4, BKAL1, ALRT1, AL13, OPSE5
- derives from: hipaa-privacy.164.514(a)
- primitives: randomAlias, stream, system-streams, access, clientData, external-id-index

## HIPAA-Privacy 164.528(b): Accounting of disclosures, Implementation specifications

Coverage: implemented · effort saved: high · draft

Requirement: Accounting must include, for each disclosure: date, name of
entity / person who received PHI, brief description of PHI
disclosed, brief statement of the purpose or copy of written
request.

**What Pryv does for you**

Each §528(b)(2) field has a Pryv source (date / name / PHI
description / purpose), see the §164.528 parent row for the
mapping. The pre-computed accounting report pattern (storing
results on a dedicated stream) keeps the §528 response window
tractable.

**Evidence**

- tests: AT01, AT51, AT61, AT65
- derives from: hipaa-privacy.164.528
- primitives: audit, access, clientData

## HIPAA-Privacy 164.504(e): Organizational requirements, business associate contracts

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Covered entity may permit a business associate to create, receive,
maintain, or transmit PHI on its behalf only with satisfactory
assurances via written contract meeting the BAA content
requirements of §164.504(e)(2).

**What Pryv does for you**

The §164.504(e) BAA content
is contractual. Pryv-side support for executing the contract
terms: BA access tagged with `clientData.baa_id` +
`clientData.role = "business_associate"`, scope narrowed to
subjects + streams covered by the BAA, audit-log accountability
for every action under the BA access.

**Evidence**

- derives from: hipaa-security.164.314(a)(1), hipaa-privacy.164.502(e)(1), gdpr.Art.28
- primitives: access, clientData, audit, CMC

## HIPAA-Privacy 164.504(g): Organizational requirements, group health plans

Coverage: out-of-scope · draft

Requirement: Group health plan may disclose PHI to a plan sponsor only upon
receipt of certification that the plan documents have been
amended per §164.504(f) restrictions.

**What Pryv does for you**

Group-health-plan / plan-sponsor arrangements are organizational
/ contractual. No software role.

## HIPAA-Privacy 164.502(j): Disclosures by whistleblowers + workforce member crime victims

Coverage: out-of-scope · draft

Requirement: Workforce member or business associate disclosure of PHI to a
regulatory authority / law enforcement / health oversight agency
is not a violation where the workforce member / BA believes in
good faith that the entity has engaged in unlawful conduct +
meets §502(j)(1) conditions.

**What Pryv does for you**

Whistleblower protections are legal framing. No software role;
the disclosing person's audit-trail evidence under their access
may be cited in subsequent proceedings.

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
