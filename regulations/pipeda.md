# Personal Information Protection and Electronic Documents Act (Canada) (PIPEDA)

- Scope id: `pipeda` (regulation)
- Jurisdiction: Canada (federal, private sector)
- Version: S.C. 2000, c. 5 (consolidated, incl. Digital Privacy Act 2015 amendments) (2001-01-01)
- Official text: https://laws-lois.justice.gc.ca/eng/acts/p-8.6/
- Requirements: 13 (4 implemented, 1 configurable, 7 facilitated, 1 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/pipeda

## PIPEDA Principle.4.1: Schedule 1, Principle 1, Accountability

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Organization is responsible for personal information under its
control and shall designate an individual or individuals who are
accountable for compliance with the following principles.

**What Pryv does for you**

Accountable-individual
designation is HR / organizational. Pryv contributes the
substrate the designated officer uses to demonstrate compliance:
audit log, observability, this matrix. Equips the role; doesn't
replace it.

**Evidence**

- derives from: gdpr.Art.24, gdpr.Art.37, iso-27701.A.7.2.1
- primitives: audit, access, observability-provider

## PIPEDA Principle.4.2: Schedule 1, Principle 2, Identifying Purposes

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Purposes for which personal information is collected shall be
identified by the organization at or before the time the
information is collected.

**What Pryv does for you**

Per-access
`clientData.purpose` records the identified purpose at the moment
the access is minted (which is "at or before the time the
information is collected" for the access's scope). The purpose
vocabulary is editorial.

**Evidence**

- derives from: gdpr.Art.5, iso-27701.A.7.2.1
- primitives: access, clientData

## PIPEDA Principle.4.3: Schedule 1, Principle 3, Consent

Coverage: implemented · effort saved: high · draft

Requirement: Knowledge and consent of the individual are required for the
collection, use, or disclosure of personal information, except
where inappropriate.

**What Pryv does for you**

Pryv's access primitive IS the durable consent record,
versioned permissions + clientData (carrying the consent text +
knowledge-of-purpose disclosure) together prove what was
authorised. Withdrawal is `accesses.delete` or scope-down via
`accesses.update`; the version chain proves the timing. CMC
`consent/*` events handle cross-account flows.

**Evidence**

- tests: AA01, AA02, ACCP
- derives from: gdpr.Art.7, iso-27701.A.7.2.4, ccpa.1798.120
- primitives: access, permissions, clientData, CMC, event

## PIPEDA Principle.4.4: Schedule 1, Principle 4, Limiting Collection

Coverage: implemented · effort saved: high · draft

Requirement: Collection of personal information shall be limited to that which
is necessary for the purposes identified by the organization.
Information shall be collected by fair and lawful means.

**What Pryv does for you**

Per-stream permissions limit what each access can write,
data outside an access's scope cannot reach Pryv via that access.
Stream-topology design (separating purposes onto distinct
subtrees) gives the granularity for "necessary for the
identified purposes". The fairness + lawfulness of the
collection method is editorial.

**Evidence**

- tests: AA01, ACCP
- derives from: gdpr.Art.5, iso-27701.A.7.4.1, ccpa.1798.140
- primitives: access, permissions, stream

## PIPEDA Principle.4.5: Schedule 1, Principle 5, Limiting Use, Disclosure, and Retention

Coverage: configurable · effort saved: medium · draft

Requirement: Personal information shall not be used or disclosed for purposes
other than those for which it was collected, except with the
consent of the individual or as required by law. Shall be
retained only as long as necessary for the fulfilment of those
purposes.

**What Pryv does for you**

Limit-use enforced by permissions; limit-disclosure enforced by
access scope to recipient. Retention has the same
configurable engine-dependent erasure mechanics noted under
GDPR Art. 17 + HIPAA-Security §164.310(d)(1): SQLite per-user
file deletion vs PG row deletion + backup rotation.
Automatic / scheduled retention enforcement is **operator-
owned** for events and streams (Pryv ships no TTL primitive
for records; whole accounts are covered by account
auto-deletion, see detail); the operator's external
retention job composes `events.get toTime=<cutoff>` +
`events.delete` + audit-log inactivity oracle,
`context/data-retention-operator-owned.md`).

**Detail**

Account auto-deletion, since open-pryv.io 2.0.0-rc.66
(`8521c8d5`, see gdpr.Art.5 §1(e)). For the account level,
"retained only as long as necessary" is a setting: your
inactivity preset (`account.autoDeletion.inactivity.defaultDays`,
default none) deletes accounts unused for that many days, its
clock starting the day it first applies (`[ACXP2]`), after
reminder mails (`[ACXP3]`) and at least 7 days after the first
notice (`[ACXP8]`), and each individual may schedule their own
account's deletion. A preset covers only plain accounts with an
email address (`[ACST14]`, `[ADSW9]`); state it in your privacy
policy. Event-level retention stays your retention job.

**Evidence**

- tests: AA02, ACCP, USAD, ACXP2, ACXP3, ACXP8, ACST14, ADSW9
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine, user-account.delete, account.autoDeletion.inactivity.defaultDays, account.autoDeletion.reminders.minNoticeDays
- derives from: gdpr.Art.5, gdpr.Art.17, ccpa.1798.105, iso-27701.A.7.4.5
- primitives: access, permissions, event, stream, backup-restore, account-auto-deletion
- context notes: data-retention-operator-owned

## PIPEDA Principle.4.6: Schedule 1, Principle 6, Accuracy

Coverage: implemented · effort saved: high · draft

Requirement: Personal information shall be as accurate, complete, and
up-to-date as is necessary for the purposes for which it is
to be used.

**What Pryv does for you**

`events.update` rectifies events (matching GDPR Art. 16); the
prior value is kept only on a deployment with
`versioning.forceKeepHistory: true` (off by default), while the
audit log records who rectified which event and when either way.
The "necessary for the purposes" determination is editorial.

**Evidence**

- tests: PTU1
- specs: EVENT.BASE
- derives from: gdpr.Art.5, gdpr.Art.16, iso-27701.A.7.4.3
- primitives: event

## PIPEDA Principle.4.7: Schedule 1, Principle 7, Safeguards

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: Personal information shall be protected by security safeguards
appropriate to the sensitivity of the information.

**What Pryv does for you**

Multi-aspect safeguards
inherited from the same primitive set as GDPR Art. 32 +
HIPAA-Security § 164.312 + ISO 27001 A.8. The "appropriate to
sensitivity" judgement (which subset to enable, how strictly to
scope) is the operator's.

