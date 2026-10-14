# Workforce access patterns: group access + sub-access derivation

Several matrix rows describe Pryv's access-control surface as
"per-stream permissions; access is the unit of authorization":

- `hipaa-security.164.308(a)(3)(ii)(C)`: Termination procedures
- `hipaa-security.164.308(a)(4)(ii)(B)`: Access Authorization
- `hipaa-security.164.308(a)(4)(ii)(C)`: Access Establishment +
  Modification
- `iso-27001.A.5.16`: Identity management
- `iso-27001.A.5.18`: Access rights

An implementer evaluating Pryv for a workforce-oriented deployment
(hospital with 100 nurses + 30 attending physicians + 10 admin
staff, etc.) will ask how Pryv handles **role / group abstractions**
on top of the per-access model. Pryv does not ship roles + groups
*inside* the platform, group membership is deliberately external,
but provides **two composable patterns** (shipped) that cover the
realistic workforce-control needs. A **third pattern is planned**
(Pattern 3 below, not yet released): a group that shares one Pryv
account reaches patient data through cross-account consent, each
member under an access of their own minted by the group's core, so
the implementer needs no backend of their own.

## Pattern 1: Group access + per-caller audit

A single access token can be granted to a group (e.g., "nurses"),
with the group membership managed *outside* Pryv by the
implementer's IdP / IGA / hospital identity system.

**Wire format:** the API request carries auth in the form
`Authorization: <TOKEN> <CALLERID>` (token + space + caller id).
Pryv parses the auth string and captures the caller id alongside
the access id.

**Audit semantics:** the stored `createdBy` and `modifiedBy` fields
become `<accessId> <callerId>` (space-separated). Audit log rows
likewise carry both. So an auditor reviewing "who did what" sees
the group identity (via the access id) AND the acting individual
(via the caller id) on every action.

