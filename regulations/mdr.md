# Medical Device Regulation (MDR)

- Scope id: `mdr` (regulation)
- Jurisdiction: EU + EEA
- Version: Regulation (EU) 2017/745 (consolidated, incl. 2023 amendments to transition periods) (2017-04-05)
- Official text: https://eur-lex.europa.eu/eli/reg/2017/745/oj
- Layered on: gdpr
- Requirements: 23 (11 facilitated, 12 out-of-scope)
- Browse: https://pryv.github.io/compliance-matrix/#/scope/mdr

## MDR Art.10: General obligations of manufacturers

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Manufacturers shall ensure devices are designed and manufactured in
accordance with the requirements of the Regulation; shall establish,
document, implement, maintain, keep up-to-date and continually
improve a QMS that ensures compliance.

**What Pryv does for you**

MDR Art. 10 is the umbrella
obligation tying every other requirement to the manufacturer's
QMS. Pryv supplies the technical raw material that several QMS
sub-processes draw on (audit log for design controls +
post-market data; observability for system-status evidence;
backup-restore for data-integrity controls). The QMS itself is
the manufacturer's organizational artefact, see ISO 13485
scope for that side.

**Detail**

§10(1) compliance "with the requirements of this Regulation" is a
programme. §10(9) requires the QMS cover at minimum: strategy for
regulatory compliance, risk management, clinical evaluation, design
and manufacturing, post-market surveillance, communication,
vigilance reporting, management of CAPAs, monitoring + measurement
of output. Pryv contributes inputs to several of these, none can
be discharged by Pryv alone.

**Evidence**

- primitives: audit, observability-provider, backup-restore

## MDR Art.51: Classification of devices

Coverage: out-of-scope · draft

Requirement: Devices shall be divided into classes I, IIa, IIb and III, taking
into account the intended purpose of the devices and their
inherent risks. Classification shall be carried out in accordance
with Annex VIII.

**What Pryv does for you**

Classification is a regulatory decision by the manufacturer (with
Notified Body involvement from class IIa upwards). Pryv is not a
medical device itself, when an implementer builds a device on
Pryv, the device's classification is determined by its own
intended purpose. Pryv has no contribution and no implementer
obligation arises from this Article alone.

## MDR Art.52: Conformity assessment procedures

Coverage: out-of-scope · draft

Requirement: Manufacturers of devices, other than custom-made devices, shall
undertake an assessment of the conformity of those devices in
accordance with the applicable conformity assessment procedures
set out in Annexes IX-XI.

**What Pryv does for you**

Conformity assessment (technical documentation + clinical
evaluation + QMS audit by a Notified Body for class IIa+) is the
manufacturer's process. Pryv may appear in the technical
documentation as a sub-system supplier, but the conformity
decision is the manufacturer's. No software contribution from
Pryv at this layer.

## MDR Art.61: Clinical evaluation

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Confirmation of compliance with relevant general safety + performance
requirements set out in Annex I shall be based on clinical data
providing sufficient clinical evidence.

**What Pryv does for you**

Clinical evaluation is the
manufacturer's regulatory artefact. Pryv's contribution is
operational: if your device collects clinical data during the
evaluation, Pryv stores it (events with stable class/format
from data-types) and audit-logs its processing, making the
clinical data set inspectable and reproducible.

**Detail**

The post-market clinical follow-up (PMCF) plan under Annex XIV B
drives ongoing data collection. Pryv as the data backend gives
you a single, audit-trailed substrate for both the pre-market
clinical evaluation file and the PMCF data feed.

**Evidence**

- primitives: audit, event, stream, data-types

## MDR Art.62: General requirements regarding clinical investigations

Coverage: facilitated · effort saved: medium · mode: infrastructure · draft

Requirement: Clinical investigations on devices shall be designed and conducted
to ensure rights, safety, dignity and well-being of subjects;
data shall be reliable and robust.

**What Pryv does for you**

