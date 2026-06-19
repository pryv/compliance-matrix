---
title: Quality Policy
id: pol-quality
draft: true
owner: management
version: "0.1"
satisfies:
  - iso-13485.5.3
  - iso-13485.5.4.1
  - iso-9001.5.2
matrix_evidence_for:
  - iso-27001.5
reviewed_by: null
reviewed_at: null
---

# Quality Policy

## Purpose

This policy states the commitment of the open-pryv.io project to
delivering software that is fit for its purpose — a trustworthy
substrate for personal-data applications — and to maintaining a quality
management system that is effective and continually improved.

## Scope

Applies to all development, testing, release and maintenance activities
for open-pryv.io and the libraries and tools distributed alongside it.

## Policy statements

1. **Fitness for purpose.** open-pryv.io is built so that organizations
   can operate it as a privacy-respecting personal-data store. Every
   released capability is exercised by automated tests before it ships.

2. **Evidence over assertion.** No capability is claimed without
   verifiable evidence. Coverage claims in the compliance matrix are
   backed by test codes, documentation, or tracked planned work — never
   by unverified assertion. This is enforced in CI.

3. **Quality is built in, not inspected in.** Defects are prevented by
   design review, type checking, linting and the full automated test
   matrix gating every merge, rather than detected after release.

4. **Continual improvement.** Defects, regressions and process gaps are
   logged, triaged and resolved through the corrective-and-preventive-
   action procedure. Recurring classes of defect drive process change,
   not just point fixes.

5. **Traceability.** Requirements, design decisions, code, tests and
   released artefacts are linked so that any released behaviour can be
   traced back to a requirement and forward to its verifying test.

## Measurable objectives

The project tracks, at minimum:

- automated test pass rate on the release branch (target: 100% of
  non-pending tests green on every merge),
- number of open defects by severity,
- mean time from defect identification to resolution for high-severity
  defects,
- number of compliance-matrix coverage claims lacking evidence (target:
  zero — CI-enforced).

## Responsibilities

Management is accountable for this policy, for providing the resources
the QMS needs, and for reviewing its effectiveness at planned intervals.
Every contributor is responsible for working within the QMS procedures.

## Review

This policy is reviewed at least annually and whenever a significant
change to the project's scope or organization occurs.
