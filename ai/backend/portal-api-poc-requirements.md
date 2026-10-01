# Portal API — PoC requirements (Vercel + Neon)

**Status:** Partial (28 September 2026). Demo live: SPA <https://raisd-student-portal.vercel.app> → API <https://raisd-portal-api.vercel.app> → Neon. Checked: PoC-F2, F3, F5, F6, F7, F8, F9 and PoC-S1, S2 (token survives a redeploy; logout → 401; deep links refresh; `CORS_ORIGIN` = SPA + GitHub Pages, other origins refused; only portal-api holds `DATABASE_URL`). Open: PoC-F1 (the SPA uses the HTTP adapter, but `MockPortalApi` fixtures still ship in the bundle because `portal-runtime.tsx` imports the mock statically), PoC-N7 (both projects deploy prebuilt from a maintainer checkout, not from Git), Preview-origin CORS. Hosted on a personal Hobby team, not the PoC-P1 Pro team.  
**Architecture and how-to:** [architecture/vercel-neon-poc.md](../architecture/vercel-neon-poc.md) (diagram, provisioning steps).  
**This file:** what the PoC must do, what it needs, how it is accepted, and what it does not prove.  
**Production target (unchanged):** [portal-api-deployment.md](portal-api-deployment.md), [SDD-12](../../sdd/12-deployment-architecture.md). The PoC is not an ADR and never Live.

## 1. Purpose

Put a clickable, shareable Demo of the **student portal + Portal API** on public URLs so stakeholders can try the RPC contract end to end without a local checkout, and so the team can rehearse the "SPA → Portal API → Postgres" shape before the k3s stage 1 node exists.

Success = a reviewer opens one URL, signs in to a Demo scenario, and every request they trigger goes browser → Portal API → Neon (sessions and Demo records) with the same OpenAPI contract as local.

## 2. Scope

| In scope | Out of scope |
|---|---|
| `student-portal` SPA on Vercel (project A) | Applicant, lecturer, staff portals (same pattern later) |
| `portal-api` on Vercel Node runtime (project B) | Any Live CMS write or CMS connectivity |
| Neon Postgres (free tier) for sessions and Demo tables | Evidence / payment-proof durable storage |
| Four Demo scenarios (`mid-programme`, `first-semester-registration`, `new-student-pass`, `graduation-ready`) | Real identity, real students, PII |
| Preview deploys per PR on both projects | `raisd.co` hostnames (reserved for SDD-12) |

## 3. Prerequisites (accounts and access)

