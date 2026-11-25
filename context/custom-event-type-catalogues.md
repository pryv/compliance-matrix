# Custom event-type catalogues: the extension model

**Status:** Pryv's documented extension surface for implementers
needing event types beyond the upstream `pryv/data-types`
catalogue. Recorded from the gap-probing session (Q14, 2026-05-20)
after the implementer-perspective question on custom event-type
support.

## TL;DR

Implementers add custom event types **without forking
`pryv/data-types`**. They maintain a **sibling data-model repo**
(small, schema-only, no Pryv runtime), publish a merged catalogue
to a URL, and point each Pryv.io deployment's
`service.eventTypes` config at that URL. The server fetches the
catalogue at startup and applies it **entry by entry** on top of
the bundled defaults, so custom types are **first-class**,
validated by the same pipeline as the standard catalogue, returned in
`events.get` with the same canonical shape, and portable in
`events.json` for GDPR Art.20.

## How it works in code

`components/business/src/types.ts`, `TypeRepository.tryUpdate(sourceURL)`:

1. Fetches `service.eventTypes` URL at startup (or `file://`
   for tests).
2. Checks that the response compiles as a schema as a whole
   (`validator.validateSchema`), then warns about each type whose
   own schema is malformed: every event of such a type is refused.
3. Applies it onto `event-types.default.json` (the bundled
   catalogue, mirroring `pryv/data-types`), entry by entry: each
   type it carries replaces the bundled one **whole** (not a deep
   merge), and bundled types it does not carry stay. A catalogue
   can therefore add and override types, not remove one.

`components/api-server/src/methods/events.ts` and
`components/hfs-server/src/application.ts` both read
`service:eventTypes`: API and HFS use the same catalogue.

`service.eventTypes` is required: a core without it does not start
(`config/plugins/config-validation.js`). When the URL cannot be
fetched, or its answer is not JSON or does not compile, the core
starts on the bundled types only, logs an error, retries in the
background, and refuses events of unknown types until it loads
`[ETD2]`, `[ETD3]`; `GET /system/event-types-status` (admin key)
tells `[ETD4]`.

## The HDS exemplar

`hds-macro/data-model` is a real-world implementer-side custom
catalogue. It demonstrates the pattern end-to-end:

```
hds-macro/data-model/
├── definitions/
│   ├── eventTypes/
│   │   ├── eventTypes-legacy.json    ← mirror of upstream
│   │   │                                pryv/data-types
│   │   └── eventTypes-hds.json       ← HDS-specific additions
│   │                                    (vulva-mucus-inspect/
│   │                                    9d-vector, etc.)
│   ├── items/                        ← health-data-point
│   │                                    definitions
│   ├── streams/                      ← stream hierarchy
│   └── converters/                   ← cross-method converters
├── src/eventTypes.js                 ← merge + duplicate-key
│                                       check
└── dist/eventTypes.json              ← published artefact
```

The build merges legacy + HDS into `dist/eventTypes.json` with
**duplicate-key detection** (catches accidental overrides of
upstream types). The published catalogue at `model.datasafe.dev`
is served via GitHub Pages.

A Pryv.io deployment serving HDS sets:

```yaml
service:
  eventTypes: https://model.datasafe.dev/eventTypes.json
```

## Two publication strategies

The implementer chooses between:

1. **Additive catalogue**: publish only the custom types (e.g.,
   `{ "types": { "measurement/vo2max": {...} } }`). The server
   merges them onto the baked-in default. **Simpler to
   maintain**, the implementer doesn't track upstream
   `pryv/data-types` updates; they ride free.

2. **Complete merged catalogue** (HDS choice), vendor a full
   copy of upstream + add custom. **Deterministic control**,
   the operator pins the exact catalogue version + can
   selectively cherry-pick upstream updates instead of taking
   them automatically. Trade-off: the implementer takes
   ownership of staying current with upstream.

For most implementers the additive strategy is the right
default. The complete-merge strategy fits regulated deployments
(HDS, DiGA, MDR) where the operator wants explicit control over
which schema versions are in force at audit time.

## Compliance implications

| Obligation | Implication |
|---|---|
| GDPR Art.20 (portability) | Custom types serialise identically to legacy types; export bundles travel between deployments with the same JSON shape. Receiving Pryv.io deployments either ship the same catalogue (interoperable) or store the events of types they do not know without validating their content. |
| MDR Annex II §5 (device-record schemas) | Implementer custom schemas live alongside legacy `pryv/data-types`; MDR-specific device-record formats can be authored once + reused across deployments. |
| DiGA Annex 1.3.1 (FHIR-R4 requirement) | A FHIR-flavoured custom catalogue (mapping each FHIR resource to a Pryv event type) plugs into the extension model. The implementer maintains the FHIR-Pryv binding repo. |
| ISO 13485 7.3 (design-control documentation) | The data-model repo IS the design-control artefact for the data layer, versioned, reviewed, signed off per ISO 13485 §7.3.4. |
| HIPAA-Privacy §164.514 (de-identification) | Custom types can carry de-identification flags (e.g., `de_identified: true` field in the schema) that downstream rules engines consume. |

## Schema integrity guarantees

- **A catalogue that does not load is not applied**: the core starts on the
  bundled types and keeps retrying (above). The catalogue is loaded
  once, at startup; a change of yours takes effect at the next
  start of each core.
- **Per-event validation at write time**, for types in the
  catalogue: `events.create` and `events.update` reject invalid
  content with `400`; the event is not stored.
- **Unknown types are not refused.** An event of a type that is not
  in the catalogue is accepted with any content `[ETD1]` (except by
  a core whose catalogue has not loaded yet, and for `series:`
  types). No setting makes the catalogue an allow-list: if only
  declared types may be stored, check it in your app or review the
  types in use.

## What the extension model does NOT cover

- **Server-side computed fields** (e.g., "automatically calculate
  BMI from `height` + `weight`"), that's application-layer
  responsibility, not a custom type definition.
- **Custom converters / transformations**: the HDS data-model
  ships a `converters/` directory but those are
  application-layer artefacts; Pryv stores the input + output
  events and the conversion happens client-side or in a separate
  service.
- **Custom stream hierarchies**: the data-model can document
  stream conventions (HDS does this in `definitions/streams/`)
  but Pryv doesn't enforce them at the API layer. Stream IDs are
  free-form per-user; the catalogue is documentation +
  client-side hint, not server-side schema.

## Related

- `pryv/data-types` upstream:
  https://github.com/pryv/data-types, the baked-in default
  (`event-types.default.json` mirrors it at build time).
- `hds-macro/data-model` exemplar, a sibling project (external
  to the open-pryv.io workspace).
- `docs/pryv-primitives.md` `data-types` primitive entry,
  references this context note.
- Server code: `components/business/src/types.ts`,
  `components/business/src/types/event-types.default.json`
  (~4750-line built-in fallback).
