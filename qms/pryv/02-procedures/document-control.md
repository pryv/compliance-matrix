---
title: Document Control Procedure
id: proc-doc-control
draft: true
owner: quality-officer
version: "0.1"
satisfies:
  - iso-13485.4.2.4
  - iso-27001.7.5
  - iso-9001.7.5.3
matrix_evidence_for:
  - iso-13485.4.2.4
reviewed_by: null
reviewed_at: null
---

# Document Control Procedure

## Purpose

To ensure QMS documents are identified, reviewed, approved, versioned and
made available in their current form, and that obsolete versions are not
used by mistake.

## Scope

All documents in this QMS tree (`qms/pryv/`) and the controlled
documentation the project publishes (functional specifications, setup
guides, changelogs).

## Procedure

1. **Identification.** Every controlled document carries frontmatter with
   `id`, `title`, `version`, `owner`, and a `draft` flag.

2. **Authoring.** New or changed documents are authored as `draft: true`.

3. **Review and approval.** The named `owner` (or a delegate) reviews the
   document. On approval, `draft` is set to `false` and `reviewed_by` /
   `reviewed_at` are recorded.

4. **Versioning.** Documents are version-controlled in git. The `version`
   field is incremented on each approved substantive change; the git
   history is the authoritative change record.

5. **Distribution.** The current version is whatever is on the release
   branch. There is no separate distribution step; readers always consult
   the controlled source.

6. **Obsolescence.** Superseded content is removed or replaced; git
   history preserves prior versions for audit. A document withdrawn from
   use is deleted from the tree with a commit message stating why.

7. **External documents.** Standards and regulations referenced by the
   QMS are recorded by citation only (title, version/date, canonical URL)
   in `references/`; copyrighted text is never redistributed.

## The `draft` / release gate

A document with `draft: true` is a working draft and not a controlled
record. A document is **released** only when an accountable owner has
reviewed it and set `draft: false` with `reviewed_by` and `reviewed_at`.
CI reports the count of draft vs released documents.

## Records

- The git history of `qms/` (the authoritative document-change log).
- `reviewed_by` / `reviewed_at` frontmatter on each released document.

## Responsibilities

The quality officer maintains this procedure and audits frontmatter
completeness. Document owners are responsible for review and approval of
their documents.
