# Swiss Federal Act on Data Protection (revised FADP / nLPD) (Swiss nLPD)

- Scope id: `swiss-nlpd` (regulation)
- Jurisdiction: Switzerland (extraterritorial via Art. 3 for processing affecting CH)
- Version: SR 235.1 (revFADP / nLPD, in force 2023-09-01) (2023-09-01)
- Official text: https://www.fedlex.admin.ch/eli/cc/2022/491/en
- Requirements: 30 (5 implemented, 1 configurable, 18 facilitated, 6 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/swiss-nlpd

## Swiss nLPD Art.5: Definitions

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Defines key terms, including personal data, sensitive personal data,
processing, controller, processor. Sensitive personal data under
revFADP is broader than GDPR Art. 9, includes social-assistance
measures and administrative or criminal proceedings + sanctions.

**What Pryv does for you**

The same primitive
mapping that handles GDPR Art. 4 carries here (event = personal
data, access = consent / authorization, etc.). The Swiss-
specific item is the broader "sensitive personal data"
category: implementer responsibility to design the stream
layout so social-assistance / administrative-proceeding data
sit on streams permissioned at the heightened-protection scope
you apply to it.

**Detail**

Practical Pryv pattern: dedicate stream subtrees per sensitive-
data category (e.g., `health/`, `social-assistance/`,
`criminal-record/`), and grant accesses with `permissions[]`
restricted to the smallest necessary subtree. Sensitive-data
classification of a category is a written editorial decision,
Pryv carries the classification but doesn't assign it.

**Evidence**

- derives from: gdpr.Art.4
- primitives: event, stream, system-streams, clientData

## Swiss nLPD Art.6: Principles of processing

Coverage: implemented · effort saved: high · draft

Requirement: Processing must be lawful, in good faith and proportionate.
Personal data may only be collected for a specific purpose
recognisable to the data subject; data accuracy must be ensured;
data destroyed or anonymized when no longer needed.

**What Pryv does for you**

Same Pryv contributions as GDPR Art. 5: permissions enforce
purpose-limitation technically; audit + access versioning give
the accountability artefact; events.update addresses accuracy
(keeping the prior value only with
`versioning.forceKeepHistory: true`, off by default). The Swiss-specific "recognisability" criterion
(purpose recognisable to the subject at collection) maps to the
consent UX layer, where the purpose written into
`access.clientData.purpose` should be the same purpose presented
to the subject.

**Detail**

Storage limitation: see Art.17-equivalent (GDPR Art.17 erasure;
revFADP Art. 32 §2 lit c on data destruction when no longer
needed). The configurable erasure mechanics from
`gdpr.Art.17` apply equivalently.

**Evidence**

- tests: GLHP, UZEV, AA01
- derives from: gdpr.Art.5
- primitives: access, permissions, clientData, audit

## Swiss nLPD Art.7: Data protection by design and by default

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: Controller must, from planning through implementation, ensure
processing operations comply with the Act through suitable
technical and organisational measures; default settings must be
privacy-protective.

**What Pryv does for you**

Pryv's architecture is
designed to satisfy Art. 7's "from planning through
implementation" directive, per-user storage isolation, stream-
scoped permissions, separate personal/app/shared access types,
system streams for privileged data, audit-by-default. What
stays on the implementer is the per-deployment default
configuration (token scopes minted, retention chosen, notice
shown at registration).

**Detail**

Same principle as GDPR Art.25, which this row derives from. The
architectural commitments and the catalogue of Pryv defaults are
in `context/privacy-by-design-and-default.md`.

**Evidence**

- derives from: gdpr.Art.25
- primitives: access, permissions, stream, system-streams
- context notes: privacy-by-design-and-default

## Swiss nLPD Art.8: Data security

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: Controller and processor must ensure data security through
appropriate technical and organisational measures. Federal Council
may issue minimum requirements (Ordinance on Data Protection /
OPDP).

**What Pryv does for you**

Pryv contributes the
same multi-aspect technical baseline as for GDPR Art. 32: TLS
in transit (letsEncrypt-integration); operator-side at-rest
encryption; AES-256-GCM for at-rest operator secrets; stream-
scoped permissions; MFA; multi-core HA via rqlite;
`bin/backup.js` restoration. The OPDP minimum-requirements
detailing remains the operator's compliance verification work.

**Evidence**

- derives from: gdpr.Art.32
- primitives: permissions, system-streams, letsEncrypt-integration, multi-core-mTLS, encryption-at-rest-secrets, backup-restore, MFA, data-residency

## Swiss nLPD Art.19: Information duty when collecting personal data

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Controller must inform the data subject of any acquisition of
personal data (whether from the subject or from a third party);
information must include controller identity, processing purpose,
recipients, transfer abroad.

**What Pryv does for you**

Same mapping as GDPR
Art. 13/14: notice text lives in
`access.clientData.privacy_notice` (or a dedicated `consent/*`
event when CMC is in play), kept with every previous version on
the access (on an event, only with
`versioning.forceKeepHistory: true`). The customer-
facing `app-web-auth3` template is the surface where the notice
is typically shown. Pryv records what you presented;
presentation itself is your editorial responsibility.

**Detail**

revFADP Art. 19 unifies the GDPR Art. 13 (direct collection) and
Art. 14 (indirect collection) into a single information duty.
The Pryv artefact set is the same, `access.clientData` +
provenance metadata on event.clientData when data didn't come
from the subject directly.

**Evidence**

- derives from: gdpr.Art.13, gdpr.Art.14
- primitives: access, clientData, app-web-auth3, event

## Swiss nLPD Art.21: Automated individual decisions

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Controller must inform the data subject of any decision based
exclusively on automated processing that has legal effect or
significantly affects the subject; subject has the right to
express their view.

**What Pryv does for you**

Automated decisioning is the
implementer's application logic, not Pryv's. What Pryv
contributes: the audit log lets you record when automated-
decision processing ran and on which input data, and `events`
are the carrier for the subject's expressed view (e.g., a
`decision/objection` event on a designated stream).

