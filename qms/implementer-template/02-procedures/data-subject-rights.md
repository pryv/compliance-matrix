---
title: "{{organization}}, Data-Subject Rights Procedure"
id: impl-proc-dsar
draft: true
owner: "{{dpo-contact}}"
version: "0.1"
satisfies:
  - gdpr.Art.15
  - gdpr.Art.16
  - gdpr.Art.17
  - gdpr.Art.20
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Data-Subject Rights Procedure

## Purpose

To handle requests from data subjects to exercise their rights of access,
rectification, erasure, portability and restriction in
{{deployment-name}}, within the statutory timeframe of {{jurisdiction}}.

## Procedure

1. **Receive and verify.** Authenticate the requester as the data subject
   (or authorized representative).
2. **Log.** Record the request with a deadline.
3. **Fulfil** using Pryv's primitives:
   - **Access / portability**: export the subject's account data (events,
     streams, attachments, accesses, profile). The account-backup tool or
     a `lib-js`-based export produces the copy; confirm coverage of audit,
     high-frequency series and webhooks per the matrix gap report.
   - **Rectification**: update the relevant events/streams.
   - **Erasure**: delete the subject's data and, where applicable, the
     account; confirm cascade behaviour and audit-retention mode per your
     configuration.
   - **Restriction**: limit processing via access/permission changes.
4. **Respond** within the deadline and record the outcome.
5. **Edge cases.** Legal-hold, overlapping requests, and third-party data
   are escalated to {{dpo-contact}}.

## Records

Data-subject request records
(`../03-record-templates/dsar-record.md`).

## Responsibilities

{{dpo-contact}} owns this procedure and the request log.
