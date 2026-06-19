# scheduled-retention-job

A reference **backend** job that enforces data-retention rules against a Pryv
deployment — the operator-owned half of storage limitation. Pryv ships the
composable primitives (`events.get?toTime=<cutoff>`, two-stage
`events.delete`, `streams.delete`, `auth.delete`, the audit-log inactivity
oracle); the scheduler, the rule language and any legal-hold overrides are the
operator's. This sample is the recipe.

## What it demonstrates

- **GDPR Art.5(1)(e)** storage limitation + **Art.17** erasure on a schedule.
- **PIPEDA Principle 4.5**, **ISO 27701 A.7.4.5**, **HIPAA-Privacy
  164.530(j)** retention/disposal.

It is a Node script (not a web app) because retention is a scheduled backend
task — the topology should reflect that.

## Run

```bash
npm install
node src/retention.js --rules retention.yml            # dry-run by default
node src/retention.js --rules retention.yml --apply     # actually delete
```

Provide the deployment endpoint + credentials via env:

```bash
export PRYV_API_ENDPOINT="https://<token>@<username>.pryv.me"   # cross-user personal token
# or admin-key flows for account-level operations (see retention.yml)
```

## Rule language

See [`retention.yml`](./retention.yml). Each rule targets a stream class with
a `max_age` and an action (`trash` → `delete`). Intentionally minimal — no
boolean composition, no per-rule rollback. The summary (deleted count,
elapsed, errors per rule) is printed to stdout and can be piped to your
observability sink.

## Deployment wrappers

- [`deploy/systemd-timer/`](./deploy/systemd-timer/) — `.service` + `.timer`.
- [`deploy/kubernetes/`](./deploy/kubernetes/) — a `CronJob`.
- [`deploy/github-actions/`](./deploy/github-actions/) — a scheduled workflow.

## Honest limitations (also printed by the script)

- **Legal-hold opt-out is not implemented** — excluding held records is the
  operator's responsibility.
- **No atomic rollback** on partial failure — monitor the summary + alert.
- **High-frequency series** attached to deleted events need a separate
  `DELETE /events/<id>/series` call — out of scope for this minimal sample.
- Audit rows for deletions survive per your `audit.onUserDelete` setting; with
  PostgreSQL baseStorage, historical backups may still contain deleted data
  until rotated.

## Backed matrix rows

`gdpr.Art.5`, `gdpr.Art.17`, `pipeda.Principle.4.5`, `iso-27701.A.7.4.5`,
`hipaa-privacy.164.530(j)`.