**Evidence**

- derives from: gdpr.Art.22
- primitives: audit, event, access

## Swiss nLPD Art.22: Data protection impact assessment

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Controller must carry out a data protection impact assessment in
advance for processing that may entail a high risk to the
personality or fundamental rights of the data subject.

**What Pryv does for you**

The DPIA itself is a written
assessment artefact that you (the controller) produce. Pryv
contributes to its inputs: the data-residency primitive tells
you where each subject's data lives; audit + access-version
data describe the processing-flow technical layer with concrete
artefacts; system-streams isolation gives a defensible "scope
of sensitive data" boundary. The legal-side methodology + the
writing of the assessment remain yours.

**Evidence**

- derives from: gdpr.Art.35
- primitives: audit, data-residency, access

## Swiss nLPD Art.24: Notification of data security breaches

Coverage: facilitated · effort saved: high · mode: evidence · draft

Requirement: Controller must notify the Federal Data Protection and Information
Commissioner (FDPIC) of a data security breach that is likely to
result in a high risk to the personality or fundamental rights of
the data subject as soon as possible. Notification to the affected
subject only when necessary for their protection or upon FDPIC
request.

**What Pryv does for you**

Same Pryv contribution as
GDPR Art. 33: the shipped `bin/breach-scope.js` toolchain +
audit data + access-version chain let you scope the breach
(which subject, which streams in scope, by which access).
The Swiss-specific point: revFADP Art. 24 says "as soon as
possible" rather than GDPR's 72-hour hard cap, but the FDPIC
2025-02-06 guideline still expects "immediately" for high-risk
breaches. Plan your incident-response cadence to match either
regime if you face both.

**Detail**

