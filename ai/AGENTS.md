# Raisd campus — agent instructions

These instructions apply to **every** repository under `raisd-campus` unless a portal-specific file under `frontend/` narrows them. Read this file before changing code or documentation.

**Knowledge base root:** this directory (`docs/ai/`).  
**Product baseline:** [`docs/sdd/`](../sdd/).  
**Organization:** [raisd-campus](https://github.com/raisd-campus).

## 1. Read order (any task)

1. This file.
2. [architecture/overview.md](architecture/overview.md) and [architecture/repositories.md](architecture/repositories.md).
3. The portal or service file that owns the change:
   - Student UI → [frontend/student-portal/AGENTS.md](frontend/student-portal/AGENTS.md)
   - Applicant UI → [frontend/applicant-portal.md](frontend/applicant-portal.md)
   - Lecturer UI → [frontend/lecturer-portal.md](frontend/lecturer-portal.md)
   - Staff UI → [frontend/staff-portal.md](frontend/staff-portal.md)
   - Portal API / identity / campus config → [backend/portal-api.md](backend/portal-api.md), then [development plan](backend/portal-api-development-plan.md), [target deployment](backend/portal-api-deployment.md), [PoC requirements](backend/portal-api-poc-requirements.md)
   - Canonical record schema / ERD (LUCT readiness — Schema v3 campus policy Demo done; see §7) → [backend/canonical-schema-luct-readiness.md](backend/canonical-schema-luct-readiness.md)
   - Pending schema confirmations (CS-01–CS-13: Schema v3 policy Demo done; campus Live readiness) → [../diagrams/canonical-schema-confirmations.html](../diagrams/canonical-schema-confirmations.html)
   - LMS research posture (Raisd CAP + F01–F37; no PPA LMS inventory here) → [architecture/lms.md](architecture/lms.md), [../diagrams/lms.html](../diagrams/lms.html)
   - Existing Cyberjaya CMS inventory / CAP comparison → [backend/old-cms-cyberjaya.md](backend/old-cms-cyberjaya.md), [backend/cms-feature-comparison.md](backend/cms-feature-comparison.md)
   - Sierra Leone CMS inventory (M5 pattern) → [backend/old-cms-sierra-leone.md](backend/old-cms-sierra-leone.md)
   - Botswana CMS inventory (M5 pattern) → [backend/old-cms-botswana.md](backend/old-cms-botswana.md)
   - Botswana DTEF / TEF.gov.bw scholarship sync → [backend/botswana-dtef-scholarship-sync.md](backend/botswana-dtef-scholarship-sync.md)
4. Matching SDD (`docs/sdd/04`–`08`, `12`, `14`) for the delivery contract. Jump any `CAP-*` / `M*` via [SDD-15 nomenclature](../sdd/15-nomenclature.md).
5. [MANIFEST.yaml](MANIFEST.yaml) if you need to discover related documents.

For any portal UI task, also read [design/component-library.md](design/component-library.md) and the package's [component catalogue](https://github.com/raisd-campus/design-system/blob/main/docs/components.md) before creating a visual component.

## 2. Product boundaries (campus-wide)

- **Four portals, one existing CMS.** Applicant, Student, Lecturer, and Staff are separate webs. They talk only to the **Portal API**. They never write directly to Postgres or the existing CMS.
- **Cyberjaya first.** Admissions before semester registration. Core mobile at launch means phone-friendly agreed journeys, not a verified native-app mandate.
- **This phase — ADR-1 (confirmed Aslam, 23 Sep 2026):** keep the existing Cyberjaya CMS as system of record; build modern portal experiences via the Portal API; **do not duplicate** operational functions. Inventory and CAP mapping: [backend/cms-feature-comparison.md](backend/cms-feature-comparison.md).
- **Longer term:** progressive **unified one-stop CMS**, only on verified gaps with an explicit migration strategy ([M5](../sdd/03-delivery-milestones.md#m5)+ backlog — not launch rewrite). Target vision (proposed): one product with **distributed country data planes**, white-label, and feature flags — [architecture/distributed-cms-target.md](architecture/distributed-cms-target.md), diagram [`docs/diagrams/distributed-cms-architecture.html`](../diagrams/distributed-cms-architecture.html). See [architecture/overview.md](architecture/overview.md) and [SDD-03](../sdd/03-delivery-milestones.md).
- **Demo ≠ Live.** Sample data and session-only mutations are Demo. Live requires durable save through the Portal API (or approved production path), server-enforced authz, and a named owner.
- Do not present planned or speculative capabilities as implemented.
- Do not invent campus policy, legal basis, EMGS outcomes, or tax treatment beyond what the knowledge base already records as prototype assumptions.

## 3. Repository map

| Repository | Owns | Agent entry |
|---|---|---|
| `control-plane` | Campus config, identity design, Portal API contract (`openapi.yaml`), SDD, **this knowledge base** | this file |
| `portal-api` | Portal API service code, image, CI, its own deploy manifests | [backend/portal-api.md](backend/portal-api.md) |
| `student-portal` | Enrolled-student web (current deepest Demo UI) | [frontend/student-portal/AGENTS.md](frontend/student-portal/AGENTS.md) |
| `applicant-portal` | Online registration (Admissions launch) | [frontend/applicant-portal.md](frontend/applicant-portal.md) |
| `lecturer-portal` | Lecturer web | [frontend/lecturer-portal.md](frontend/lecturer-portal.md) |
| `staff-portal` | Registry / Faculty / Bursary / QA / Marketing | [frontend/staff-portal.md](frontend/staff-portal.md) |
| `design-system` | Versioned shared tokens/components | [design/component-library.md](design/component-library.md), [design/design-system.md](design/design-system.md) |
| `portal-api-docs` | Public OpenAPI + Swagger (GitHub Pages) | [backend/portal-api.md](backend/portal-api.md) |

Local checkouts are siblings under `~/src/raisd/`. See [architecture/repositories.md](architecture/repositories.md).

## 4. Architecture rules agents must not violate

- Portal API write success only after the CMS acknowledges the write (when Live/CMS-connected).
- Authorisation is server-enforced. Client-side role hiding is not security.
- Evidence, assignments, and payment proofs need a durable file store for Live; metadata-only demos are not Live.
- Hosting: existing UltaHost VDS / staged k3s plan in [architecture/deployment.md](architecture/deployment.md) and [SDD-12](../sdd/12-deployment-architecture.md). Do not invent a greenfield cloud topology without an ADR update. A documented **PoC-only** Vercel + Neon path lives in [architecture/vercel-neon-poc.md](architecture/vercel-neon-poc.md); it must not be treated as Live or as replacing ADR-2/ADR-3.
- CAP IDs are shared across portals: the same CAP on two portals is one capability, two role surfaces ([SDD-11](../sdd/11-capability-catalog.md)). Quick links: [SDD-15](../sdd/15-nomenclature.md).

## 5. Documentation duties

- When behaviour changes, update the canonical knowledge file under `docs/ai/` **and** the matching SDD or capability note in the same change.
- Use [process/generate-documentation.md](process/generate-documentation.md) to produce or refresh human-facing SDD sections, architecture PDF inputs, and public docs from this base.
- For observable shared component or student-owned reusable pattern changes, refresh only the affected [design system HTML](../design-system/index.html) text/captures and its `portal-api-docs` mirror under the released-version rule in [design/component-library.md](design/component-library.md). Unrelated tasks and internal refactors with no observable UI/API change do not trigger a catalogue edit.
- Update [MANIFEST.yaml](MANIFEST.yaml) when adding or removing knowledge files.
- Do not rely on a previous chat as project context. Prefer handoff + this knowledge base.

## 6. Working rules

- Inspect `git status` before editing. Preserve unrelated user changes.
- Prefer small, reusable changes. Do not silently change an agreed product policy.
- If a request conflicts with this knowledge base or an SDD, surface the conflict and confirm before coding.
- Never commit `.env`, CMS credentials, or live student data.
- Do not commit or push unless the user explicitly asks.

### Component-change guardrail (all portals)

This rule protects shared components and established portal-owned components and layouts across Applicant, Student, Lecturer and Staff portals.

- Use existing components and documented variants by default. Do not change established component source, styling, sizing, spacing, typography, layout, responsive behaviour or interactions—including through local CSS, class overrides or wrappers—unless the user explicitly instructs that change or approves the specific proposed change.
- A request to build a feature authorizes the necessary composition, content, data and workflow work; it does not authorize incidental component redesigns.
- If a component change is needed beyond the authorized scope, explain the affected component, proposed change and cross-portal impact, then obtain approval before editing. Existing explicit authorization remains valid; do not ask again.
- Implement approved reusable changes in the owning shared package and follow its release process. Keep approved portal-specific changes in the owning portal.

See [component ownership and application of this guardrail](design/component-library.md#component-change-guardrail).

## 7. Maintaining these instructions

Update this `AGENTS.md` when campus-wide scope, architecture, repository layout, status language, or documentation process materially changes. Keep portal feature detail in `frontend/<portal>/` rather than growing this file into a feature log.