**Evidence**

- derives from: gdpr.Art.32, hipaa-security.164.312(a)(1), iso-27001.A.8.20
- primitives: permissions, system-streams, letsEncrypt-integration, multi-core-mTLS, encryption-at-rest-secrets, MFA, backup-restore, audit

**Planned changes**

- feature: End-to-end encryption reframes the safeguards posture for high-sensitivity health data

## PIPEDA Principle.4.8: Schedule 1, Principle 8, Openness

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Organization shall make readily available to individuals specific
information about its policies and practices relating to the
management of personal information.

**What Pryv does for you**

Policy + practice text lives
on `access.clientData.privacy_notice` or as `consent/notice`
events, durably + per-subject + per-time recoverable. The
`app-web-auth3` template is the customer-facing surface where
the policy typically appears. Drafting the text is editorial.

**Evidence**

- derives from: gdpr.Art.12, gdpr.Art.13, ccpa.1798.130
- primitives: access, clientData, app-web-auth3, event

## PIPEDA Principle.4.9: Schedule 1, Principle 9, Individual Access

Coverage: implemented · effort saved: high · draft

Requirement: Upon request, an individual shall be informed of the existence,
use, and disclosure of their personal information and shall be
given access to that information. An individual shall be able
to challenge the accuracy and completeness of the information
and have it amended as appropriate.

**What Pryv does for you**

Individual access is the same primitive surface as GDPR Art. 15 +
HIPAA-Privacy § 164.524 + CCPA § 1798.100: subject holding a
personal token reads events, streams, accesses (with history),
audit data via the standard Pryv API. Challenge-and-amend uses
`events.update` for amendments + the disagreement-statement-as-
event pattern for denied amendments.

**Evidence**

