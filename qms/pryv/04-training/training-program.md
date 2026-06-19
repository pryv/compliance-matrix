---
title: Competence and Training Program
id: proc-training
draft: true
owner: quality-officer
version: "0.1"
satisfies:
  - iso-13485.6.2
  - iso-27001.A.6.3
  - iso-9001.7.2
matrix_evidence_for:
  - iso-27001.A.6.3
reviewed_by: null
reviewed_at: null
---

# Competence and Training Program

## Purpose

To ensure people working on open-pryv.io are competent for their role and
are aware of the security, privacy and quality obligations that apply to
their work.

## Scope

All contributors with access to source, build, release or infrastructure.

## Required awareness and competence

| Topic | Who | When |
|---|---|---|
| QMS overview (this tree) | all contributors | onboarding + annually |
| Information security policy + secure development | all contributors | onboarding + annually |
| Privacy / data-protection by design | engineers, reviewers | onboarding + annually |
| Change control + design control procedures | engineers, reviewers | onboarding |
| Incident response + vulnerability disclosure | security-relevant roles | onboarding + on change |

## Delivery and verification

Awareness is delivered by review of the relevant QMS documents and
confirmed by the contributor acknowledging them. Role-specific competence
is verified through code review participation and, where relevant, a short
practical check.

## Records

Training records (`03-record-templates/training-record.md`).

## Responsibilities

The quality officer maintains the program and the training records and
flags refreshers that are due.