The downstream subject-notification trigger differs from GDPR
(revFADP Art. 24 makes it more conditional). Your incident-
response decision matrix should encode: "high risk to subject?
→ notify FDPIC immediately + assess whether subject notification
necessary for their protection". Pryv data feeds both the risk
assessment (audit scope of access) and the safe-harbor
determination (was the leaked artefact encrypted at rest?).

**Evidence**

- derives from: gdpr.Art.33
- primitives: audit, encryption-at-rest-secrets, access

## Swiss nLPD Art.25: Right to information (data subject access)

Coverage: implemented · effort saved: high · draft

Requirement: Any person may request information from the controller as to
whether personal data concerning them are being processed.
Controller must provide the information necessary to enable the
subject to assert their rights, including processing purpose,
categories, recipients, retention, source, automated decisions.

**What Pryv does for you**

Same implementation as GDPR Art. 15: subject holding a personal
token reads everything via the standard Pryv API (events, streams,
accesses with history, audit, attachments) in the canonical
data-types JSON shape. revFADP Art. 25 §2 lists an extended
minimum-information set (purpose, categories, recipients,
retention, source, automated decisions), same artefacts as
GDPR + a Swiss-specific "source" duty that maps to
`event.clientData.source` when data wasn't from the subject
directly.

**Evidence**

- tests: AA01, EGSQ, UZEV
- specs: EVENT.BASE, STREAM.BASE
- derives from: gdpr.Art.15
- primitives: access, stream, event, audit, data-types, account-backup-tool

## Swiss nLPD Art.28: Right to data portability

Coverage: implemented · effort saved: high · draft

Requirement: Data subject has the right to receive personal data concerning
them, which the subject has communicated to the controller, in a
commonly used electronic format. Right to transmit to another
controller where feasible.

**What Pryv does for you**

Same implementation as GDPR Art. 20: `events.get` + `streams.get`
return canonical JSON validated against `data-types` schemas.
For controller-to-controller transmission (§2), the CMC capability-
access flow mints a URL the receiving controller can read; no
operational lift on the subject's side.

**Evidence**

- tests: EGSQ
- specs: EVENT.BASE, STREAM.BASE
- derives from: gdpr.Art.20
- primitives: event, stream, data-types, CMC

## Swiss nLPD Art.31: Justification for processing sensitive personal data

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Processing of sensitive personal data without consent requires an
overriding private or public interest. Specific grounds are
enumerated (medical care, social-assistance, statistics under
conditions, etc.).

**What Pryv does for you**

Same approach as GDPR Art. 9:
legal-ground determination is your programmatic decision; Pryv
preserves the cited ground per access in
`access.clientData.legal_ground` so the justification travels
with the technical authorization and lives in the audit trail.
The Swiss-specific enumeration (Art. 31 §2 list) drives the
vocabulary your implementer uses for the `legal_ground` values.

**Evidence**

- derives from: gdpr.Art.9
- primitives: access, clientData, audit

## Swiss nLPD Art.32: Communicating personal data, general rules

Coverage: implemented · effort saved: high · draft

Requirement: Controller must take appropriate measures to ensure personal data
remain accurate; subject may request rectification, erasure, or
destruction of inaccurate personal data.

**What Pryv does for you**

Rectification and erasure: same mapping as GDPR Art. 16 + 17.
`events.update` for rectification (with version preservation);
`system.users.delete` for erasure (with the same engine-dependent
backup semantics noted under GDPR Art. 17).

**Detail**

Account auto-deletion, since open-pryv.io 2.0.0-rc.66
(`8521c8d5`, see gdpr.Art.17). The person can schedule the
erasure of their own account, at a date or after a period
without use, where your `user-account.delete` lets them delete
it directly (`[ACST10]`, arming needs the password, `[ACST3]`),
with reminder mails before it (`[ACRM1]`); the erasure is the
same as `system.users.delete`, guards included (`[ADSW8]`).

**Evidence**

- tests: PTU1, USAD, ACST3, ACST10, ACRM1, ADSW8
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine, user-account.delete
- derives from: gdpr.Art.16, gdpr.Art.17
- primitives: event, stream, backup-restore, account-auto-deletion

