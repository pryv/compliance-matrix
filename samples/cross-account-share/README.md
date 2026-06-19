# cross-account-share

A two-pane demonstrator of **controller-to-controller** data sharing between
two Pryv accounts via CMC (Consent-Managed Capabilities) — driven by subject
consent, **not** joint controllership.

## What it demonstrates

- **GDPR Art.6(1)(a)** consent + **Art.7** conditions for consent.
- **GDPR Art.20(2)** direct transmission controller-to-controller.
- **GDPR Art.30** records of processing (the `consent/*` event chain + the
  access pair are the record).

> **Not Art.26.** CMC is controller-to-controller transmission by subject
> consent, *not* joint controllership. A is a controller; B is a controller;
> they are not joint controllers. Each side keeps its own consent record and
> can independently exercise erasure on its own copy (core-affinity).

## The flow

1. **User A** signs in (left pane) and initiates a sharing request — a
   `consent/request-cmc` event describing the requested scope.
2. **User B** signs in (right pane), sees the request, and **accepts** — a
   `consent/accept-cmc` event + the back-channel access.
3. Both panes render their own `consent/*` event chain and the resulting
   access, making "who controls what" visible.
4. Either side can independently **revoke** (`consent/revoke-cmc`) — local
   deletion is authoritative; peer delivery is best-effort.

## Important — verify against your deployment

The exact CMC method/event wiring is deployment-specific. This sample uses the
`consent/*` event types as the consent record and `events.create` /
`events.get` as the transport; confirm the handshake specifics against your
open-pryv.io build:

- `components/cmc/` — the CMC handlers (e.g. `handleRevoke.ts`: "local
  deletion authoritative, peer delivery best-effort").
- The `consent/*` event formats + the CMC-≠-Art.26 framing are described in
  the matrix context note `context/cmc-consent-primitives.md`.

This is a reference skeleton: it shows the narrative and the record shape, not
a production handshake implementation.

## Run

```bash
npm install
npm run dev      # backloop.dev HTTPS
```

Open two personal API endpoints (A and B); for a true cross-platform demo use
two different deployments.

## Backed matrix rows

`gdpr.Art.6`, `gdpr.Art.7`, `gdpr.Art.20`, `gdpr.Art.30`.
**Do not** cite `gdpr.Art.26`.
