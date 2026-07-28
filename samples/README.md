# samples/

Small standalone web applications that demonstrate a compliance-relevant
flow end-to-end. Cited from scope YAML rows via `sample_apps:`.

Sample apps fill the gap where automated tests + functional specs can't
carry the user-experience evidence, auditors and compliance reviewers
want to *see* the flow working, not read the API contract.

## When to write a sample

Write a sample when a coverage claim depends on an implementer-side / user-
facing flow that:

- Combines several Pryv primitives (e.g., access + clientData + audit).
- Has a temporal / interactive element (consent presentation → grant →
  later revoke).
- Needs to be demonstrable to an auditor without a full test harness or a
  deployed customer app.

## Built

- [`who-has-access-to-my-data/`](./who-has-access-to-my-data/): list + revoke
  accesses (GDPR Art.7(3)/15/30). React + Vite + Tailwind.
- [`scheduled-retention-job/`](./scheduled-retention-job/): operator-owned
  retention enforcement (GDPR Art.5(1)(e)/17). Node script + systemd/k8s/
  github-actions wrappers.
- [`cross-account-share/`](./cross-account-share/): CMC controller-to-
  controller sharing (GDPR Art.6/7/20/30). Two-pane React app.

## Examples to build (proposals)

- `get-a-copy-of-my-data/`: GDPR Art.15 + Art.20: data subject downloads a
  copy of their data. **Deferred**, covered by the shipped
  `pryv-account-backup-webapp`.
- `consent-presented-and-versioned/`: GDPR Art.7 + Art.12: app presents
  consent text, user grants, app shows the access with the consent text in
  clientData and the access version number. **Deferred.**
- `deployment-verification-runbook/`: GDPR Art.32(1)(d): operator-run
  verify-my-deployment package. **Deferred**, overlaps the internal
  deploy-validation matrix.

## Layout

```
samples/
  <slug>/
    README.md           # what flow this demonstrates + which scope rows it backs
    package.json
    src/                # standalone React + Vite + Tailwind 4 mini-app
    public/
```

Each sample is self-contained, its own `package.json`, `vite.config.ts`,
deps. The compliance-matrix root `package.json` does NOT include them in
its install graph (operator-side build only).

## Citation example

```yaml
# in scopes/gdpr.yml
- ref: Art.15
  coverage: implemented
  pryv_primitives: [access, stream, event, audit]
  tests: [AA01, EGSQ, UZEV]
  sample_apps: [get-a-copy-of-my-data]
  notes: |
    The sample app demonstrates the full subject-side flow including the
    supplementary metadata (purposes from clientData) presentation.
```

## Validation

`scripts/validate.js` checks that every `sample_apps:` local path resolves
to either `samples/<slug>/` or `<slug>/` at repo root. External URLs
(http://, https://) are allowed without further check.
