# Account delegation: owner-equivalent control with an authoritative, genuine-login-gated teardown

Pryv lets one account be controlled by one or more **delegate accounts**. A
delegate holds an **owner-equivalent personal token** over the controlled
account — it can do everything the account owner can do through the standard
API — with a single, deliberate exception: **a delegate can never remove a
delegation**, not its own and not a co-delegate's. Removing a delegation
(detach) requires a **genuine interactive login on the controlled account
itself**. This note describes the model the matrix rows cite; the
implementation is the `delegation` plugin at
`open-pryv.io/components/delegation/` (shipped on the account-delegation
feature line; skeleton `46ae0c23`, handshake `1a797815`, delegate token +
audit/accessInfo `6f220187`, authoritative detach `6c618f24`, create-from-
delegate `42c4b7d8`, internal-read hardening + same-core audit parity
`e75f2155`, wildcard-read exclusion `00edf2a1`).

## What it is (and is not)

- **A plugin, not a storage engine.** Delegation owns a reserved stream-id
  namespace (`:_delegation:*`) and a set of guard write-hooks. All delegation
  state lives in the controlled account's own standard per-user storage; there
  is no new engine and no central registry.
- **Owner-equivalent, minus detach.** The delegate token is a personal-class
  token minted on the controlled account and backed by a session, exactly like
  a normal login token. It carries full owner authority over that account's
  data. The one power it lacks is dissolving the delegation relationship.
- **The controlled account stays the identity.** For a delegate token,
  `accessInfo` reports the controlled account as `user.username` (the token
  acts AS the account); an additive `delegation` field names the relationship
  (see below). The delegate does not impersonate a different username — it
  operates the controlled account under its own attributable token.

## The two roles

Each account can play either or both roles:

- **Controlled account** — the subject whose data is delegated. It holds the
  **authoritative** relationship records, mints the delegate tokens, and is the
  only party whose genuine login can tear a delegation down. It also
  **initiates** the attach handshake (it invites a delegate).
- **Delegate account** — the party granted control. It accepts or refuses an
  invite, then holds and uses the owner-equivalent token. Its local record of
  the relationship is an **advisory mirror**: it grants nothing on its own and
  can be dismissed locally, but dismissing it does not end the delegation
  (only a genuine login on the controlled account does).

## The genuine-login detach gate (the security crux)

