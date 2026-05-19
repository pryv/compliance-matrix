# Facilitation typology

The `facilitated` coverage tag is the most-used cell type in the matrix
(54 % of rows as of 2026-05-19). Without further structure, it collapses
five very different kinds of "Pryv contribution" into one label.

This convention decomposes `facilitated` along two orthogonal axes:

- **Mode** — *what* Pryv contributes to the obligation.
- **Level** — *how much* of the total obligation Pryv carries.

Every `coverage: facilitated` row's `overview` field begins with a
structured opening line:

```
**Facilitation: <mode> (<level>)** — <free prose>
```

The WAB extracts the lead pattern and renders two badges next to the
`Facilitated` coverage chip. No schema change today — pure prose
convention. Promotable to schema fields later if the typology stabilises
(see [[../proposals/facilitation-schema-promotion.md]] if filed).

## The five modes

### `primitive`

Pryv's permission / access-versioning / system-streams primitive
**technically enforces** the obligation. The implementer's part is
policy: choose the stream layout, choose the permission scope, classify
the data. The enforcement happens at the API surface; an
implementer-side violation is not possible *for the part Pryv covers*.

**Use when** the row's compliance check is satisfied by the access /
permission / stream design choices the implementer makes once — not by
an ongoing process.

**Examples:** `gdpr.Art.29` (workforce processes only on instructions
because permissions scope it), `gdpr.Art.9` (special-category isolation
on dedicated stream subtrees), `iso-27001.A.5.3` (segregation of duties
via distinct accesses).

### `evidence`

Pryv generates structured data (the audit log, the access version chain,
event version history) that the implementer **uses as proof** for a
regulatory artefact they produce — a Article 30 register, a breach
report, a §164.528 accounting of disclosures, an ISMS internal-audit
deliverable.

**Use when** the row's compliance burden is producing or maintaining a
written / reportable artefact, and Pryv's contribution is the data the
artefact cites.

**Examples:** `gdpr.Art.30` (records of processing), `gdpr.Art.24`
(controller accountability evidence), `hipaa-breach.164.402(1)`
(four-factor risk-assessment inputs), `mdr.Art.83` (PMS data sources).

### `storage`

Pryv durably stores artefacts the **implementer creates** — notice text,
consent records, policies-as-events, BAA references, classification
metadata. Pryv does not generate the content; it makes the content
recoverable per-subject and per-time.

**Use when** the row's compliance burden is "show the auditor the exact
text you presented", and Pryv's contribution is durable + per-subject
preservation of that text alongside the technical authorization.

**Examples:** `gdpr.Art.13/14` (notice at collection), `ccpa.1798.130(a)(5)`
(privacy-policy notice content), `hipaa-privacy.164.530(i)`
(policies-as-data on a designated stream), `pipeda.Principle.4.8`
(openness — published practices stored as events).

### `infrastructure`

Pryv runs the **technical layer** the obligation depends on — TLS,
mTLS, encryption-at-rest, multi-core HA, data-residency, backup-restore.
The obligation is satisfied because the technical layer exists, not
because the implementer composed anything.

**Use when** the row's compliance burden is "demonstrate the technical
controls", and Pryv ships the controls themselves.

**Examples:** `gdpr.Art.32` (security of processing — multi-aspect TLS +
HA + at-rest), `gdpr.Art.44` (data-residency controls international
transfers), `iso-27001.A.5.30` (ICT readiness for BCM), `hipaa-security.
164.308(a)(7)(ii)(C)` (emergency mode operation).

### `awareness`

Pryv has **minimal direct contribution**; the row exists so the
implementer doesn't forget the obligation. Often paired with a
`derives_from` cross-link pointing at the row in another scope that
*does* carry substantive Pryv contribution.

**Use when** the row is mostly framing or pointer; if Pryv were removed
from the equation, the obligation would still attach to the implementer
in nearly identical form.

**Examples:** `gdpr.Art.40` (codes of conduct), `gdpr.Art.42`
(certification), `iso-27001.A.5.21` (ICT supply chain management),
`pipeda.framing` (provincial regimes applicability).

## The three levels

Levels describe how much of the total obligation Pryv covers — not the
quality of the Pryv contribution.

### `high`

Pryv covers most of the obligation. The implementer's remaining work
is mostly **citing**, **composing** or **clicking** — choosing
configuration, signing an attestation, writing the executive summary
of the artefact Pryv's evidence makes trivial to produce.

Example: `gdpr.Art.30` records-of-processing — the register is
mechanically derivable from access + clientData + audit; the
implementer's part is the formatting + the human-readable summary.

### `medium`

Pryv covers about half. The implementer does substantive work — drafts
the notice text, classifies the data, designs the stream layout, runs
the periodic review cadence — but uses Pryv-provided primitives or
data as the substrate.

Example: `gdpr.Art.13` notice at collection — Pryv preserves whatever
notice you wrote, but the writing is on you.

### `low`

Pryv contributes a small substrate (this matrix as a supplier-evidence
artefact, the audit log as forensic evidence in defense). The bulk of
the obligation sits on the implementer.

Example: `gdpr.Art.40` codes of conduct — Pryv-side contribution is
"the audit log + this matrix demonstrate the technical-control side
of code adherence". The implementer drafts the code, the supervisory
authority approves it, the operator chooses to adhere.

## How to pick mode + level

Decision flow:

1. **Mode** — read the overview prose and ask:
   - Does Pryv's permission / access primitive enforce it? → `primitive`
   - Is Pryv's audit / version data the evidence layer? → `evidence`
   - Does Pryv store text the implementer wrote? → `storage`
   - Does Pryv run TLS / HA / encryption the obligation needs? → `infrastructure`
   - Otherwise (row is framing or pointer)? → `awareness`
   - Multiple modes co-dominant? Use the strongest one and note the
     others in the prose. Avoid `mixed` — pick the primary; mixed-mode
     is rare in practice and usually indicates the row should be split.

2. **Level** — ask:
   - If you removed the implementer's part entirely, would Pryv satisfy
     the obligation alone? → `high`
   - Implementer does roughly half the work? → `medium`
   - Implementer does most of the work, Pryv just makes it traceable?
     → `low`

When in doubt, pick the higher level — being slightly aggressive about
Pryv's contribution is fine for a draft; reviewers can revise downward.

## What this is not

- **Not a new coverage tier.** The five existing tiers (`implemented` /
  `configurable` / `facilitated` / `documented` / `out-of-scope`) are
  unchanged.
- **Not a schema field.** Today, the `facilitation: <mode> (<level>)`
  prefix lives in the `overview` text. The WAB parses the prefix; the
  validator ignores it. If the typology stabilises across the corpus,
  a future schema promotion adds `facilitation_mode` + `facilitation_level`
  enum fields (Path B in the proposal).
- **Not required for non-facilitated coverage.** `implemented` rows
  already carry their detail in `tests:` + `pryv_primitives:`;
  `configurable` adds `config_keys:`; `documented` adds `docs:`. Only
  `facilitated` needed the additional structure.
