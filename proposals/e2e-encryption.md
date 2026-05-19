# Proposal: end-to-end encryption of user data (future Pryv-native primitive)

**Status:** future / research direction. The matrix records this so
that if/when the feature ships, the affected coverage rows can be
updated.
**Upstream backlog item:** macroPryv `_plans/XXX-Backlog/E2E-ENCRYPTION.md`
(filed 2026-04-26; mirror of `pryv/service-core#516`).

## Why the matrix cares about this proposal

Several matrix rows around "encryption at rest" land at
`Configurable | Medium` or `Facilitated | Medium` today because Pryv
itself does **not** encrypt event content at rest. The implementer
gets there via operator-side filesystem encryption (LUKS / dm-crypt
on disks) or DB-engine TDE (PostgreSQL TDE, MongoDB encrypted
storage engine). That's the **correct deliberate choice** for v2 —
infrastructure-layer encryption is the right place for at-rest
encryption of bulk event data — but it means **Pryv-managed
customer keys (CMEK / BYOK)** are not on the table today.

The user clarified this on 2026-05-19 during the implementer-
perspective gap-probing session: CMEK is **voluntarily missing** in
the matrix; the right answer is "your hosting provider handles
that". Documenting the choice is the matrix's job, not implementing
it.

The longer-term direction in `_plans/XXX-Backlog/E2E-ENCRYPTION.md`
is **end-to-end encryption**, where the server itself never holds
plaintext — research direction is proxy re-encryption (see the
upstream backlog item for references). That is a substantively
different primitive from CMEK and would change the matrix more
deeply: rows about server-side processing (audit, analytics, type
validation, full-text search) would acquire new caveats because the
server can no longer read the data.

## Rows currently affected

| Scope | Row | Today | After server-side CMEK (if it ever shipped) | After E2E |
|---|---|---|---|---|
| gdpr | Art.32 | F: Infrastructure \| High | unchanged (operator-side encryption is already covered) | new caveats around audit/search semantics |
| hipaa-security | 164.312(a)(2)(iv) | Configurable \| Medium | could become Configurable \| High if CMEK ships | reframed entirely: encryption is the default |
| hipaa-breach | 164.402(2) | F: Infrastructure \| Medium | unchanged | safe-harbor coverage broadens |
| iso-27001 | A.8.24 | Implemented \| High | unchanged (TLS + at-rest secret encryption already shipped) | new mode: customer-key flow |
| ccpa | 1798.150 | F: Infrastructure \| Medium | unchanged | §1798.150 trigger zone narrows further |
| pipeda | Principle.4.7 | F: Infrastructure \| High | unchanged | reframed |

## What this proposal does not propose

- Application-layer CMEK on top of the existing storage engines.
  Per user direction, this is left to the infrastructure provider
  (LUKS, TDE, KMS-wrapped backup archives).
- Field-level encryption inside event content. That is application-
  layer concern (the implementer encrypts sensitive fields in
  `event.content` before write). Pryv stores ciphertext as ordinary
  string content.
- Server-side decryption-by-key-rotation primitives. Out of scope
  today; in scope for the future E2E direction.

## Action items (defer until E2E ships)

1. When `_plans/XXX-Backlog/E2E-ENCRYPTION.md` advances to a concrete
   feature (proxy re-encryption working POC + integration into the
   API path), revisit each affected row.
2. Add an `e2e-encryption` primitive to `docs/pryv-primitives.md`
   when shipped.
3. Note new audit / search / analytics caveats per affected row,
   since server-side reads of plaintext become impossible.

## Related

- Upstream backlog: `_plans/XXX-Backlog/E2E-ENCRYPTION.md`
- Sibling proposal: `proposals/aliases-as-pseudonymization-primitive.md`
  (covers a different pseudonymization angle — username aliases).
- macroPryv `_plans/XXX-Backlog/CONTENT-INDEXING.md` (referenced in
  the E2E backlog as a paired concern; full-text search semantics
  under E2E need their own design).
