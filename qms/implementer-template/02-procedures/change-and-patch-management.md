---
title: "{{organization}}, Change and Patch Management Procedure"
id: impl-proc-change
draft: true
owner: "{{security-contact}}"
version: "0.1"
satisfies:
  - iso-27001.A.8.32
  - iso-27001.A.8.8
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Change and Patch Management Procedure

## Purpose

To control changes to {{deployment-name}}, including upgrades of Pryv
(open-pryv.io), configuration changes, and security patches, so they are
tested before reaching production.

## Procedure

1. **Track upstream.** Monitor open-pryv.io releases and security
   advisories for Pryv and its dependencies.
2. **Assess.** For each change, assess impact on availability, data
   migration, configuration and security. Note any new or changed default
   configuration in the upstream changelog.
3. **Test.** Apply the change in a staging environment and verify core
   flows (authentication, read/write, backup) before production.
4. **Schedule and apply.** Apply during a change window; have a rollback
   plan and a recent backup.
5. **Patch urgency.** Critical security patches are expedited but still
   tested in staging where feasible.
6. **Record.** Record the change, its testing and its outcome.

## Records

Change records (`../03-record-templates/change-record.md`).

## Responsibilities

{{security-contact}} owns change scheduling and the change log.