| ID | Requirement | Owner | Notes |
|---|---|---|---|
| PoC-P1 | Vercel team for `raisd-campus` | Infra owner — TBC | Vercel Hobby is limited to personal, non-commercial use; plan for a **Pro** team (confirm pricing and seats before creating) |
| PoC-P2 | Vercel GitHub App installed on `raisd-campus` with access to `student-portal` and `portal-api` | Org admin | Private repos |
| PoC-P3 | Neon via Vercel Marketplace, attached to the **portal-api** project only | Infra owner | `DATABASE_URL` injected for Preview + Production |
| PoC-P4 | `NODE_AUTH_TOKEN` (packages:read) in the student-portal Vercel project | Org admin | Installs `@raisd-campus/design-system` from GitHub Packages |
| PoC-P5 | Mock engine available to the API build without a sibling checkout | Backend | Requires [phase 1](portal-api-development-plan.md#phase-1) of the plan (package or bundle). **Hard blocker** |
| PoC-P6 | Named PoC owner who can wipe/rotate Neon and revoke Vercel tokens | TBC | |

## 4. Functional requirements

| ID | Requirement | Acceptance check |
|---|---|---|
| PoC-F1 | SPA is built with the HTTP `PortalApi` adapter (`VITE_PORTAL_API_URL` set); no `MockPortalApi` in the shipped bundle | Bundle search for mock module id returns nothing; network tab shows API calls |
| PoC-F2 | `POST /v1/auth/login` issues a bearer token for a chosen scenario | 200 with `accessToken`, `scenarioId`, `studentProfileId` |
| PoC-F3 | Sessions persist in Neon, not in process memory | Token issued by one invocation is accepted by a later cold invocation; row visible in `poc_sessions` |
| PoC-F4 | `POST /v1/portal/:method` works for every method in `openapi.yaml` that the SPA calls on the core screens (dashboard, modules, timetable, finance, immigration, graduation, online forms, profile) | Smoke script green; manual walkthrough §7 |
| PoC-F5 | `POST /v1/auth/scenario` switches scenario; `POST /v1/auth/logout` revokes the session row | Old token → 401 after logout |
| PoC-F6 | Response envelope keeps `cms: { acknowledged: true, mode: "stub" }` | Visible in responses; UI labels remain Demo |
| PoC-F7 | `GET /health` and `GET /v1/meta` return service info incl. `cmsMode: "stub"` | 200 |
| PoC-F8 | SPA client routes (`/academic/*`, `/profile/*`, …) resolve on refresh | Vercel rewrite to `index.html` |
| PoC-F9 | OpenAPI contract is not forked: Swagger stays on [GitHub Pages](https://raisd-campus.github.io/portal-api-docs/openapi.html) | No second spec in Vercel projects |

### Session table (minimum)

```sql
create table poc_sessions (
  token_hash    text primary key,          -- sha256 of the bearer token; raw token never stored
  scenario_id   text not null,
  student_profile_id text not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null,
  revoked_at    timestamptz
);
create index poc_sessions_expires_at on poc_sessions (expires_at);
```

### Demo records (done 29 September 2026)

The stretch goal is met: Demo records persist in Neon. Every `PortalRecordGraph` collection is its own table (95 at schema v3, including campus policy; `record jsonb` plus generated browse columns), per-student engine state is in `student_portal_state`, `portal_meta` carries the write revision and `schema_version` (currently 3), and `audit_events` records every graph change. Four reporting views mirror the TypeScript projections (academic-status membership joins campus policy). Each request runs a fresh `MockPortalApi` over those records and writes back only changed rows, so edits survive cold starts and are visible from every instance. Schema and flows: [architecture/vercel-neon-poc.md](../architecture/vercel-neon-poc.md#demo-records). Reseed with `npm run db:reset` in portal-api.

## 5. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| PoC-N1 | Region close to users | Vercel function region `sin1` (Singapore); Neon region AWS `ap-southeast-1` |
| PoC-N2 | Warm API latency | p95 < 500 ms for `getDashboard` (warm); cold start < 3 s including Neon wake-up |
| PoC-N3 | Cost | $0 Neon; Vercel team plan only (PoC-P1). No paid add-ons |
| PoC-N4 | Capacity | ≤ 10 concurrent testers; stays within Neon Free (0.5 GB, 50 CU-h/month) |
| PoC-N5 | Availability | Best effort; Neon scale-to-zero is acceptable |
| PoC-N6 | Observability | Vercel function logs; request id per call; no tokens in logs |
| PoC-N7 | Reproducibility | Both projects deploy from `main` with no manual file edits; env vars documented in the repo README |

## 6. Security requirements

| ID | Requirement |
|---|---|
| PoC-S1 | Only the portal-api project holds `DATABASE_URL`; the SPA has no database or CMS variable |
| PoC-S2 | `CORS_ORIGIN` is the exact student-portal Production and Preview origins plus `https://raisd-campus.github.io` for Swagger "Try it out" (no `*`) |
| PoC-S3 | Preview deployments protected (Vercel Deployment Protection) or shared only by link with the working group |
| PoC-S4 | No real student data, no CMS dumps, no PII in Neon; the DB may be wiped at any time |
| PoC-S5 | No secrets committed; Neon credentials only via Marketplace injection; rotate the Neon role if a URL leaks |
| PoC-S6 | Demo scenario login is the only auth; the PoC is labelled Demo in the UI |

## 7. Acceptance walkthrough

1. Open the student-portal Production URL, pick `mid-programme`, sign in.
2. Network: `POST {API}/v1/auth/login` → 200; bearer stored in the SPA session.
3. Visit Dashboard, Modules, Timetable, Finance, Immigration, Graduation, Online Forms, Profile. Every data request is `POST {API}/v1/portal/<method>` → 200 with the stub `cms` block.
4. Wait 15 minutes (instance cold), refresh: still signed in (PoC-F3).
5. Switch to `graduation-ready`: data changes (PoC-F5).
6. Log out, replay an old request with the old token: 401.
7. Open a PR in `portal-api`: Preview API deploys; open a PR in `student-portal`: Preview SPA deploys and talks to the Preview or Production API as configured.
8. Neon console or DB admin: `poc_sessions` rows exist and contain hashes only; the record tables are populated and a Demo edit (e.g. starting an online form) appears as a changed row after the request.

The PoC is accepted when steps 1–8 pass and PoC-S1–S6 are confirmed by the PoC owner.

## 8. Exit criteria and teardown

| Outcome | Action |
|---|---|
| Accepted | Keep running for stakeholder demos until the k3s stage 1 node serves the same build; then delete both Vercel projects and the Neon project |
| Rejected / abandoned | Delete Vercel projects and Neon project; record the reason in [vercel-neon-poc.md](../architecture/vercel-neon-poc.md) |
| Graduation to production | Same Portal API contract; move durable data to SDD-12 Postgres; swap `DATABASE_URL` and CMS adapter. The SPA never learns a second data plane |

## 9. What the PoC does not prove

- CMS integration, acknowledgement semantics, or any CAP reaching Live.
- k3s behaviour: probes, rollouts, resource limits, node sizing (SDD-12).
- Evidence storage, upload scanning, backups, restore.
- Real identity, role or campus authorisation.
- Production latency from Malaysia to UltaHost Singapore.

## 10. Traceability

| Requirement group | Plan phase | Production counterpart |
|---|---|---|
| PoC-P5 | [Phase 1](portal-api-development-plan.md#phase-1) | Self-contained image ([deployment §4](portal-api-deployment.md)) |
| PoC-F3, F5 | [Phase 3.3](portal-api-development-plan.md#phase-3) (early cut) | `sessions` table on SDD-12 Postgres |
| PoC-N6 | [Phase 2.4](portal-api-development-plan.md#phase-2) | Structured logs on k3s |
| PoC-S2 | [Phase 2.5](portal-api-development-plan.md#phase-2) | `CORS_ORIGIN` per stage |
