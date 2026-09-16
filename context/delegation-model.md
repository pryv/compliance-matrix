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
- for a **control** access: `{ kind: 'control', controlledUsername, delegate }`.

The field is additive only; existing `accessInfo` consumers are unaffected.

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
  genuine-login-gated, authoritative detach.
