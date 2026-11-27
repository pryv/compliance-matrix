# California Consumer Privacy Act (as amended by CPRA) (CCPA / CPRA)

- Scope id: `ccpa` (regulation)
- Jurisdiction: US, California (extraterritorial via business-nexus thresholds)
- Version: Cal. Civ. Code §§ 1798.100 - 1798.199.100 (CPRA amendments operative) (2023-01-01)
- Official text: https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5
- Requirements: 18 (3 implemented, 3 configurable, 9 facilitated, 3 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/ccpa

## CCPA / CPRA 1798.100: Right to know what personal information is collected

Coverage: implemented · effort saved: high · draft

Requirement: Consumer has the right to request that a business that collects
personal information about the consumer disclose the categories,
sources, business / commercial purposes, and specific pieces
collected.

**What Pryv does for you**

Same Pryv mechanism as GDPR Art. 15: the consumer holding a
personal token reads events, streams, accesses, audit data via
the standard API. Categories + sources are encoded in the event
class/format (data-types) and event.clientData.source.
Business / commercial purpose is encoded in
`access.clientData.purpose` per access.

**Evidence**

- tests: AA01, EGSQ, UZEV
- specs: EVENT.BASE, STREAM.BASE
- derives from: gdpr.Art.15
- primitives: access, stream, event, audit, data-types

## CCPA / CPRA 1798.105: Right to delete personal information

Coverage: configurable · effort saved: medium · draft

Requirement: Consumer has the right to request deletion of personal information
collected from the consumer; with statutory exceptions (Section
1798.105(d)).

**What Pryv does for you**

Same primitive as GDPR Art. 17: `system.users.delete` is the
per-consumer erasure call. Backup-completeness of the deletion
depends on the chosen storage engine (SQLite per-user file vs
PG row deletion), same notes as gdpr.Art.17 apply. Since
open-pryv.io 2.0.0-rc.58 the deletion also releases the
consumer's external ids (links to third-party record ids) at
once, on the home core and in the platform index `[XIDD2]`. Since
open-pryv.io 2.0.0-rc.89 each deletion leaves a
durable record without the consumer's data (the erasure ledger,
see gdpr.Art.17), so you can confirm later that a consumer's
account was deleted, and when `[ERLG4]`, `[ERLA4]`. The
§1798.105(d) statutory exceptions (warranty, security, legal
compliance, etc.) are your programmatic determination; if an
exception applies you suppress the deletion and document why.

**Detail**

Account auto-deletion, since open-pryv.io 2.0.0-rc.66
(`8521c8d5`, see gdpr.Art.17): the consumer can schedule the
deletion of their own account, at a date or after a period
without use, from the reference account app, where your
`user-account.delete` lets them delete it directly
(`[ACST10]`; arming needs the password, `[ACST3]`); reminders
precede it (`[ACRM1]`) and the deletion is the same as
`system.users.delete`, guards included (`[ADSW8]`). It has no
hook for a §1798.105(d) exception: if one applies to a consumer
whose deletion is scheduled, that is still your determination,
made before the deadline (for example by turning the feature off
on the core with `account.autoDeletion.enabled: false`, or by
your own process outside it).

Where you keep the audit trail after a deletion
(`audit.onUserDelete: keep`, a §1798.105(d) record-keeping
exception of yours), from open-pryv.io
2.0.0-rc.91 the kept trail ends with an `account.deleted` record
written before any of the consumer's data goes: who deleted the
account and the ledger's trigger, plus, for a deletion by the
consumer, their client address and the personal access that asked;
no username or free text `[AADL1]`, `[AADL2]`. With the default
`erase` nothing is kept in the trail `[AADL3]`. A restore of the
account from a backup leaves `account.restored` in its trail
`[AARS1]`: a deleted consumer brought back by a restore is visible
in their own record (see gdpr.Art.17 for the ledger check that
refuses such a restore by default).

**Evidence**

- tests: USAD, XIDD2, ACST3, ACST10, ADSW8, ACRM1, ERLG4, ERLA4, AADL1, AADL2, AADL3, AARS1
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine, user-account.delete, account.autoDeletion.enabled
- derives from: gdpr.Art.17
- primitives: event, stream, backup-restore, external-id-index, account-auto-deletion

## CCPA / CPRA 1798.106: Right to correct inaccurate personal information

