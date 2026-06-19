---
title: Risk Management Procedure
id: proc-risk
draft: true
owner: security-officer
version: "0.1"
satisfies:
  - iso-14971.4
  - iso-27001.6.1
  - iso-27005.8
  - iso-27701.5.4.1
matrix_evidence_for:
  - iso-27001.6.1.2
  - gdpr.Art.35
reviewed_by: null
reviewed_at: null
---

# Risk Management Procedure

## Purpose

To identify, assess, treat and monitor risks to information security and
to the safe operation of software built on Pryv, throughout the product
lifecycle.

## Scope

Security and privacy risks arising from the design and operation of
open-pryv.io. Risks specific to a given *deployment* are assessed by the
operator using the implementer template.

## Procedure

1. **Context.** Establish what is being assessed (a feature, a release, an
   architectural area) and the assets and data flows involved.

2. **Risk identification.** Identify threats and vulnerabilities —
   considering confidentiality, integrity, availability, and privacy harm
   to data subjects.

3. **Risk analysis.** Estimate likelihood and impact for each risk. For
   privacy-relevant processing, consider whether a data-protection impact
   assessment (DPIA) is warranted.

4. **Risk evaluation.** Compare against acceptance criteria. Risks above
   the acceptance threshold require treatment.

5. **Risk treatment.** Choose to mitigate (design change, control), accept
   (with rationale), transfer, or avoid. Mitigations enter design control
   and change control.

6. **Residual risk.** Record residual risk after treatment and obtain
   sign-off from the risk owner.

7. **Monitoring and review.** Risks are reviewed at planned intervals and
   when a relevant change, incident or advisory occurs.

## Inputs that drive risk review

- Dependency vulnerability advisories.
- Security incidents and near-misses.
- New features touching authentication, access control, cryptography,
  data migration, or cross-core/replication paths.
- Changes in applicable law or the threat landscape.

## Records

- Risk assessment records (`03-record-templates/risk-assessment-record.md`).
- DPIA records where applicable.
- Residual-risk sign-offs.

## Responsibilities

The security officer owns the risk register and ensures treatments are
tracked to completion via design control and CAPA.
