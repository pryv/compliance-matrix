---
title: "{{organization}}, Staff Awareness Program"
id: impl-proc-training
draft: true
owner: "{{quality-owner}}"
version: "0.1"
satisfies:
  - iso-27001.A.6.3
  - gdpr.Art.39
matrix_evidence_for: []
reviewed_by: null
reviewed_at: null
---

# {{organization}}: Staff Awareness Program

## Purpose

To ensure {{organization}} staff operating {{deployment-name}} are aware of
their security and data-protection obligations.

## Required awareness

| Topic | Who | When |
|---|---|---|
| Information security policy + acceptable use | all staff | onboarding + annually |
| Privacy / data-protection + data-subject rights | all staff handling data | onboarding + annually |
| Incident reporting | all staff | onboarding + annually |
| Access management + admin-token handling | privileged operators | onboarding + on change |
| Backup / recovery + change management | operators | onboarding |

## Delivery and verification

Awareness is delivered by reviewing the relevant policies and procedures
and acknowledging them. Operator competence is verified through supervised
practice.

## Records

Training records (`../03-record-templates/`, reuse the Pryv-project
training-record shape, or your HR system).

## Responsibilities

{{quality-owner}} maintains the program and tracks completion.
