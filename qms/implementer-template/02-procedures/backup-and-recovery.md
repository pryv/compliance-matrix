---
title: "{{organization}} — Backup and Recovery Procedure"
id: impl-proc-backup
draft: true
owner: "{{security-contact}}"
version: "0.1"
satisfies:
  - iso-27001.A.8.13
  - iso-27001.A.5.29
  - gdpr.Art.32
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}} — Backup and Recovery Procedure

## Purpose

To protect the availability and integrity of the data held in
{{deployment-name}} through regular, tested backups.

## Procedure

1. **Schedule.** Back up {{deployment-name}} per {{backup-schedule}},
   covering the {{storage-engine}} data store, attachments, and platform
   metadata.
2. **Protect.** Backups are encrypted and access-controlled; retention
   follows {{retention-policy}}, balanced against the right to erasure
   (older backups may retain data pending rotation — documented as a
   known limitation).
3. **Verify.** Backup completion is monitored; failures alert
   {{security-contact}}.
4. **Test restore.** A restore is tested at least {{restore-test-cadence}}
   to confirm recoverability.
5. **Recover.** On data loss, restore from the most recent verified backup
   and record the recovery in an incident record.

## Records

Backup logs and restore-test records
(`../03-record-templates/restore-test-record.md`).

## Responsibilities

{{security-contact}} owns the backup schedule, monitoring and restore
tests.
