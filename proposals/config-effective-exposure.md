# Read-only effective-configuration endpoint

**Status: shipped in open-pryv.io `21fd8085`** (the merge to master; it ships
in the release after open-pryv.io 2.0.0-rc.87, not tagged at the walk: name the
tag here once it is cut). The admin-panel "Configuration" view over the same data
is not shipped: it stays a later, non-gating item of the admin-panel effort and
moves no row. Rows walked 2026-11-23 (`UPDATE-TRIGGERS.md` Section A
`CONFIG-EFFECTIVE-EXPOSURE`); the five `planned:` chips are discharged.
**Proposal mirror of**: no standalone backlog file, the work was absorbed by the
operator bootstrap + admin-panel effort (macroPryv-side plan); the endpoint was
delivered on its own, ahead of the panel.
**Filed during:** DPIA Section (d) safeguards-inventory gap-probing (2026-05-21).
**Tracking card:** https://github.com/orgs/pryv/projects/5?pane=issue&itemId=219705795&issue=pryv%7Copen-pryv.io%7C118
**Surfacing question:** *"My impact assessment has to inventory the safeguards
actually in force on each core. How do I read them without SSH-ing the box?"*

## Today's state (verified at the walk, open-pryv.io `21fd8085`)

| Control | Status | Anchor |
|---|---|---|
| Configuration layering documented | ✅ | `default-config.yml` + `override-config.yml` + `host-config.yml` |
| Validation on start | ✅ | `config-validation` plugin at master start |
| Machine-readable effective config, per core | ✅ | `GET /system/admin/config/effective` (admin key; method `system.getEffectiveConfig`), `[CFE1]`, `[CFE2]` |
| Secret redaction contract | ✅ | allow-list classification with default-deny, value scan, URL sanitising that fails closed, keyed path-bound fingerprints, `[CFE5]`, `[CFC0]`..`[CFC4]`, `[CFC7]` |
| Cross-core configuration drift detection | ✅ | `configMeta.digests.platform` (cores) and `.full` (baseline), `?digest=true`, `[CFE3]`, `[CFE6]`, `[CFC8]` |
| Configuration view in the admin panel | later | not shipped; later, non-gating item of the admin-panel effort |

Before this release the effective configuration of a running core was only
readable by logging into the machine and re-deriving the merge of the YAML layers,
so every compliance artefact describing deployed technical measures was assembled
by hand and went stale immediately.

## What shipped

Source: open-pryv.io `CHANGELOG-v2.md`, "Effective configuration of a core, secrets
redacted (new admin route)"; developer site, system reference, "Get the effective
configuration" (`config.effective.get`). Tests: `components/api-server/test/system-config-effective.test.js`
(`[CFE1]`..`[CFE8]`) and `components/business/test/unit/effectiveConfig.test.js`
(`[CFC0]`..`[CFC9]`).

- **`GET /system/admin/config/effective`**, admin key in `Authorization`, `404`
  without it: `{ configMeta, keys }`, the configuration the answering core runs
  with. `keys` is a flat sorted map keyed by dotted path, each entry
  `{ value, source, scope }`. `source` names the layer that set it
  (`default-file`, `base-file`, `override-file`, `bootstrap-file`, `env`, `argv`,
  `derived`, `service-info`, `shipped-plugin`, `built-in`, `platform-db` for the
  observability values a platform row decides). `scope` is `platform` (expected
  identical on every core) or `core` (differs by design).
- **Secrets never shown.** A secret, or a subtree that can carry credentials (SMS
  provider endpoints, telemetry headers, data-store settings, OAuth extension
  options), is `{ redacted: true, class, set, type, placeholder?, size?,
  fingerprint? }`, with no fragment of the value. The fingerprint (12 hex) is an
  HMAC keyed by `auth.filesReadTokenSecret` and bound to the path: equal values on
  two cores show the same fingerprint, and a guessed value cannot be tested without
  that secret. `auth.adminAccessKey` and `auth.filesReadTokenSecret` never carry
  one. No fingerprints at all when `auth.filesReadTokenSecret` is a placeholder, a
  published value or shorter than 16 characters (`configMeta.secretFingerprints:
  false`).