## Swiss nLPD Art.34: Disclosure of personal data abroad

Coverage: configurable · effort saved: high · draft

Requirement: Personal data may be disclosed abroad only if the receiving
country guarantees adequate data protection or, in defined cases,
with appropriate safeguards (BCRs, standard contractual clauses,
Federal Council approval).

**What Pryv does for you**

The `data-residency` primitive is the technical control here:
bind each subject's data to a hosting whose jurisdiction matches
your transfer regime. For CH data, route subjects to a CH
hosting and Art. 34 is moot (no disclosure abroad). For
legitimate transfers (e.g., CH → EU with adequacy + appropriate
safeguards), the per-user `hosting` field exposes which
jurisdiction the data sits in, recoverable for audit.

**Detail**

Cross-account / CMC disclosures across hostings inherit the
same control: the counterparty access's `apiEndpoint` reveals
which hosting (= jurisdiction) the receiving deployment lives
in; document the legal basis (adequacy decision, BCRs, etc.) on
the originating access's `clientData.cross_border_basis`.

**Registration placement (the release after open-pryv.io
2.0.0-rc.89).** A registration naming a CH `hosting` is created on
an available core of that hosting or refused (`400
invalid-parameters-format`, `data.reason` `hosting-unknown` or
`hosting-unavailable`), never created on a core of another hosting
`[MCHR1]`, `[MC05E]`; earlier releases created it on the core that
received the request. A registration without a hosting goes to any
available core `[MC05F]`: send the hosting whenever the subject's
data must stay in Switzerland.

**Residency guarantee level**: core-level, enforced by
architecture (see `context/core-affinity-architecture.md`).
Cores share no event / stream / audit data; the data plane is
core-affine + the client ↔ core path is direct over TLS with
no Pryv-shipped intermediary. A CH-assigned subject's data
lives exclusively on the CH core. The CMC-counterparty
pattern is the one runtime case where a cross-jurisdiction
read can happen (a foreign counterparty's client connects to
the CH `apiEndpoint`), and that's the moment the implementer
records the Art.34 legal basis on the access.

**Evidence**

- tests: BUNDLEENC, ACMEINT
- config keys: auth.hostings
- derives from: gdpr.Art.44, gdpr.Art.46
- primitives: data-residency, CMC
- context notes: core-affinity-architecture

## Swiss nLPD Art.35: Disclosure of personal data abroad, particular cases

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Disclosure abroad without adequate protection requires one of
defined exceptions (subject consent, contract performance,
overriding interests, etc.).

**What Pryv does for you**

Exception-based transfers
require recording the legal basis. Pryv pattern: the access
authorising the disclosure carries the exception type in
`clientData.transfer_exception` (e.g., `"art_35_consent"`,
`"art_35_contract"`); the audit row at disclosure time anchors
the exception to the specific event(s) transferred.

**Evidence**

- derives from: gdpr.Art.49
- primitives: access, clientData, data-residency

## Swiss nLPD Art.2: Material scope

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: revFADP applies to the processing of personal data concerning
natural persons by private persons and federal bodies. Does not
apply to natural persons processing personal data for purely
personal use, parliamentary proceedings, pending judicial /
administrative procedures.

**What Pryv does for you**

Your Pryv deployment is
fully in scope as automated processing of personal data. The
"purely personal use" exception (§2 §1 lit a) doesn't reach a
hosted Pryv deployment where you act as operator / controller
for others.

**Evidence**

- derives from: gdpr.Art.2
- primitives: access, event, audit

## Swiss nLPD Art.3: Territorial scope

Coverage: facilitated · effort saved: low · mode: infrastructure · draft

Requirement: revFADP applies to facts that have an effect in Switzerland,
even if initiated abroad.

**What Pryv does for you**

Whether revFADP applies
depends on whether processing affects CH data subjects, not on
where infrastructure lives. Pryv's data-residency primitive lets
you bind subjects to CH hostings explicitly when CH jurisdiction
is the chosen regime, see Art. 34 for the cross-border transfer
side.