Subject protection in
clinical investigations rides on the same Pryv primitives that
carry GDPR Art. 32, per-subject storage isolation, access
control, audit, encryption at rest, restoration. "Reliable and
robust" data is the manufacturer's burden; audit-logged +
version-preserved Pryv events are the substrate.

**Evidence**

- derives from: gdpr.Art.32
- primitives: access, audit, encryption-at-rest-secrets, backup-restore

## MDR Art.83: Post-market surveillance system of the manufacturer

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Manufacturers shall plan, establish, document, implement, maintain
and update a post-market surveillance (PMS) system in a manner
proportionate to the risk class and appropriate for the type of
device.

**What Pryv does for you**

PMS data sources are
two-fold: (1) operational telemetry of the device + backend
(audit log + observability telemetry when enabled); (2) field
data from the device itself, captured as events. Pryv is the
substrate for both. The PMS plan itself, its trend analysis,
and the PSUR write-up under Art. 86 are manufacturer-side.

**Detail**

Pryv's audit log gives you the "what was processed, by whom,
when" timeline for the backend layer of the device. The
observability adapter (when enabled) gives system-availability
+ error-rate metrics, useful PMS indicators. For device-side
incident events (user-reported issues, on-device errors etc.),
the device pushes them as Pryv events on a dedicated stream.

**Evidence**

- primitives: audit, observability-provider, event

## MDR Art.85: Post-market surveillance report

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Manufacturers of class I devices shall prepare a post-market
surveillance report summarising the results and conclusions of
the analyses of the post-market surveillance data.

**What Pryv does for you**

The PMS report itself is an
editorial artefact the manufacturer drafts. Pryv contributes
the data: audit log gives the backend activity summary; events
on the PMS streams give the field data summary. Composition of
the report is yours.

**Evidence**

- primitives: audit, event

## MDR Art.86: Periodic safety update report

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Manufacturers of class IIa, IIb and III devices shall prepare a
periodic safety update report (PSUR) summarising the results +
conclusions of analyses of post-market surveillance data.

**What Pryv does for you**

Same Pryv contribution as
Art. 85, with cadence increased per device class (annually for
IIa+; available to competent authorities; for class III +
implantables, uploaded into Eudamed). The PSUR's analytical
content remains manufacturer-side.

**Evidence**

- primitives: audit, event, observability-provider

## MDR Art.87: Reporting of serious incidents and field safety corrective actions

Coverage: facilitated · effort saved: low · mode: evidence · draft

Requirement: Manufacturers shall report any serious incident involving devices
made available on the Union market, except expected side-effects
which are clearly documented in the product information.

**What Pryv does for you**

The reporting decision + the
report itself are manufacturer-side. Pryv's audit log +
observability data make root-cause analysis tractable when
investigating an incident, particularly when the incident's
chain of causation touches the backend (e.g., a latency spike
correlated to a clinical decision). The 15-day / 10-day / 2-day
reporting timelines are operational.

**Evidence**

- primitives: audit, event, observability-provider

## MDR A1.17: Annex I §17 Electronic programmable systems / software

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Devices that incorporate electronic programmable systems, including
software, or software that are devices in themselves, shall be
designed to ensure repeatability, reliability and performance
according to their intended use.

**What Pryv does for you**

Annex I §17 is the General
Safety + Performance Requirement (GSPR) most directly relevant
to software medical devices. Pryv as the backend contributes to
several §17 sub-clauses: §17.2 (development and manufacture in
accordance with state-of-the-art principles), §17.4 (verification
and validation, audit log enables it), §17.5 (interaction with
mobile platforms, out of Pryv scope, app-side).

**Detail**

