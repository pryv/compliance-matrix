---
title: "{{organization}}, Information Security Policy"
id: impl-pol-infosec
draft: true
owner: "{{security-contact}}"
version: "0.1"
satisfies:
  - iso-27001.5.2
  - iso-27001.A.5.1
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Information Security Policy

## Purpose

To protect the confidentiality, integrity and availability of the personal
data {{organization}} holds in {{deployment-name}}, and the systems that
process it.

## Policy statements

1. **Access control.** Access to {{deployment-name}}, its administration
   interfaces and its hosting infrastructure is granted on least-privilege
   and reviewed periodically. Administrative actions are auditable.
   {{#if mfa-enabled}}Multi-factor authentication is enabled for user
   accounts.{{/if}}

2. **Encryption.** Data in transit is protected with current TLS. Secrets
   and operational key material are protected at rest. {{storage-engine}}
   storage is hosted under {{organization}}'s controlled environment.

3. **Logging and monitoring.** {{#if audit-enabled}}Audit logging is
   enabled and reviewed.{{/if}} Infrastructure and application logs are
   retained per {{retention-policy}}.

4. **Vulnerability and patch management.** {{organization}} tracks
   security advisories for Pryv and its dependencies and applies patches
   through the change-and-patch-management procedure.

5. **Incident response.** Security incidents are reported to
   {{security-contact}} and handled per the incident-response procedure.

6. **Backup and recovery.** {{deployment-name}} is backed up per
   {{backup-schedule}} and restores are tested.

## Responsibilities

{{security-contact}} owns this policy and the security procedures that
implement it.

## Review

Reviewed at least annually and after any significant incident.
