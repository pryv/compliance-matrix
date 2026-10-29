# scheduled-retention-job

A reference **backend** job that enforces data-retention rules against a Pryv
deployment, the operator-owned half of storage limitation. Pryv ships the
composable primitives (`events.get?toTime=<cutoff>`, two-stage
`events.delete`, `streams.delete`, `auth.delete`, the audit-log inactivity
oracle); the scheduler, the rule language and any legal-hold overrides are the
operator's. This sample is the recipe.

## What it demonstrates

- **GDPR Art.5(1)(e)** storage limitation + **Art.17** erasure on a schedule.
- **PIPEDA Principle 4.5**, **ISO 27701 A.7.4.5**, **HIPAA-Security
  164.316(b)(2)(i)** retention/disposal.

It is a Node script (not a web app) because retention is a scheduled backend
task, the topology should reflect that.

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
a `max_age` and an action (`trash` → `delete`). Intentionally minimal, no
boolean composition, no per-rule rollback. The summary (deleted count,
elapsed, errors per rule) is printed to stdout and can be piped to your
observability sink.

## Account-level retention: not here

This job works on events inside accounts. It never deletes an account.

- **Releases with account auto-deletion** (planned for the next open-pryv.io
  release; implemented on a feature branch, not yet released): use the built-in
  feature for inactive accounts. Set an inactivity preset in
  `account.autoDeletion.inactivity.defaultDays` and run it with `dryRun: true`
  first. The core then sends the reminder mails, holds a minimum notice and runs
  the deletion guards and teardowns of `auth.delete`. State the preset in your
  privacy notice. See `context/data-retention-operator-owned.md`, "Account-level
  auto-deletion".
- **Earlier releases:** account-level deletion stays your own job, built on an
  inactivity measure you have reviewed (the context note's audit-log oracle
  pattern). Wire `auth.delete` to your admin-key flow only after that review,
  and send your own notices before deleting.

## Deployment wrappers

- [`deploy/systemd-timer/`](./deploy/systemd-timer/): `.service` + `.timer`.
- [`deploy/kubernetes/`](./deploy/kubernetes/): a `CronJob`.
- [`deploy/github-actions/`](./deploy/github-actions/): a scheduled workflow.

## Honest limitations (also printed by the script)

- **Legal-hold opt-out is not implemented**: excluding held records is the
  operator's responsibility.
- **No atomic rollback** on partial failure, monitor the summary + alert.
- **High-frequency series** attached to deleted events need a separate
  `DELETE /events/<id>/series` call, out of scope for this minimal sample.
- Audit rows for deletions survive per your `audit.onUserDelete` setting; with
  PostgreSQL baseStorage, historical backups may still contain deleted data
  until rotated.

## Backed matrix rows

`gdpr.Art.5`, `gdpr.Art.17`, `pipeda.Principle.4.5`, `iso-27701.A.7.4.5`,
`hipaa-security.164.316(b)(2)(i)`.