**Evidence**

- derives from: gdpr.Art.3
- primitives: data-residency

## Swiss nLPD Art.16: Disclosure of personal data abroad, principles (cross-link)

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: Personal data may be disclosed abroad only where the Federal
Council has determined adequate protection or appropriate
safeguards are in place; see Art. 34 for the operative framework.

**What Pryv does for you**

Framing row pointing at
Art. 34 for the operative Pryv mapping and at GDPR Chapter V
(Art. 44-50) for the parallel EU regime.

**Evidence**

- derives from: swiss-nlpd.Art.34, gdpr.Art.44
- primitives: data-residency

## Swiss nLPD Art.30: Justification of breaches of privacy

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Personal-data processing that breaches privacy is unlawful unless
justified by consent, overriding private or public interest, or
law.

**What Pryv does for you**

Same pattern as GDPR Art. 6,
justification basis is recorded on the access's
`clientData.legal_basis` (Swiss-specific vocabulary drawn from
Art. 30 §2 list). Determination of which basis applies is your
editorial / legal judgement.

**Evidence**

- derives from: gdpr.Art.6
- primitives: access, clientData

## Swiss nLPD Art.4: Federal Data Protection and Information Commissioner (FDPIC)

Coverage: out-of-scope · draft

Requirement: The FDPIC supervises the application of data-protection
legislation by federal bodies and private persons; advises
authorities and private persons; investigates breaches +
makes recommendations + orders.

**What Pryv does for you**

The FDPIC is a regulator; no software role. When an FDPIC
investigation involves a Pryv deployment, the audit log +
access-version chain are the evidence layer the controller
provides, but interaction with the FDPIC is the controller's
legal / regulatory process.

## Swiss nLPD Art.23: Privacy by default

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Controller shall, by default, ensure that personal-data processing
is limited to the minimum required to fulfil the purpose, in
particular through appropriate technical settings.

**What Pryv does for you**

Pryv defaults lean privacy-
protective by construction: smallest-permission default is
"none"; system streams isolate privileged data; per-user storage
isolates subjects. The operator's deployment-time choices
(token-scope defaults, retention policy, MFA-on) determine
whether the by-default posture is fully exercised.

**Evidence**

- derives from: gdpr.Art.25, swiss-nlpd.Art.7
- primitives: access, permissions, stream, system-streams

## Swiss nLPD Art.26: Restriction of the right to information

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Right to information under Art. 25 may be restricted, refused or
deferred where a law so provides, where overriding interests of
a third party require it, or where the request is manifestly
unfounded.

**What Pryv does for you**

When a controller invokes
Art. 26 to restrict / refuse / defer a DSAR, the rationale is
recorded as a `dsar/restricted` event on a designated stream
with `clientData.art26_basis` capturing the §1 letter (a / b /
c). Audit log anchors the decision in time. Whether a given
restriction is justified is the controller's legal judgement.

**Evidence**

- derives from: swiss-nlpd.Art.25, gdpr.Art.15
- primitives: access, clientData, audit

## Swiss nLPD Art.33: Cross-border international cooperation

Coverage: out-of-scope · draft

Requirement: Federal Council may conclude international treaties on the
cross-border exchange of personal data, including treaties on
mutual data-protection cooperation.

**What Pryv does for you**

Treaty-level activity. No software role; no implementer
obligation arises from this Article alone.

## Swiss nLPD Art.9: Processing by a processor

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Controller may entrust processing to a processor only if the
processor undertakes to process personal data only as instructed,
ensures equivalent data security, and obtains controller approval
for any sub-processor engagement.

**What Pryv does for you**

Same pattern as GDPR Art. 28:
when the Pryv operator is a processor distinct from the
controller, the DPA + sub-processor list are the operator's
contractual artefacts. Pryv's audit log enforces "only as
instructed" demonstrability; the observability-provider
primitive is the sole built-in subprocessor candidate (default
disabled).

