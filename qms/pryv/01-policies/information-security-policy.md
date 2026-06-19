---
title: Information Security Policy
id: pol-infosec
draft: true
owner: security-officer
version: "0.1"
satisfies:
  - iso-27001.5.2
  - iso-27001.A.5.1
  - iso-27701.6.2
matrix_evidence_for:
  - iso-27001.A.5.1
  - gdpr.Art.32
reviewed_by: null
reviewed_at: null
---

# Information Security Policy

## Purpose

To state the project's commitment to protecting the confidentiality,
integrity and availability of information — both the information the
project handles in developing open-pryv.io and, by design, the personal
data that deployments of Pryv hold on behalf of their users.

## Scope

All information assets, systems, contributors and third parties involved
in developing, building, releasing and supporting open-pryv.io.

## Policy statements

1. **Security by design and by default.** Security and privacy
   requirements are part of the design of every feature, not an
   afterthought. Defaults are the safe choice (for example,
   authentication is required, transport is encrypted, audit logging is
   available out of the box).

2. **Least privilege.** Access to source repositories, build systems,
   signing material and deployment infrastructure is granted on a
   need-to-have basis and reviewed periodically.

3. **Cryptographic protection.** Secrets at rest are encrypted; secrets
   are never committed to source control in plaintext. Transport uses
   current TLS. Released cores support automated certificate management
   and at-rest encryption of sensitive operational material.

4. **Secure development.** Dependencies are tracked and scanned for known
   vulnerabilities; advisories are triaged and remediated through the
   change-control and CAPA procedures. Code reaches the release branch
   only after review and a green automated test matrix.

5. **Vulnerability disclosure.** The project maintains a documented route
   for reporting security issues and a defined process for triaging,
   fixing and disclosing them.

6. **Incident response.** Security incidents are detected, contained,
   investigated and recorded; lessons feed back into the QMS.

7. **Supply-chain integrity.** Build inputs and published artefacts are
   controlled so that what is released is what was reviewed and built.

## Responsibilities

The security officer owns this policy and the risk-management and
incident-response procedures that implement it. All contributors are
responsible for handling credentials and information assets according to
this policy.

## Relationship to deployed Pryv

This policy governs the *project*. Each organization deploying Pryv runs
its own information security policy for its *operation* of Pryv; the
`implementer-template/` tree provides a starting point and the compliance
matrix maps which security obligations Pryv carries versus which remain
the operator's.

## Review

Reviewed at least annually and after any significant security incident or
change to the threat landscape.
