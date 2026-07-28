# compliance-matrix

The compliance & regulation matrix for **Pryv** (the deployed running
platform; software project: [open-pryv.io](https://github.com/pryv/open-pryv.io)).

**Audience: the implementer.** If you're building on Pryv, every row tells
you what the platform does for you and what's still on your plate:

- **what** Pryv implements out of the box,
- **what** it makes configurable,
- **what** it facilitates (but you still do part of the work),
- **what** it documents as guidance,
- **what** is genuinely out of scope (no software contribution, no implementer
  obligation from this row alone).

Companion: [Pryv's QMS + an implementer QMS template](./qms/) for the
organizational side.

## Scopes covered

| Type | Scopes |
|------|--------|
| Regulations | GDPR, HIPAA-Security, HIPAA-Privacy, HIPAA-Breach, Swiss nLPD, CCPA, DiGA, MDR |
| Standards | ISO/IEC 27001, ISO/IEC 27701, ISO 13485 *(curated)*, SOC 2 (AICPA Trust Services Criteria) |
| Hosting certification | HDS |

See [scopes/](./scopes/) for the matrix data and [references/](./references/)
for the canonical regulation sources.

## Repository layout

```
schemas/        JSON Schema for scope + requirement records
scopes/         The matrix data, one YAML per scope
references/     Canonical regulation references (URLs, version pins, license notes)
scripts/        build.js (YAML → SQLite), validate.js (CI checks)
wab/            The Web App, React 19 + Vite 5 + Tailwind 4 + TypeScript
qms/            QMS docs, Pryv's own + implementer template
docs/           How to add a scope, glossary, contribution guide
dist/           Build output (gitignored): compliance.sqlite + wab build
```

## Coverage taxonomy

Every `(scope, requirement)` cell carries one of:

- `implemented`: control shipped out of the box; works with no config
- `configurable`: available when you set specific config keys (cited per row)
- `facilitated`: Pryv reduces your work; you still do part
- `documented`: guidance only; you implement yourself following the doc
- `out-of-scope`: no software contribution AND no implementer obligation from
  this row (rare, most articles imply something for you even when Pryv
  itself doesn't touch them)

**Tests are the proof.** Every `implemented`/`configurable` row cites a test
code from the open-pryv.io test suite, CI checks every cited code resolves.

## Working with this repo

```sh
npm install            # root deps for build + validate
npm run validate       # schema + cross-reference checks
npm run build          # YAML → dist/compliance.sqlite
cd wab && npm install && npm run dev   # WAB locally (via backloop.dev)
```

## Status

**Early, schema + foundation in place, GDPR first draft published.** All
coverage rows are marked `draft: true` until reviewed. See `scopes/*.yml`
for current state and the GitHub Actions `validate` workflow for what CI
checks per change.

## "Pryv" vs "open-pryv.io"

Two distinct things:

- **Pryv**: the deployed running platform; what your subjects' apps talk to.
  Used in all matrix prose ("Pryv stores events").
- **open-pryv.io**: the upstream software project / source code / version.
  Used only for code-path or version references ("open-pryv.io 2.0.0-pre.3",
  "open-pryv.io/components/cmc/").

## License

[BSD-3-Clause](./LICENSE): same as open-pryv.io.

Regulation reference materials are NOT covered by this license; they remain
the property of their respective authors (EU institutions, US federal
government, ISO, AFNOR, etc.). See per-scope notes in [references/](./references/).