Coverage: implemented · effort saved: high · draft

Requirement: Consumer has the right to request that a business correct
inaccurate personal information.

**What Pryv does for you**

`events.update` is the correction primitive, and the audit log
records who corrected which event and when. The prior
(inaccurate) value is kept for traceability only if your
deployment sets `versioning.forceKeepHistory: true` (off by
default; see `context/event-history.md`). The §1798.106 process
(consumer request → reasonable efforts → action) is yours to run;
the technical correction is shipped, and keeping the history is
your configuration choice.

**Evidence**

- tests: PTU1
- specs: EVENT.BASE
- derives from: gdpr.Art.16
- primitives: event
- context notes: event-history

## CCPA / CPRA 1798.110: Right to know, categories and specific pieces

Coverage: implemented · effort saved: high · draft

Requirement: Consumer has the right to request specific categories of personal
information and the specific pieces of personal information the
business has collected about the consumer.

**What Pryv does for you**

Categories surface from the canonical event-type schemas
(`event.type` = `<class>/<format>`); specific pieces are the
events themselves. A consumer-portal app wrapping
`events.get`+`streams.get` delivers both in one response.

**Evidence**

- tests: EGSQ, UZEV
- specs: EVENT.BASE, STREAM.BASE
- derives from: gdpr.Art.15
- primitives: event, stream, data-types, account-backup-tool

## CCPA / CPRA 1798.115: Right to know about sale or sharing

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Consumer has the right to know whether personal information was
sold or shared, the categories sold or shared, and the categories
of third parties to whom it was sold or shared.

**What Pryv does for you**

Every "sale" or "sharing"
you do, in CCPA's broad sense, which includes cross-context
behavioural advertising, happens through a Pryv access granted
to the recipient. The access's `clientData` can carry the
§1798.115 classification (sale vs share, category of third
party); audit records anchor the transaction in time. What's
not the software's job: deciding when a use qualifies as "sale"
or "sharing" under the CCPA definition (Civ. Code §1798.140(ad)
+(ah)), that's a contractual / classification decision you
record on the access.

**Detail**

Pattern: when minting an access for a counterparty:
`access.clientData = {`
`  type: "share",          // or "sale", per §1798.140`
`  third_party_category: "ad_partner",`
`  contract_id: "..."`
`}`
The consumer-side §1798.115 response then queries
`accesses.get ?includeHistory=true` filtered on
`clientData.type ∈ {sale, share}` and surfaces the third-party
categories.

**Evidence**

- primitives: access, clientData, audit, CMC

## CCPA / CPRA 1798.120: Right to opt out of sale or sharing

Coverage: configurable · effort saved: medium · draft

Requirement: Consumer has the right, at any time, to direct a business that
sells or shares personal information about the consumer to third
parties not to do so.

**What Pryv does for you**

Opt-out is implemented by revoking or narrowing the access
powering the sale/share, `accesses.delete` for full opt-out,
`accesses.update` for narrowing, both versioned and audit-
anchored. A `consent/opt-out-sale-cmc` event (or custom
`optout/*` event) gives the consumer-side artefact alongside
the technical effect.

**Detail**

Honoring Global Privacy Control signals (which CPPA regulations
require treating as a §1798.120 opt-out request) is your
application-layer responsibility, detect the GPC header on the
consumer's browser session and trigger the access revoke flow
automatically. Pryv has no opinion on the signal source.

**Evidence**

- tests: AA02, ACCP
- config keys: access.permissions
- derives from: gdpr.Art.21
- primitives: access, permissions, clientData, audit

## CCPA / CPRA 1798.121: Right to limit use of sensitive personal information

Coverage: configurable · effort saved: medium · draft

Requirement: Consumer has the right to direct a business that collects
sensitive personal information to limit its use to what is
necessary to perform the services or provide the goods
reasonably expected (with statutory exceptions in CPPA
regulations).

**What Pryv does for you**

The limit-use directive is operationalized by narrowing the
relevant accesses' `permissions[]` to the minimum-necessary
streams. The "reasonably expected use" classification is your
programmatic decision; the technical control is the access
mutation. Sensitive personal information (per §1798.140(ae))
can be segregated onto designated streams up front so the
narrowing operation is a known-shape transformation.

**Evidence**

- tests: AA02, ACCP
- config keys: access.permissions
- derives from: gdpr.Art.18
- primitives: access, permissions, stream

