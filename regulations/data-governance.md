# Data Governance (DAMA-DMBOK knowledge areas) (Data Governance)

- Scope id: `data-governance` (discipline)
- Jurisdiction: International (framework)
- Version: DAMA-DMBOK 2 (framing) + ISO/IEC 38505-1 (2017-07-01)
- Official text: https://www.dama.org/cpages/body-of-knowledge
- Requirements: 11 (5 facilitated, 6 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/data-governance

## Data Governance DG-01: Data Governance (framework / accountability)

Coverage: facilitated · effort saved: medium · mode: primitive · draft

**What Pryv does for you**

Pryv gives you the governance substrate, every datum is owned by a
user (per-user storage isolation), every privileged action is auditable,
and cross-organization sharing is consent-managed (CMC). What Pryv does
NOT give you is the governance *program*: the policies, stewardship
roles, decision rights and oversight cadence. Those are organizational,
start from the QMS templates and the ISO/IEC 38505 Evaluate-Direct-
Monitor model.

**Detail**

ISO/IEC 38505-1 frames governance as accountability for the value, risk
and constraints of data. Pryv's primitives map to the "constraints"
pillar (ownership, access, audit); value and risk decisions remain the
governing body's. The matrix itself is a governance artefact, it makes
"which control covers which obligation" mechanical.

**Evidence**

- qms: qms/pryv/01-policies/quality-policy.md, qms/pryv/01-policies/information-security-policy.md
- primitives: access, audit, CMC, system-streams

## Data Governance DG-04: Data Storage & Operations

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

**What Pryv does for you**

Pryv stores each user's data in isolation, lets you choose the storage
engine (PostgreSQL or SQLite) and keep data in-region per core
(residency), and ships backup/restore primitives. Capacity planning,
SLAs, monitoring and the operational runbook are yours (see the QMS
backup-and-recovery + change procedures).

**Evidence**

- primitives: data-residency, backup-restore

## Data Governance DG-05: Data Security

Coverage: facilitated · effort saved: high · mode: primitive · draft

**What Pryv does for you**

This is Pryv's strongest data-governance contribution: scoped accesses,
per-stream permissions, privileged-data separation via system streams,
and an audit trail are the enforcement primitives. You still own the
classification-to-control policy (which streams are sensitive, who may
hold which access), Pryv enforces the decisions you encode.

**Detail**

Cross-references the regulation scopes: the same primitives back
gdpr.Art.32, iso-27001 Annex A.5/A.8 access-control rows, and
hipaa-security technical safeguards. Use those rows for the
requirement-level evidence.

**Evidence**

- qms: qms/pryv/01-policies/information-security-policy.md
- primitives: access, permissions, system-streams, audit

## Data Governance DG-06: Data Integration & Interoperability

Coverage: facilitated · effort saved: medium · mode: primitive · draft

**What Pryv does for you**

Pryv moves data between parties through consented channels, CMC for
controller-to-controller sharing with a consent record, webhooks for
event propagation, and a shared event-type catalogue (data-types) for
semantic interoperability. Pipeline orchestration, transformation
governance and data-contract management remain yours.

**Evidence**

- primitives: CMC, webhooks, data-types

## Data Governance DG-10: Metadata Management

Coverage: facilitated · effort saved: medium · mode: storage · draft

**What Pryv does for you**

Streams classify data into a navigable hierarchy, clientData carries
business metadata alongside each access/event, and the data-types
catalogue is a schema registry for event formats. The metadata
*management process* (curation, ownership, glossary upkeep) is yours.

**Evidence**

- primitives: stream, clientData, data-types

## Data Governance DG-02: Data Architecture

Coverage: out-of-scope · draft

**What Pryv does for you**

Enterprise data architecture (target-state models, data-flow design
across systems) is the operator's. Pryv is one component within it; its
per-core residency topology is described under DG-04, not here.

## Data Governance DG-03: Data Modeling & Design

Coverage: out-of-scope · draft

**What Pryv does for you**

Logical/physical data modelling is an operator design activity. Pryv's
event/stream model is fixed substrate, not a modelling tool.

## Data Governance DG-07: Document & Content Management

Coverage: out-of-scope · draft

**What Pryv does for you**

Pryv stores events and attachments, not a document-management system
(records lifecycle, content workflow, e-discovery). Out of software
scope here.

## Data Governance DG-08: Reference & Master Data Management

Coverage: out-of-scope · draft

**What Pryv does for you**

MDM (golden records, match/merge, reference-data distribution) is an
operator capability layered above Pryv, not provided by it.

## Data Governance DG-09: Data Warehousing & Business Intelligence

Coverage: out-of-scope · draft

**What Pryv does for you**

Analytics warehousing and BI are downstream of Pryv; the operator
builds them from exported/streamed data.

## Data Governance DG-11: Data Quality

Coverage: out-of-scope · draft

**What Pryv does for you**

Typed events (data-types) give light structural validation, but a data-
quality program (profiling, rules, remediation, scorecards) is the
operator's. Recorded as out-of-scope rather than overclaiming.

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
