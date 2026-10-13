# Rate limiting / API throttling / DoS protection

**Traffic shaping stays at the edge; Pryv enforces targeted
in-code budgets.** General rate limiting and DoS protection
(volumetric traffic, per-token request rates, WAF rules, DDoS
scrubbing) are handled at the reverse-proxy / WAF / API-gateway
layer, not inside open-pryv.io. Since open-pryv.io 2.0.0-rc.47
(updated 2026-10-13), Pryv does enforce **targeted budgets on the
abuse paths it can count correctly**: failed passwords per account
and per client address (counted across all cores), pending access
requests per address, pending MFA sessions per account, batch,
paging, upload and socket.io message sizes; 2.0.0-rc.50 added an
invitation-check budget, a `webhooks.test` interval, a preview
pixel cap and render concurrency, an SMS cost cap per core and a
restart backoff for crashing workers. These came out of the 2026
code-level security review (`code-security-review-2026.md`).
Before 2.0.0-rc.47 the only in-process throttle was the per-account
MFA backoff (2.0.0-rc.27). See "What is in Pryv-side scope today"
below; the edge recipes remain the recommended front.

## Why general traffic shaping stays at the edge

General in-process rate limiting inside Pryv was considered and
rejected for two reasons. The targeted budgets below avoid the first
by keying on the account (counted on its home core) or by sharing the
counter through the platform database:

