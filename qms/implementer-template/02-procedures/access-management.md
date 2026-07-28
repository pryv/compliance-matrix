---
title: "{{organization}}, Access Management Procedure"
id: impl-proc-access
draft: true
owner: "{{security-contact}}"
version: "0.1"
satisfies:
  - iso-27001.A.5.15
  - iso-27001.A.5.18
  - gdpr.Art.32
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Access Management Procedure

## Purpose

To grant, review and revoke access to {{deployment-name}}, its
administrative surfaces and its hosting infrastructure on a least-privilege
basis.

## Procedure

1. **Grant.** Access is requested with a business justification and
   approved by {{security-contact}}. {{#if mfa-enabled}}MFA is required for
   accounts.{{/if}}
2. **Provision.** Administrative tokens and accesses are scoped to the
   minimum permissions needed (Pryv accesses + permissions).
3. **Review.** Access rights are reviewed at least {{access-review-cadence}}
   and after any role change.
4. **Revoke.** Access is revoked promptly on role change or departure;
   tokens are deleted and audited.
5. **Privileged access.** Use of the admin key and cross-user tokens is
   restricted, logged and reviewed.

## Records

Access register and review records
(`../03-record-templates/access-review-record.md`).

## Responsibilities

{{security-contact}} owns the access register and conducts reviews.