Per §17 sub-clause:
  - §17.1 Repeatability/reliability/performance, Pryv's audit log
    + reproducible-deployment posture (Docker image + multi-core
    HA) supports the manufacturer's V+V evidence.
  - §17.2 State-of-the-art SDLC, IEC 62304 alignment is
    manufacturer-side. Pryv's own release process (Dockerfile,
    test matrix, CHANGELOGs) feeds the manufacturer's supplier
    assessment.
  - §17.3 Risk management throughout the software lifecycle,
    ISO 14971-aligned; manufacturer-side. Pryv-side risk artefacts
    (e.g., this matrix + the QMS) inform supplier assessment.
  - §17.4 Verification and validation, audit log + the
    compliance-matrix test-citation chain are concrete evidence.

**Evidence**

- primitives: audit, backup-restore, multi-core-mTLS, letsEncrypt-integration, observability-provider

## MDR A1.18: Annex I §18 Active devices / connected devices

Coverage: out-of-scope · draft

Requirement: Active devices and devices connected to them shall be designed in
such a way as to remove or reduce as far as possible the risks
relating to electrical, mechanical or thermal hazards.

**What Pryv does for you**

Annex I §18 covers physical electrical/mechanical/thermal hazards,
outside Pryv's scope as a backend service. When the device
depends on Pryv for safe operation (e.g., a connected clinical
monitor), §18.4 + §18.7 (interoperability + connection-loss
safety) become operational concerns the manufacturer addresses
at the device + integration layer.

## MDR A1.23: Annex I §23 Information supplied with the device

Coverage: out-of-scope · draft

Requirement: The instructions for use and label of a device shall comply with
defined requirements (§23.1 labels, §23.2 IFU content, §23.3
e-labelling, §23.4 patient implant card content where applicable).

**What Pryv does for you**

Labelling + IFU content is the device manufacturer's editorial
artefact. Pryv has no role at the IFU-content layer. For
software medical devices that present the IFU in-app, the IFU
versioning + acknowledgement record can ride on Pryv events
with `clientData.ifu_version`, but the IFU content is
manufacturer-side.

## MDR Art.27: Unique Device Identification (UDI) system

Coverage: out-of-scope · draft

Requirement: Manufacturers shall assign a UDI to their devices and place it on
the device label (or its packaging) before placing on the market;
record the UDI in their internal device-file system; submit it
to the UDI database (Eudamed UDI module).

**What Pryv does for you**

UDI assignment + Eudamed submission are manufacturer-side. Pryv
doesn't ship with a UDI (Pryv is not itself a medical device).
When a device built on Pryv has a UDI, the manufacturer's UDI
record may cite Pryv as a sub-system component but the UDI
management is theirs.

## MDR Art.93: Market surveillance activities (competent authorities)

Coverage: out-of-scope · draft

Requirement: Competent authorities shall perform appropriate checks on the
conformity characteristics + performance of devices, including
review of documentation, physical / laboratory checks on
adequate samples, follow-up of received vigilance information.

**What Pryv does for you**

Market surveillance is competent-authority activity. Pryv has no
software role. If an authority requests information about the
Pryv-backed device, the manufacturer's evidence pack (drawing
on this matrix + the audit log) is the substrate of the
response.

## MDR Art.95: Measures required to deal with devices presenting an unacceptable risk to health

Coverage: facilitated · effort saved: medium · mode: evidence · draft

Requirement: Competent authorities may require manufacturers to take all
appropriate corrective actions where a device presents an
unacceptable risk; including withdrawal, recall, restrictions
on availability.

**What Pryv does for you**

A recall / withdrawal
decision is manufacturer + authority side. Pryv contributes:
audit log + observability data scope the affected user / device
population (which subjects' devices were active when the risk
was identified); the access primitive gives the technical
mechanism to disable the device's backend connectivity if
remote disable is part of the corrective action; events on a
`recall/*` stream carry the recall communication record per
affected subject.

**Evidence**

- primitives: audit, access, event, observability-provider

## MDR Art.84: Post-market surveillance plan

Coverage: facilitated · effort saved: low · mode: storage · draft

Requirement: The post-market surveillance plan referred to in Art. 83 shall be
part of the technical documentation specified in Annex II; details
in Annex III.

**What Pryv does for you**

