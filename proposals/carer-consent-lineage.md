# Consent given by a carer (delegate) for the account they manage

**Status:** scheduled platform work, not shipped. **Delivery vehicle:** scheduled
open-pryv.io releases tracked by the three public issues below, not a backlog item.
There is no standalone backlog file; this mirror exists so the affected rows can carry
`planned:` chips and so a reader can see what will change and when.
**Filed:** 2026-10-01, from an implementer's carer-and-child onboarding request.
**Slug:** `CARER-CONSENT-LINEAGE` (Section A of `UPDATE-TRIGGERS.md`).
**Tracking:**

| Issue | What | Target release |
|---|---|---|
| https://github.com/pryv/open-pryv.io/issues/143 | a delegate may accept a cross-account consent for the account it manages; the minted data grant carries the delegation lineage; the delegate is recorded on the accept event; detaching the delegate revokes such grants and notifies the requester | open-pryv.io 2.0.0-rc.30 |
| https://github.com/pryv/open-pryv.io/issues/144 | reviewed detach: before a delegate is detached, the account holder reviews each consent that delegate gave and keeps or drops it (nothing kept by default) | open-pryv.io 2.0.0-rc.31 |
| https://github.com/pryv/open-pryv.io/issues/145 | consent invites carried inside the authorisation request, each presented and decided on its own, never implied by approving the app access | open-pryv.io 2.0.0-rc.32 |

Release targets are plans, not commitments; the chips carry them in `eta_release` and
move if a release slips.

**Surfacing question:** *"A parent manages their child's account. A study asks the
child's account to share data. Can the parent accept that for the child, and if they
do, will the record show it was the parent, and will the consent end when the parent
stops managing the account?"*

## Today's state (verified, open-pryv.io 2.0.0-rc.23 onwards)

| Control | Status | Anchor |
|---|---|---|
| A delegate grants an app access to the managed account through the auth request, with server-stamped lineage | ✅ | `clientData.delegation.kind: 'delegated-child'`, `[DCH01]`, `[DCH03]` |
| Grants made through a delegation are revoked when the delegate is detached | ✅ | `[DCH12]` |
| A delegate accepts a cross-account consent (`consent/accept-cmc`) for the managed account | ❌ refused | `delegation-grant-requires-owner`, `[DCH14]` |
| A delegate requests or rescopes a cross-account consent (`consent/request-cmc`, `consent/scope-update-cmc`) | ❌ refused | `[DCH14]` |
| A delegate gives OAuth2 consent for the managed account | ❌ refused | `403 access_denied`, `[OE27]` |

The CMC refusal exists because the cross-account data grant is minted outside the access
creation path that stamps lineage. Without lineage the grant would survive the end of the
delegation, so the platform refuses the accept rather than mint a consent that could
outlive the carer's authority. The consequence for you today: a carer must sign in as
the managed account itself to accept a cross-account consent, and the record does not
show that a carer acted.

## After shipping

### rc.30 (issue #143): the delegate may accept, and it is recorded

- A delegate token (or an access granted through a delegation) may write
  `consent/accept-cmc` on the managed account. Pryv stamps
  `content.approvedBy = { delegate, relId }` on the accept event from the authenticated
  access, and deletes any client-supplied `approvedBy` (non-forgeable, same rule as the
  lineage attribute). An accept written by the account holder carries no `approvedBy`.
- The data grant the accept mints carries the same lineage attribute as any other grant
  made through a delegation (`clientData.delegation.kind: 'delegated-child'`, naming the
  delegate), so `accessInfo` reports `delegation.grantedVia` on it.
- If the delegation ends before the accept is processed, no grant is minted (the trigger
  fails with `cmc-handler-delegation-ended`).
- Detaching the delegate revokes each such grant through the cross-account revoke path,
  so the requester is told the consent ended (delivery best-effort), instead of being left
  with a dead token.
