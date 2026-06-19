# Template generator

`scripts/generate-template.js` turns a short questionnaire (plus, optionally,
your `open-pryv.io` configuration) into a per-scope compliance-documentation
skeleton and a filled-in copy of the [implementer QMS template](../qms/implementer-template/).

## Run

```bash
# 1. Copy the example answers and fill them in.
cp scripts/questionnaire.example.yml my-answers.yml
$EDITOR my-answers.yml

# 2. Generate (optionally pass your open-pryv.io config to auto-derive
#    storage-engine / mfa-enabled / audit-enabled / multi-core).
npm run generate -- --answers my-answers.yml --out ./compliance-pack
npm run generate -- --answers my-answers.yml --config /path/to/config.yml --out ./compliance-pack
```

## Inputs

- **`--answers`** — questionnaire answers, validated against
  [`schemas/questionnaire.schema.json`](../schemas/questionnaire.schema.json).
  Keys are kebab-case so they map 1:1 onto the `{{placeholders}}` in the QMS
  template.
- **`--config`** *(optional)* — your `open-pryv.io` config. The generator
  derives `storage-engine`, `mfa-enabled`, `audit-enabled` and `multi-core`
  from it (config wins over the answers fallback). Derivation is best-effort
  across the common key paths; anything it can't find falls back to the
  answers file.
- The matrix content is read directly from `scopes/*.yml` (the same source
  the build compiles to `dist/compliance.sqlite`).

## Output (`--out`, default `./compliance-pack`)

```
index.md          table of contents + your answers summary
<scope-id>.md     per scope: cover page, coverage summary, applicable-
                  requirements table, evidence pointers, your to-do list
gap-report.md     every documented / out-of-scope row across your scopes
qms/              the implementer QMS template with placeholders resolved
```

## What it does and does not do

- It produces a **skeleton**: the rows that are your responsibility
  (`configurable`, `facilitated`, `documented`, `out-of-scope`) become a
  to-do list and a gap report. Rows Pryv carries (`implemented`) are listed
  with their verifying test codes as evidence.
- It does **not** decide your controller/processor split, write your
  evidence, or give legal advice. The output is a starting point you
  complete and bring to your auditor.
- Unknown `{{placeholders}}` are left visible in the QMS output so you can
  see exactly what still needs filling.

## Templating

The QMS template uses two constructs the generator understands:

- `{{placeholder}}` — replaced by the matching answer.
- `{{#if flag}}…{{/if}}` — kept only when `flag` is truthy (e.g.
  `{{#if mfa-enabled}}MFA is required.{{/if}}`).