Detach may only be driven by a **clean interactive login on the controlled
account**: a `type: 'personal'` access carrying **no** forge-protected
`clientData.delegation` marker. A delegate token is *also* `type: 'personal'`,
so the token type alone discriminates nothing — it is the **absence** of the
delegation marker that proves the token came from the account's own login flow
rather than from a delegate. The marker is forge-protected on create *and*
update for every token class (the plugin's forge hooks), so a marker-free
personal token provably originated from a genuine login and cannot be
fabricated by a delegate. A control access (`type: 'shared'`) is rejected by
the type check outright.

The consequence is the property the compliance rows lean on: **control of the
account can always be reclaimed by whoever can genuinely log in to it**, and no
delegate — however privileged — can lock the owner out or silently shed
oversight by removing a co-delegate.

## Handshake, create-from-delegate, cross-core

- **Controlled-account-initiated attach.** The controlled account requests
  attachment to a delegate; the delegate accepts or refuses. The only
  no-prior-credential delivery is the initial invite (an operator-admin-key-
  gated system endpoint); every later step rides a plugin-minted, forge-
  protected marker access used as a one-method bearer credential, so the
  blanket write-guard over `:_delegation:*` is never opened.
- **Create-from-delegate.** A delegate can provision a brand-new controlled
  account and attach to it in one flow, optionally seeding it with an
  email/password so the subject can later log in genuinely (and thus retain the
  power to detach). Useful for a guardian setting up an account on a
  dependant's behalf.
- **Cross-core, same platform.** Both roles work when the two accounts live on
  different cores of the same platform, as well as same-core. Control endpoints
  stay server-side; the delegate retrieves its token through a wrapper rather
  than holding a cross-core control endpoint directly.

  ⚑ **Accuracy note (2026-09-16).** The cross-core half of this statement was
  aspirational for the 2.0.0-rc.19 and rc.20 releases: resolving the peer
  account's core read a field that is written only when an operator configures
  an explicit core URL, which the installation wizard and the bootstrap bundle
  do not do. On a platform relying on DNS-derived core URLs, every cross-core
  delegation call was refused, so only the same-core half of the capability was
  actually reachable there. Resolution was corrected to use the platform's own
  core-URL helper (derivation included); the statement above describes the
  corrected behaviour and holds for releases carrying that fix. Compliance rows
  citing delegation are unaffected in substance, since none of them depends on
  the accounts living on different cores, but a reader auditing a deployment
  running rc.20 or earlier should expect same-core only.

## Namespace guard posture (`:_delegation:*`)

The whole `:_delegation:*` namespace is plugin-owned end-to-end. Unlike the
cross-account messaging namespace it has **no** user-creatable region: user
code may neither create, delete, nor write anywhere under it via the generic
routes, and no `delegation/*`-typed event may be written by any token
(capability tokens included). The plugin-internal subtree
(`:_delegation:_internal:*`) is additionally **read**-guarded on
`events.get` / `events.getOne` / `streams.get` (all query forms — bare string,
`{streamId}`, and logical `{any|all|not}`), because its mirror events carry a
control-channel bearer that must never reach a client; and a wildcard `*`
event read excludes the hidden plugin-internal namespaces so a broad read
cannot exfiltrate them either.

## Per-delegate audit attribution

Every delegate's actions are attributable on the **controlled account**: the
audit trail stamps `content.delegation` and records each delegate's activity
under its own delegate-token access stream, so an auditor reading the
controlled account's log can tell which delegate did what. This holds for
**same-core** and **cross-core** delegation alike (same-core issuance writes
the same `delegations.issueToken` audit record the cross-core path does, so
single-core deployments keep an equivalent per-issuance trail). The full
`delegations.*` method family (attach / accept / refuse / cancel / detach /
dismiss / createAccount / issueToken / list) is in the audit method registry.

## The `accessInfo.delegation` field

`accessInfo` (`GET /access-info`) surfaces an additive, first-class
`delegation` object derived from the forge-protected `clientData.delegation`
marker, so a client need not parse `clientData`:

- for a **delegate token**: `{ isDelegatedAccess: true, controlledUsername,
  delegate }` — the caller learns it is operating a controlled account and
  which delegate identity it is acting as;
- for a **control** access: `{ kind: 'control', controlledUsername, delegate }`;
- for an access **granted through a delegation** (see the next section):
  `{ isDelegatedAccess: true, controlledUsername, delegate, grantedVia: 'app' }`.

The field is additive only; existing `accessInfo` consumers are unaffected.

## Accesses granted through a delegation (`delegated-child`)

A delegate may grant a third-party app access to the controlled account, the
way the account holder grants one. The platform's authentication page does it:
after the delegate signs in, it asks whom the access is for, obtains a
delegate token for the chosen controlled account (kept in the page's memory
only, never stored and never handed to the app), and creates an ordinary `app`
access on the controlled account with the permissions the app requested. The
app receives that access only; the owner-equivalent delegate token never
leaves the page. An app can opt out per request (`actAs: 'deny'` on the auth
request). Shipped on open-pryv.io master in `91b06363`, `ef0a3f75`,
`5943ca0b`, released in 2.0.0-rc.23 (2.0.0-rc.22 and earlier do not
carry it).

**The lineage attribute.** Every access created through `accesses.create`
while the caller is authenticated by a delegate token, or by an access itself
granted that way, carries a server-stamped attribute
`clientData.delegation = { kind: 'delegated-child', relId, delegate,
viaAccessId }`:

- `relId` names the delegation relationship, `delegate` the delegate
  identity (`username`, and `hostSlug` when known), `viaAccessId` the access
  that created it (the delegate token, or the parent app access for an access
  an app created in turn), so the chain back to the delegation is recorded on
  the access itself.
- It is stamped from the authenticated access only, never from the request:
  a client-supplied `clientData.delegation` is still refused on create and on
  update for every token class, so the attribute cannot be forged, changed or
  removed by any client. An update that replaces or clears `clientData` keeps
  it. `[DLN01-04]`, `[DCH01]`, `[DCH03]`, `[DCH04]`, `[DCH06]`, `[DCH07]`,
  `[DUP01-04]`.
- `accessInfo` reports it (`grantedVia: 'app'`, above) `[DCH02]`, and every
  audit record of an action taken with such an access carries the delegate in
  `content.delegation`, as for the delegate token itself `[DCH05]`.

**Consent is recorded on the subject's account.** The access, which is the
consent record in Pryv (see `context/cmc-consent-primitives.md`), lives on the
controlled account: the account of the data subject, not the delegate's. It is
versioned and revocable like any access, and the subject (for example a young
person who has taken over their account) sees it among their apps. The grant
itself is audited on the controlled account under the delegate token that
created it. When the auth request carries a consent form, the server checks
the delegated grant against the offer exactly as for the holder's own grant
`[DCH13]`. The `delegation` block an auth page posts with the accepted request
is a display hint for the app; `accessInfo` is the authoritative answer.

**Delete and update policy.** A `delegated-child` access is an ordinary grant,
not plugin-owned control-plane state: the account holder and the delegate may
update or revoke it, and the app may revoke itself (no access can update
itself), through the standard access rules, and a
revoke cascades to the accesses the app created `[DCH06]`, `[DCH08]`,
`[DCH09]`, `[DUG04-05]`, `[DAD05-07]`. The plugin-owned kinds (control,
delegate token, invite capability, notify, and any unknown kind) stay
protected. The attribute propagates: an access a `delegated-child` access
creates is stamped with the same relationship, `viaAccessId` naming its
creator. Such an access cannot detach the delegation: the genuine-login gate
above is unchanged `[DCH11]`. If the account holder later signs in to the same
app on the same device, the existing delegated access is reused (the lineage
attribute is not compared as app data) and still ends with the delegation
`[DCH10]`.

**Revocation cascade at detach.** Detaching a delegate deletes, right after
the delegate token, every `delegated-child` access of that relationship, at
any depth, and nothing else: accesses the account holder granted are
untouched `[DCH12]`, `[DDCH1]`. Ending the delegation therefore ends every
grant made through it, so no third-party access outlives the authority that
created it. This is a behaviour change for apps that held such an access
(announced as breaking in the open-pryv.io changelog); the holder can grant
the app again from a genuine login.

**Grant paths a delegation may not use.** Some paths create durable grants
outside `accesses.create` and cannot yet record the lineage attribute, so a
grant made there would survive the end of the delegation. Until they record
it, a delegate token and any access granted through a delegation are refused
on them, and only the account holder can grant there:

- OAuth2 consent (`POST /oauth2/authorize/accept`): `403 access_denied`, and
  nothing is minted `[OE27]`;
- writing `consent/accept-cmc`, `consent/scope-update-cmc` or
  `consent/request-cmc` (publishing a CMC offer, whose capability and
  back-channel accesses are written the same way): `400 invalid-operation`
  with `delegation-grant-requires-owner` `[DCH14]`, `[DDG01-03]`.

What stays on your plate: the auth page that offers "who is this for?" is the
platform's reference auth UI; a deployment using its own auth UI decides
whether to offer it. The age of the subject, and whether a given delegate may
consent for a given app, remain your determination (Pryv does not verify
either).

## Where this shows up in the matrix

- **GDPR Art.8** (child's consent / parental holder of responsibility) — a
  parent or guardian holds an owner-equivalent delegate token over a minor's
  account, with per-delegate audit attribution, and the minor reclaims sole
  control at majority through a genuine login (which lets them detach the
  guardian). Pryv still does not verify age; delegation is the *control*
  mechanism, not age verification.
- **HIPAA §164.502(g)** (personal representatives) — a personal representative
  acts on behalf of an individual through an owner-equivalent delegate token,
  audited per representative, and revocable by the individual via a genuine
  login.
- **Access-control / authentication rows** (GDPR Art.7 + Art.32,
  HIPAA-Security §164.312(a)(1) + §164.312(d), SOC 2 CC6.1 / CC6.2 / CC6.3,
  ISO 27001 A.5.15 / A.5.16) — delegation adds a new token class (the delegate
  personal token) whose defining access-control property is the
  genuine-login-gated, authoritative detach. Accesses granted through a
  delegation add the lineage attribute, its revocation cascade at detach, and
  the owner-only grant paths (OAuth2 consent, CMC accept / scope-update /
  offer).
- **Audit rows** (HIPAA-Security §164.312(b)): actions taken by an app
  granted through a delegation name the delegate on the controlled account's
  audit record.
