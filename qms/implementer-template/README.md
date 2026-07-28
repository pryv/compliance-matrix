# Implementer QMS template

A fork-able quality / information-security / privacy management system for
an organization that **operates a Pryv deployment**. The Pryv project's
own QMS (`../pryv/`) governs the *software*; this template governs *your
operation* of it.

## How to use

1. Copy this `implementer-template/` directory into your own (private)
   repository or document store.
2. Replace every `{{placeholder}}` with your organization's specifics.
   The template generator (`../../scripts/generate-template.js`) can
   pre-fill many placeholders from a short questionnaire plus your
   `open-pryv.io` configuration.
3. Decide the controller/processor split per requirement using the
   compliance matrix gap report for your scopes (GDPR, HIPAA, ISO 27001,
   HDS, …). The matrix tells you what Pryv carries; these documents record
   what *you* run.
4. Review, assign owners, set `draft: false`, and bring the released set
   to your auditor.

## Placeholders

Common placeholders used across the documents:

| Placeholder | Meaning |
|---|---|
| `{{organization}}` | your legal entity name |
| `{{deployment-name}}` | the name of your Pryv deployment / service |
| `{{jurisdiction}}` | applicable legal jurisdiction(s) |
| `{{controller-or-processor}}` | your GDPR role for the data you hold |
| `{{storage-engine}}` | PostgreSQL or SQLite (from your config) |
| `{{multi-core}}` | single-core or multi-core topology |
| `{{mfa-enabled}}` | whether MFA is enabled |
| `{{audit-enabled}}` | whether audit logging is enabled |
| `{{dpo-contact}}` | data protection officer / privacy contact |
| `{{security-contact}}` | security incident reporting contact |
| `{{retention-policy}}` | your data-retention rules |
| `{{backup-schedule}}` | your backup cadence and retention |

## Contents

- `01-policies/`: quality, information-security, privacy, acceptable-use.
- `02-procedures/`: incident response, access management, data-subject
  rights, backup & recovery, change & patch management.
- `03-record-templates/`: the forms that produce your operational
  evidence.
- `04-training/`: staff awareness program.

> These templates are a starting point, not legal advice. Your applicable
> law and your auditor determine what is sufficient.
