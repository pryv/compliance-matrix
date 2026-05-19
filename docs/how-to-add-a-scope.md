# How to add a new scope

A "scope" is one regulation, standard, or certification. See
[glossary.md](./glossary.md).

## 1. Reference document

Create `references/<scope-id>/source.md` with the canonical URL, version,
license note, and a list of the requirements you intend to map. Use an
existing one as template (e.g., [`references/gdpr/source.md`](../references/gdpr/source.md)).

## 2. Scope YAML

Create `scopes/<scope-id>.yml`. The structure is validated by
[`schemas/scope.schema.json`](../schemas/scope.schema.json). Example skeleton:

```yaml
id: my-scope
title: My Scope Long Name
short: My Scope
type: regulation        # or 'standard' or 'hosting-cert'
jurisdiction: EU
version: "1.0"
version_date: 2026-01-01
canonical_url: https://example.org/my-scope
curated: false          # set true to use excluded_items rather than authoring out-of-scope rows
layered_on: []          # e.g., [gdpr, mdr] for DiGA

requirements:
  - ref: Art.1
    title: First requirement
    text: |
      Paraphrased text of the requirement.
    coverage: implemented
    draft: true
    tests: [TEST01]
    docs: [reference.md#section]
    functional_specs: [EVENT.BASE]
    notes: |
      Optional freeform nuance.

excluded_items: []      # for curated scopes only
```

## 3. Validate locally

```sh
npm run validate
```

Strict-by-default rules — fails on:

- unknown `reqid` (referenced but missing from `dev-site`'s `requirements.yml`)
- broken test code (referenced but not found in any
  `open-pryv.io/components/*/test` file)
- missing doc file (referenced doc path doesn't exist in `dev-site/src/`)
- `coverage: implemented` or `configurable` with empty `tests:`

## 4. Build the SQLite

```sh
npm run build
```

Produces `dist/compliance.sqlite` consumed by the WAB and other tooling.

## 5. Iterate

- Mark every cell `draft: true` as you go.
- When user-reviewed: set `draft: false` + add `reviewed_by` + `reviewed_at`.
- Coverage status meaning:
  - `implemented` — works out of the box
  - `configurable` — works with specific config keys (cite them in `config_keys:`)
  - `facilitated` — reduces work but implementer does X
  - `documented` — guidance only (cite the doc in `docs:`)
  - `out-of-scope` — not for software

## 6. Linkages

- `functional_specs:` — IDs from `dev-site/src/_functional-specifications/requirements.yml`
- `tests:` — `[CODE]` identifiers from open-pryv.io test descriptions
- `docs:` — relative paths into `dev-site/src/`
- `qms_docs:` — relative paths into `compliance-matrix/qms/`
- `config_keys:` — dotted paths into open-pryv.io config (e.g.,
  `storages.engines.postgresql.database`)
