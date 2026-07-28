---
title: "{{organization}}, Incident Response Procedure"
id: impl-proc-incident
draft: true
owner: "{{security-contact}}"
version: "0.1"
satisfies:
  - iso-27001.A.5.24
  - iso-27001.A.5.26
  - gdpr.Art.33
  - gdpr.Art.34
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Incident Response Procedure

## Purpose

To detect, contain, investigate, record and (where required) notify
security and personal-data incidents affecting {{deployment-name}}.

## Procedure

1. **Report.** Anyone aware of a suspected incident notifies
   {{security-contact}} immediately.
2. **Triage.** Classify severity and determine whether personal data is
   involved (a potential breach).
3. **Contain.** Take immediate steps to limit harm (revoke access, isolate,
   rotate credentials). Pryv's accesses and audit log help scope the
   incident.
4. **Assess breach scope.** Using the audit log and access records,
   determine which data subjects and data categories are affected.
5. **Notify.** If a personal-data breach meets the threshold, notify the
   supervisory authority within {{breach-notify-deadline}} and affected
   subjects without undue delay, per {{jurisdiction}} law.
6. **Eradicate and recover.** Remove the cause and restore service,
   restoring from backup if needed.
7. **Record and learn.** Complete an incident record; feed corrective and
   preventive actions back into the QMS.

## Records

Incident records (`../03-record-templates/incident-record.md`); breach
notifications sent.

## Responsibilities

{{security-contact}} leads incident response and decides on notification
with {{dpo-contact}}.