## CCPA / CPRA 1798.125: Non-discrimination

Coverage: out-of-scope · draft

Requirement: Business shall not discriminate against a consumer because the
consumer exercised any rights under CCPA.

**What Pryv does for you**

Non-discrimination is a business-policy commitment, pricing,
service levels, marketing eligibility, not a software control.
Pryv has no role in pricing or product gating; if your app
enforces tier-based feature access, the non-discrimination
analysis happens at your app's pricing-policy layer.

## CCPA / CPRA 1798.130: Notice and response procedures

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Business must provide notice of categories of PI collected,
purposes, sources; respond to verifiable consumer requests within
45 days (one extension permitted, 90 day total max).

**What Pryv does for you**

Notice text lives on
`access.clientData.privacy_notice` or on a dedicated
`consent/notice` event, preserved per consumer per time,
recoverable later. The 45-day response window is your
operational target. Pryv's read APIs respond in milliseconds,
so the rate-limit on the response is your fulfilment workflow,
not a software latency.

**Evidence**

- derives from: gdpr.Art.12
- primitives: access, clientData, app-web-auth3, event

## CCPA / CPRA 1798.135: Methods for opt-out

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: Business must provide a clear "Do Not Sell or Share My Personal
Information" link / mechanism; CPRA additionally requires
honoring opt-out preference signals (Global Privacy Control).

**What Pryv does for you**

The opt-out UI surface is
your app, a CCPA-required link or an automated GPC-signal
handler. When the opt-out is exercised, the Pryv mechanism is
the access revoke / narrow flow from §1798.120. Implementer's
job: detect the opt-out, call the Pryv revoke flow, surface
confirmation.

**Evidence**

- primitives: access, clientData

## CCPA / CPRA 1798.140: Definitions

Coverage: facilitated · effort saved: medium · mode: awareness · draft

Requirement: Defines key terms including "personal information", "sensitive
personal information", "sale", "sharing", "service provider",
"third party".

**What Pryv does for you**

Pryv primitives map
cleanly to most CCPA-defined terms (event = personal-information
storage; access + permissions = the consent / authorization
layer; CMC = sharing across distinct operators). The
§1798.140(ae) sensitive-personal-information category drives
stream layout (segregate sensitive categories onto designated
subtrees for clean §1798.121 limit-use operation).

**Detail**

Service-provider vs third-party (§1798.140(ag) vs (ai))
classification is contractual, record it on the access's
`clientData.role` so the consumer-side §1798.115 response
surfaces the right category.

**Evidence**

- primitives: event, stream, access, clientData, CMC

## CCPA / CPRA 1798.150: Civil action for breach

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: Consumer whose nonencrypted and nonredacted personal information
is subject to an unauthorized access, exfiltration, theft, or
disclosure as a result of failure to maintain reasonable security
may bring a civil action for statutory damages ($100-$750 per
consumer per incident or actual damages).

**What Pryv does for you**

Two contributions:
(1) TLS-in-transit + operator-side at-rest encryption move ePHI
/ personal-information out of the "nonencrypted and nonredacted"
trigger zone for §1798.150; (2) audit + access-version data are
the technical evidence layer when defending a "reasonable
security" claim. The "reasonable security" determination remains
a fact-specific legal question; Pryv provides the substrate.

**Detail**

The §1798.150 trigger is narrow, encrypted-and-redacted PI
that leaks doesn't ground a statutory-damages claim. Pryv's
posture (TLS in the core or at your proxy, as you configure it
+ operator-side at-rest encryption + per-
access access-control + audit) substantially constrains the
surface where §1798.150 can attach. Encryption-at-rest is
operator-side (LUKS, PG TDE, etc.) for event content today;
Pryv-managed at-rest encryption covers platform secrets.

**Evidence**

- primitives: letsEncrypt-integration, encryption-at-rest-secrets, audit, access

**Planned changes**

- feature: End-to-end encryption narrows the §1798.150 nonencrypted-PI trigger zone further

## CCPA / CPRA 1798.81.5: Reasonable security procedures (Cal. Civ. Code §1798.81.5)

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: Business that owns, licenses, or maintains personal information
about a California resident shall implement and maintain
reasonable security procedures and practices appropriate to the
nature of the information, to protect the information from
unauthorized access, destruction, use, modification, or
disclosure.

