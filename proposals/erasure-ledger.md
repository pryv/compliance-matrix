# Proposal: erasure ledger (durable proof of account erasure)

**Status: shipped in open-pryv.io `83e14c94`** (the merge to master, after
an independent review whose fixes it includes; it ships in
the release after open-pryv.io 2.0.0-rc.87, not tagged at the walk: name the
tag here once it is cut). Requested by an operator in
https://github.com/pryv/open-pryv.io/issues/154; earlier recorded as out of
scope of the first account auto-deletion release
(`proposals/account-auto-deletion.md`, backlog `COMPLIANCE-ERASURE-LEDGER`).
Rows walked 2026-11-21 (`UPDATE-TRIGGERS.md` Section A `ERASURE-LEDGER` and
Section B.11). No `planned:` chip was queued for it, so none is discharged.

## The gap it closes

Before this release, an account erasure left two traces: WARN log lines
before and after it, and, while it ran, a per-core "record of the erasure in
progress" (`account_erasures` on PostgreSQL, `account-erasures.db` on
SQLite) that makes an interrupted erasure resumable and is removed when the
erasure ends. Once the account was gone the platform held nothing that let
the operator answer "was this account erased, and when?" except its own log
retention. Two consequences:

- **Accountability (GDPR Art.5 §2, Art.17).** The proof that an erasure
  request was honoured lived in log files the operator had to keep and
  search, holding the username in clear.
- **Restores.** A restore of a backup taken before an erasure brought the
  erased account back without notice; nothing told the operator that the
  account had been erased since.

## What shipped

- **One durable record per erased account**, written by a new last step of
  the erasure (`writeErasureLedger`, after the high-frequency series are
  dropped again and before the record of the erasure in progress is
  closed), for every erasure path: the holder's or the admin's
  `DELETE /users/:username`, the account auto-deletion (`date`,
  `inactivity`, `transfer-fallback`), the unfinished-registration reconcile,
  and the ledger replay. Stored in the platform database (key
  `account-erasure/<userIdHash>`, replicated to every core).
- **No personal content.** The record names the account only by keyed
  hashes (HMAC-SHA256) of its user id and of its lowercased username, plus
  when the erasure started and ended, its `trigger`, the core, the steps
  done, the `audit.onUserDelete` mode, the attempts and the server version.
  No username, email, address, access id or account data `[ERLG4]`. The
  access id of the caller, asked for in the issue, is left out: the id of an
  erased access proves nothing and adds a link.
- **Not written** for the rollback of a failed account creation (trigger
  `system`) `[ERLG5]`, an account transfer, or a registration-only removal
  (`onlyReg=true`): none of them erases an account. An unfinished erasure
  recorded by an earlier version without a trigger gets the trigger
  `unknown` when completed `[ERLG9]`. A later erasure of the same id
  replaces the record: after a restore marked it restored, as a new record
  `[ERLG7]`; otherwise (an account a storage restore brought back, erased
  again by the replay) keeping the first erasure's date and trigger in
  `firstDeletedAt` / `firstTrigger` `[ERLT3]`.
- **A record that cannot be written fails the erasure**: the data is gone,
  the call answers an error, and the account auto-deletion sweep completes
  the erasure (this step only) at its next pass once the erasure has been
  idle 15 minutes (passes every 6 hours by default), writing the record
  once `[ERLG6]`. An erasure never looks finished without its proof.
- **One log line per record** (`account erased`, with `userIdHash`,
  `trigger`, `coreId`), so a log shipper keeps a second copy.
- **Admin routes** (admin key, any core answers): `GET /system/admin/erasures`
  (`since`, `limit` 1 to 1000, `after` cursor; method `system.erasures.list`)
  and `POST /system/admin/erasures/lookup` with `userId` or `username`
  (method `system.erasures.get`; a POST so the identifier stays out of URLs
  and access logs; the name matched is the one held when erased, not its
  aliases) `[ERLA1]`..`[ERLA5]`. The lookup also answers `keyId` and
  `otherKeyRecords`, the count of records under another key that no lookup
  can match: when it is not 0, `erased: false` is not a proof `[ERLA6]`.
  Any core answers for an erasure made on another `[2CEL1]`. Both methods
  are audited without a user (syslog). There is no delete route: records
  leave only by retention. A forwarder polling with `since` must overlap
  its windows: a record can arrive after later ones were listed (merged
  from a backup, a lagging core clock, an erasure completed by a later
  sweep pass).
