---
title: Change Control Procedure
id: proc-change-control
draft: true
owner: engineering-lead
version: "0.1"
satisfies:
  - iso-13485.4.1.4
  - iso-13485.7.3.9
  - iso-27001.A.8.32
  - iso-9001.8.5.6
matrix_evidence_for:
  - iso-27001.A.8.32
reviewed_by: null
reviewed_at: null
---

# Change Control Procedure

## Purpose

To ensure changes to open-pryv.io are proposed, reviewed, verified and
released in a controlled, traceable way, and that the impact of each
change is understood before it ships.

## Scope

All changes to source, schemas, configuration templates, build and
release tooling, and controlled documentation.

## Procedure

1. **Proposal.** A change is described on a feature branch (the proposed
   diff is the change request). The description states what changes, why,
   and what it affects.

2. **Impact assessment.** The author and reviewer assess impact on:
   security and privacy, data migration and backward compatibility,
   public API and configuration, and any compliance-matrix rows the
   change touches.

3. **Significance routing.** Significant changes additionally follow the
   design-control procedure. Trivial changes (typo, isolated fix covered
   by an existing test) proceed directly to review.

4. **Verification.** The full automated test matrix runs across the
   supported storage engines and must be green before merge. Linting and
   type checks pass.

5. **Review and approval.** At least one reviewer who is not the sole
   author approves the change.

6. **Merge and release.** The change merges to the release branch.
   API-facing changes are recorded in the API changelog; internal changes
   in the internal changelog. Released versions are tagged.

7. **Configuration changes.** Default and template configuration changes
   are reviewed for their effect on existing deployments and documented in
   the changelog.

## Emergency changes

A security or release-blocking fix may be expedited, but still requires
review and a green test matrix; the design record (if warranted) is
completed retrospectively and the CAPA record captures the root cause.

## Records

- The merged change (commit/PR) and its review.
- Test matrix result.
- Changelog entry.

## Responsibilities

The engineering lead owns this procedure. Reviewers enforce the
verification and approval gates at merge time.