The PMS plan document itself
is the manufacturer's artefact (it lives in the technical
documentation under Annex III). Pryv-side operational
contribution: when the plan calls for specific data collection
(e.g., field-event reporting cadence, telemetry thresholds),
the event-stream + audit substrate carries the data flow per
the plan. The plan's content (criteria, methods, cadence) is
manufacturer-side.

**Evidence**

- derives from: mdr.Art.83, iso-13485.4.2.5
- primitives: event, stream, audit, backup-restore

## MDR A2.5: Annex II §5 Information supplied by the manufacturer

Coverage: facilitated · effort saved: medium · mode: storage · draft

Requirement: Technical documentation shall include a complete set of information
supplied with the device (labels, IFU, design history file
summary, post-market documentation references).

**What Pryv does for you**

The technical documentation
file (TDF) is the manufacturer's regulatory artefact. Pryv-side
support: events on a designated `tdf/<device-id>/*` stream with
attachments give a single, versioned, backed-up + audit-trailed
home for the file's contents. Cross-link to iso-13485.7.3.10
(design + development files) preserves the QMS standard's
parallel obligation.

**Evidence**

- derives from: iso-13485.7.3.10, mdr.A1.23
- primitives: event, stream, backup-restore

## MDR Art.5: Placing on the market and putting into service

Coverage: out-of-scope · draft

Requirement: A device may be placed on the market or put into service only if
it complies with this Regulation when duly supplied and properly
installed, maintained and used in accordance with its intended
purpose.

**What Pryv does for you**

Placing-on-market is the manufacturer's act and depends on the
device passing classification + conformity assessment. Pryv has
no role in the act itself.

## MDR Art.11: Authorised representative

Coverage: out-of-scope · draft

Requirement: Where manufacturer is not established in a Member State, the
device may only be placed on the Union market if the manufacturer
designates an authorised representative.

**What Pryv does for you**

Authorised-representative designation is a contractual + Eudamed-
registration step for non-EU manufacturers. No software role.

## MDR Art.31: Registration of manufacturers, authorised representatives + importers

Coverage: out-of-scope · draft

Requirement: Manufacturers, authorised representatives + importers shall
submit specified information to Eudamed.

**What Pryv does for you**

Eudamed registration is a regulatory submission. No software
role.

## MDR Art.55: Implant card and information to be supplied to the patient with an implanted device

Coverage: out-of-scope · draft

Requirement: Manufacturer of an implantable device shall supply with the
device an implant card carrying device identification + patient-
specific safety information.

**What Pryv does for you**

Implant cards are physical artefacts (or digital equivalents
issued at implantation). If a digital implant-card record lives
in Pryv, the manufacturer puts it on a designated
`implant-card/*` stream, but the regulatory burden remains
manufacturer-side.

## MDR Art.14: General obligations of importers

Coverage: out-of-scope · draft

Requirement: Importers shall verify that devices have been CE-marked + the
EU declaration of conformity drawn up, manufacturer + authorised
representative are identified, and importer's name + registered
trade name + address + place of business / single registered
office + UDI are indicated on device labelling or accompanying
documentation.

**What Pryv does for you**

Importer obligations are contractual + regulatory. No software
role.

## MDR Art.15: General obligations of distributors

Coverage: out-of-scope · draft

Requirement: Distributors shall act with due care + verify CE marking,
EU declaration of conformity, language requirements, expiry
dates, etc. Shall cooperate with manufacturers and competent
authorities + maintain a register of complaints, non-conforming
devices, recalls + withdrawals.

**What Pryv does for you**

Distributor obligations are operational. No software role; if a
distributor uses Pryv to store its complaints + recall register,
see the iso-13485.4.2.5 control-of-records row.

---

This matrix describes the software's contribution to compliance. It is not legal advice and not a certification: implementer organisations remain responsible for their own GDPR, HIPAA, ISO, MDR or HDS posture. Rows marked draft are authored but not yet reviewed.
Legend and other scopes: https://pryv.github.io/compliance-matrix/llms.txt
