# who-has-access-to-my-data

A subject-facing mini-app that lists every access granted on a Pryv account
and lets the subject **revoke** any of them — the "as easy to withdraw as to
give" half of consent that the grant UI (app-web-auth3) doesn't cover.

## What it demonstrates

- **GDPR Art.7(3)** — withdrawal of consent must be as easy as giving it.
- **GDPR Art.15 / Art.30** — the subject can see who/what has access and the
  scope each access was granted.
- **HIPAA-Privacy 164.508**, **Swiss nLPD Art.6** — authorisation/consent
  withdrawal.

The flow: the subject signs in with a personal API endpoint → the app calls
`accesses.get` and renders a table (name, type, scope/permissions, created,
lastUsed) → a per-row **Revoke** button calls `accesses.delete` → after a
successful delete the app reads back the audit trail (`events.get` on the
`:_audit:` streams) and shows the logged action, proving the withdrawal was
recorded.

## Honest limitations (shown in the UI)

- Revoking an access does **not** currently cascade to webhooks created by
  that access (see the `WEBHOOK-CASCADE-ON-ACCESS-DELETE` work — shipped
  2026-05-27 on open-pryv.io `e009ac9`; older deployments may lack it). The
  app surfaces this caveat rather than hiding it.
- This is a reference demonstrator, not a production app: no error-recovery
  polish, no i18n.

## Run

```bash
npm install
npm run dev      # served via backloop.dev (HTTPS) — never bare localhost
```

Sign in by pasting a **personal** API endpoint of the form
`https://<token>@<username>.pryv.me` (a personal token can revoke any access).

## Backed matrix rows

`gdpr.Art.7`, `gdpr.Art.15`, `gdpr.Art.30`, `hipaa-privacy.164.508`,
`swiss-nlpd.Art.6`.

## Implementation references (open-pryv.io)

- `components/api-server/src/methods/accesses.ts` — delete handler + cache/
  pubsub cascade.
- `components/business/src/accesses/AccessLogic.ts` — `canDeleteAccess`
  (personal token revokes any).
- `components/audit/src/ApiMethods.ts` — `accesses.delete` is audited.