**Trust model:** Pryv trusts the access-token holder (the
implementer's app / IdP) to forward a truthful caller id. Caller
id is not separately authenticated by Pryv, it's a label the app
provides. The chain of trust is:
1. The external IdP authenticates the individual.
2. The implementer's app calls Pryv with the group token + the
   authenticated individual's id as `callerId`.
3. Pryv records both.

If the implementer's app lies about the caller id, the audit log
contains a fiction. The mitigation is that the implementer's app
is itself audited / hardened / under the same compliance regime as
the Pryv deployment.

**Code (open-pryv.io):**
- `components/business/src/MethodContext.ts` `parseAuth()`,
  splits the auth header on the first space character.
- `components/business/src/accesses/refs.ts` `composeStoredRef()`,
  composes the `<accessId> <callerId>` storage form.

**When to use this pattern:**
- The group is large and high-churn (100s of staff, weekly
  joiners/leavers).
- Group-level access management (start/stop the whole group)
  matters more than per-individual revocation latency.
- The implementer already runs a trusted IdP / IGA system that
  authenticates individuals.

**Compliance benefit:** per-individual audit accountability without
the cost of provisioning per-individual accesses in Pryv. HIPAA-
Security §164.308(a)(3)(ii)(C) Termination, terminating an
individual means removing them from the external group; no Pryv-
side action needed. ISO 27001 A.5.16 identity lifecycle delegates
to the external IdP.

## Pattern 2: Seed access for sub-account derivation

An "app" access can be the seed for sub-accesses. The app holding
the seed can create individual sub-accesses for each group member
on demand; each sub-access is independently revocable; the seed
access can list / manage all its children.

**Mechanism:** when an access creates another access via
`accesses.create`, Pryv records the creating access's id as the
new access's `createdBy`. The set of accesses where
`createdBy = <seed>` is the seed's managed children. The seed can
list them (`accesses.get` filtered by `createdBy`), modify them
(`accesses.update` if their `createdBy` matches), and delete them
(`accesses.delete`).

**Code (open-pryv.io):**
- `components/api-server/src/methods/accesses.ts`,
  `query.createdBy = currentAccess.id` filters on listing /
  modification; `isManaged = createdByBase === context.access.id`
  gate on management operations.

**When to use this pattern:**
- Per-individual revocation matters (a single nurse's access
  yanked without affecting the rest of the group).
- Group-level operations need to compose (deleting the seed through
  `accesses.delete` deletes its children with it; a child can never
  outlive the seed's expiry; widening the seed does not widen its
  children, and narrowing the seed's permissions or expiry is
  refused while a child would fall outside the new bounds
  (`cannot narrow access: would orphan managed shared accesses`,
  `offendingChildren` lists them), so your role engine narrows or
  deletes those children first).
- The implementer wants Pryv to be the source of truth for
  per-individual access state (audit, expiry, scope).

**Trade-off:** higher Pryv-side state cost (N sub-accesses for N
group members), but full per-individual control.

**Across accounts.** The seed can be a cross-account (CMC) data
grant: an offer that sets `request.accessType: 'app'` (since
open-pryv.io 2.0.0-rc.9, default `'shared'`) makes the grant the
person accepts delegable, so the requester can derive per-member
sub-accesses on the person's account from it. Today that derivation
runs in the requester's own backend, which holds the grant token;
Pattern 3 (planned) moves it to the group's Pryv core. **Known gap
(open-pryv.io 2.0.0-rc.51):** only `accesses.delete` of the grant
removes the sub-accesses with it. The cross-account withdrawal paths
(`consent/revoke-cmc`, the reference account app's consent page, the
requester withdrawing, a delegation detach, account deletion) remove
the grant and leave the sub-accesses derived from it alive until
their own expiry. Until the fix ships (scheduled ahead of the
group-accounts release), give every sub-access a short expiry and
have your backend delete them itself when it learns of the
withdrawal (`consent/revoke-cmc` in its inbox).

**Compliance benefit:** clean §164.308(a)(3)(ii)(C) termination,
individual sub-access deleted, others untouched, audit row
records the revocation timestamp. ISO 27001 A.5.18 access-rights
lifecycle is per-individual + the seed allows efficient bulk
operations.

## Pattern 3: Group account over CMC, server-minted member accesses (PLANNED, not yet released)

**Status.** Designed, not released. Tracked at
https://github.com/pryv/open-pryv.io/issues/158 (v2 board card
https://github.com/orgs/pryv/projects/5?pane=issue&itemId=271216458&issue=pryv%7Copen-pryv.io%7C158).
Nothing in this section is a control you can cite today; the names
below are the planned wire shapes and may still change before the
release. Matrix rows that this pattern would change carry a
`planned:` chip pointing at `proposals/group-accounts-cmc.md`.

**The case.** A practice, a research team or a bridge shares one
Pryv account (the *group account*) and reaches patient data through
cross-account consent (CMC). Each member (a practitioner, a
researcher) has their own Pryv account and works from a static web
app: no implementer backend holds the group's grants or mints
anything.

**Mechanism (as designed):**

1. **Patients consent to the group.** A member publishes the invite
   on the group account, on a team stream they hold `contribute` on
   (`:_cmc:apps:<app>[:<team>]`), with `request.accessType: 'app'`,
   so the grant each patient accepts is delegable (shipped since
   open-pryv.io 2.0.0-rc.9). The invite's `createdBy` on the group
   account names the member who wrote it. The reference consent
   page is planned to tell the patient, in one line, that the grant
   is delegable to members of the group.
2. **Members join through consent, not a role table.** The member
   writes a `consent/request-cmc` with `request.membership: true` on
   their own account and hands its capability URL (link or QR) to an
   administrator of the group (the account owner, or a delegate of
   the group account), who accepts it with a personal or delegate
   token and chooses the teams. The grant minted on the group
   account is the *membership access* (`clientData.cmc.role:
   'member'`, `clientData.cmc.membership = { approvedBy,
   requestedScopes }`): a two-sided consent record, withdrawable by
   either party. The server constrains what a membership offer may
   ask for, at write and again at accept: stream permissions on
   `:_cmc:apps:*` team streams only, `read` or `contribute` at most,
   no feature permissions, never delegable, never the group's
   `:_cmc:inbox` (refused with `cmc-membership-permissions-invalid`).
3. **The group's core mints a per-member access on the patient's
   core.** The member writes `consent/member-access-cmc` (`{
   counterparty, scopeStreamId?, permissions?, expireAfter? }`) on
   the group account. The group's core checks that the writer is a
   membership access (or the owner), that the patient relationship
   sits under the member's team streams, that the requested stream
   permissions are a subset of the patient's offer, the expiry
   bounds, a rate limit and one mint in flight per membership; then,
   through the patient's grant, it creates on the patient's core a
   `shared` child access with a server-derived name
   (`cmc-member--<member>--<hash>`), at most 24 h by default (60 s
   to 7 d, per-core config, never beyond the grant). The patient's
   core stamps the child's `clientData.cmc` with the member and the
   group, taken from the authenticated grant, never from the
   request. The child's token is returned once, in the response to
   the member's write; it is never stored on the trigger, logged,
   or retried from a snapshot.
4. **The member reads the patient's data directly** from the
   patient's core with that child access. A `shared` child cannot
   call `accesses.*`, cannot exceed the grant (the patient's core
   re-checks the bound), and cannot outlive it.
5. **Offboarding is a sweep.** Whenever a membership ends (the
   group revokes it, the member leaves, the membership access is
   deleted or expires, the delegate who approved it is detached and
   the owner does not keep it, the group account is deleted), the
   group's core deletes each child it minted for that member through
   the patient grants (when the membership access is only narrowed,
   the children that fall outside it), reads back to confirm, and
   records residuals on a server-written `consent/member-revoke-cmc`
   event. Failed sweeps are retried (this needs
   `cmc.retryLoop.enabled: true`) and re-run periodically; a
   residual on an unreachable patient core lives at most until the
   child's own expiry.
6. **A patient's withdrawal ends every member access** derived from
   their grant, on every teardown path.

**Audit and attribution (as designed).** Patient side: every call
by a member carries the child access id; the child's `createdBy` is
the group's grant and its stamped `clientData.cmc` names the member
and the group, so the reference account app can show "<member
access> via <grant name>", deleted accesses included. Group side:
each mint and each sweep is a `consent/*` event naming the member,
written by the member's membership access or by the server. A
patient core on an older release refuses the stamp; for one release
cycle the group's core then mints with the name only and reports
`attribution: 'name-only'` (`cmc.memberAccess.allowNameOnly`), later
it refuses.

**Trust model.** Pryv attributes each action to a member's own
account credential, authenticated by that member's own sign-in (and
MFA where enabled), not to a label an app forwards (contrast
Pattern 1's `callerId`). It still attributes to the credential, not
to the human: the group remains responsible for vetting members and
for their not sharing credentials. The group account itself holds
every patient grant, so its owner and administrators are the trust
anchor: protect them with MFA, and grant `read` on the group's
`:_cmc:inbox` only to apps you would trust with every grant (the
inbox records each accepted invite with the grant's endpoint, by
design, so that access equals holding every grant token; this is
true of any CMC account today, not specific to Pattern 3). Members
sharing a team stream see each other's invites and mint events; use
per-member sub-streams (`<team>:<member>`) where that matters.

**When to use this pattern:**
- The group reaches patient data through cross-account consent and
  the implementer does not want to run a backend that holds the
  group's grants.
- Each member should read under an access that names them on the
  patient's account, and leaving the group must end that access on
  every patient account.

**Compliance benefit (once released):** per-member authorization by
a recorded consent act (the membership accept), per-member
attribution stamped by the server on both accounts, per-member
termination swept by the platform instead of by the implementer's
code, and a patient-side record that shows which member acted under
which grant.

## When to combine

The patterns are complementary:

| Use case | Pattern |
|---|---|
| Large transient group with external IdP | 1 (group token + caller id) |
| Small stable team with strict per-person revocation | 2 (seed + sub-accesses) |
| Large group with both, group-level rev + per-person audit + occasional per-person revocation | 1 + 2 (seed access used by the IdP to provision sub-accesses on first access; per-call `callerId` adds the audit detail) |
| Practice / research team sharing one account, reaching patients through CMC, no implementer backend | 3 (planned: membership by consent, member accesses minted and swept by the group's core) |
| Same, with the implementer running its own backend today | 2 across accounts (delegable CMC grant, sub-accesses derived by the backend) + 1 if the backend acts for several people |

## What this is not

- **Not roles / RBAC inside Pryv.** No `role` primitive, no
  `role-to-permission` mapping, no hierarchy. The role abstraction
  lives entirely outside Pryv (in the implementer's IdP / IGA
  system). Pryv records the consequences (which accesses exist,
  what they grant) but not the role assignments. Pattern 3 does not
  change this: the group is an ordinary account, a "team" is a
  stream on it, and a membership is a consent relationship whose
  permissions name those streams. There is no organisation entity,
  no role name, no role-to-permission mapping and no hierarchy of
  groups; deciding who may join and which teams they get stays
  with the group's administrators.
- **Not group identity authentication.** The `callerId` in
  pattern 1 is a label, not an authenticated claim. The Pryv layer
  doesn't independently verify that the caller is who the
  implementer's app claims. (In Pattern 3 each member authenticates
  as their own account; Pryv still does not verify who the human
  behind that account is.)
- **Not a directory service.** Pryv doesn't maintain "list of all
  workforce members"; that's the IdP's job. Pryv knows about
  accesses (and through pattern 1, about caller ids it has seen);
  it doesn't enumerate group memberships. With Pattern 3 the group
  account's membership accesses are a list of the accounts its
  administrators approved, not a directory of people.

## Matrix rows that lean on these patterns

| Scope | Row | Pattern leveraged |
|---|---|---|
| hipaa-security | 164.308(a)(3)(ii)(C) Termination | 1 (drop from IdP) + 2 (delete sub-access); 3 planned (membership end sweeps member accesses) |
| hipaa-security | 164.308(a)(4)(ii)(B) Access Authorization | 2 (mint sub-access per individual); 3 planned (membership accept is the authorization act) |
| hipaa-security | 164.308(a)(4)(ii)(C) Establishment + Modification | 2 (seed manages children); 3 planned (narrowing a membership sweeps what falls outside) |
| hipaa-security | 164.312(a)(1) Access control | 3 planned (member accesses bounded by membership, offer and grant) |
| hipaa-security | 164.312(a)(2)(i) Unique user identification | 1 (callerId IS the per-person identifier on a group token); 3 planned (member stamped by the server) |
| hipaa-security | 164.312(b) Audit controls | 3 planned (per-member attribution on the patient's and the group's trail) |
| iso-27001 | A.5.15 Access control | 3 planned |
| iso-27001 | A.5.16 Identity management | 1 (external IdP) + 2 (Pryv-side per-individual access); 3 planned (member accounts) |
| iso-27001 | A.5.18 Access rights | 1 + 2; 3 planned |
| iso-27001 | A.6.5 Post-termination responsibilities | 1 (IdP removes) + 2 (seed deletes); 3 planned (sweep) |
| gdpr | Art.7 Conditions for consent | 3 planned (the patient consents to a delegable grant; withdrawal ends member accesses) |
| gdpr | Art.29 Processing under the authority | 1 (caller id ties action to a workforce member); 3 planned (member access names the member) |
| gdpr | Art.32 Security of processing | 3 planned (access-control bullet) |
| soc2 | CC6.2 Credential issuance + de-provisioning | 3 planned (approved before issued, swept on removal) |
| soc2 | CC6.3 Least privilege | 2; 3 planned (short-lived per-patient member accesses) |
| iso-27701 | A.7.4.7 Records of PII processing | 1 (callerId on audit row enriches the register) |

These rows should reference this document via their `detail` block
when an implementer is likely to ask the workforce-control
question explicitly. The rows marked "3 planned" carry a `planned:`
chip until the release; their claims today rest on patterns 1 and
2 only.

## Related primitives

- `access`: the unit of authorization; pattern 1 shares one across
  a group, pattern 2 derives many from a seed, pattern 3 (planned)
  has the group's core derive them from patient grants.
- `audit`: captures both `accessId` and `callerId` per call.
- `permissions`: per-stream + per-level scope carried by every
  access (seed or shared).
- `CMC`: the cross-account consent the group's patient grants and
  (planned) its memberships are made of. See
  [`cmc-consent-primitives.md`](./cmc-consent-primitives.md).
- `delegation`: delegates of a group account can act as
  membership administrators (planned); see
  [`delegation-model.md`](./delegation-model.md).
- `system-streams`: for sensitive workforce metadata (role labels,
  IdP-side group memberships) the implementer can keep on a
  privileged subtree.