1. **Multi-core load distribution makes in-process throttling
   mis-fire.** When a deployment spans N cores behind a load
   balancer, each core sees only its share of the traffic. A
   per-core counter sees `1/N` of the actual incoming rate; a
   "true" cross-core rate-limit needs shared state (Redis,
   PostgreSQL row, rqlite key, all of which add a hot-path
   dependency that itself becomes a DoS target). Cross-region
   multi-hosting (Pryv's data-residency feature) makes a shared
   counter even more pathological.

2. **DoS / abuse signatures are operator-specific.** What counts
   as "abusive" depends on the workload: a research consortium
   running batch imports has legitimate 10K-events/min bursts;
   a consumer health app should never see one user generate
   100 events/sec. Pryv-side defaults would mis-fire for both.

The right place for traffic shaping is **the layer that already
sees all traffic before sharding**, the reverse proxy / API
gateway / WAF. Those tools (Cloudflare, AWS WAF, nginx `limit_req`,
HAProxy, etc.) are purpose-built for this, already deployed by the
operator for other reasons (TLS termination, geo-routing,
WebSocket upgrades), and tunable per the operator's actual traffic
profile.

## What the operator handles

Standard operator-side protections that compose with Pryv:

- **Per-IP rate limits**: nginx `limit_req_zone`, HAProxy
  `stick-table`, Cloudflare Rate Limiting Rules.
- **Per-token rate limits**: same tools, keyed on the
  `Authorization` header value rather than the source IP.
- **Per-route rate limits**: heavier limits on
  `/auth/login`, `/reg/access`, `events.create` than on read
  endpoints.
- **WAF rules**: OWASP CRS, custom rules blocking known abuse
  signatures (e.g., paths Pryv doesn't expose; user-agent
  blocklist).
- **Account-lockout policies**: `fail2ban` watching audit logs +
  banning IPs that exceed N auth failures in T minutes. Pryv's
  audit log feeds this (every failed `auth.login` is a row);
  fail2ban is the trigger + banner.
- **DDoS scrubbing**: Cloudflare, AWS Shield, etc., at the edge
  CDN layer.
- **Burst / cost protection**: request size limits, max-events-
  per-batch caps, slow-loris timeouts. Already in nginx /
  Cloudflare defaults; operator tunes per workload.

Multi-core deployments behind a single edge layer (single Cloudflare
zone, single load balancer) handle the "where to keep the counter"
problem cleanly, the edge sees all traffic.

## What Pryv contributes

Pryv-side contribution to the operator's DoS / rate-limiting
posture is in the **detection layer**, not the enforcement layer:

- **Audit log of every API call.** Per-user SQLite audit row per
  API method invocation includes timestamp, access reference,
  method, key request fields. `fail2ban` and SIEM tools consume
  this to drive policy.
- **Observability emitter** (when configured). Per-core, per-method
  request rate + latency + error rate metrics feed
  capacity-management dashboards + anomaly-detection rules.
- **Access primitive for revocation.** When abuse is detected,
  `accesses.delete` cuts off the offending token immediately;
  audit log records the revocation.
- **Failed-auth visibility.** Failed `auth.login` / failed token
  validation surfaces in the audit log so the operator's rate-
  limit policy has a feed.

## Matrix rows that lean on this

Rows whose `detail` should call out the operator-side responsibility
+ the Pryv-side detection contribution:

| Scope | Row | Today | After update |
|---|---|---|---|
| iso-27001 | A.8.6 capacity management | F: Infrastructure \| Medium | unchanged; clarify "reactive scaling, not protective throttling" |
| iso-27001 | A.8.21 network services security | F: Infrastructure \| Medium | unchanged; spell out operator-side rate-limit responsibility |
| iso-27001 | A.5.7 threat intelligence | F: Evidence \| Low | unchanged; cite audit feed for operator's threat-intel programme |
| hipaa-security | 164.308(a)(5)(ii)(C) login monitoring | F: Evidence \| Medium | unchanged tier; cites the Pryv-side MFA backoff (rc.27) and, since rc.47, the per-account and per-address password budgets (corrected 2026-10-13: the row said Pryv did not throttle passwords) |
| hipaa-security | 164.308(a)(6)(i) incident procedures | F: Evidence \| Medium | unchanged; same framing |
| hipaa-security | 164.312(d) authentication | Implemented \| High | unchanged; mention failed-auth visibility + fail2ban pattern; cites the Pryv-side MFA backoff, atomic TOTP consumption and boot-time `services.mfa` check (rc.27) |

## What is in Pryv-side scope today

- HTTPS body size limits (Express body-parser defaults).
- Connection timeouts at the Node.js HTTP server layer.
- The Lets-Encrypt + bootstrap-bundle layers don't expose
  unauthenticated mutation endpoints; the public surface is small.
- **Per-account MFA backoff** (open-pryv.io 2.0.0-rc.27, `6231a37c`,
  `aa445c43`). Pryv itself throttles second-factor guessing: after
  `services.mfa.attempts.backoff.freeFailures` failed second factors
  (default 3) within `perAccountWindowSeconds` (default 900 s), each
  further failure delays the next attempt, doubling from `baseSeconds`
  (2 s) up to `maxSeconds` (300 s); `mfa.verify` / `mfa.confirm` /
  `mfa.challenge` answer 429 `too-many-attempts` with `Retry-After`
  meanwhile. It is a delay, never a lockout (a password holder cannot
  lock the real user out; a success clears it). The counter is keyed
  on the account and lives on its home core, so the multi-core
  objection above does not apply to it. The `attempts` block is
  platform-wide policy (same values on every core);
  `backoff.maxSeconds: 0` disables it when you throttle at the edge
  instead.
- **Failed passwords, per account** (open-pryv.io 2.0.0-rc.47).
  Sign-in, `account.changePassword` (old password), the MFA step-up
  by password and `mfa.recover` count on one tally; after
  `auth.passwordAttempts.freeFailures` failures (default 5) within
  `windowSeconds` (900), the next attempt answers 429
  `too-many-attempts` with `Retry-After`, without checking the
  password, for `baseSeconds` (2) doubling up to `maxSeconds` (300;
  `0` disables). A delay, never a lockout; a success clears it.
  Tests `[CEPB1]`..`[CEPB6]`.
- **Failed passwords, per client address** (2.0.0-rc.47). Past
  `auth.passwordAttempts.perIp.maxFailures` failures (default 30)
  within `perIp.windowSeconds` (900), from one IPv4 address or IPv6
  /64, whatever the account and **across all cores** (the counter
  lives in the platform database), those calls answer 429 until the
  window ends. Tests `[CEPI1]`..`[CEPI8]`.
- **Credential methods are not batchable** (2.0.0-rc.47): `auth.login`,
  `mfa.recover` and the other credential-taking methods answer 400
  inside a batch call or over socket.io, so a batch can no longer
  carry many guesses past an edge limit that counts HTTP requests
  `[CEDB1]`, `[SION5]`. A batch holds at most 1000 calls and its
  results are bounded by `limits.batch.maxTotalItems` `[CEDB5]`,
  `[CEDB6]`.
- **Unauthenticated entry points** (2.0.0-rc.47, rc.50): one address
  holds at most `access.maxLiveRequestsPerIp` live `/reg/access`
  requests (default 50), and an unread request lives
  `access.unopenedRequestTtl` (600 s) `[RAI1]`, `[RAU1]`;
  `POST /access/invitationtoken/check` allows 10 checks a minute per
  address `[IVCK1]`; password reset requests were already budgeted
  per account and per address (2.0.0-rc.43).
- **Per-account caps**: `services.mfa.sessions.maxPendingPerUser`
  pending MFA logins (default 5) `[MCPU1]`; SMS sends per session,
  per user, per destination (platform-wide since 2.0.0-rc.50) and per
  core (`services.mfa.methods.sms.sendLimits.perCorePerHour`, default
  100, the toll-fraud cost cap) `[MSSL1]`, `[MSSL11]`;
  `webhooks.test` once per webhook interval `[WHTT1]`.
- **Resource bounds**: `events.get` `limit` / `skip` within 0..100000
  and PostgreSQL results streamed through a cursor `[EGLV1]`,
  `[EGLC1]`; uploads limited to one event part and `uploads.maxFiles`
  files (default 10) with the size limit applied by default
  `[MPLM3]`, `[MPLD1]`; socket.io namespaces restricted to user names
  and messages to `socketIO.maxMessageBytes` `[SION1]`, `[SION4]`;
  previews refuse images over `eventFiles.previewsMaxInputPixels`
  and render at most `eventFiles.previewsRenderConcurrency` at once
  `[PVPX1]`, `[PVRQ1]`; the embedded DNS bounds its TCP connections
  (`dns.tcpMaxConnections`, 2.0.0-rc.46).
- **Recovery**: a worker that keeps crashing is replaced after a
  delay doubling up to 30 s (2.0.0-rc.50) `[WRBO1]`.

**Client address**: every per-address budget reads the address
through `http.trustedProxies` only. Behind a reverse proxy, list it
there, or every client shares the proxy's budget `[CEPI2]`, `[RAI3]`.

These budgets close specific abuse paths; they do not substitute for
an edge layer (volumetric floods, per-token request rates on data
routes, WAF rules, DDoS scrubbing). Run the edge recipes in front of
any internet-facing core.

## When this stance might change

The targeted budgets above answer the original "no reverse proxy in
front" concern for the authentication and resource paths. A general
opt-in per-core rate-limit middleware (request rates per token or
route) remains a backlog candidate, not filed.

## Reference configs (planned)

While general in-process rate-limiting stays out of scope, a **reference
reverse-proxy configuration** now ships with the developer site:
[Rate limiting and DoS protection](https://pryv.github.io/customer-resources/rate-limiting/)
(nginx + fail2ban, verified end to end against a running core).
It keys limits on the routes that matter (per IP on login, MFA,
registration, password reset and access requests; per token on data
reads and writes), caps bodies and slow clients, returns a JSON 429,
bans addresses with fail2ban jails reading the nginx logs, gives
limits for three workload profiles (consumer app, B2B research,
hospital) and a load test that proves each limit fires. HAProxy,
Cloudflare, Traefik and Caddy apply the same route table; dedicated
snippets for them are not shipped yet.

## Related primitives

- `audit`: feeds operator-side rate-limit + fail2ban tooling.
- `observability-provider`: surfaces request-rate metrics for the
  operator's monitoring.
- `access`: the revocation primitive when abuse is detected.