- **Configuration** (platform-wide): `accountErasure.ledger.enabled`
  (default `true`) `[ERLG8]`; `accountErasure.ledger.retentionDays` (default
  1825, five years; `0` keeps the records forever; under 365 gets a boot
  warning) `[ERLT4]`, `[ERLT5]`; `accountErasure.ledger.hmacKey` (base64 of
  32 bytes; empty: derived from `auth.adminAccessKey`).
  - **Retention is the shortest one set on any core**: every core's sweep
    purges the shared ledger with its own value. Keep it the same
    everywhere and at least as long as the longest backup retention: a
    record purged while a backup taken before its erasure still exists lets
    that backup bring the account back unnoticed.
  - **A key change disarms the ledger for the records written before it**,
    unless the old key is kept: those records stay listed (each carries a
    `keyId`) but no id or name matches them, so the lookup does not find
    them, a restore no longer refuses those accounts and the replay no
    longer finds them. With the derived key, rotating the admin key is such
    a change: set `hmacKey` first. Every core must use the same key. The
    restore, the lookup and the tool warn with the count of records under
    another key. Destroying the key makes the records anonymous.
- **Restores check the ledger (behaviour change of `bin/backup.js
  --restore`).** An account erased after the backup's data of it was taken
  is not restored: the ledger records its erasure and no restore since
  `[ERLR1]`, `[ERLR3]`, or an erasure of it started on this core after the
  backup and stopped unfinished (a plain restore used to withdraw such an
  erasure) `[ERLR8]`. An account that still exists gets the usual
  `--overwrite` refusal first. A whole restore lists the erased accounts
  under "Erased after this backup" and restores the others (exit code 3
  when it restores nothing else); a `--user` restore of one fails naming
  the override. A restore that cannot build the ledger key fails closed,
  unless `--restore-erased` `[ERLR7]`. `--restore-erased` restores the
  account and stamps `restoredAt` on its record, which is kept (for an
  unfinished erasure the record is written, already marked restored)
  `[ERLR2]`, `[ERLR8]`; the stamp is set only once `--verify-integrity`, if
  given, kept the account: an account rolled back stays recorded as erased
  `[ERLR6]`. A stamp that fails is listed and the restore exits 4 (the
  replay would otherwise erase the account) `[ERLR9]`. A chain restore
  dates each account by the newest run that holds it `[ERLR5]`. A restore
  check on one core refuses an account erased on another `[2CEL1]`.
- **Platform backups carry the ledger**, and a restore merges it into the
  live one (absent rows written, a newer erasure kept, nothing removed), so
  a platform database rebuilt from a backup keeps the proof of earlier
  erasures `[ERLR4]`.
- **`bin/erasures.js`**: `--list [--since] [--limit]`, `--check <userId |
  username>`, and `--replay [--apply]` for a core whose storage was restored
  from a snapshot or a database dump taken before some erasures: it looks up
  every account of the core in the ledger, lists by id those recorded as
  erased and not restored since (dry run by default), and with `--apply`
  erases them again, with the trigger `ledger-replay`, the record keeping
  the first erasure's date and trigger `[ERLT1]`..`[ERLT3]`. The list is to
  be checked before `--apply`: an account restored by a restore that could
  not mark its record (exit 4) is in it.
- **Wording**: "erasure ledger" now names this durable record only; the
  per-core row kept while an erasure runs is "the record of the erasure in
  progress" (matrix rows reworded at this walk).

## Data-protection review of the record

- Both hashes are pseudonymous personal data (GDPR recital 26) while the key
  exists: the operator can re-identify by hashing a known id or name. That is
  the purpose (proof of erasure, Art.5 §2 and Art.17 §1); basis Art.6 §1(c)
  or (f), minimised, time-limited by `retentionDays`, readable with the admin
  key only.
- `coreId` is infrastructure data; with `deletedAt` it narrows a region, not
  a person. `trigger`, `auditMode`, the steps: no personal data. No health
  data, so no Art.9 processing.
- The operator's Art.30 record gets one line for it (the release notes say
  so). A username reused later only answers "an account of this name was
  erased at T".

## Rows updated

| Scope | Ref | What changed |
|---|---|---|
| gdpr | Art.5 | §2 accountability bullet: proof of erasure kept after the account is gone; §1(e) wording "record of the erasure in progress" |
| gdpr | Art.17 | new paragraph "Proof of erasure and restores" |
| gdpr | Art.30 | detail: the ledger is a processing of its own, one register line |
| iso-27001 | A.8.10 | new paragraph "Record of each deletion" |
| iso-27001 | A.8.13 | restore refusal of erased accounts, ledger in platform backups |
| hipaa-security | 164.316(b)(2)(i) | ledger retention against the six-year floor |
| ccpa | 1798.105 | overview: the ledger answers "was it deleted" |

Walked without change: the other erasure-family rows (they defer to
`gdpr.Art.17`), see `UPDATE-TRIGGERS.md`.

## Not in this release (later, only on an operator's go)

- **A push hook** to an external register (a webhook per erasure). The pull
  route with `since` and the cursor is the forwarding interface for now (a
  job on the operator's side), and the log line is a second copy.
- **A secondary key ordered by `deletedAt`**: listing reads the ledger
  prefix whole and orders it in memory, fine to about 100,000 records.
- **Washington My Health My Data Act**: it asks for proof of deletion too;
  the matrix has no MHMDA scope, so it is noted here only.
