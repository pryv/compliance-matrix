---
title: Change Request Record (template)
id: rec-change-request
draft: true
owner: engineering-lead
version: "0.1"
record_for: proc-change-control
---

# Change Request Record

> Blank form. In practice the feature branch + its review thread is the
> living record; this template is the checklist that review confirms.

| Field | Value |
|---|---|
| Record ID | `CR-YYYY-MM-DD-N` |
| Title | |
| Author | |
| Branch / PR | |
| Date | |

## What changes and why

## Impact assessment

- [ ] Security / privacy impact:
- [ ] Data migration / backward compatibility:
- [ ] Public API / configuration impact:
- [ ] Compliance-matrix rows touched:
- [ ] Significant change → design-control record `DR-____`

## Verification

- Test matrix result (PostgreSQL):
- Test matrix result (SQLite):
- Lint / typecheck:

## Approval

- Reviewer:
- Approved date:
- Changelog entry (API / internal):
- Release tag (if applicable):