- **Shown only when classified (default-deny).** Every key is classified (shown, URL
  origin only, secret, opaque); a key no rule names is redacted as `unclassified`,
  as is a shown key whose name looks like a secret. Shown strings are scanned
  (configured secrets and their encoded forms, PEM, `Bearer`/`Basic`, JWT, key-like
  material, `user:password@host`). A URL loses its credentials, query values and
  `;` parameters; one that does not parse cleanly is redacted (fails closed).
  Environment variables and flags appear only when they set a known key; unknown
  top-level keys are listed by name only.
- **Two digests** (SHA-256 of the canonical JSON of `{ format, keys }`, without
  `source` and `scope`): `platform` over the platform keys, to compare cores;
  `full` over every key, for a per-core baseline. `?digest=true` answers
  `configMeta` only. `configMeta` also carries `format`
  (`pryv-effective-config/1`), `coreId`, `apiVersion`, `snapshotAt` and the file
  names.
- **Audited without a user** (syslog when the audit syslog is on), logged
  (`[config-effective-read]`), `Cache-Control: no-store`; only `digest` is accepted
  as a parameter (`400` otherwise); `503` when platform storage is unreachable.
- **Limits, stated on every row**: it shows configured values, not that a control
  is effective; it is the view of the API worker that answers (values the master
  process alone sets are not in it); it covers Pryv's configuration, not the host,
  network or database server.

Deltas from the proposal: the redaction contract is an allow-list classification
of every key with default-deny (not a `SECRET_KEYS` list plus `secret: true` schema
annotations); secrets carry a keyed fingerprint so drift in hidden values still
shows; the admin-panel view is not part of this delivery.

## Rows walked (applied 2026-11-23)

| Scope | Ref | Applied |
|---|---|---|
| gdpr | Art.30 | chip removed; detail: the §1(g) description of technical security measures can be emitted per core as a redacted machine-readable document |
| gdpr | Art.32 | chip removed; new per-aspect bullet: operator-readable evidence of the configured safeguards, configuration not effectiveness |
| gdpr | Art.35 | chip removed; §7(d): the DPIA safeguards inventory can cite a dated, digest-stamped per-core snapshot |
| iso-27001 | A.8.9 | chip removed; overview + new detail: readable and comparable (per-core and platform digests) without host access |
| hipaa-security | 164.308(a)(8) | chip removed; overview + detail: the periodic evaluation can diff the `full` digest against the previous baseline |

Operator ruling 2026-11-23: `pryv_effort_saved` raised from low to medium on gdpr Art.35,
iso-27001 A.8.9 and hipaa-security 164.308(a)(8) (each now cites a machine-readable,
comparable per-core snapshot instead of a hand-assembled inventory). Coverage and
facilitation mode unchanged (A.8.9 stays `evidence`: the route is evidence, not a setting);
Art.30 and Art.32 unchanged. `reviewed_at` left unchanged.

## As filed (2026-05-21): after shipping

A read-only, per-core admin route returning the merged effective configuration
(including YAML-only key families), with secrets redacted via an explicit secret-key
list plus a schema annotation, a digest mode for cheap cross-core drift comparison,
and a Configuration view in the admin panel over the same data.

| Scope | Ref | Kind | Impact | After shipping |
|---|---|---|---|---|
| gdpr | Art.30 | feature | medium | the §1(g) "description of technical security measures" becomes emitable evidence rather than a hand-written inventory |
| gdpr | Art.32 | feature | low | strengthens the evidence narrative around operator-visible safeguards |
| gdpr | Art.35 | feature | medium | DPIA safeguards inventory cites endpoint output; row could shift from awareness to evidence |
| iso-27001 | A.8.9 | feature | medium | direct match on configuration-management evidence; row could move toward configurable |
| hipaa-security | 164.308(a)(8) | feature | medium | the periodic evaluation gains a technical baseline snapshot to measure against, instead of reconstructing it per assessment cycle |

All five rows carried a chip (discharged 2026-11-23). The chips carried no
`backlog:` key: this work had no standalone backlog file and was delivered by the
operator bootstrap + admin-panel effort. `planned.backlog` is optional in the
schema and `scripts/validate.js` only resolves it when set, so no stub file was
needed.
