---
title: Software Development Lifecycle Policy
id: pol-sdlc
draft: true
owner: engineering-lead
version: "0.1"
satisfies:
  - iso-13485.7.3.1
  - iso-27001.A.8.25
  - iec-62304.5.1
matrix_evidence_for:
  - iso-27001.A.8.25
reviewed_by: null
reviewed_at: null
---

# Software Development Lifecycle (SDLC) Policy

## Purpose

To define how open-pryv.io is planned, designed, implemented, verified,
released and maintained so that the software is safe, secure and traceable
throughout its life.

## Scope

All software in the open-pryv.io project and the libraries and tools
released alongside it.

## Lifecycle stages

1. **Requirement.** Capabilities originate from functional specifications,
   regulatory needs (mapped in the compliance matrix) and defect reports.
   Each is captured before implementation.

2. **Design.** Significant changes go through design review under the
   design-control procedure, which considers security, privacy, data
   migration and backward compatibility.

3. **Implementation.** Work happens on feature branches. Code follows the
   project's style rules (linting enforced) and is type-checked.

4. **Verification.** Every change is exercised by the automated test
   matrix across the supported storage engines (PostgreSQL and SQLite)
   before merge. Reviews are mandatory.

5. **Release.** Releases are tagged from the release branch with a
   changelog. API-facing and internal changes are recorded separately.
   Published artefacts (container images, npm packages) are produced from
   the tagged source.

6. **Maintenance.** Defects and security advisories are triaged and
   resolved through the CAPA and change-control procedures. Migrations
   between schema versions are forward-only and tracked.

## Branching and integration

- Development uses short-lived feature branches merged into the release
  branch after review and a green test matrix.
- The release branch is always intended to be in a releasable state.

## Configuration and version control

All source, schemas, configuration templates and documentation are under
version control. Released versions are tagged and immutable.

## Records produced

- Design review records (design-control procedure).
- Change request records (change-control procedure).
- Test matrix results on the release branch.
- Changelog entries per release.

## Responsibilities

The engineering lead owns this policy. Reviewers enforce it at merge time.

## Review

Reviewed at least annually and whenever the toolchain or release process
changes materially.
