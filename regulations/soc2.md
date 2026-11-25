# SOC 2, AICPA Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy) (SOC 2)

- Scope id: `soc2` (standard)
- Jurisdiction: United States (AICPA)
- Version: Trust Services Criteria (2017), with revised points of focus (2022) (2022-01-01)
- Official text: https://www.aicpa-cima.com/resources/landing/trust-services-criteria
- Requirements: 61 (8 implemented, 5 configurable, 38 facilitated, 10 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/soc2

## SOC 2 CC1.1: CC1.1 Commitment to integrity and ethical values

Coverage: out-of-scope · draft

Requirement: The entity demonstrates a commitment to integrity and ethical
values.

**What Pryv does for you**

Integrity + ethics are a management-and-culture matter. Pryv has
no software role at the values / code-of-conduct layer; your audit
log can later evidence whether workforce behaviour matched the
stated values, but the commitment itself is yours to make and
document.

## SOC 2 CC1.2: CC1.2 Board independence and oversight

Coverage: out-of-scope · draft

Requirement: The board of directors demonstrates independence from management
and exercises oversight of the development and performance of
internal control.

**What Pryv does for you**

Board governance is organizational. No software contribution; this
matrix + the audit log feed the oversight pack the board reviews,
but the oversight function is yours.

## SOC 2 CC1.3: CC1.3 Management structures, reporting lines, authorities

Coverage: out-of-scope · draft

Requirement: Management establishes, with board oversight, structures,
reporting lines, and appropriate authorities and responsibilities
in the pursuit of objectives.

**What Pryv does for you**

Org structure + authority assignment are management artefacts.
Pryv enforces the *technical* half of "appropriate authorities"
once you've decided them (see CC6.3 least-privilege), but the
reporting-line design itself is yours.

## SOC 2 CC1.4: CC1.4 Commitment to competence

Coverage: out-of-scope · draft

Requirement: The entity demonstrates a commitment to attract, develop, and
retain competent individuals in alignment with objectives.

**What Pryv does for you**

Hiring + training + retention is an HR programme. No software
role.

## SOC 2 CC1.5: CC1.5 Accountability for internal control responsibilities

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity holds individuals accountable for their internal
control responsibilities in the pursuit of objectives.

**What Pryv does for you**

Pryv gives you the technical accountability substrate: every API
call is attributable to an access (accessId + accessSerial) in the
per-user audit log, so "who did what, when" is recoverable when
you need to hold an individual to account. Defining the
responsibilities and the consequence process is your management
activity; Pryv supplies the evidence trail.

**Evidence**

- derives from: iso-27001.A.5.16
- primitives: audit, access

## SOC 2 CC2.1: CC2.1 Quality information to support internal control

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity obtains or generates and uses relevant, quality
information to support the functioning of internal control.

**What Pryv does for you**

Pryv produces two streams of control-relevant information: the
per-user audit log (application-level activity, attributable to an
access) and observability metrics (operational + security KPIs via
the pluggable provider). What you monitor and how you act on it is
your programme; Pryv supplies the quality data.

**Evidence**

- primitives: audit, observability-provider

## SOC 2 CC2.2: CC2.2 Internal communication of objectives and responsibilities

Coverage: out-of-scope · draft

Requirement: The entity internally communicates information, including
objectives and responsibilities for internal control, necessary
to support the functioning of internal control.

**What Pryv does for you**

Internal communication of objectives is a management activity. No
software role at the communication-content layer.

## SOC 2 CC2.3: CC2.3 External communication on internal control matters

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: The entity communicates with external parties regarding matters
affecting the functioning of internal control.

**What Pryv does for you**

For the slice of external communication that concerns the Pryv
platform itself, open-pryv.io's public release process is the
channel: tagged releases, CHANGELOG-v2 + CHANGELOG-v2-back, and
(when shipped) the vulnerability-disclosure programme. You layer
your own customer / subprocessor / auditor communications on top.

**Evidence**

- derives from: iso-27001.A.5.19
- primitives: audit

## SOC 2 CC3.1: CC3.1 Specifies objectives with sufficient clarity

Coverage: out-of-scope · draft

Requirement: The entity specifies objectives with sufficient clarity to enable
the identification and assessment of risks relating to objectives.

**What Pryv does for you**

Objective-setting is your management exercise. Pryv has no role in
authoring objectives; the matrix supports the downstream
risk-to-control mapping once your objectives exist.

## SOC 2 CC3.2: CC3.2 Identifies and analyzes risk

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: The entity identifies risks to the achievement of its objectives
across the entity and analyzes risks as a basis for determining
how the risks should be managed.

**What Pryv does for you**

Your risk-assessment methodology and the specific findings are
yours. Pryv contributes the inventory of technical controls (this
matrix, particularly the CC6 access + CC6.6/6.7 boundary +
cryptography rows), when you identify a confidentiality /
integrity / availability risk, the matrix surfaces which Pryv
primitive addresses it, so control applicability is mechanical
rather than judgemental.

**Evidence**

- derives from: iso-27001.6.1.2
- primitives: access, permissions, audit, encryption-at-rest-secrets, multi-core-mTLS, backup-restore

## SOC 2 CC3.3: CC3.3 Considers the potential for fraud

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity considers the potential for fraud in assessing risks
to the achievement of objectives.

**What Pryv does for you**

Pryv's audit log + observability metrics are the detection
substrate for insider-misuse and anomalous-access fraud scenarios
(every access is attributable; unusual read/write patterns
surface). The fraud-risk analysis itself, which scenarios matter,
what thresholds trigger review, is your assessment.

**Evidence**

- primitives: audit, observability-provider

## SOC 2 CC3.4: CC3.4 Identifies and assesses changes affecting internal control

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity identifies and assesses changes that could
significantly impact the system of internal control.

**What Pryv does for you**

For changes to the Pryv platform, open-pryv.io's CHANGELOGs +
tagged releases announce what changed; the audit log shows when
config-driven behaviour changed observably in your deployment. The
change-impact assessment process is yours.

**Evidence**

- derives from: iso-27001.A.8.32
- primitives: audit

## SOC 2 CC4.1: CC4.1 Performs ongoing and separate evaluations

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: The entity selects, develops, and performs ongoing and/or
separate evaluations to ascertain whether the components of
internal control are present and functioning.

**What Pryv does for you**

Pryv supplies the data an ongoing evaluation samples: the audit
log evidences control-effectiveness (e.g., that access scoping
actually blocks out-of-scope reads), observability evidences
operational health. You define the evaluation cadence and the
sampling method.

**Detail**

**A separate evaluation of the platform code.** The open-pryv.io
maintainers ran a code-level security review of the source in 2026
(2026-06 to 2026-10); its confirmed findings were fixed with
regression tests in open-pryv.io 2.0.0-rc.40 to 2.0.0-rc.51, each
described in the release notes. The public report,
`SECURITY-AUDIT.md`
(https://github.com/pryv/open-pryv.io/blob/master/SECURITY-AUDIT.md,
published 2026-10-14), lists each finding with its severity and fix
release and the known residual risks. Cite it as a supplier
evaluation of the software component; it does not evaluate your
deployment's controls, and it was not performed by an independent
party. See `context/code-security-review-2026.md`.

**Evidence**

- derives from: iso-27001.A.8.16, iso-27001.9.1
- primitives: audit, observability-provider
- context notes: code-security-review-2026

## SOC 2 CC4.2: CC4.2 Evaluates and communicates deficiencies

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity evaluates and communicates internal control
deficiencies in a timely manner to those parties responsible for
taking corrective action.

**What Pryv does for you**

Pryv-side deficiency signals (audit anomalies, observability
alerts) feed your deficiency-tracking process. CAPA-style records
can themselves ride on Pryv events on a dedicated stream. The
evaluation + communication workflow is your procedure.

**Evidence**

- derives from: iso-27001.10.2
- primitives: audit, observability-provider

## SOC 2 CC5.1: CC5.1 Selects and develops control activities

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity selects and develops control activities that
contribute to the mitigation of risks to the achievement of
objectives to acceptable levels.

**What Pryv does for you**

Several of your control activities ARE Pryv primitives:
permission-scoped access tokens (purpose limitation), system
streams (privileged-data isolation), encryption of operator
secrets at rest. You select which to deploy against which risk;
Pryv provides the activities ready-made rather than as something
you build.

**Evidence**

- derives from: iso-27001.A.8.27
- primitives: access, permissions, system-streams, encryption-at-rest-secrets

## SOC 2 CC5.2: CC5.2 General control activities over technology

Coverage: facilitated · effort saved: high · mode: primitive · draft

Requirement: The entity also selects and develops general control activities
over technology to support the achievement of objectives.

**What Pryv does for you**

The technology general controls SOC 2 examines, logical access,
authentication, encryption in transit + at rest for secrets,
audit logging, secure inter-core transport, are shipped Pryv
primitives, enforced at the API surface rather than left to your
configuration discipline. The CC6 + CC7 rows below detail each.
Your role is selecting and operating them.

**Evidence**

- derives from: iso-27001.A.8.3, iso-27001.A.8.24
- primitives: access, permissions, audit, letsEncrypt-integration, multi-core-mTLS, encryption-at-rest-secrets

## SOC 2 CC5.3: CC5.3 Deploys control activities through policies and procedures

Coverage: out-of-scope · draft

Requirement: The entity deploys control activities through policies that
establish what is expected and procedures that put policies into
action.

**What Pryv does for you**

Policy + procedure authoring is your editorial work. Pryv enforces
what the policies decide (access rules, encryption), but the
policy text and the operating procedures are yours.

## SOC 2 CC6.1: CC6.1 Logical access security over protected information assets

Coverage: implemented · effort saved: high · draft

Requirement: The entity implements logical access security software,
infrastructure, and architectures over protected information
assets to protect them from security events to meet the entity's
objectives.

**What Pryv does for you**

Logical access is enforced by Pryv at the API surface: every
read/write is checked against the access's per-stream + level
permissions, token-based authentication is the default, and MFA is
available via the mfa.* methods (on by default since open-pryv.io
2.0.0-rc.14 with authenticator-app TOTP; each account holder
enrols) `[MA15C]`, `[MA11A]`. System streams
isolate privileged data (credentials, MFA state). Transport
encryption is configured (in the core or at your proxy, see
CC6.7). You define who gets which access; Pryv enforces it.

**Detail**

**OAuth2 as a second logical-access path.** Alongside token +
MFA authentication, Pryv ships a standards-based OAuth2
authorization-code + PKCE authorization server
(`open-pryv.io/components/oauth2/`, open-pryv.io 2.0.0-rc.8):
discovery at `GET /.well-known/oauth-authorization-server`,
`GET /oauth2/authorize`, and `POST /oauth2/token`. PKCE is
mandatory (S256 only); presented redirect URIs are validated by
exact string match with a single loopback-port carve-out
(RFC 8252 / 9700) and fragment-bearing redirect URIs are rejected
(`open-pryv.io/components/oauth2/src/clientRegistry.ts`). Client
registration is curated-only, the operator promotes an account
to an OAuth client via `bin/oauth-client.js`; open self-service
registration (`POST /oauth2/register`) is deliberately disabled.

**The OAuth2 surface since open-pryv.io 2.0.0-rc.64.** Added and
tested: token revocation (`POST /oauth2/revoke`, RFC 7009) and
introspection for clients registered `--can-introspect`
(`POST /oauth2/introspect`, RFC 7662), OpenID Connect discovery,
key set and id tokens when `oauth.signingKeys` lists a key (rc.69)
`[ORVK1]`, `[OXI01]`, `[OXD01]`; resource indicators (RFC 8707),
refused as `invalid_target` (rc.70) `[ORI03]`; token exchange for
resource servers registered `--can-exchange` (RFC 8693, rc.73)
`[OTX05]`; clients identified by a client metadata document URL
when `oauth.clientMetadataDocuments.mode` is not `off` (rc.74, see
CC6.2) `[OCMDE06]`. Since rc.74 the OAuth2 and discovery endpoints
answer CORS with their own policy (any origin, never credentials)
instead of the API's `[OACO1]`. Per-user addresses (rc.75) bind an
authorization to the account its address names `[OPUE2]`; with
`oauth.perUserIssuer` (rc.77, opt-in) each account host is its own
issuer `[OPIS4]`. The access-control effect of these is recorded on
CC6.3 and `hipaa-security.164.312(a)(1)`.

**Federated sign-in (SSO).** An account holder may also authenticate
through an external OpenID Connect provider (`sso.*`, beta, off by
default). It mints a normal Pryv session but is gated so an external
identity cannot claim an account whose email was never inbox-proved,
MFA (when active) is still enforced, and the session token reaches
the auth app via a one-time shared secret, never a URL. Sign-ins and
refusals are recorded in the audit trail (`sso.login`, `sso.refused`,
and from the release after open-pryv.io 2.0.0-rc.88 `sso.failed`).

**Credential transmission to third parties.** When a credential
must be handed to a counterparty, the shared-secrets endpoints
(`open-pryv.io/components/shared-secrets/`) replace URL-embedded
tokens with a one-time random key: redeemable exactly once (with
atomic single-winner semantics under concurrent redemption),
mandatory TTL, only the SHA-256 of the key's random half stored
server-side, payload scrubbed when the item leaves the pending
state (on redemption, on a signature mismatch, and on the first
retrieval attempt after the TTL; expiry is enforced on access,
not by a background sweeper, so an untouched expired secret keeps
its payload until something reaches it or you delete it),
optional passphrase / HMAC signature on redemption. Browser history, referrer headers, and access logs
therefore stop carrying live credentials. A
`secretSharing: forbidden` feature permission, inherited by
child accesses and not strippable via `accesses.update`, lets
you exclude designated access classes from minting shared
secrets at all.

**Delegate-account access path.** Account delegation
(`open-pryv.io/components/delegation/`) lets one account hold an
owner-equivalent delegate token over another. It rides the same
per-stream permission enforcement as any token, and its logical-
access guarantee is the non-forgeable teardown: a delegate can
never remove a delegation, and dissolving one requires a genuine
login on the controlled account (a personal token with no
forge-protected delegation marker). The `:_delegation:*`
namespace is plugin-owned and guarded (no user create/write/
delete; internal subtree read-guarded and excluded from wildcard
reads); each delegate's actions are audited on the controlled
account. See `context/delegation-model.md`.

**Privileged streams, by every spelling of an id** (open-pryv.io
2.0.0-rc.56). The guards that isolate the account fields (the
primary email, written only through `account.update`; the
non-editable and hidden fields; the level caps on account-stream
permissions), the delegation namespace and the plugin-managed
regions of the cross-account (CMC) namespace judge the stream an
id resolves to, whatever store-prefixed spelling a request uses,
for every token `[ASA1]`, `[ASA2]`, `[ASA6]`, `[CNRP6]`,
`[CNRP7]`. Before this release a store-prefixed spelling was not
recognised by these guards, so the isolation held only for
requests using the canonical ids; in particular an access holding
`contribute` on the email field could change the primary email
through the events API.

**Evidence**

- tests: AA01, AA02, ACCP, MA15C, MA11A, SHS02, SHS09, SHS13, ASA1, ASA2, ASA6, CNRP6, CNRP7, ORVK1, OXI01, OXD01, ORI03, OTX05, OCMDE06, OACO1, OPUE2, OPIS4
- docs: customer-resources/auth-oauth2.md
- config keys: oauth.signingKeys, oauth.clientMetadataDocuments.mode, oauth.perUserIssuer
- derives from: iso-27001.A.5.15, iso-27001.A.8.5, hipaa-security.164.312(a)(1)
- primitives: access, permissions, system-streams, MFA, encryption-at-rest-secrets, letsEncrypt-integration, shared-secrets, delegation
- context notes: delegation-model

**Planned changes**

- enhancement: Reference TOTP / WebAuthn MFA plugins + AAL-tier mapping strengthen the CC6.1 authentication-strength evidence

## SOC 2 CC6.2: CC6.2 User registration, credential issuance, and de-provisioning

Coverage: implemented · effort saved: high · draft

Requirement: Prior to issuing system credentials and granting system access,
the entity registers and authorizes new internal and external
users whose access is administered by the entity. For those users
whose access is administered by the entity, user system
credentials are removed when user access is no longer authorized.

**What Pryv does for you**

The full credential lifecycle is Pryv primitives: registration
mints an account; accesses.create issues a scoped credential;
accesses.update modifies scope (writing the prior version to
history); accesses.delete revokes; system.users.delete removes the
account entirely. Each stage lands in the audit log. The
authorization decision (who may register, what scope is
appropriate) is your policy; the mechanism is shipped.

**Detail**

**OAuth2 client credential issuance is curated.** For
delegated-app credentials, Pryv issues OAuth2 client identities
only through the operator CLI (`bin/oauth-client.js`, register /
rotate-secret / list), not through open dynamic registration: the
discovery document advertises no registration endpoint and
`POST /oauth2/register` (RFC 7591 open mode) is intentionally
deferred, `oauth.clientRegistration.mode: curated` is the only
supported value and `open` is rejected. Each client carries an
exact-match set of registered redirect URIs and, for confidential
clients, a rotatable `client_secret`. The authorization decision
(who becomes a client, which redirect URIs + scopes are
appropriate) stays your policy; the issuance + rotation mechanism
is shipped (`open-pryv.io/components/oauth2/`, open-pryv.io
2.0.0-rc.8).

**Operator-registered clients and their vetting (open-pryv.io
2.0.0-rc.68 and 2.0.0-rc.71).** `bin/oauth-client.js
create-registry` registers a client for an installed OAuth
extension, with a mandatory subject type (`public` or `pairwise`,
no default), audiences, lifetimes, an optional region and a
secret, `private_key_jwt` keys or none (public, PKCE). Since rc.71
a change to what an active client may do (redirect URIs, scope,
keys, auth method, audiences, allowed features, lifetimes) moves
it to `review` until the operator approves it, and a client under
review or suspended is refused everywhere, the data API included
`[OCLI19]`, `[ORF1]`. A rotated secret can keep the previous one
valid for at most 30 days `[OCAK14]`; logos are shown only from
hosts listed in `oauth.logoHosts` `[ORF4]`.

**Correction and opt-in: client metadata documents (open-pryv.io
2.0.0-rc.74).** "Curated only" holds while
`oauth.clientMetadataDocuments.mode` is `off`, the default. With
`allowList` (hosts you list) or `any`, a client may identify itself
by an https URL whose JSON document Pryv fetches: identity and
display come from the document, reach comes only from your
`client` template (scope, audiences, subject type, lifetimes),
never from the document. Such a client can never hold a secret,
introspection, token exchange, allowed features or "any audience",
and authenticates with `none` or `private_key_jwt` only
`[OCMD01]`, `[OCMD05]`, `[OCMDE03]`, `[OCMDE06]`. The fetch is a
guarded outbound call (see `CC6.6`), every fetch and refusal is in
the audit trail without the document body (`oauth.client.
metadata_fetched` / `metadata_refused`) `[OCMDE13]`, and the
consent screen must show the client's host next to its name.
`mode: any` lets any party present a client to your users' consent
screen: prefer `allowList`, keep `deniedHosts` current. Open
registration (`POST /oauth2/register`) stays disabled in every
mode.

**Delegate-credential issuance + de-provisioning.** Account
delegation (`open-pryv.io/components/delegation/`) issues a
delegate an owner-equivalent personal token over another account
through a controlled-account-initiated invite / accept handshake
(the only no-credential step is the operator-admin-key-gated
invite); create-from-delegate can provision a fresh controlled
account at the same time. De-provisioning is authoritative and
reserved to the controlled account: a delegate can never remove a
delegation, and detach is gated on a genuine login of the
controlled account. Issuance and teardown are audited per
delegate on the controlled account (same-core + cross-core). See
`context/delegation-model.md`.

Credentials a delegate issues to apps for the controlled account
follow the same lifecycle: each is an ordinary app access on the
controlled account, marked by the server as granted through the
delegation `[DCH01]`, and they are removed together with the
delegation: detach deletes every access granted through it, and
nothing the account holder granted `[DCH12]`. So credentials
issued under a delegate's authority do not survive the end of
that authority. In open-pryv.io 2.0.0-rc.23.

**Group accounts over CMC** (open-pryv.io 2.0.0-rc.53, release
commit `61fb28dd`, https://github.com/pryv/open-pryv.io/issues/158).
For a team sharing one account, a member is registered and
authorized before any credential reaches them: the member's
membership request is accepted by an administrator of the group
`[GA01]`, and only then can the member obtain, per patient, a
short-lived credential minted by the group's core and returned
once in the answer to the member's request, never stored, logged
or retried `[GA10]`, `[MA50]`; asking again with the same
permissions while it has more than five minutes left returns the
same access `[GA11]`, and any
other caller is refused (`cmc-member-access-not-member`)
`[GA12]`. When the membership ends, including when the delegate
who approved it is detached, the group's core deletes those
credentials on every patient account and records the outcome
`[GA20]`, `[GA22]`, `[GA23]`. See
`context/workforce-access-patterns.md`, Pattern 3.

**Evidence**

- tests: AA01, AA02, ACCP, UZEV, DCH01, DCH12, CMCGA, GA01, GA10, GA11, GA12, GA20, GA22, GA23, MA50, OCLI19, ORF1, OCAK14, ORF4, OCMD01, OCMD05, OCMDE03, OCMDE06, OCMDE13
- docs: customer-resources/auth-oauth2.md
- config keys: oauth.logoHosts, oauth.clientMetadataDocuments.mode, oauth.clientMetadataDocuments.allowedHosts, oauth.clientMetadataDocuments.deniedHosts, oauth.clientMetadataDocuments.client
- derives from: iso-27001.A.5.16, iso-27001.A.5.18, hipaa-security.164.308(a)(3)(ii)(C)
- primitives: access, system-streams, audit, delegation, CMC
- context notes: delegation-model, workforce-access-patterns

## SOC 2 CC6.3: CC6.3 Role-based access, least privilege, segregation of duties

Coverage: implemented · effort saved: high · draft

Requirement: The entity authorizes, modifies, or removes access to data,
software, functions, and other protected information assets based
on roles, responsibilities, or the system design and changes,
giving consideration to the concepts of least privilege and
segregation of duties, to meet the entity's objectives.

**What Pryv does for you**

Least privilege is native: an access carries only the
stream+level tuples it needs (none / create-only / read /
contribute / manage), so a credential cannot touch out-of-scope
data. Segregation of duties is expressed by issuing distinct
narrow accesses per role, with system streams isolating privileged
functions. accesses.update / .delete cover modify + remove; access
version history is the review-evidence layer. Role definitions
live in your IdP / policy; Pryv records and enforces the resulting
access state.

**Detail**

For workforce / role-scale deployments, Pryv composes with an
external IdP / IGA system rather than implementing roles + groups
itself, two integration patterns (group access + callerId audit
suffix; seed access + sub-access derivation) are documented in
context/workforce-access-patterns.md. The IdP stays the source of
truth for identity; Pryv records the access state + per-individual
audit trail. A third pattern ships in open-pryv.io 2.0.0-rc.53
(release commit `61fb28dd`,
https://github.com/pryv/open-pryv.io/issues/158): members of a
team sharing one account each get, per patient, a short-lived
access minted by the group's core, limited to their team streams
and to named data streams of the patient's offer, never beyond
the membership's expiry, unable to manage accesses, and deleted
when their membership ends `[GA12]`, `[GA14]`, `[GA15]`,
`[GA20]`, `[CMCMA]`. The membership itself is least privilege
too: team streams only, `read` or `contribute`, no feature
permission, never delegable `[GA02]`, no chat or alert channel
to the group `[MB21]`, and a delegate administrator cannot
approve their own membership `[MB34]`. Teams are streams and
memberships are consent relationships; there is still no role,
role-to-permission mapping or hierarchy inside Pryv (Pattern 3 of
the same note).

**Least privilege when streams move** (open-pryv.io
2.0.0-rc.56). A permission on a stream reaches its descendants,
so a move could widen who reaches a subtree. An app or shared
access now moves a stream only with manage rights on every stream
of the moved subtree, trashed ones included `[SMV1]` to `[SMV4]`,
and no access can move a stream under its own descendant
`[SMV10]`. Before this release a child granted to the moving
access at a lower level (`read`, `create-only`, `none`) moved
along into the target parent's inherited permissions, so the
"cannot touch out-of-scope data" property above did not hold for
stream moves.

**OAuth2 revoke + refresh-chain teardown.** For delegated apps,
the durable consent behind an OAuth2 grant is a cross-account CMC
data-grant; revoking it (deleting the counterparty access) kills
the refresh chain, the next `refresh_token` exchange sees the
data-grant gone and fails `invalid_grant`, so no fresh access is
minted (`open-pryv.io/components/oauth2/src/grants/refresh_token.ts`,
open-pryv.io 2.0.0-rc.8). Access modification propagates the same
way: narrowing the granted permissions on the data-grant narrows
what the next rotated token can do; widening requires a fresh
consent, never a refresh.

**Operator client revocation reaches live tokens.** Revoking a
delegated app (`bin/oauth-client.js revoke <clientId>`) no longer
merely blocks new grants while issued tokens live out their TTL:
it writes a platform-wide tombstone and every core rejects that
client's existing access tokens at validation time within
`oauth.clientRevokeCheckSeconds` (default 30 s; from the release
after open-pryv.io 2.0.0-rc.88 a value above 300 s is used as
300 s, like `caching.accessMaxAgeSeconds`), open socket.io
connections are swept and dropped too. So "remove access for app
X, everywhere, now" is one operator command with a bounded
propagation window (open-pryv.io `7b6321aa`). For DPoP-bound apps
the same is available per client key (`revoke-key <jkt>`,
open-pryv.io `4c0a5ade`).

**Removal and modification reach live tokens (open-pryv.io
2.0.0-rc.64 to 2.0.0-rc.76).** Deleting a consent grant deletes
the app's live sessions and the accesses they created at once
(rc.64; before, a live access token ran out its lifetime, up to
`oauth.accessTokenTTL`) `[OE31]`. Narrowing a grant re-cuts every
live session at once (rc.68) and narrows the accesses sessions
created, deleting those left with nothing (rc.70); a refresh never
mints more than the grant now holds (rc.66) `[OSUB3]`, `[PMRG2]`.
An app ends a token itself with `/oauth2/revoke` (rc.69); a
refreshed token's predecessor expires after
`oauth.refreshRetireGraceSeconds` (default 60 s) instead of living
out its lifetime; a refresh refused for bad client authentication
no longer uses up the refresh token, so a leaked refresh token
without the client's credential cannot end the user's consent
`[ORVK1]`, `[ORET1]`, `[ORL04]`. Suspending a client (or putting it
under review) stops its live tokens on the data API within
`oauth.clientRevokeCheckSeconds` and its `client_credentials`
grant since rc.71 (rc.68 to rc.70 stopped neither) `[ORF1]`.
`purge-grants <clientId>` deletes a client's grants, sessions,
created accesses and refresh chains on a core (rc.71) `[ORGP1]`.
Since rc.74 everything a revoked client was issued up to 5 s after
the revoke stays refused even if the id is registered again
`[OCR02]`, `[OCMD18]`. Deleting an address alias withdraws the
grant that adopted it (rc.76) `[OPAL4]`.

Expiry removes derived access too: a `shared` access managed by an
app access can no longer outlive it (it inherits the app access's
expiry at creation, clearing that expiry is refused, and
authentication refuses a never-expiring shared access once its app
access has expired, `5d609bfa`), and a webhook stops firing and
becomes `inactive` once its access has expired (`3394b95f`), both
in open-pryv.io 2.0.0-rc.23.

**Delegate-account access removal.** Account delegation
(`open-pryv.io/components/delegation/`) is a deliberately BROAD,
owner-equivalent grant, so where least privilege matters choose a
scoped `app` / `shared` access instead; delegation is for the
"act as the account holder" case. What CC6.3 relies on where full
delegation IS used is the removal + review half: each delegate's
actions are audited per delegate on the controlled account
(same-core + cross-core), and removal is authoritative and
reserved to the account holder, a delegate can never remove a
delegation, and detach is gated on a genuine login of the
controlled account (a personal token with no forge-protected
delegation marker). See `context/delegation-model.md`.

Least privilege also holds for apps a delegate authorizes on the
controlled account: they receive a scoped `app` access with the
permissions they requested, never the owner-equivalent token.
Such an access can be modified or revoked by the account holder
or the delegate, and revoked by the app itself, like any app
access (revocation cascades to what the app created) `[DCH06]`, `[DCH08]`,
`[DCH09]`, and is removed automatically when the delegation is
removed `[DCH12]`. In open-pryv.io 2.0.0-rc.23.

**Evidence**

- tests: AA01, AA02, ACCP, DCH06, DCH08, DCH09, DCH12, CMCMA, GA02, GA12, GA14, GA15, GA20, MB21, MB34, SMV1, SMV2, SMV3, SMV4, SMV10, OE31, OSUB3, PMRG2, ORVK1, ORET1, ORL04, ORF1, ORGP1, OCR02, OCMD18, OPAL4
- config keys: oauth.refreshRetireGraceSeconds, oauth.clientRevokeCheckSeconds
- derives from: iso-27001.A.5.15, iso-27001.A.5.18, iso-27001.A.5.3
- primitives: access, permissions, system-streams, audit, delegation, CMC
- context notes: workforce-access-patterns, delegation-model

## SOC 2 CC6.4: CC6.4 Physical access to facilities and protected assets

Coverage: out-of-scope · draft

Requirement: The entity restricts physical access to facilities and protected
information assets (for example, data center facilities, back-up
media storage, and other sensitive locations) to authorized
personnel to meet the entity's objectives.

**What Pryv does for you**

Physical access control (data-center entry, badge systems, media
vaults) is facility scope, outside Pryv's software boundary. Your
hosting provider carries this, an HDS- or ISO 27001-certified
hoster typically inherits it from the underlying CSP and provides
the attestation you reference.

## SOC 2 CC6.5: CC6.5 Logical and physical protections over data destruction

Coverage: configurable · effort saved: medium · draft

Requirement: The entity discontinues logical and physical protections over
physical assets only after the ability to read or recover data
and software from those assets has been diminished and is no
longer required to meet the entity's objectives.

**What Pryv does for you**

Logical destruction is per-user: system.users.delete removes the
user's data from the live store; event- and stream-level deletion
cover per-record needs. Whether destruction extends to backups is
engine-dependent, SQLite stores one file per user (unlink =
gone), PostgreSQL deletes rows but historical pg_dump artefacts
retain them until rotated. Choose the engine that matches your
destruction policy; physical media sanitisation is your hosting
procedure.

**Detail**

Account auto-deletion, since open-pryv.io 2.0.0-rc.66
(`8521c8d5`, see gdpr.Art.17 and gdpr.Art.5 §1(e)). Whole-account
destruction is schedulable, by the account holder or by your
inactivity preset, and runs through the same erasure as
system.users.delete, guards included (`[ADSW8]`); each scheduled
erasure is logged before and after, and kept as an audit row
where `audit.onUserDelete: keep` (`[ADSW17]`); an erasure
interrupted halfway is completed at a later pass (`[ADSW19]`),
and `maxDeletionsPerPass` caps a pass (`[ADSW12]`). The backup
reach above is unchanged.

**Evidence**

- tests: USAD, ADSW8, ADSW17, ADSW19, ADSW12
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine, audit.onUserDelete, account.autoDeletion.inactivity.defaultDays
- derives from: iso-27001.A.8.10, gdpr.Art.17, hipaa-security.164.310(d)(1)
- primitives: event, stream, backup-restore, account-auto-deletion

## SOC 2 CC6.6: CC6.6 Boundary protection against external threats

Coverage: configurable · effort saved: medium · draft

Requirement: The entity implements logical access security measures to protect
against threats from sources outside its system boundaries.

**What Pryv does for you**

Every API request is token-gated, whatever the deployment. The
transport side of the boundary is configured: the core terminates
TLS itself when `http.ssl.*` is set (with the built-in ACME
integration issuing, renewing and replicating certificates when
`letsEncrypt.enabled` is set), otherwise it serves plain HTTP
(default `http.ip` 127.0.0.1) and your reverse proxy terminates
TLS. Inter-core Raft traffic runs over mTLS on a private CA once
`bin/bootstrap.js` has written `storages.engines.rqlite.tls`
(default `tls: null`, plain TCP), separating the control plane
from the user-facing plane. Edge controls (WAF, firewall, rate
limiting) sit in your reverse proxy by design, see
context/rate-limiting-and-dos-protection.md.

**Detail**

The boundary also holds outbound (open-pryv.io 2.0.0-rc.56): a
URL supplied by a counterparty cannot make Pryv call inside your
network. Cross-account deliveries, chat, revocations, scope
updates, delegation and OAuth revocation notices are refused,
before any connection, when the host is or resolves to a
loopback, private, link-local or otherwise reserved address
(checked again at connect time), and redirects are not followed
`[PFR1]`, `[PFR2]`, `[PFR5]`, `[CO22]`. The platform's own host
names are allowed; other private peers must be listed in
`cmc.allowedPrivateHosts` `[PFR3]`. The same guard covers the key
sets (`jwks_uri`, rc.70) and client metadata documents (rc.74)
Pryv fetches for OAuth2 clients, https only, size, time and
per-host bounded `[OCMD03B]`, `[OCMD03G]`, `[OCMD03H]`; a host you
list in `cmc.allowedPrivateHosts` is allowed for them too.

Webhook calls leaving the boundary are signed from the release
after open-pryv.io 2.0.0-rc.88: a per-webhook secret, returned
once by `webhooks.create` and replaced by `webhooks.rotateSecret`,
keys a `Pryv-Signature` HMAC-SHA256 of a timestamp and the body,
so the receiving systems can refuse calls from anyone else
`[WHSG2]`, `[WHSR1]`. Rotation follows the rules of
`webhooks.update` (another app's access and a delegate barred
from the webhook's full URL are refused) `[WHSR2]`, `[WHSR3]`;
webhooks created earlier stay unsigned until rotated `[WHSG6]`.

Inbound, adapter routes (open-pryv.io 2.0.0-rc.73, off unless
`adapterRoutes` is set) open `/adapter/<name>/…` on every host the
core serves and forward it to a sidecar you run, without
authentication, CORS, audit or rate limiting by the core: the
sidecar is part of your boundary and must authenticate every
request, and its port must stay closed to the outside. The core
refuses traversal paths, caps bodies and idle time, sets the
forwarding headers itself, and since rc.75 names the addressed
account in `X-Adapter-Name` / `X-Adapter-Base` (client copies
removed) or answers `421` for an account of another core
`[ADRI03]`, `[ADRI06]`, `[ADRI09]`, `[ADRU3]`, `[ADRU4]`.

**Evidence**

- tests: ACMEINT, ACMEORCH, BUNDLEENC, PFR1, PFR2, PFR3, PFR5, CO22, OCMD03B, OCMD03G, OCMD03H, ADRI03, ADRI06, ADRI09, ADRU3, ADRU4, WHSG2, WHSG6, WHSR1, WHSR2, WHSR3
- docs: customer-resources/adapter-routes.md
- config keys: http.ssl.keyFile, http.ssl.certFile, letsEncrypt.enabled, storages.engines.rqlite.tls, cmc.allowedPrivateHosts, adapterRoutes
- derives from: iso-27001.A.8.20, hipaa-security.164.312(e)(1)
- primitives: letsEncrypt-integration, multi-core-mTLS, access
- context notes: rate-limiting-and-dos-protection

## SOC 2 CC6.7: CC6.7 Restriction and encryption of information in transmission and movement

Coverage: configurable · effort saved: medium · draft

Requirement: The entity restricts the transmission, movement, and removal of
information to authorized internal and external users and
processes, and protects it during transmission, movement, or
removal to meet the entity's objectives.

**What Pryv does for you**

Transmission is TLS once you configure where it terminates: in
the core (`http.ssl.*`, certificates from the built-in ACME
integration when `letsEncrypt.enabled` is set) or in your reverse
proxy, with the core serving plain HTTP behind it. The core sets
no TLS version of its own, so Node.js defaults apply (TLS 1.2
floor on the Node 24 the image runs). Pryv ships no intermediary
that could log or cache traffic. Movement is
restricted by the permission model, a credential only moves the
data its scope permits. Operator secrets at rest use AES-256-GCM
(HKDF-derived per-key); bootstrap bundles for core-to-core movement
are AES-256-GCM (scrypt). Bulk event-data at-rest encryption is an
operator-side storage-layer choice (LUKS / SSE-KMS / customer keys).
If your proxy terminates TLS, set `hostedSites.<name>.hsts: always`
so the sites the core hosts keep sending `Strict-Transport-Security`
(open-pryv.io 2.0.0-rc.34); see hipaa-security 164.312(e)(2)(ii).
Since open-pryv.io 2.0.0-rc.56 the calls Pryv makes to a
counterparty (cross-account deliveries, which carry a data grant's
endpoint, and the related notices) refuse plain `http:` unless
`cluster.allowInsecurePeerUrl` is set for a development or test
cluster `[PFR4]`.

**Evidence**

- tests: ACMEINT, ATRENC, BUNDLEENC, HSHT, PFR4
- config keys: http.ssl.keyFile, http.ssl.certFile, letsEncrypt.enabled, hostedSites.<name>.hsts, cluster.allowInsecurePeerUrl
- derives from: iso-27001.A.8.24, hipaa-security.164.312(e)(1), hipaa-security.164.312(e)(2)(ii)
- primitives: letsEncrypt-integration, encryption-at-rest-secrets, multi-core-mTLS, access, permissions

## SOC 2 CC6.8: CC6.8 Prevention and detection of unauthorized or malicious software

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity implements controls to prevent or detect and act upon
the introduction of unauthorized or malicious software to meet
the entity's objectives.

**What Pryv does for you**

Anti-malware / endpoint protection is a host-and-network control,
not shipped in Pryv. Pryv's contribution is detection-adjacent:
server-side event-type validation rejects malformed payloads at
ingest, the dependency-audit pipeline guards the software supply
chain, and audit + observability surface anomalous behaviour. AV +
application-allowlisting on the hosts is your operator scope.
One prevention control is built in: since open-pryv.io
2.0.0-rc.34 an attachment whose declared type a browser executes
or renders as a document (HTML, SVG and other XML, JavaScript) is
served in a sandbox (`Content-Security-Policy: sandbox;
default-src 'none'`), so an uploaded file cannot run script on
the API origin. It does not scan attachment content: uploads are
not refused for their type.

**Evidence**

- tests: ACTY
- derives from: iso-27001.A.8.7
- primitives: observability-provider, audit, data-types

## SOC 2 CC7.1: CC7.1 Detection of configuration changes and vulnerabilities

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: To meet its objectives, the entity uses detection and monitoring
procedures to identify (1) changes to configurations that result
in the introduction of new vulnerabilities, and (2) susceptibility
to newly discovered vulnerabilities.

**What Pryv does for you**

Pryv-side substrate-vulnerability detection now has an
active, CI-enforced feed (open-pryv.io master merge
`9e2ee7ff`): a runtime-dependency audit gate fails every
build on high or critical advisories in the shipped npm
tree (accepted advisories live in a documented allowlist,
not silenced), a CycloneDX SBOM is emitted and
Grype-scanned on every CI run (build fails on critical
findings), the base image is digest-pinned with the rqlite
download checksum-verified, and release images are
cosign-signed with a SLSA build-provenance attestation.
Dependabot alerts, CHANGELOG announcements, and a
config-validation step that fails fast on malformed
configuration at master start round this out; observability
+ audit surface runtime anomalies. Base-image OS-level CVEs
remain visible to the scanners (a slimmer-base migration is
a tracked follow-up); the image installs the Debian security
updates available at build time and no longer ships `curl`
(2.0.0-rc.42) nor `npm` / `npx` (2.0.0-rc.50). Your own
scanning cadence for the layers you add sits on top.

**Detail**

**Vulnerabilities in Pryv's own code.** The dependency feed above
does not see defects in open-pryv.io itself. Those were the subject
of a code-level security review by the maintainers in 2026 (2026-06
to 2026-10), fixed in open-pryv.io 2.0.0-rc.40 to 2.0.0-rc.51 (most
of those release notes say "upgrade promptly" and list operator
steps); public report `SECURITY-AUDIT.md`, published 2026-10-14
(https://github.com/pryv/open-pryv.io/blob/master/SECURITY-AUDIT.md).
Your
susceptibility depends on the release you run: track the release
notes and `SECURITY.md` advisories and upgrade. See
`context/code-security-review-2026.md`.

**Evidence**

- derives from: iso-27001.A.8.8, iso-27001.A.8.9
- primitives: observability-provider, audit
- context notes: code-security-review-2026

## SOC 2 CC7.2: CC7.2 Monitoring for anomalies indicative of security events

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: The entity monitors system components and the operation of those
components for anomalies that are indicative of malicious acts,
natural disasters, and errors affecting the entity's ability to
meet its objectives; anomalies are analyzed to determine whether
they represent security events.

**What Pryv does for you**

The pluggable observability provider gives system-level anomaly
signal (latency, error rate, request volume); the per-user audit
log gives application-level activity, attributable to an access.
Anomaly-detection logic on the audit stream itself is a natural
extension you build; the raw signal is shipped.

**Evidence**

- derives from: iso-27001.A.8.16
- primitives: observability-provider, audit, audit-event-stream

## SOC 2 CC7.3: CC7.3 Evaluation of security events

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity evaluates security events to determine whether they
could or have resulted in a failure of the entity to meet its
objectives (security incidents) and, if so, takes actions to
prevent or address such failures.

**What Pryv does for you**

Event-vs-incident classification is your decision. Pryv supplies
the evaluation inputs, audit row patterns, observability
anomalies, but the categorisation rule and the response trigger
are your policy.

**Evidence**

- derives from: iso-27001.A.5.25
- primitives: audit, observability-provider

## SOC 2 CC7.4: CC7.4 Incident response program

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: The entity responds to identified security incidents by executing
a defined incident response program to understand, contain,
remediate, and communicate security incidents, as appropriate.

**What Pryv does for you**

Pryv contributes the technical halves of incident response:
detection + scoping (audit + observability) and containment
(accesses.delete revokes a compromised credential immediately).
The external intake channel for substrate-vulnerability reports
is published in `SECURITY.md` (coordinated disclosure policy:
private GHSA flow + `security-dev@` mailbox + SLA + scope +
safe harbor; private vulnerability reporting enabled on the
published repositories). The incident-response program itself,
roles, escalation, communications, lessons-learned, is yours
to define and rehearse.

**Evidence**

- derives from: iso-27001.A.5.24, hipaa-security.164.308(a)(6)(i)
- primitives: audit, observability-provider, access

**Planned changes**

- feature: Chained / signed audit log strengthens forensic evidence during incident analysis (F:Evidence Med → High)

## SOC 2 CC7.5: CC7.5 Recovery from identified security incidents

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The entity identifies, develops, and implements activities to
recover from identified security incidents.

**What Pryv does for you**

Recovery primitives: bin/backup.js + --restore rebuild a user from
backup, the recovery path for user data; a multi-core cluster
replicates the platform DB and TLS certs over Raft, so the other
cores keep serving their own users when a peer fails (the failed
core's users wait for that core or its restore: user data is not
replicated between cores). The recovery-objective targets
(RTO / RPO) and the drill cadence are your policy.

**Evidence**

- derives from: iso-27001.A.8.14, hipaa-security.164.308(a)(7)(ii)(B)
- primitives: backup-restore, multi-core-mTLS, letsEncrypt-integration

## SOC 2 CC8.1: CC8.1 Authorized changes to infrastructure, data, software, procedures

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity authorizes, designs, develops or acquires, configures,
documents, tests, approves, and implements changes to
infrastructure, data, software, and procedures to meet its
objectives.

**What Pryv does for you**

Pryv-side change evidence: tagged releases, SHA-pinned Docker
images, CHANGELOG-v2 + CHANGELOG-v2-back per release, an
engine-agnostic forward-only schema-migration framework
(bin/migrate.js, with autoRunOnStart), and a public CI test matrix
(PostgreSQL + SQLite). Separate dev / test / prod environments are
supported via independent core deployments. The audit log records
config-driven behaviour changes in your deployment. Your
change-approval workflow (windows, sign-off, rollback) sits on top.

**Evidence**

- derives from: iso-27001.A.8.32, iso-27001.A.8.31
- primitives: audit

## SOC 2 CC9.1: CC9.1 Risk mitigation for business disruptions

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The entity identifies, selects, and develops risk mitigation
activities for risks arising from potential business disruptions.

**What Pryv does for you**

Disruption-mitigation inheritance: multi-core HA + Raft
replication, backup-restore, cluster-replicated TLS certificates,
and a clean cloud-exit path (re-issue the cluster onto new
infrastructure from a bootstrap bundle). The business-continuity
objectives and the insurance / contractual mitigation choices are
yours.

**Evidence**

- derives from: iso-27001.A.8.14, iso-27001.A.5.30
- primitives: multi-core-mTLS, backup-restore, letsEncrypt-integration

## SOC 2 CC9.2: CC9.2 Vendor and business partner risk management

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: The entity assesses and manages risks associated with vendors and
business partners.

**What Pryv does for you**

Where Pryv is your vendor (open-pryv.io as a third-party,
BSD-licensed platform), the public release process + CHANGELOGs +
this compliance matrix are the vendor-monitoring artefact set you
reference. Your broader vendor-risk programme (assessment
criteria, SLA reviews, subprocessor inventory) sits on top.

**Detail**

Supply-chain risk on the Pryv substrate is actively managed
upstream: committed lockfile + Dependabot, a CI
runtime-dependency audit gate, CycloneDX SBOM emission with
Grype scanning, a digest-pinned base image, and
cosign-signed release images with SLSA provenance
(open-pryv.io merge `9e2ee7ff`). The SBOM + signature +
CHANGELOG set is the vendor-monitoring artefact you cite
when Pryv is the vendor under review. See CC7.1.

**Evidence**

- derives from: iso-27001.A.5.19, iso-27001.A.5.21
- primitives: audit, observability-provider

## SOC 2 A1.1: A1.1, Capacity management

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The entity maintains, monitors, and evaluates current processing
capacity and use of system components (infrastructure, data, and
software) to manage capacity demand and to enable the
implementation of additional capacity to help meet its objectives.

**What Pryv does for you**

Capacity signal comes from per-core observability metrics (memory,
CPU, latency, request volume); capacity grows by adding cores to
the cluster (each serves its bound users behind the shared rqlite
control plane). The capacity-planning cadence and provisioning
automation are yours.

**Evidence**

- derives from: iso-27001.A.8.6
- primitives: observability-provider, multi-core-mTLS

## SOC 2 A1.2: A1.2, Environmental protections, backup, and recovery infrastructure

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: The entity authorizes, designs, develops or acquires, implements,
operates, approves, maintains, and monitors environmental
protections, software, data back-up processes, and recovery
infrastructure to meet its objectives.

**What Pryv does for you**

Backup + recovery infrastructure ships: bin/backup.js produces
per-user backups (the only copy of user data Pryv makes),
multi-core topology replicates the platform DB and TLS certs over
Raft so the remaining cores stay user-facing for their own users;
user data is not replicated between cores. Environmental protections (power, cooling,
fire suppression) are facility-side; your hoster's certification
covers them. Backup cadence, retention, and offsite policy are
yours.

**Detail**

Two open-pryv.io 2.0.0-rc.34 changes to plan for. Backups taken
before 2.0.0-rc.34 carry no high-frequency series data (on every
series engine, with no warning): take a new backup after
upgrading. The replicated platform DB moves to rqlite 10.5.1
(crash-safe, checksummed snapshot store; a node stops on a
node-local SQLite error); its data directory upgrade is one-way,
so back up every node before the first start
(`open-pryv.io/INSTALL.md`, "Upgrading the bundled rqlite (9.x to
10.x)").

One open-pryv.io 2.0.0-rc.51 change to plan for: before that
release, `bin/backup.js --incremental` overwrote the full backup it
continued, so a directory that received incrementals restores only
the last delta. `--inspect <dir>` reports it `DAMAGED` and a restore
refuses it; take a new full backup into a new directory. Since
2.0.0-rc.51 the incrementals form a chain next to the full backup,
restorable as of any run (`--through-run`); see
`iso-27001.A.8.13`.

One open-pryv.io 2.0.0-rc.86 change to plan for: a backup written
by 2.0.0-rc.86 or later restores with that release or later, so a
rollback plan to an earlier release starts a new backup chain in a
new directory. The same release checks every file of a run against
the run's manifest before restoring it, optionally verifies an
Ed25519 signature per run, and no longer leaves an account
half-restored after a failed restore; see `iso-27001.A.8.13`.

**Evidence**

- derives from: iso-27001.A.8.13, iso-27001.A.8.14, hipaa-security.164.308(a)(7)(ii)(A)
- primitives: multi-core-mTLS, backup-restore, letsEncrypt-integration

## SOC 2 A1.3: A1.3, Recovery plan testing

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity tests recovery plan procedures supporting system
recovery to meet its objectives.

**What Pryv does for you**

Pryv gives you a testable recovery path (restore a user from a
backup file into a clean core; fail a core and confirm a peer keeps
serving). The recovery drill, scheduling it, evidencing the result,
feeding gaps back into the plan, is your operating procedure.

**Evidence**

- derives from: iso-27001.A.8.13
- primitives: backup-restore, multi-core-mTLS

## SOC 2 C1.1: C1.1, Identification and maintenance of confidential information

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity identifies and maintains confidential information to
meet the entity's objectives related to confidentiality.

**What Pryv does for you**

Pryv lets you identify + isolate confidential data by stream
layout: dedicate subtrees per confidentiality tier and gate each
with a distinct permission scope, so confidential streams are
reachable only by credentials granted them. System streams add a
privileged tier independent of your scheme; clientData / event
type can carry machine-readable classification labels. Masking is
by projection (stream + permissions), not value transformation,
see context/data-masking-projection-vs-transformation.md. For
the account name, accesses created with `randomAlias:true` carry
an alias in place of the username, hidden from the holder; since
open-pryv.io 2.0.0-rc.69 the token is accepted under its alias
only, so a holder who guesses the username cannot confirm it with
the token.

**Evidence**

- derives from: iso-27001.A.5.12, iso-27001.A.8.11
- primitives: stream, system-streams, event, permissions, clientData, randomAlias
- context notes: data-masking-projection-vs-transformation

**Planned changes**

- feature: End-to-end (proxy re-encryption / BYOK) keeps confidential content opaque to the operator; the natural future confidentiality primitive

## SOC 2 C1.2: C1.2, Disposal of confidential information

Coverage: configurable · effort saved: medium · draft

Requirement: The entity disposes of confidential information to meet the
entity's objectives related to confidentiality.

**What Pryv does for you**

Confidential-data disposal uses the same per-user erasure path as
CC6.5: system.users.delete for whole-account, event/stream
deletion for per-record. Backup reach is engine-dependent (SQLite
per-user file vs PostgreSQL row + pg_dump rotation), pick the
engine that matches your disposal commitment.

**Detail**

Account auto-deletion (open-pryv.io 2.0.0-rc.66, `8521c8d5`), as
under CC6.5: whole-account disposal schedulable by the holder or
by your inactivity preset, same erasure path, guards included
(`[ADSW8]`), an interrupted erasure completed later
(`[ADSW19]`).

**Evidence**

- tests: USAD, ADSW8, ADSW19
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine
- derives from: iso-27001.A.8.10, gdpr.Art.17
- primitives: event, stream, backup-restore, account-auto-deletion

## SOC 2 PI1.1: PI1.1 Quality information about processing objectives

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity obtains or generates, uses, and communicates relevant,
quality information regarding the objectives related to processing,
including definitions of data processed and product and service
specifications, to support the use of products and services.

**What Pryv does for you**

The canonical event-type schemas (class/format JSON Schemas in the
data-types repo) are the machine-readable definition of "data
processed", what each event type means and what shape it takes.
You extend the catalogue with your own types via the
service.eventTypes URL. The processing-objective specifications
themselves are your product definitions.

**Evidence**

- primitives: data-types, audit

## SOC 2 PI1.2: PI1.2 Completeness and accuracy of inputs

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity implements policies and procedures over system inputs,
including controls over completeness and accuracy, to result in
products and services that meet the entity's objectives.

**What Pryv does for you**

Input accuracy is enforced structurally at ingest: events.create
and events.update run every payload through the event type's JSON
Schema (ajv-draft-04), unknown types and schema violations are
rejected with HTTP 400, no silent truncation or downgrade. This is
the structural-accuracy layer; semantic accuracy (is this the
*right* blood-pressure reading) stays in your application. Tighten
structural strictness by declaring min/max/pattern in a custom
catalogue, see context/data-accuracy-structural-vs-semantic.md.

**Evidence**

- derives from: gdpr.Art.5
- primitives: data-types, event, permissions
- context notes: data-accuracy-structural-vs-semantic

## SOC 2 PI1.3: PI1.3 Completeness and accuracy of processing

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity implements policies and procedures over system
processing to result in products and services that meet the
entity's objectives.

**What Pryv does for you**

Pryv's processing model is deterministic + attributable: the
audit log is append-only by convention of its write path (no
hash chain, see `proposals/audit-log-chaining.md`), an access keeps
every previous version, events.update snapshots the prior state
of an event into version history only with
`versioning.forceKeepHistory: true` (the default keeps no event
history; see `context/event-history.md`), and every mutation is
authorised by the permission model and recorded in the audit log.
Concurrent writes do not silently drop data: since open-pryv.io
2.0.0-rc.38 (merge `461f3c4c`) an update, a trash (a
shared-secret event excepted) or an attachment deletion is applied onto the event as stored at write time
(atomically on the built-in PostgreSQL and SQLite stores), so a
top-level field written meanwhile and not changed by the request
is kept, server-written processing status included `[ESR1]`,
`[ESR4]`, `[ESR5]`, `[ESR6A]`. The
business-logic processing your application performs on top is your
control responsibility.

**Evidence**

- tests: ESR1, ESR4, ESR5, ESR6A
- primitives: event, audit, permissions
- context notes: event-history

## SOC 2 PI1.4: PI1.4 Completeness, accuracy, and timeliness of outputs

Coverage: facilitated · effort saved: low · mode: primitive · draft

Requirement: The entity implements policies and procedures to make available or
deliver output completely, accurately, and timely in accordance
with specifications to meet the entity's objectives.

**What Pryv does for you**

Output delivery is deterministic: events.get / streams.get return
canonical serialisations; the audit log carries an integrity
checksum of the affected event when a method mutates one, so
output can be tied back to a verified state. Webhooks notify
subscribers of change (signal-only, the receiver fetches the
authoritative state via authenticated GET, so the delivered output
is always the current canonical value); from the release after
open-pryv.io .0.0-rc.88 each call is signed with a per-webhook
secret, so the receiver can check where it comes from (see
context/webhooks-signal-only.md). Delivery SLAs to your end
recipients are your specification.

**Evidence**

- primitives: event, audit, webhooks
- context notes: webhooks-signal-only

## SOC 2 PI1.5: PI1.5 Completeness and accuracy of stored information

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: The entity implements policies and procedures to store inputs,
items in processing, and outputs completely, accurately, and
timely in accordance with system specifications to meet the
entity's objectives.

**What Pryv does for you**

Storage integrity: event version history preserves prior states
on a deployment with `versioning.forceKeepHistory: true` (off by
default), the audit log carries the integrity hash of each event
as created or updated (integrity is on by default), and
backup-restore provides a recoverable copy. Together these give an
accuracy + completeness signal for stored data. Tamper-evidence on
the audit log itself (hash chaining) is a future primitive, see
the CC7.4 chain proposal. The recoverable copy is complete for
high-frequency series only from open-pryv.io 2.0.0-rc.34 (earlier
operator backups held no series data); the backup and restore
round trip is tested (`[BKSR]`, `[BKEV]`). Incremental backups are
complete from 2.0.0-rc.51: before it an incremental run overwrote
the full backup it continued and missed changes made while the
previous run was in progress; since then each run is kept next to
the full backup and the restore replays the whole chain `[BKC1]`,
`[BKC2]`, `[BKC3]`. Since 2.0.0-rc.86 each run's manifest lists
every file with its size and hash, and a restore refuses a run with
a file added, removed, changed or cut short, so the recoverable
copy is checked for completeness and accuracy before it is used;
`--inspect --verify-files` runs the same check without restoring
`[BKSM1]`, `[BKSM2]`, `[BKIS3]`.

**Evidence**

- tests: BKSR, BKEV, BKC1, BKC2, BKC3, BKSM1, BKSM2, BKIS3
- derives from: hipaa-security.164.312(c)(1)
- primitives: event, audit, backup-restore

## SOC 2 P1.1: P1.1, Notice of privacy practices

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: The entity provides notice to data subjects about its privacy
practices to meet the entity's objectives related to privacy. The
notice is updated and communicated to data subjects in a timely
manner for changes to the entity's privacy practices.

**What Pryv does for you**

Pryv gives you the surface to present notice: app-web-auth3 is the
forkable consent / auth web page where notice text is shown at
authorization time, and the durable access record (with clientData)
can carry the notice version the subject saw. Authoring the notice
content and keeping it current is your editorial obligation; Pryv
carries it through the consent flow and records what was presented.

**Evidence**

- derives from: gdpr.Art.13, gdpr.Art.14, hipaa-privacy.164.520, iso-27701.A.7.3.2
- primitives: app-web-auth3, access, clientData

## SOC 2 P2.1: P2.1, Choice and consent

Coverage: implemented · effort saved: high · draft

Requirement: The entity communicates choices available regarding the
collection, use, retention, disclosure, and disposal of personal
information to the data subjects and obtains consent, as required,
to meet the entity's objectives related to privacy.

**What Pryv does for you**

The access IS the durable, versioned consent record: it carries
the granted permissions (the scope the subject agreed to), and its
clientData holds the consent text / purposes / lawful basis. CMC
carries cross-account consent state transitions via typed
consent/* events. app-web-auth3 is the choice-presentation UX, and
the audit chain proves the consent state at any moment. You design
the choices; Pryv records and enforces them.

**Evidence**

- tests: AA01, ACCP
- derives from: gdpr.Art.7, iso-27701.A.7.2.4
- primitives: access, permissions, clientData, CMC, app-web-auth3, audit

## SOC 2 P3.1: P3.1, Collection consistent with objectives

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Personal information is collected consistent with the entity's
objectives related to privacy.

**What Pryv does for you**

Collection scope is bounded by the access's permissions, an app
can only write to the streams + levels it was granted (e.g.
create-only on a specific subtree), so collection cannot silently
exceed the agreed purpose. Defining the purpose and the minimal
stream set is your data-model design; the boundary is enforced.

**Evidence**

- derives from: gdpr.Art.5, gdpr.Art.6
- primitives: access, permissions, stream

## SOC 2 P3.2: P3.2, Explicit consent for sensitive personal information

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: Explicit consent for the collection, use, retention, disclosure,
and disposal of sensitive personal information is obtained from
data subjects or other authorized persons, if required.

**What Pryv does for you**

Sensitive data can be isolated in dedicated streams gated by a
distinct access whose clientData records the explicit-consent
basis; consent/* events capture the state transition with a
timestamp. The "explicit" UX (a separate, affirmative consent step)
is yours to present; Pryv records it as a distinct, auditable
grant rather than folding it into general consent.

**Evidence**

- derives from: gdpr.Art.9, iso-27701.A.7.2.4
- primitives: access, clientData, CMC, system-streams, event

## SOC 2 P4.1: P4.1, Use limited to identified purposes

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity limits the use of personal information to the purposes
identified in the entity's objectives related to privacy.

**What Pryv does for you**

Purpose limitation is the permission model's core job: a
credential issued for purpose A (scoped to stream A) cannot read
or write purpose-B data. The audit log evidences that uses stayed
within scope. Mapping purposes to streams + accesses is your
design; the enforcement is technical, not policy-on-paper.

**Evidence**

- derives from: gdpr.Art.5, gdpr.Art.6
- primitives: access, permissions, audit

## SOC 2 P4.2: P4.2, Retention of personal information

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: The entity retains personal information consistent with the
entity's objectives related to privacy.

**What Pryv does for you**

Retention metadata (period, basis, scheduled disposal date) can
ride on event / access clientData so each record carries its own
retention contract. Pryv ships no automatic TTL / expiry
primitive for records: enforcement of their retention schedule
is an operator job (a scheduled sweep calling events/streams
delete); whole accounts are covered by account auto-deletion
since 2.0.0-rc.66, see detail. The retention
policy itself is yours; treat the absence of auto-expiry as an
operator responsibility when you attest P4.2.

**Detail**

For records inside an account this is **voluntarily missing +
operator-owned** by design, the same classification as GDPR
Art.5(1)(e) storage limitation. Pryv stays retention-policy-neutral:
no TTL / auto-delete / scheduler primitive ships for events and
streams, so their automatic disposal is the operator's external
scheduled job composing existing primitives (`events.get
toTime=<cutoff>` + two-stage `events.delete` + `streams.delete` +
`auth.delete`, with the audit log as the inactivity oracle).
`clientData.retention` is advisory metadata, not an enforcement
hook; every retention deletion is itself audit-logged. Full
rationale + the recommended operator retention-job pattern in
`context/data-retention-operator-owned.md`.

Account auto-deletion, since open-pryv.io 2.0.0-rc.66
(`8521c8d5`). For whole accounts, retention is a platform
setting: your inactivity preset
(`account.autoDeletion.inactivity.defaultDays`, default none)
deletes plain accounts with an email address after that many
days without use (`[ACST14]`), with reminder mails (`[ACXP3]`), a
7-day minimum notice (`[ACXP8]`) and a clock that starts the day
the preset first applies (`[ACXP2]`); holders may schedule their
own deletion, `allowUserOptOut: false` keeps them from opting
out of your preset (`[ACST8]`) and `userOverride: false` from
choosing another date or period (`[ACST9]`). `dryRun: true` lets
you measure a preset before arming it (`[ADSW13]`). Retention of
records inside an account (events, streams) stays your scheduled
job, which is why the row stays facilitated. When you attest
P4.2, the preset's period is part of your stated retention
policy.

**Evidence**

- tests: ACXP2, ACXP3, ACXP8, ACST8, ACST9, ACST14, ADSW13
- docs: customer-resources/account-auto-deletion.md
- config keys: account.autoDeletion.inactivity.defaultDays, account.autoDeletion.allowUserOptOut, account.autoDeletion.userOverride, account.autoDeletion.dryRun
- derives from: gdpr.Art.5, iso-27701.A.7.4.7
- primitives: clientData, event, backup-restore, account-auto-deletion
- context notes: data-retention-operator-owned

## SOC 2 P4.3: P4.3, Disposal of personal information

Coverage: configurable · effort saved: medium · draft

Requirement: The entity securely disposes of personal information to meet the
entity's objectives related to privacy.

**What Pryv does for you**

Disposal uses the per-user erasure path: system.users.delete for
whole-account, event/stream deletion for per-record. Backup reach
is engine-dependent (SQLite per-user file unlink vs PostgreSQL row
+ pg_dump rotation), choose the engine that matches your disposal
commitment, same as GDPR Art.17.

**Detail**

Account auto-deletion (open-pryv.io 2.0.0-rc.66, `8521c8d5`, see
P4.2 and CC6.5): scheduled whole-account disposal, by the holder
or by your inactivity preset, through the same erasure path,
guards included (`[ADSW8]`), an interrupted erasure completed
later (`[ADSW19]`).

**Evidence**

- tests: USAD, ADSW8, ADSW19
- docs: customer-resources/account-auto-deletion.md
- config keys: storages.userAccountStorage.engine
- derives from: gdpr.Art.17, iso-27001.A.8.10, iso-27701.A.7.4.7
- primitives: event, stream, backup-restore, account-auto-deletion

## SOC 2 P5.1: P5.1, Data subject access to personal information

Coverage: implemented · effort saved: high · draft

Requirement: The entity grants identified and authenticated data subjects the
ability to access their stored personal information for review and,
upon request, provides physical or electronic copies of that
information to data subjects to meet the entity's objectives
related to privacy.

**What Pryv does for you**

Subject access is subject-runnable: the data subject holds their
own credentials, so events.get / streams.get return their data
directly (since open-pryv.io 2.0.0-rc.84 their accesses.get also
reports how much each access was used, as approximate lifetime
call counts that only the owner receives `[AUG1]`, `[AUG3]`, and
since rc.86 audit.getSummary counts their audited calls over a
period `[ASM1]`, `[ASM4]`; see gdpr.Art.15), and the pryv-account-backup CLI produces a complete
portable export, account, profiles, app profiles, streams,
accesses (incl. revoked / expired + opt-in per-access version
history), events (chunked + incremental), audit log, HF series
data points, webhooks, and attachments, with a per-file sha256
integrity manifest, with no operator dependency for routine
requests. The browser-based webapp flavour covers the read-side
text resources only; route subjects who need attachments / HF
series / webhooks to the CLI. See
context/account-backup-coverage.md.

**Evidence**

- tests: AA01, EGSQ, UZEV, AUG1, AUG3, ASM1, ASM4
- derives from: gdpr.Art.15, hipaa-privacy.164.524, iso-27701.A.7.3.4
- primitives: account-backup-tool, access, event, stream, audit
- context notes: account-backup-coverage

## SOC 2 P5.2: P5.2, Correction, amendment, or appending of personal information

Coverage: implemented · effort saved: medium · draft

Requirement: The entity corrects, amends, or appends personal information based
on information provided by data subjects and communicates such
information to third parties, as committed or required, to meet
the entity's objectives related to privacy.

**What Pryv does for you**

Correction is events.update and account.update for profile
fields; the audit log records who amended which event, when (not
the prior value). events.update keeps the prior value in version
history, preserving the amendment trail, only on a deployment
with `versioning.forceKeepHistory: true` (off by default; see
`context/event-history.md`).
Propagation to third parties who hold a shared/CMC access can use
webhooks to signal the change. Judging the correctness of a
correction request is your process.

**Evidence**

- tests: PTU1
- derives from: gdpr.Art.16, hipaa-privacy.164.526, iso-27701.A.7.3.6
- primitives: event, access, audit, webhooks
- context notes: event-history

## SOC 2 P6.1: P6.1, Disclosure to third parties for identified purposes with consent

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity discloses personal information to third parties for the
purposes identified in the entity's objectives related to privacy
and with the explicit consent of the data subject, if required.

**What Pryv does for you**

Third-party disclosure happens by issuing a scoped shared / CMC
access, the disclosure is exactly the permissions granted,
nothing more, and the access's clientData records the purpose +
consent basis. There is no out-of-band data-dump path; disclosure
is always a tracked, revocable grant. Deciding the lawful purpose
is yours.

A grant is a set of streams, and what a stream carries can grow
with a Pryv release. Since open-pryv.io 2.0.0-rc.44, a grant
that reads the account email stream
(`:system:email`, shown as "Read Email") can also request, by
type, a read-only, server-derived `verification/email` event:
whether ownership of the primary address was proved, how, and
when. Apps granted it earlier can request it without new consent;
other addresses of the account are never disclosed. If your consent
text should say so, rename the field's `name` in
`custom.systemStreams`.

**Evidence**

- tests: SIB01, SIB11
- derives from: gdpr.Art.6, hipaa-privacy.164.502, iso-27701.A.7.3.4
- primitives: access, permissions, CMC, clientData

## SOC 2 P6.2: P6.2, Record of authorized disclosures

Coverage: implemented · effort saved: high · draft

Requirement: The entity creates and retains a complete, accurate, and timely
record of authorized disclosures of personal information to meet
the entity's objectives related to privacy.

**What Pryv does for you**

Every disclosure is a read against a shared / CMC access, and the
per-user audit log records each access invocation with the
accessId + accessSerial that made it, a complete, attributable
record of who accessed what, when. Since open-pryv.io `07b6d3b6`
the *authorization* of a disclosure is recorded too: OAuth2
`oauth.*` audit events capture the consent grant, the code
exchange and every token issuance / refresh / revocation that
underlie a delegated-app disclosure. Since open-pryv.io
2.0.0-rc.73 a resource server that exchanges a user's token for
its own is recorded in the subject's trail as
`oauth.token.exchanged`, naming the resource server and the app
whose token it received `[OTX03]`, `[OTXE10]`; an introspection
(which resource server asked about whose token) is in syslog
(`oauth.token.introspected`, rc.69) `[OXI06]`. The audit-event-stream can
surface the same record into the subject's own streams. This is
the technical disclosure register; how long you retain it is your
policy. Since open-pryv.io 2.0.0-rc.84 the account owner also gets,
per access and per deletion record, approximate lifetime call
counts by method (`usage` on `accesses.get`, never returned to an
app or shared caller) `[AUG1]`, `[AUG3]`, `[AUG4]`: a summary of
how much each recipient used its grant, not a substitute for the
per-call record, which stays the audit log. Since rc.86
`audit.getSummary` gives the owner the same audit log counted per
hour, day or week for chosen accesses `[ASM2]`, `[ASM3]`: when each
recipient used its grant, still a summary of the record.

**Evidence**

- tests: AT01, AT51, AT61, OE07, OTX03, OTXE10, OXI06, AUG1, AUG3, AUG4, ASM2, ASM3
- derives from: hipaa-privacy.164.528, gdpr.Art.30
- primitives: audit, audit-event-stream, access

## SOC 2 P6.3: P6.3, Record of detected unauthorized disclosures

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: The entity creates and retains a complete, accurate, and timely
record of detected or reported unauthorized disclosures (including
breaches) of personal information to meet the entity's objectives
related to privacy.

**What Pryv does for you**

The audit log captures access patterns (including failed /
out-of-scope attempts), and observability surfaces anomalies, so a
detected unauthorized disclosure has a contemporaneous evidentiary
record. Detecting that a disclosure was unauthorized (vs
authorized) is your assessment; Pryv supplies the raw trail.

**Evidence**

- derives from: iso-27001.A.5.25, hipaa-breach.164.408
- primitives: audit, observability-provider

## SOC 2 P6.4: P6.4, Third-party commitments for privacy

Coverage: out-of-scope · draft

Requirement: The entity obtains privacy commitments from vendors and other
third parties who have access to personal information to meet the
entity's objectives related to privacy.

**What Pryv does for you**

Vendor / subprocessor privacy commitments are contractual
artefacts (DPAs, BAAs). No software role, though when the third
party's technical access is a Pryv shared/CMC access, the
permission scope is a concrete, enforced bound on what they were
given, which your DPA can reference.

## SOC 2 P6.5: P6.5, Third-party unauthorized disclosure response

Coverage: out-of-scope · draft

Requirement: The entity obtains commitments from vendors and other third
parties with access to personal information to notify the entity
in the event of actual or suspected unauthorized disclosures, and
the entity responds to such notifications.

**What Pryv does for you**

The third-party notification commitment is contractual and the
response is your incident process (see CC7.4). No software role at
the vendor-commitment layer.

## SOC 2 P6.6: P6.6, Notice of breaches and incidents to affected parties

Coverage: facilitated · effort saved: high · mode: evidence · draft

Requirement: The entity provides notification of breaches and incidents to
affected data subjects, regulators, and others to meet the
entity's objectives related to privacy.

**What Pryv does for you**

Pryv contributes the scoping evidence a breach notice needs, the
audit log ties a compromised access to the user + data it
touched. The shipped `bin/breach-scope.js` (accessId → user
reverse-index + audit `recordCount` + `scopedStreamIds` query
scope) automates "who was affected, how many records, which
streams in scope" in one command. Drafting and sending the
notifications within the regulatory deadline is your process.

**Evidence**

- derives from: gdpr.Art.33, gdpr.Art.34, hipaa-breach.164.404
- primitives: audit, access

**Planned changes**

- feature: Chained audit log raises forensic confidence in the breach-scope determination

## SOC 2 P6.7: P6.7, Accounting of disclosures to data subjects

Coverage: implemented · effort saved: medium · draft

Requirement: The entity provides data subjects with an accounting of the
personal information held and disclosure of the data subjects'
personal information, upon the data subjects' request, to meet the
entity's objectives related to privacy.

**What Pryv does for you**

The accounting-of-disclosures answer is computable from the audit
log (which accesses read which data, when) plus the accesses list
(who holds a grant). The audit-event-stream can expose this to the
subject directly. Packaging it into a subject-facing report on
request is your workflow; the underlying record is complete and
attributable. The reference account app (app-web-user-account
0.34.0) gives the subject a self-service view of it: an Audit trail
tab, linkable and filtered by app, access, date or kind of call,
each row naming the access that made it (a revoked one included),
and per-access lifetime call counts read from open-pryv.io
2.0.0-rc.84 or later (app tests `[ACTV]`, `[TRLP]`). Its next
release adds charts of that activity over a chosen period, counted
by the core (`audit.getSummary`, open-pryv.io 2.0.0-rc.86; older
cores fall back to counting the audit rows in the app).

**Evidence**

- tests: AT01, AT51, AT61, AT65
- derives from: hipaa-privacy.164.528, gdpr.Art.15
- primitives: audit, audit-event-stream, access

## SOC 2 P7.1: P7.1, Data quality, accuracy, completeness, relevance

Coverage: facilitated · effort saved: medium · mode: primitive · draft

Requirement: The entity collects and maintains accurate, up-to-date, complete,
and relevant personal information to meet the entity's objectives
related to privacy.

**What Pryv does for you**

Structural data quality is enforced at ingest by event-type schema
validation (HTTP 400 on malformed input); subjects keep their data
up-to-date via events.update / account.update (prior event values
kept only with `versioning.forceKeepHistory: true`, off by
default). "Relevant", collecting no more than the purpose needs,
is bounded by the permission scope you grant. Judging semantic
accuracy of a specific value is your application's responsibility.

**Evidence**

- derives from: gdpr.Art.5, iso-27701.A.7.4.3
- primitives: data-types, event, access

## SOC 2 P8.1: P8.1, Privacy complaint management and compliance monitoring

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: The entity implements a process for receiving, addressing,
resolving, and communicating the resolution of inquiries,
complaints, and disputes from data subjects and others and
periodically monitors compliance to meet the entity's objectives
related to privacy. Corrections and other necessary actions
related to identified deficiencies are made or taken in a timely
manner.

**What Pryv does for you**

The complaint-handling workflow is yours, but Pryv supplies the
monitoring evidence (audit + observability) and can host the
complaint / resolution records themselves as events on a dedicated
stream with an attributable trail. This compliance matrix doubles
as the periodic control-inventory you monitor against.

**Evidence**

- derives from: gdpr.Art.12, iso-27701.A.7.3.1
- primitives: audit, observability-provider, event

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
