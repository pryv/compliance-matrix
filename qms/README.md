# Quality Management System (QMS)

The compliance matrix answers **"what does the Pryv software contribute
to this requirement?"** A QMS answers the complementary question:
**"what does the *organization* operating Pryv run as a process?"**
Together they form the evidence trail an auditor expects under
ISO 13485, ISO/IEC 27001, ISO/IEC 27701 and the EU MDR.

This directory holds two trees:

| Tree | Audience | Status |
|---|---|---|
| [`pryv/`](./pryv/) | Pryv's own QMS for developing open-pryv.io | the real, living document set (currently `draft`) |
| [`implementer-template/`](./implementer-template/) | an organization deploying Pryv | fork-able templates with `{{placeholders}}` |

> **`draft: true`** on every document means "authored, not yet
> formally reviewed and released." A document is released when an
> accountable owner reviews it, sets `draft: false`, and records
> `reviewed_by` / `reviewed_at`. Until then, treat the content as a
> structured starting point, not a controlled record.

## Layout

Both trees use the same four-tier layout:

```
01-policies/          # what the organization commits to (the "why")
02-procedures/        # how the organization does it (the "how")
03-record-templates/  # the forms that produce evidence (the "proof")
04-training/          # competence + awareness
```

Policies are stable and few. Procedures implement policies. Record
templates are the blank forms; the **filled-in records** are private
operational evidence and never live in this public repository.

## Frontmatter convention

Every QMS document carries YAML frontmatter:

```yaml
---
title: Information Security Policy
id: pol-infosec
draft: true
owner: "{{security-officer}}"      # role, not a person, in the template tree
version: "0.1"
satisfies:                          # standards clauses this document helps satisfy
  - iso-27001.A.5.1
  - iso-27001.5.2
  - iso-27701.6.2
matrix_evidence_for:                # scope.ref rows in the matrix that may cite this doc
  - iso-27001.A.5.1
  - gdpr.Art.24
reviewed_by: null
reviewed_at: null
---
```

- **`satisfies`** lists the standard clauses the document addresses.
  Free-form clause identifiers (`iso-27001.A.5.1`, `iso-13485.4.2.3`,
  `mdr.Annex-II`). Used for human traceability, not validated against a
  clause catalogue (the standards are paywalled — we do not redistribute
  their clause lists).
- **`matrix_evidence_for`** lists matrix `scope.ref` rows. **Validated**:
  every entry must resolve to a real requirement row in `scopes/*.yml`.
  This is the reciprocal of a requirement's `qms_docs:` field — a matrix
  row with `coverage: documented` can cite a QMS document by relative
  path (`qms/pryv/01-policies/information-security-policy.md`), and the
  CI cross-check (`scripts/validate.js`) verifies both directions.

## How the QMS links to the matrix

```
                 matrix row (scopes/*.yml)
            coverage: documented
            qms_docs: [qms/pryv/.../document-control.md]
                       │   ▲
            cites ─────┘   └───── matrix_evidence_for: [iso-27001.A.5.1]
                       ▼          (in the QMS doc frontmatter)
                 QMS document (this tree)
```

A `documented` matrix row says "the obligation here is satisfied by an
organizational process, not by software." It points at the QMS document
that describes that process. The QMS document points back at the matrix
rows it provides evidence for. CI keeps both halves honest.

## Using the implementer template

1. Copy `implementer-template/` into your own (private) repository.
2. Replace every `{{placeholder}}` with your organization's specifics
   (the [questionnaire](../scripts/README-template-generator.md) can
   pre-fill many of them from your answers + your `open-pryv.io` config).
3. Review, assign owners, set `draft: false`, and bring the released set
   to your auditor alongside the matrix gap report for your scopes.
