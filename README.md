# compliance-matrix

The compliance & regulation matrix for **[open-pryv.io](https://github.com/pryv/open-pryv.io)**.

For each regulation, standard or certification an implementer must comply with,
this repository documents:

- **what** open-pryv.io implements out of the box,
- **what** it makes configurable,
- **what** it facilitates (but still requires implementer work),
- **what** it documents as guidance,
- **what** is fully out of scope (the implementer's own organizational work).

Companion to: [Pryv's QMS + an implementer QMS template](./qms/).

## Scopes covered

| Type | Scopes |
|------|--------|
| Regulations | GDPR, HIPAA-Security, HIPAA-Privacy, HIPAA-Breach, Swiss nLPD, CCPA, DiGA, MDR |
| Standards | ISO/IEC 27001, ISO/IEC 27701, ISO 13485 *(curated)* |
| Hosting certification | HDS |

See [scopes/](./scopes/) for the matrix data and [references/](./references/)
for the canonical regulation sources.

## Repository layout

```
schemas/        JSON Schema for scope + requirement records
scopes/         The matrix data — one YAML per scope
references/     Canonical regulation references (URLs, version pins, license notes)
scripts/        build.js (YAML → SQLite), validate.js (CI checks)
wab/            The Web App — React 19 + Vite 5 + Tailwind 4 + TypeScript
qms/            QMS docs — Pryv's own + implementer template
docs/           How to add a scope, glossary, contribution guide
dist/           Build output (gitignored): compliance.sqlite + wab build
```

## Coverage taxonomy

Every `(scope, requirement)` cell carries one of:

- `implemented` — control shipped in default open-pryv.io build
- `configurable` — available with specific config keys (cited per row)
- `facilitated` — feature reduces implementer work; implementer does the rest
- `documented` — guidance only; implementer implements themselves
- `out-of-scope` — organizational/process responsibility, not software

**Tests are the proof.** Every `implemented`/`configurable` row must cite a
test code from the open-pryv.io test suite.

## Working with this repo

```sh
npm install            # root deps for build + validate
npm run validate       # schema + cross-reference checks
npm run build          # YAML → dist/compliance.sqlite
cd wab && npm install && npm run dev   # WAB locally (via backloop.dev)
```

## Status

**Planning + Phase A+B in progress.** See macroPryv Plan 71 for the full plan.

## License

[BSD-3-Clause](./LICENSE) — same as open-pryv.io.

Regulation reference materials are NOT covered by this license; they remain
the property of their respective authors (EU institutions, US federal
government, ISO, AFNOR, etc.). See per-scope notes in [references/](./references/).
