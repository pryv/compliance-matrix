---
title: Design and Development Control Procedure
id: proc-design-control
draft: true
owner: engineering-lead
version: "0.1"
satisfies:
  - iso-13485.7.3
  - iec-62304.5.1
  - iso-27001.A.8.25
matrix_evidence_for:
  - iso-13485.7.3.7
reviewed_by: null
reviewed_at: null
---

# Design and Development Control Procedure

## Purpose

To control the design of significant changes to open-pryv.io so that
design inputs, outputs, review, verification and changes are planned and
recorded.

## Scope

New features, architectural changes, schema migrations, security-relevant
changes, and any change a reviewer flags as significant. Trivial fixes
(typos, isolated bug fixes covered by an existing test) follow change
control without a full design record.

## Procedure

1. **Design inputs.** The change is described with: the requirement or
   defect it addresses, functional and security/privacy requirements,
   data-migration and backward-compatibility constraints, and the
   applicable compliance-matrix rows it touches.

2. **Design outputs.** The implementation plan, interface/API changes,
   schema or migration definitions, and the verification approach (which
   tests will prove it).

3. **Design review.** A reviewer who is not the sole author examines the
   inputs and outputs, with explicit attention to security, privacy, data
   migration and backward compatibility. The review outcome is recorded
   (see `03-record-templates/design-review-record.md`).

4. **Verification.** The change is verified by automated tests across the
   supported storage engines. The verification is the test matrix result
   on the release branch.

5. **Validation.** Where a change affects an end-to-end user-facing flow
   that automated tests cannot fully carry, a sample application or manual
   validation run provides the evidence.

6. **Design transfer / release.** Released via the change-control and SDLC
   procedures, with a changelog entry.

7. **Design changes.** Subsequent changes to a released design re-enter
   this procedure proportionate to their significance.

## Compliance-matrix interaction

When a change adds, removes or alters a capability that a matrix row
cites, the matrix row (and any `planned:` chip) is updated as part of the
change — the matrix update is an exit criterion of the design, not a
follow-up.

## Records

- Design review records (`03-record-templates/design-review-record.md`).
- Test matrix results on the release branch.
- Changelog entry per released change.

## Responsibilities

The engineering lead owns this procedure. Reviewers conduct design review
and record the outcome.