- tests: AA01, EGSQ, UZEV, PTU1
- specs: EVENT.BASE, STREAM.BASE
- derives from: gdpr.Art.15, gdpr.Art.16, hipaa-privacy.164.524, ccpa.1798.100
- primitives: access, stream, event, audit, data-types, account-backup-tool

## PIPEDA Principle.4.10: Schedule 1, Principle 10, Challenging Compliance

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Individual shall be able to address a challenge concerning
compliance with the above principles to the designated
individual or individuals accountable for the organization's
compliance.

**What Pryv does for you**

Complaint-intake workflow
stores each challenge as an event on a designated
`compliance/challenges/*` stream with disposition tracking. The
accountable-individual interaction + resolution workflow is
operator-side.

**Evidence**

- derives from: hipaa-privacy.164.530(d)
- primitives: event, stream, audit

## PIPEDA s.10.1: Division 1.1, Mandatory breach reporting (Digital Privacy Act 2015)

Coverage: facilitated · effort saved: high · mode: evidence · draft

Requirement: Organization shall report to the Privacy Commissioner any breach
of security safeguards involving personal information under its
control if it is reasonable in the circumstances to believe that
the breach creates a real risk of significant harm (RROSH).
Shall also notify affected individuals + maintain records of
every breach for at least 24 months.

**What Pryv does for you**

Same primitive set as the
parallel breach-notification regimes (GDPR Art. 33-34,
HIPAA-Breach §164.402-404, Swiss nLPD Art.24): the shipped
`bin/breach-scope.js` + audit log produce the RROSH-input
artefact (records affected, methods invoked, streams in scope)
in one command per compromised access; operator-side
at-rest encryption may bear on the RROSH determination
(HHS-equivalent safe-harbor reasoning, though RROSH is a
different test). The 24-month record-retention obligation rides
on Pryv events on a `compliance/breaches/*` stream.

**Detail**

RROSH factors include sensitivity of the PI involved + probability
that the PI has been / will be misused, both informed by
Pryv-side data (audit row method + access reference + clientData
categorization). The decision itself + reporting + notification
content + delivery are the operator's; record-keeping rides on
Pryv.

**Notification delivery** (s.10.1 "notify affected individuals"),
voluntarily missing + operator-owned at the platform layer.
Pryv ships the identification primitive (audit log + the
shipped `bin/breach-scope.js`); operator composes delivery
via their
existing CRM / mail / SMS pipeline. Per-recipient send-
receipts captured back as
`compliance/breach-notification/sent-cmc` events satisfy
the 24-month record-retention obligation on the same Pryv
event chain. Full pattern in
`context/breach-notification-delivery-operator-owned.md`.

**Evidence**

- derives from: gdpr.Art.33, gdpr.Art.34, hipaa-breach.164.402, hipaa-breach.164.404, swiss-nlpd.Art.24
- primitives: audit, encryption-at-rest-secrets, access, event
- context notes: breach-notification-delivery-operator-owned

**Planned changes**

- feature: Chained audit log improves RROSH evidence chain (scoping + non-repudiation)

## PIPEDA s.11: Right to file a complaint with the Privacy Commissioner

Coverage: out-of-scope · draft

Requirement: Individual may file with the Commissioner a written complaint
against an organization for contravening a provision of Division
1 or for not following a recommendation set out in Schedule 1.

**What Pryv does for you**

Complaint-to-Commissioner is the individual's procedural right;
no software role on the Pryv side. The organization's response
file (the underlying evidence) draws on the audit log + this
matrix.

## PIPEDA framing: PIPEDA + provincial regimes, applicability

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: PIPEDA applies federally; provincial private-sector privacy acts
(BC PIPA, AB PIPA, Quebec Law 25) may apply in place of PIPEDA
to organizations operating substantially within those provinces.
Implementer determines which regime applies + may face multiple.

**What Pryv does for you**

Applicability is a legal
determination, not a software control. Pryv-side support: the
data-residency primitive lets you bind Canadian subjects' data
to a Canadian hosting (per-province granularity if multiple
Canadian hostings are configured), which simplifies the
substantially-within-province analysis. Tracking the chosen
regime per-deployment is operator-side.

**Evidence**

- primitives: data-residency

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
