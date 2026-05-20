# pryv-account-backup — DSAR coverage matrix

**Status:** implementer reference + audit of `pryv-account-backup`
v0.2.3 (`@pryv/account-backup`) against GDPR Art.15 / Art.20, CCPA
§1798.110 / §1798.115, PIPEDA Principle 4.9, and Swiss nLPD Art.25.
Recorded from the gap-probing session (Q10, 2026-05-20).

## TL;DR

`pryv-account-backup` is the right tool to point a subject at when
they file a DSAR — **but the bundle it produces today is missing
audit log + HF series data points + webhooks**. Implementers should
either patch the gaps locally or warn subjects that the export is
partial. Backlog tracks the fix:
`_plans/XXX-Backlog/ACCOUNT-BACKUP-DSAR-COMPLETENESS.md`.

## Per-data-type coverage (v2 deployments)

| Pryv data type | In backup today | Notes |
|---|---|---|
| account info | ✅ via `/account` | username, email, language, system-streams account-tree |
| public profile | ✅ via `/profile/public` | |
| private profile | ✅ via `/profile/private` | |
| per-app profile (app `clientData`) | ✅ via `/profile/app` per app token | re-authenticates with each app access token |
| streams tree | ✅ via `/streams` | including trashed when `?state=all` |
| events (standard) | ✅ via `/events?fromTime=<MIN>&toTime=<MAX>` | single-shot fetch — won't scale to GB datasets |
| event attachments | ✅ opt-in, via `GET /events/<id>/<attId>?readToken=...` | streamed binary |
| accesses (current) | ✅ via `/accesses` | |
| access version history | ❌ **gap** | Plan 66 access versioning not exported |
| CMC counterparty metadata | ⚠️ likely partial | needs verification — counterparty `apiEndpoint` may not surface |
| HF series data points (`series:*`) | ❌ **gap** | series-event containers ARE in events.json but data points (`GET /events/<id>/series`) not fetched |
| webhooks | ❌ **gap** | `/webhooks` not in resource list |
| audit log | ❌ **gap** | `/audit/logs` not in resource list — Art.15(1)(c) disclosure history missing |
| followed-slices | ⚠️ legacy | requested as `/followed-slices`; resource removed in v2 (Plan 07) → 404 |
| MFA enrolment metadata | ❌ borderline | secret correctly out of scope; "MFA enabled / method / since" status worth documenting |

## Restore-side coverage (Art.20 portability — the round-trip)

`src/restore.js` re-uploads from a backup folder via the standard
write APIs. Two known data-loss points:

- **HF series data**: a `series:*`-typed event is re-created as the
  empty container; the data points themselves are not re-uploaded.
- **Multi-attachment events**: the script explicitly logs
  "Ignored 2nd attachment for event" and discards every attachment
  after the first.

Implication: a subject who runs `pryv-account-backup` today, then
imports the result into a different Pryv account (the Art.20
"transmit to another controller" promise), **loses any HF history
and any event with more than one attachment**.

## Map to Art.15(1) sub-paragraphs

| Sub-paragraph | Data piece | Pryv source | In backup? |
|---|---|---|---|
| (a) purposes | per-access `clientData.purpose` | `accesses.json` | ✅ |
| (b) categories of data | event `class/format` (data-types) | derivable from `events.json` | ✅ implicit |
| (c) recipients / disclosures | audit log (who accessed what when) + accesses + webhooks | `/audit/logs` + `/accesses` + `/webhooks` | ⚠️ accesses only; audit + webhooks missing |
| (d) retention period | per-access `clientData.retention` + `access.expires` | `accesses.json` | ✅ |
| (e) rectification / erasure rights | nothing to export — these are operator obligations | n/a | ✅ (out of scope for export) |
| (f) right to lodge complaint | nothing to export | n/a | ✅ (out of scope) |
| (g) source of data | event `createdBy` + audit + clientData | derivable from `events.json` + `/audit/logs` | ⚠️ audit missing |
| (h) automated decision-making | nothing native to Pryv | application layer | ✅ (out of scope) |

## Map to Art.20 (data portability)

- "structured, commonly used, machine-readable format" — JSON
  + binary attachments + canonical event types ✅
- "right to transmit to another controller" — restore-side
  experimental support ⚠️ (HF + multi-attach loss).

## Operational guidance for implementers today (while gaps are open)

If you must answer a DSAR before the backlog ships:

1. Run `pryv-account-backup` with `--includeTrashed --includeAttachments`.
2. **Augment with manual `/audit/logs` fetch** — use any HTTP client
   with the subject's personal token + `GET <apiEndpoint>/audit/logs`.
3. **Augment with manual HFS fetch** for each `series:*` event —
   `GET <apiEndpoint>/events/<eventId>/series` per series.
4. **Augment with manual `/webhooks` fetch.**
5. Combine the four JSON files + the original backup folder.
6. Hand the subject the combined bundle + a README pointing at
   `data-types` schemas for field semantics.

The matrix's `Implemented | High` claim on Art.15 / Art.20 stands
because all the data IS exportable via existing API endpoints —
the gap is in the tooling completeness, not the API surface.

## Related

- Upstream backlog:
  `_plans/XXX-Backlog/ACCOUNT-BACKUP-DSAR-COMPLETENESS.md`
- Proposal mirror:
  `proposals/account-backup-dsar-completeness.md`
- Audit erasure modes intersect:
  `proposals/audit-on-user-delete.md` (`keep` mode means more audit
  rows to export; `pseudonymise` mode means the exported audit
  carries alias not identifier).
- Audit no-content guarantee:
  `docs/pryv-primitives.md` (audit entry) — audit-in-DSAR is
  data-minimal by construction; safe to include.
