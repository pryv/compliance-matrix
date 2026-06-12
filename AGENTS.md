# AGENTS.md

Welcome, agent. Fast orientation for this repo. Read this first, `README.md` for depth.

## What this repo is

`compliance-matrix` maps **regulations and standards** (GDPR, HIPAA, nLPD, CCPA, DiGA, MDR, ISO 27001/27701/13485, HDS, …) onto what **Pryv** — the deployed platform built from [open-pryv.io](https://github.com/pryv/open-pryv.io) — actually does about each requirement. Audience: the **implementer** building on Pryv: each row says what the platform handles, what is configurable, what it merely facilitates or documents, and what stays on the implementer's plate.

This is **data + proof, not prose**: the matrix lives in YAML (`scopes/*.yml`), is validated against JSON Schemas, builds into SQLite, and every `implemented`/`configurable` claim cites a test code from the open-pryv.io test suite (CI checks the codes resolve).

## Quick repo map

```
scopes/         THE MATRIX — one YAML per scope (gdpr.yml, hipaa-security.yml, …)
schemas/        JSON Schemas for scope + requirement records (the row format contract)
references/     Canonical regulation sources (URLs, version pins)
proposals/      One file per planned/considered improvement — the evidence chain of
                why a row claims what it claims and what would upgrade it
docs/           Methodology: coverage taxonomy, effort axis, facilitation typology,
                glossary, how-to-add-a-scope, implementer FAQ, pryv-primitives
qms/            QMS documents (Pryv's own + implementer template)
scripts/        build.js (YAML → dist/compliance.sqlite), validate.js (CI gate)
wab/            Web app to browse the matrix (React + Vite)
UPDATE-TRIGGERS.md   Reverse index: shipped-code triggers → matrix rows to refresh
```

## Commands

```bash
npm install
npm run validate      # schema + cross-reference checks (run before any commit)
npm run build         # → dist/compliance.sqlite
npm run build:all     # validate + build
npm test              # script unit tests
```

## The update contract — this is why you're probably here

The matrix is only trustworthy if it tracks shipped reality. Two directions:

1. **You shipped code on a Pryv repo** (open-pryv.io, lib-js, …) → open [`UPDATE-TRIGGERS.md`](./UPDATE-TRIGGERS.md) and grep it for your feature, touched paths, or proposal slug. If your work appears (or plausibly affects ACL, audit, schema, primitives), update the cited rows: remove stale `planned:` chips, promote coverage, cite your new test codes. Commit the matrix update in lockstep with your PR.
2. **You edit the matrix** → every claim change needs its proof updated: `tests:` entries must cite real test codes, `proposals/<slug>.md` must reflect status, and `npm run validate` must pass.

If your shipped work is matrix-relevant but not listed in UPDATE-TRIGGERS.md, **add the trigger entry first**, then update the rows.

## Editing rules

- Row semantics (coverage levels `implemented | configurable | facilitated | documented | out-of-scope`, effort axis, facilitation modes) are defined in `docs/` — read `docs/effort-axis.md` and `docs/facilitation-typology.md` before assigning values; don't invent new enum values (the schema will reject them anyway).
- A claim without a citation is a regression: `implemented`/`configurable` rows cite test codes; `documented` rows cite the doc URL.
- `proposals/` files are append-style history — update statuses, don't rewrite past reasoning.
- One scope per YAML file; new scopes follow `docs/how-to-add-a-scope.md`.

## Where to file issues / PRs

- Matrix errors, missing scopes, disputed claims: [`pryv/open-pryv.io` GitHub Issues](https://github.com/pryv/open-pryv.io/issues) — single tracker for the Pryv ecosystem; maintainers route internally.
- PRs against `master`; `npm run validate` is the merge gate.

## When in doubt

- The schema files in `schemas/` are the authoritative row format — more current than any prose description.
- Where the matrix and the open-pryv.io codebase disagree, the codebase wins; fix the matrix and say so in the commit message.
