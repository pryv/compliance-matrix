# samples/

Small standalone web applications that demonstrate a compliance-relevant
flow end-to-end. Cited from scope YAML rows via `sample_apps:`.

Sample apps fill the gap where automated tests + functional specs can't
carry the user-experience evidence — auditors and compliance reviewers
want to *see* the flow working, not read the API contract.

## When to write a sample

Write a sample when a coverage claim depends on a user-facing flow that:

- Combines several primitives (e.g., access + clientData + audit).
- Has a temporal / interactive element (consent presentation → grant →
  later revoke).
- Needs to be demonstrable without a full test harness or a deployed
  customer app.

## Examples to build (proposals)

- `get-a-copy-of-my-data/` — GDPR Art.15 + Art.20: data subject logs in,
  app fetches all events + streams + attachments, downloads as a ZIP.
- `who-has-access-to-my-data/` — GDPR Art.30 + Art.15: data subject sees
  the list of accesses (current head + history), what scope each granted,
  when last used, with revoke buttons.
- `consent-presented-and-versioned/` — GDPR Art.7 + Art.12: app presents
  consent text, user grants, app shows the access with the consent text in
  clientData and the access version number. Subject can later see the same
  text + the version chain after a scope-update.
- `cross-account-share/` — GDPR Art.7 + Art.30 with CMC: user A initiates
  a sharing request to user B (possibly cross-platform); B accepts; both
  see the access pair + the `consent/request-cmc` + `consent/accept-cmc`
  events.

## Layout

```
samples/
  <slug>/
    README.md           # what flow this demonstrates + which scope rows it backs
    package.json
    src/                # standalone React + Vite + Tailwind 4 mini-app
    public/
```

Each sample is self-contained — its own `package.json`, `vite.config.ts`,
deps. The compliance-matrix root `package.json` does NOT include them in
its install graph (operator-side build only).

## Citation example

```yaml
# in scopes/gdpr.yml
- ref: Art.15
  coverage: implemented
  pryv_primitives: [access, stream, event, audit]
  tests: [AA01, EGSQ, U9HQ]
  sample_apps: [get-a-copy-of-my-data]
  notes: |
    The sample app demonstrates the full subject-side flow including the
    supplementary metadata (purposes from clientData) presentation.
```

## Validation

`scripts/validate.js` checks that every `sample_apps:` local path resolves
to either `samples/<slug>/` or `<slug>/` at repo root. External URLs
(http://, https://) are allowed without further check.