**What Pryv does for you**

Statute predates CCPA
but provides the "reasonable security" basis the §1798.150 civil
action attaches to. Pryv's multi-aspect technical baseline (TLS,
mTLS, at-rest secrets, audit, MFA, backup-restore, permissions)
constitutes the software-layer "reasonable security" inventory.
The organizational-side reasonable-security programme is the
operator's.

**Evidence**

- derives from: ccpa.1798.150, gdpr.Art.32
- primitives: access, permissions, audit, letsEncrypt-integration, encryption-at-rest-secrets, MFA, backup-restore

## CCPA / CPRA 1798.130(a)(5): Notice, content elements

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Privacy-policy notice must include categories of PI collected,
categories of sources, business / commercial purposes, categories
of third parties with whom PI is shared, sale / sharing
practices, and consumer rights.

**What Pryv does for you**

Notice content is editorial.
Pryv preserves the notice text per individual consumer (on
`account.clientData.privacy_notice` or a dedicated event), so
the precise wording shown at the moment a particular consumer
first interacted is recoverable later. Drafting the wording
remains the implementer's editorial work.

**Evidence**

- derives from: ccpa.1798.130
- primitives: access, clientData

## CCPA / CPRA 1798.135(a): Methods for opt-out, Do Not Sell / Share + Limit Use links

Coverage: out-of-scope · draft

Requirement: Business that sells or shares PI shall provide a clear and
conspicuous link titled "Do Not Sell or Share My Personal
Information" on its homepage. Business that uses sensitive PI for
purposes beyond those listed in §1798.121(a) shall provide an
additional link titled "Limit the Use of My Sensitive Personal
Information".

**What Pryv does for you**

The UI link is part of the implementer's homepage; Pryv is the
backend the link's handler talks to (revoke / narrow the
relevant access). Surface itself is app-layer.

**Evidence**

- derives from: ccpa.1798.135, ccpa.1798.120

## CCPA / CPRA 1798.140(ad): Definition, "Sale"

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: "Sale" / "Sell" includes selling, renting, releasing, disclosing,
disseminating, making available, transferring, or otherwise
communicating orally, in writing, or by electronic / other
means, a consumer's personal information by the business to
another business or a third party for monetary or other valuable
consideration.

**What Pryv does for you**

Whether a given access
constitutes a "sale" under §1798.140(ad) is a classification the
implementer applies + records on the access's
`clientData.type = "sale"`. The consideration test (monetary or
valuable) is fact-specific and editorial; Pryv preserves
whatever classification you record.

**Evidence**

- derives from: ccpa.1798.140
- primitives: access, clientData

## CCPA / CPRA 1798.140(ae): Definition, "Sensitive personal information"

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Enumerated categories: SSN, drivers license, account log-in
with password, precise geolocation, racial / ethnic origin,
religious / philosophical beliefs, union membership, contents
of mail / email / text messages not directed at the business,
genetic data, biometric identifier, health, sex life or
sexual orientation.

**What Pryv does for you**

Sensitive-PI enumeration
drives stream-layout design, dedicate subtrees per sensitive
category (`sensitive/health/`, `sensitive/precise-location/`,
etc.) for clean §1798.121 limit-use enforcement. The
classification of whether a specific event qualifies as
sensitive PI is editorial. An alias-only deployment pattern is now
available: issue accesses with `randomAlias:true` so counterparties
hold a routable `r-XXXXXXXX` alias instead of a linkable username,
keeping linkable identifiers off the sensitive-PI access path.
Since open-pryv.io 2.0.0-rc.69 the token is accepted under its
alias only, so a counterparty that suspects the username cannot
confirm it with the token; earlier releases accepted the token
under every name of the account.

**Evidence**

- derives from: ccpa.1798.121, gdpr.Art.9
- primitives: stream, system-streams, event, randomAlias

## CCPA / CPRA 1798.155: Enforcement

Coverage: out-of-scope · draft

Requirement: California Privacy Protection Agency (CPPA) + California Attorney
General may bring civil actions for CCPA violations; statutory
penalties up to $2,500 per violation ($7,500 for intentional
violations + violations involving minors).

**What Pryv does for you**

Enforcement is regulator-side. No software role; Pryv's audit
log + access-version chain are the evidence pack the implementer
surfaces in response to inquiries.

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