**Evidence**

- derives from: gdpr.Art.28
- primitives: access, clientData, audit, encryption-at-rest-secrets

## Swiss nLPD Art.12: Register of processing activities

Coverage: implemented · effort saved: high · draft

Requirement: Each controller + processor shall maintain a register of
processing activities (exceptions for SMEs whose processing
poses low risk). Register content parallels GDPR Art. 30.

**What Pryv does for you**

Same primitive-set mapping as GDPR Art. 30: access + clientData
+ audit + CMC + data-residency form the technical register
substrate. Swiss-specific note: the SME exception (Ordinance on
Data Protection) drops register obligation for companies < 250
personnel processing low-risk data. The register substrate is
available regardless; whether it's required is operator-side
legal judgement.

**Evidence**

- tests: UZEV, TJ8S, AA01
- docs: customer-resources/audit-setup.md, guides/audit-logs.md
- derives from: gdpr.Art.30
- primitives: access, clientData, audit, CMC, data-residency

## Swiss nLPD Art.17: Exceptions to the duty to inform

Coverage: out-of-scope · draft

Requirement: Information duty under Art. 19 may be waived where the data
subject already has the information, the processing is
provided for by law, the controller is bound by professional
secrecy, or providing information would be disproportionate.

**What Pryv does for you**

Exception-applicability is the controller's legal judgement; no
software role. Where the exception applies, the controller's
reasoning is documentable in `account.clientData.art17_basis`
for auditor questions.

**Evidence**

- derives from: swiss-nlpd.Art.19

## Swiss nLPD Art.18: Information when collecting personal data, specific cases

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: In addition to Art. 19 baseline, controller shall provide
additional information when transferring abroad, when processing
involves automated decision-making, and in cases involving
sensitive personal data.

**What Pryv does for you**

Additional disclosures are
stored alongside the baseline notice in
`access.clientData.privacy_notice` (or as additional
`consent/notice` events for clarity). The cross-border transfer
element ties to Art. 34; automated-decision element ties to
Art. 21.

**Evidence**

- derives from: swiss-nlpd.Art.19, swiss-nlpd.Art.21, swiss-nlpd.Art.34
- primitives: access, clientData

## Swiss nLPD Art.11: Codes of conduct

Coverage: out-of-scope · draft

Requirement: Professional, sector or trade associations may submit codes of
conduct to the FDPIC; the FDPIC takes a position on the code.

**What Pryv does for you**

Sector-level instrument; see GDPR Art. 40 for parallel framing.
Adherence is recorded as one of the Art. 8 "appropriate
measures" indicators on the deployment.

**Evidence**

- derives from: gdpr.Art.40

## Swiss nLPD Art.14: Representative in Switzerland

Coverage: out-of-scope · draft

Requirement: A controller established abroad whose processing concerns
persons in Switzerland on a large scale + regularly + with high
risk shall designate a representative in Switzerland.

**What Pryv does for you**

Representative designation is a contractual / regulatory
registration step for non-Swiss controllers; no software role.

## Swiss nLPD Art.15: Duty of the processor to inform the controller

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Processor shall inform the controller of all data security
breaches without delay; cooperate with the controller in
fulfilling obligations toward data subjects.

**What Pryv does for you**

When Pryv operator acts as
processor, the breach-notification channel to the controller is
the operator's contractual commitment. Pryv's audit +
observability + access primitives give the operator the scoping
data needed for the notification; CMC's cross-platform messaging
is a structured channel when both sides run Pryv.

**Evidence**

- derives from: gdpr.Art.28, gdpr.Art.33
- primitives: audit, CMC, observability-provider

## Swiss nLPD Art.29: Information from official registers

Coverage: out-of-scope · draft

Requirement: Anyone may obtain information from official registers on the
conditions provided for in special legislation.

**What Pryv does for you**

Public-register access is regulatory framing; no software role.

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
