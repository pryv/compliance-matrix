---
title: Privacy (Data Protection) Policy
id: pol-privacy
draft: true
owner: privacy-officer
version: "0.1"
satisfies:
  - iso-27701.6.2
  - iso-27701.7.2
  - gdpr.Art.24
  - gdpr.Art.25
matrix_evidence_for:
  - gdpr.Art.24
  - gdpr.Art.25
reviewed_by: null
reviewed_at: null
---

# Privacy (Data Protection) Policy

## Purpose

To state the project's commitment to privacy as a design property of
open-pryv.io, and to set the principles under which the project itself
processes any personal data.

## Scope

The development of open-pryv.io (where privacy is a product requirement)
and the project's own limited processing of personal data (contributor
accounts, issue reporters, mailing-list subscribers).

## Policy statements — privacy as a product property

1. **Data minimization is structural.** Pryv stores personal data
   per-user and exposes it only through explicit, scoped accesses. The
   software gives implementers the primitives to collect and expose only
   what is needed.

2. **Purpose binding.** Accesses, permissions and consent records let an
   implementer bind processing to a stated purpose and demonstrate it.

3. **Data-subject rights are supported by primitives.** Access,
   rectification, erasure, portability and restriction map to concrete
   API capabilities; the matrix records which are `implemented`,
   `configurable`, `facilitated` or left to the operator.

4. **Privacy by default.** Out-of-the-box configuration favors the
   privacy-protective choice; broadening exposure is a deliberate
   operator action.

## Policy statements — the project's own processing

5. The project processes the minimum personal data needed to run an
   open-source project and does not sell or repurpose it.

6. Data-subject requests addressed to the project are handled within the
   timeframe the applicable law requires.

## Responsibilities

The privacy officer owns this policy and coordinates data-protection
impact considerations during design review. Engineers raise privacy
questions through the design-control procedure.

## Relationship to deployed Pryv

The *operator* of a Pryv deployment is the controller (or processor) for
the personal data its users hold and runs its own data-protection policy.
This policy concerns the *software project*. The compliance matrix is the
authoritative map of the controller/processor responsibility split per
requirement.

## Review

Reviewed at least annually and whenever data-protection law materially
changes.
