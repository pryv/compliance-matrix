# Proposal: audit-log erasure on user account delete (engine-consistency fix + operator setting)

**Status:** **bug fix queued** + future setting. Mirror of the upstream
backlog item (filed 2026-05-20 from the compliance-matrix
implementer-perspective gap-probing session — Q8 on right-to-erasure
end-to-end including the audit log itself).

## Today's posture (engine-dependent — undocumented gap)

The `auth.delete` API method (the GDPR Art.17 erasure primitive)
should produce a consistent end-state regardless of audit storage
engine. Today it does not.

The `auth.delete` pipeline runs:

```
checkIfAuthorized → validateUserExists → validateUserFilepaths
→ deleteUserFiles → deleteHFData → deleteAuditData → deleteUser
```

The `deleteAuditData` step calls `userLocalDirectory.deleteUserDirectory`
which removes the per-user filesystem directory wholesale. That happens
to wipe SQLite audit (the per-user `.sqlite` file lives there), but
does **nothing** for PostgreSQL audit (rows in the shared `audit_events`
table keyed by `user_id`).

| Audit engine | Storage layout | Outcome of `auth.delete` |
|---|---|---|
| SQLite | per-user file under user directory | wiped ✅ |
| PostgreSQL | shared `audit_events` table | **not touched** ⚠️ |

`AuditStoragePG.deleteUser(userId)` exists (it runs
`DELETE FROM audit_events WHERE user_id = $1`) but is only wired into
the backup-restore preflight, not the user-delete pipeline. The
implementer sees this row claim "configurable end-to-end erasure"; on
a PG deployment, audit rows referencing the deleted subject silently
survive.

## Direction when shipped

Two parts, shipped together:

### 1. Consistency fix (the bug)

Add `deleteAuditDataStorage` as its own explicit middleware in
`auth.delete`, calling `auditStorage.deleteUser(userId)`. Removes the
implicit "wipe via filesystem directory" coupling that papered over
the PG gap. Both engines now converge.

### 2. Operator setting `audit.onUserDelete`

```yaml
audit:
  onUserDelete: erase | keep | pseudonymise   # default: erase
```

- **`erase`** (default) — runs `auditStorage.deleteUser(userId)`.
  Matches today's effective SQLite behaviour + the GDPR/CCPA/PIPEDA
  default. The implementer-friendly default.

- **`keep`** — skips the call. Retains every audit row referencing
  the deleted user. Use case: HIPAA §164.316(b)(2)(i) (6-year audit
  retention regardless of subject erasure), MDR Art.10(8) (10-year
  device-history record retention), or any regime where the audit
  is kept under a separate lawful basis (GDPR Art.17(3)(b) —
  "compliance with a legal obligation"). The implementer must
  document the retention in their DPIA.

- **`pseudonymise`** — null/hash the personal identifiers in audit
  rows (`accessId`, `userId`, params containing personal data),
  keeping the access-pattern + timestamps + action verbs. The
  audit row no longer qualifies as personal data under GDPR; the
  operator retains forensic value. **Composes with the
  `randomAlias` primitive** (see
  `proposals/aliases-as-pseudonymization-primitive.md`): an alias-
  issuing deployment never stores the canonical identifier in the
  audit row, so erasure of the user removes the only PII handle
  with no audit rewriting required.

## Affected matrix rows (today's framing → after shipping)

| Scope | Row | Today | After shipping |
|---|---|---|---|
| gdpr | Art.17 | Configurable \| Medium (engine-dependent, undocumented gap) | Configurable \| High (one consistent knob across engines) |
| gdpr | Art.5(1)(c) data minimisation | F: Storage \| Medium | F: Storage \| Medium (better post-erasure residual-data story) |
| ccpa | §1798.105 | Configurable \| Medium | Configurable \| High |
| swiss-nlpd | Art.32 | Implemented \| High | unchanged (note the consistency fix) |
| pipeda | Principle.4.5 | Configurable \| Medium | Configurable \| High |
| hipaa-security | §164.316(b)(2)(i) 6-year audit retention | F: Storage \| Low | F: Storage \| Medium (the `keep` mode is the HIPAA-friendly path) |

## Rows updated alongside this proposal

The engine-dependent gap should be surfaced today in the `detail` of
the GDPR Art.17 row + the rows that `derives_from gdpr.Art.17` (CCPA
§1798.105, Swiss nLPD Art.32, PIPEDA Principle 4.5) — so an
implementer reading the matrix learns about it without having to read
the source.

- `gdpr.Art.17` — `detail` extended with the per-engine truth-table
  + planned consistency fix + operator setting.
- `hipaa-security.164.316(b)(2)(i)` — `detail` extended to flag
  that the planned `audit.onUserDelete: keep` mode is the
  HIPAA-friendly path.

## Related

- Upstream backlog: `_plans/XXX-Backlog/AUDIT-ON-USER-DELETE.md`
- Sibling proposal:
  `proposals/aliases-as-pseudonymization-primitive.md`
  (the `randomAlias` primitive is the natural building block for
  the `pseudonymise` mode).
- Sibling proposal: `proposals/audit-log-chaining.md` (different
  concern — tamper-resistance vs erasure — but the chain design
  must accommodate post-hoc row deletion / pseudonymisation; e.g.,
  "tombstone" rows that preserve chain continuity while removing
  personal data).
