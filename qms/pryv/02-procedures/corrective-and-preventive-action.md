---
title: Corrective and Preventive Action (CAPA) Procedure
id: proc-capa
draft: true
owner: quality-officer
version: "0.1"
satisfies:
  - iso-13485.8.5.2
  - iso-13485.8.5.3
  - iso-27001.10.1
  - iso-9001.10.2
matrix_evidence_for:
  - iso-27001.10.2
reviewed_by: null
reviewed_at: null
---

# Corrective and Preventive Action (CAPA) Procedure

## Purpose

To eliminate the causes of actual defects (corrective action) and
potential defects (preventive action) so they do not recur.

## Scope

Defects, regressions, security advisories, audit findings, and process
nonconformities observed in open-pryv.io or in the QMS itself.

## Principle

Every observed defect or issue ends in exactly one outcome: **fixed**,
**tracked with an agreed owner and plan**, or **explicitly judged not a
defect**. Nothing is silently dropped. Pre-existing and out-of-scope
defects count.

## Procedure

1. **Identification.** A defect/issue is recorded with a stable
   identifier, the repository it affects, severity, how it was observed,
   and a reproduction or symptom.

2. **Containment.** For high-severity or security issues, immediate
   containment (revert, disable, advisory) precedes root-cause work.

3. **Root-cause analysis.** The underlying cause is investigated, not just
   the symptom. Where a class of defect recurs, the analysis addresses the
   class.

4. **Action.** A corrective action (fix the cause) and, where warranted, a
   preventive action (process or test change that stops the class) are
   defined, with an owner.

5. **Verification of effectiveness.** A regression test is added that
   would catch the defect's return. The action is not closed until the
   test exists and passes.

6. **Closure.** The record is closed with the resolving commit reference
   and the verifying test code. Security issues additionally follow the
   disclosure timeline in the information security policy.

## Severity guidance

- **High**: data loss/corruption, security vulnerability, or release
  blocker. Triaged immediately.
- **Medium**: incorrect behaviour with a workaround, or
  compliance-relevant gap.
- **Low**: cosmetic, test-only flake, or documentation defect.

## Records

- Defect/CAPA records (`03-record-templates/capa-record.md`).
- Resolving commit + regression test code per closed item.

## Responsibilities

The quality officer maintains the CAPA log and reports recurring classes
to management. Action owners drive items to closure.
