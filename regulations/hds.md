# Hébergement de Données de Santé (Health Data Hosting Certification) (HDS)

- Scope id: `hds` (hosting-cert)
- Jurisdiction: France
- Version: HDS Référentiel, current consolidated edition (2018-06-19)
- Official text: https://esante.gouv.fr/produits-services/hds
- Requirements: 13 (2 implemented, 2 configurable, 5 facilitated, 4 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/hds

## HDS Activity.1: Activity 1, Provision of physical infrastructure

Coverage: out-of-scope · draft

Requirement: Provision of physical computing infrastructure (servers, storage,
network equipment) used to host health data.

**What Pryv does for you**

Physical infrastructure provisioning is the data-centre operator's
certification scope, not Pryv's. Pryv-as-software doesn't ship a
data centre, when an HDS-certified hoster deploys Pryv on their
certified infrastructure, this activity is covered by their cert,
not by anything Pryv contributes.

## HDS Activity.2: Activity 2, Provision of virtual infrastructure

Coverage: out-of-scope · draft

Requirement: Provision of virtual computing infrastructure (VMs, container
hosts, virtual storage) used to host health data.

**What Pryv does for you**

Virtual infrastructure is the cloud / virtualisation provider's
certification scope. Pryv runs on whatever virtual infrastructure
the operator chooses; the cert for the virtual layer is the
hoster's (typically a CSP that itself holds HDS Activity 2).

## HDS Activity.3: Activity 3, Platform-as-a-service for health data

Coverage: facilitated · effort saved: high · mode: infrastructure · draft

Requirement: Provision of a software platform on which health-data applications
are deployed and operated (runtime, libraries, middleware,
databases).

**What Pryv does for you**

This is the activity
where Pryv-as-software substantively contributes. An HDS-certified
hoster running Pryv covers Activity 3 by inheriting Pryv's
primitive set: per-user storage isolation (system-streams +
per-user files when SQLite engine), stream-scoped permissions,
TLS in the core or at your proxy (configured, not default), mTLS
between cores once bootstrapped, AES-256-GCM at-rest secrets,
MFA, audit log, backup-restore, observability adapter. The
operator still does the operational + organizational work the
HDS audit checks (governance, incident response, ISMS).

**Detail**

The HDS audit verifies the platform's actual operational state,
audit logs available, vulnerability management, change control,
etc. Pryv-side artefacts feeding the audit: CHANGELOG-v2 +
CHANGELOG-v2-back (change control evidence); audit-log per-user
SQLite (forensic evidence); observability metrics (operational
monitoring evidence); release tags + Docker image SHAs
(configuration management evidence). For vulnerability
management on the software side: the 2026 code-level security
review of open-pryv.io and its fix releases (2.0.0-rc.40 to
2.0.0-rc.51; public report `SECURITY-AUDIT.md`, published
2026-10-14,
https://github.com/pryv/open-pryv.io/blob/master/SECURITY-AUDIT.md;
`context/code-security-review-2026.md`). Running a release that
carries the fixes, and the vulnerability management of your own
hosting, stay yours.

**Evidence**

- primitives: access, permissions, audit, system-streams, letsEncrypt-integration, multi-core-mTLS, encryption-at-rest-secrets, MFA, data-residency, backup-restore, observability-provider
- context notes: code-security-review-2026

## HDS Activity.4: Activity 4, Sysadmin and operations of the information system

Coverage: out-of-scope · draft

Requirement: Administration of the platform: patching, configuration, change
management, incident response, operational monitoring.

**What Pryv does for you**

Sysadmin is the certified operator's role. Pryv ships the
software; the operator runs it, monitors it, patches it,
responds to incidents. The HDS Activity 4 audit verifies the
operator's ITSM practices (typically ISO 20000-1 aligned).

## HDS Activity.5: Activity 5, Outsourced backup

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: Outsourced backup of health data: backup planning, execution,
retention, restoration.

**What Pryv does for you**

Pryv contributes the
backup primitive (`bin/backup.js` per-user backups + `--restore`).
Multi-core cluster topology gives in-line Raft replication of
platform data. The backup tool can **encrypt its output on demand**
so plaintext PHI never touches the destination disk: a recipient
public key (RSA-OAEP-wrapped per-backup data key, the backup host
holds no decryption secret) or a passphrase, with per-file
authenticated AES-256-GCM. This covers backup-archive at-rest
encryption directly; the operator may still layer
LUKS / GPG / KMS at the volume level, and remains responsible for
key management, transport, retention, and the "outsourced"
(separate physical location) element. Pryv provides the
backup-generation, payload-encryption, and restoration primitives.

**Detail**

**Backups taken before open-pryv.io 2.0.0-rc.34 are incomplete:**
they carry no high-frequency series data, on every series engine,
and nothing warned. Take a new backup after upgrading, and do not
count older archives as a full copy of series data. Since
2.0.0-rc.34 the series are exported and restored (series move
between any two series engines, InfluxDB included), and the
manifest's `coreVersion` reports the core's release, which you
can record in your backup register. Backup and restore round
trips are tested in open-pryv.io (`[BKSR]`, `[BKEV]`, `[BKVR]`).

**Incremental backups (open-pryv.io 2.0.0-rc.51).** Before
2.0.0-rc.51 an `--incremental` run overwrote the full backup it
continued, leaving a directory that restores only the last delta;
`node bin/backup.js --inspect <dir>` reports such a directory
`DAMAGED` and a restore refuses it `[BKIC2]`: remove it from your
backup register and take a new full backup. Since 2.0.0-rc.51 each
run is written next to the full backup (`incrementals/<runId>/`,
indexed by `chain.json`), each encrypted run with its own envelope
and decrypt script, and a restore replays the chain, or stops at a
given run with `--through-run` `[BKC1]`, `[BKC2]`, `[BKC5]`,
`[BKIC1]`. Your retention schedule applies per chain: a run is only
restorable with the full backup and every run before it.

**Outsourced copies you can check (open-pryv.io 2.0.0-rc.86).**
Each run's manifest lists every file with its size and hash, and a
restore refuses a run whose files were added, removed, changed, cut
short or swapped between accounts `[BKSM1]`, `[BKSM2]`. With a
recipient public key, sign the runs (`--signing-key` at backup,
`--signing-pubkey` at restore): whoever can write to the outsourced
destination and holds the public key can otherwise replace a run
`[BKSM4]`, `[BKSM5]`. `--inspect --verify-files` checks every file
of a backup without restoring it, a check you can schedule after
each transfer to the backup host `[BKIS3]`. Keep the destination
directory for the backup only: a file the backup did not write is
refused at restore, while files that storage appliances create by
themselves (`@eaDir`, `.snapshot`, `.zfs`, ...) are ignored with a
notice `[BKSM7]`. A backup written by 2.0.0-rc.86 or later restores
with that release or later; runs written earlier restore as
before, reported as "file list not verified".

**Evidence**

- tests: BKSR, BKEV, BKVR, BKC1, BKC2, BKC5, BKIC1, BKIC2, BKSM1, BKSM2, BKSM4, BKSM5, BKSM7, BKIS3
- docs: customer-resources/backup.md
- primitives: backup-restore, backup-payload-encryption, encryption-at-rest-secrets, multi-core-mTLS

## HDS Activity.6: Activity 6, Archival of health data

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: Long-term archival of health data with verifiable integrity over
the archival period (typically 20+ years for medical records).

**What Pryv does for you**

Pryv stores events with
retained `class/format` semantics (data-types schemas), and keeps
per-event version history when you set
`versioning.forceKeepHistory: true` (off by default; with
`versioning.deletionMode: keep-nothing`, the default, a deleted
event's history is removed with it). For long-term archival, the operator
typically combines Pryv's event store with an external archival
system (WORM storage, blockchain-anchored hashes etc.), Pryv
is not an archival product itself but feeds it. Integrity
verification across long timescales is a separate certified
archival service.

**Evidence**

- primitives: event, stream, backup-restore

## HDS cross.data-residency: Cross-cutting, data residency in France

Coverage: configurable · effort saved: high · draft

Requirement: Health data subject to HDS must remain on infrastructure located
in France (or in a country offering equivalent protection per
Article L.1111-8 CSP).

**What Pryv does for you**

Pryv's data-residency primitive is the technical control: bind
each French-health-data subject to a French hosting (declared
in `auth.hostings`). Cross-core forwarding inside a multi-
hosting Pryv platform respects the per-user hosting binding,
so a user's data physically stays where assigned.

**Detail**

Configuration pattern for HDS-targeting deployment:
  - `auth.hostings` declares the French hosting(s), each backed
    by a core or core-cluster running on HDS-certified
    infrastructure.
  - At registration, the implementer routes French-health-data
    subjects to a French hosting (operator/regulatory routing,
    not end-user choice).
  - `system.users.get` exposes the per-user `hosting` field so
    you can prove residency in audit responses.

**Evidence**

- tests: REGC, RC01, RC03, RC07
- config keys: auth.hostings
- primitives: data-residency

## HDS cross.iso-references: Cross-cutting, ISO 27001 + 27018 + 20000-1 baseline

Coverage: facilitated · effort saved: medium · mode: awareness · draft

Requirement: HDS certification requires the hoster to demonstrate alignment
with ISO/IEC 27001 (ISMS), ISO/IEC 27018 (PII in public clouds),
and ISO/IEC 20000-1 (IT service management). These ISO certs
may be held independently and presented as part of the HDS
audit pack.

**What Pryv does for you**

Pryv's primitive set
carries a substantial share of the ISO 27001 Annex A technical
controls (A.5 information security policies derives_from
operator, A.8 asset management is operational, A.9 access
control = permissions, A.10 cryptography = TLS + at-rest
secrets, A.12 operations security = audit + monitoring, A.13
communications security = TLS + mTLS, A.17 BCM = backup +
multi-core HA). See the `iso-27001.*` rows of this matrix for
the detailed per-control mapping; the per-Activity-3 sub-control
rows below name the specific A.5/A.8 controls.

**Detail**

The detailed control-by-control mapping will land in the
`iso-27001` scope. HDS audit pack
references the ISO 27001 certificate(s) the hoster holds; the
Pryv-side contribution is the same set of primitive evidence
either way.

**Evidence**

- primitives: access, permissions, audit, letsEncrypt-integration, encryption-at-rest-secrets, MFA, data-residency, backup-restore, observability-provider

## HDS cross.hds-vs-gdpr: Cross-cutting, HDS ≠ GDPR compliance

Coverage: facilitated · effort saved: low · mode: awareness · draft

Requirement: HDS certifies the hosting infrastructure; GDPR compliance for
consent, data-subject rights, breach notification, lawful basis,
and the records of processing remains the data controller's
separate responsibility.

**What Pryv does for you**

A common misconception in
French health-tech: holding an HDS certificate is sometimes
mistaken for GDPR-compliance. It isn't. The HDS scope above
covers infrastructure security; the GDPR scope (see this
matrix's `gdpr.*` rows) covers the controller's obligations
toward data subjects. Pryv carries the technical substrate for
both, but they're distinct compliance burdens.

**Detail**

Reference content for this point: Pryv published
"pourquoi-la-certification-hds-ne-garantit-pas-votre-conformite-au-rgpd"
in `www`. The matrix expresses the same point structurally,
separate scopes, no scope is the other's proxy.

**Evidence**

- primitives: access, audit, CMC

## HDS cross.subcontracting: Cross-cutting, subcontracting chain

Coverage: out-of-scope · draft

Requirement: Where the HDS-certified hoster subcontracts any HDS activity,
the subcontractor must also be HDS-certified for that activity
(or operate under the hoster's own certificate per the
Référentiel's subcontracting clauses).

**What Pryv does for you**

Subcontracting + certification chain are organizational. Pryv as
a software supplier sits below the hoster's certification scope,
the hoster's contract with the Pryv operator (often the same
entity) declares the scope, but Pryv-the-software isn't itself
certified.

## HDS Activity.3.access: Activity 3, Access control (sub-control)

Coverage: implemented · effort saved: high · draft

Requirement: Logical access to ePHI shall be restricted to authorized users
via authentication + authorization controls; access shall be
managed across the user lifecycle.

**What Pryv does for you**

HDS Activity 3 sub-control aligning with ISO 27001 A.5.15 +
A.5.18: the Pryv access + permissions primitive enforces
per-stream access control across the access lifecycle
(create / read / update / delete). Cross-link to ISO 27001 +
HIPAA-Security for the parallel control rows.

**Evidence**

- tests: AA01, AA02, ACCP
- derives from: iso-27001.A.5.15, iso-27001.A.5.18, hipaa-security.164.312(a)(1)
- primitives: access, permissions, system-streams

## HDS Activity.3.audit: Activity 3, Audit logging (sub-control)

Coverage: implemented · effort saved: high · draft

Requirement: All access to ePHI shall be logged with sufficient detail for
forensic investigation; logs shall be retained per the
applicable retention policy.

**What Pryv does for you**

HDS Activity 3 audit sub-control inherits the Pryv audit
primitive (per-user SQLite, every API method captured with
access reference + timestamp). The retention period + log-
review cadence are operator policy per the HDS audit pack.

**Evidence**

- tests: AT01, AT02, AT51, AT61
- derives from: iso-27001.A.8.15, hipaa-security.164.312(b)
- primitives: audit, audit-event-stream

## HDS Activity.3.cryptography: Activity 3, Use of cryptography (sub-control)

Coverage: configurable · effort saved: medium · draft

Requirement: ePHI in transit shall be protected via TLS; cryptographic key
management shall follow the operator's documented procedures.

**What Pryv does for you**

HDS Activity 3 cryptography sub-control: TLS in transit once you
configure it, in the core (`http.ssl.*`, certificates from the
built-in ACME integration when `letsEncrypt.enabled` is set) or
at your reverse proxy (the core then serves plain HTTP behind
it); the core sets no TLS version of its own (Node.js defaults,
TLS 1.2 floor on Node 24). mTLS between cores once
`bin/bootstrap.js` has written `storages.engines.rqlite.tls`,
AES-256-GCM at-rest for operator secrets. Cross-link to ISO 27001 A.8.24 +
HIPAA-Security §164.312(e)(1) for the parallel control rows.

**Evidence**

- tests: ACMEINT, ACMEORCH, CERTUTILS, BUNDLEENC, ATRENC
- config keys: http.ssl.keyFile, http.ssl.certFile, letsEncrypt.enabled, letsEncrypt.atRestKey, storages.engines.rqlite.tls
- derives from: iso-27001.A.8.24, hipaa-security.164.312(e)(1)
- primitives: letsEncrypt-integration, multi-core-mTLS, encryption-at-rest-secrets

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