- Unchanged: `consent/request-cmc` and `consent/scope-update-cmc` stay refused to
  delegation-derived tokens; OAuth2 consent stays owner-only (`[OE27]` stays cited).

### rc.31 (issue #144): reviewed detach

- `delegations.detachDelegate` gains `keepAccessIds`: the account holder (genuine login)
  reviews the consents the delegate gave and keeps or drops each; nothing is kept unless
  chosen. A kept grant loses its lineage attribute and its accept event gains
  `ownerConfirmedAt`, so it becomes the holder's own consent with the history preserved.
  Dropped grants are revoked with notification, as in rc.30.
- This is the technical shape of a young person reclaiming their account at majority:
  they decide, consent by consent, which of the carer's decisions they adopt.

### rc.32 (issue #145): consent invites in the authorisation request

- An app may carry cross-account consent invites inside its authorisation request. The
  authentication page presents each invite as its own block with its own Approve and
  Decline, never implied by approving the app access, and accepts them before granting
  the app access. Outcomes returned to the app are hints; the authoritative record is
  the accept event on the subject's account.

## Affected matrix rows

| Scope | Ref | Today | Kind | Impact | Release | After shipping |
|---|---|---|---|---|---|---|
| gdpr | Art.7 | Implemented, High | feature | medium | rc.30 | the "consent given by a delegate" paragraph extends to cross-account consent: the accept event names the delegate (`approvedBy`), the grant carries lineage, ends with the delegation and the requester is notified; `[DCH14]` replaced by the new tests. No tier change is possible (already at the top tier); the demonstrability claim gains a new recorded consent path. |
| gdpr | Art.7 | same | feature | low | rc.31 | withdrawability paragraph: owner review at detach, nothing kept by default, `ownerConfirmedAt` on kept consents. |
| gdpr | Art.7 | same | feature | low | rc.32 | §2 "clearly distinguishable": consent invites decided one by one, separately from the app access, in the same authorisation flow. |
| gdpr | Art.8 | Facilitated, Medium, primitive | feature | medium | rc.30 | the parent can accept a cross-account consent for the child, recorded with the parent named and ended with parental control; `pryv_effort_saved` may move medium → high once both releases ship. |
| gdpr | Art.8 | same | feature | medium | rc.31 | owner reclaim at majority extends to consents: the young person reviews the parent's consents at detach and keeps only what they choose. |
| hipaa-security | 164.312(a)(1) | Implemented, High | feature | low | rc.30 | "Apps granted access through a delegation" paragraph: CMC accept leaves the refusal list, the data grant carries the lineage and is revoked with the delegation; `[DCH14]` replaced, `[OE27]` kept. |
| iso-27001 | A.5.15 | Implemented, High | feature | low | rc.30 | same correction as 164.312(a)(1): the access-control rule for delegated grants now covers CMC data grants; refusal list shrinks to request / scope-update / OAuth2. |

Why these rows carry a chip: each states today, in its detail text or its `tests:`, that a
delegate cannot accept a cross-account consent (`[DCH14]`), or describes the parental /
consent claim this work extends. After rc.30 that statement is no longer true, so a reader
should see that the row is about to change.

Rows to walk at release without a chip (their claim does not shift, only a sentence or a
test citation): `gdpr.Art.32` (the "Delegate-account control" bullet lists CMC accept
among the refused paths), `hipaa-privacy.164.502(g)` (the representative may also accept
a cross-account consent for the individual), `hipaa-security.164.312(b)` (the accept
event names the delegate), `soc2.CC6.2`, `soc2.CC6.3`, `iso-27001.A.5.16` (lifecycle of
grants made under a delegate's authority, now including CMC data grants). Context notes to
update at the same time: `context/delegation-model.md` ("Accesses granted through a
delegation") and `context/cmc-consent-primitives.md` (gates section).

The chips carry no `backlog:` key: the work is delivered by scheduled platform releases,
not a backlog file, and `planned.backlog` is optional in the schema. The `tracking_url`
will point at the v2 board card once it exists.
