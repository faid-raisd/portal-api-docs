# Open questions

**Document:** SDD-10  
**Status:** Working draft  
**Date:** 18 September 2026

Decisions required before capabilities can move from Needs checking / Demo to Live. Intended as the working-group agenda, then as a living decision log.

## 1. Blocking for [M1](03-delivery-milestones.md#m1) / [M2](03-delivery-milestones.md#m2)

| ID | Question | Why it blocks | Owner |
|---|---|---|---|
| Q1 | What is the stack, repo, and who can grant access today? | Cannot implement [CAP-53](11-capability-catalog.md#cap-53) or review the real frontend. | TBC |
| Q2 | Who owns the old CMS / API, and what is already callable? | [CAP-53](11-capability-catalog.md#cap-53), every Needs checking backend row. Partial answer: 23 Sep 2026 dump inventoried in SDD-14 / `docs/ai/backend/cms-feature-comparison.md` (`api_student_*` SPs, portal sync tables, desk modules). Callable HTTP surface and owner still TBC. | TBC |
| Q3 | Login: CMS password, SSO, or both? | [CAP-01](11-capability-catalog.md#cap-01) applicant and student. | TBC |
| Q4 | Is admissions-first still the sequence, or has student v1 been promoted? | Stops building the wrong next screens. | Product owner |
| Q5 | File store for evidence, assignments, and payment proofs? | [CAP-03](11-capability-catalog.md#cap-03), 09, 20, 46. | TBC |
| Q6 | Named owners for Registry, Faculty, Bursary, QA, Marketing, IT? | Every next-action owner is TBC. | Working group |
| Q7 | Kickoff date and backend commitment window? | All milestone targets. | Working group |

## 2. Product and UX

| ID | Question | Related CAP |
|---|---|---|
| Q8 | Minimum applicant field set per Cyberjaya programme? | 02, 03, 55 |
| Q9 | Which profile fields save directly vs need Registry approval? | 08 |
| Q10 | Announcement audiences and acknowledgement for policies? | 16, 55 |
| Q11 | Approved meeting tool for live class, or defer [CAP-26](11-capability-catalog.md#cap-26)? | 26 |
| Q12 | Payment: bank-transfer only for [M3](03-delivery-milestones.md#m3), gateway on [M5](03-delivery-milestones.md#m5)? | 45–47 |
| Q13 | Core mobile breakpoints and devices for acceptance? | 36, PRODUCT-MOBILE |

## 3. Academic and finance rules

| ID | Question | Related CAP |
|---|---|---|
| Q14 | Legacy registration rules and atomic save constraints? | 10 |
| Q15 | Result approval / publication workflow in old CMS? | 13, 28 |
| Q16 | Authoritative attendance source? | 12 |
| Q17 | Past-paper publication policy? | 22 |
| Q18 | Proof-to-allocation SLA and who emails the student? | 46 |
| Q19 | Real bank instructions for Cyberjaya (no fictional numbers)? | 45 |

## 4. Compliance and ops

| ID | Question | Related CAP |
|---|---|---|
| Q20 | [CAP-04](11-capability-catalog.md#cap-04) approval pack for Cyberjaya programmes/sites? | 04 |
| Q21 | Backup owner and last successful restore test? | 38 |
| Q22 | Privacy policy that the portal must enforce? | 39 |
| Q23 | Training plan for Registry and lecturers before [M4](03-delivery-milestones.md#m4)? | 41 |
| Q24 | Which country clauses actually apply to Cyberjaya vs later campuses? | SDD-09 |
| Q25 | Which Cyberjaya student-facing URL is still Live (vs staff stdfile/studentfile)? | 01, 53; SDD-14 |
| Q26 | Map `api_student_*` and `portal_r_student_*` to Portal API methods? | 53 |
| Q27 | Does Raisd applicant-portal replace or sit beside agent online application? | 02, 07 |
| Q28 | Where do assignment submissions land in the old CMS today? | 20 |

## 4b. Canonical schema & campus policy (LUCT readiness) — 1 October 2026

**Decision (1 October 2026):** Shared vocabulary and invariants stay canonical. University default then campus override (effective-dated) control behaviour. Incomplete campus policy confirmation blocks that campus’s Live feature only — not the Schema. **Implemented in Demo as Schema v3** (`PORTAL_RECORD_SCHEMA_VERSION = 3`): policy collections, university-default seeds, projections, SQL reporting views, Data Model Explorer, published ERD, `/v1/meta.schemaVersion`. Per-campus Live confirmation of CS-01–CS-11 remains open. Full table: [canonical-schema-confirmations.html](../diagrams/canonical-schema-confirmations.html). Knowledge source: [canonical-schema-luct-readiness.md](../ai/backend/canonical-schema-luct-readiness.md) §0 / §6 / §7.

| ID | Topic | Treatment | Live readiness owner |
|---|---|---|---|
| Q29 / CS-01 | Legacy → canonical academic / enrolment status mapping | Demo policy table seeded; confirm per campus before Live | Registry (per campus onboarding) |
| Q30 / CS-02 | `current_active_students` definition | One mechanism; policy-driven status set; academic only (not Portal authz) | Registry + International Office |
| Q31 / CS-03 | Outstanding / Inactive / Deferred | Three distinct concepts; operational class via campus policy | Registry |
| Q32 / CS-04 | Enrolment lifecycle extras | Keep four statuses; extend only when a real process needs it | Registry / product |
| Q33 / CS-05–07 | Credit classification, CGPA repeat, outcomes | Policy tables seeded; keep `pass\|fail` initially; CT/exemption first-class | Registry (+ Portal API for enum) |
| Q34 / CS-08–10 | Refunds, document numbers, adjustments | Schema keeps correction model; campus enables workflows / numbering | Bursary |
| Q35 / CS-11 | RBAC / LoginActive mapping | Accounts ≠ identity; LoginActive ≠ `user_account.status` | Product + IT / Registry |
| Q36 / CS-12–13 | Physical FKs; Live reports on views | No Demo FKs (mandatory on relational Live); incremental shadow cutover | Engineering |

## 4c. LMS documentation posture — 1 October 2026

**Verdict:** Raisd can generate LMS architecture + features pages from CAP + `INPUT-F01`–`F37` research. This workspace has **no** PPA LMS product inventory (only infra intent / client IDs). Student Materials alone is not an LMS ([BASE-44](09-requirements-traceability.md)). Published page: [lms.html](../diagrams/lms.html). Agent knowledge: `docs/ai/architecture/lms.md` in control-plane.

| ID | Question | Why it matters | Owner |
|---|---|---|---|
| <a id="q37"></a>Q37 | Generate Raisd LMS pages now (CAP + F01–F37), wait for PPA LMS URL/export, or both once access is shared? | Unlocks `lms-architecture.html` / `lms-features.html`; avoids inventing PPA features | Product / architecture |

## 5. Role split after tonight

Proposed until the group names people:

| Seat | Focus |
|---|---|
| Frontend | Applicant [M2](03-delivery-milestones.md#m2) + mobile shell; stop expanding student demo |
| Backend / old CMS | [CAP-53](11-capability-catalog.md#cap-53) admissions slice, auth, files |
| Architecture | Contracts, environments, definition of Live |
| DevOps | Monitoring, backups, promotion path |
| Department owners | Close Needs checking on rules, not screens |

## 6. Decision log

| Date | Decision | Decided by |
|---|---|---|
| 7 Sep 2026 | Cyberjaya first; admissions before registration; core mobile; keep existing CMS; five portal groups | Product owner (sheet) |
| 18 Sep 2026 | Student portal v1 frontend currently in progress; meeting to review it | Faid Zamin / Aslam (chat) |
| 22 Sep 2026 | Central AI knowledge base for backend, frontend, and architecture under control-plane `docs/` (`docs/ai/`) | Faid Zamin (standup) |
| 23 Sep 2026 | Student-portal agent docs extracted into `docs/ai/frontend/student-portal/`; sibling repos point to `docs/ai` as SSOT | Iman Suherman |
| 23 Sep 2026 | Cyberjaya old CMS source+structure dump inventoried; CAP comparison published as SDD-14 (reuse staff desks; Portal API for Live) | Iman Suherman |
| 23 Sep 2026 | This phase: existing Cyberjaya CMS remains SoR; modern portals via Portal API; do not duplicate operational functions. Longer term: progressive unified one-stop CMS on verified gaps + migration strategy | Aslam (WG chat); recorded by Iman Suherman |
| 1 Oct 2026 | Canonical Schema proceeds with policy hierarchy: CS-01–CS-11 become effective-dated campus/university policy (Live readiness), not Schema blockers; CS-12 no Demo FKs / mandatory on relational Live; CS-13 incremental campus-scoped report cutover. Hierarchy: canonical → university default → campus override | Architecture recommendation to Iman Suherman; recorded in knowledge base |
| 1 Oct 2026 | Schema v3 Demo: campus policy collections, university-default seeds, projections + SQL views, Data Model Explorer, published ERD, `/v1/meta.schemaVersion`, db-admin IRREGULAR map. Per-campus Live confirmation of CS-01–CS-11 remains open | Engineering; recorded in knowledge base §7 |
| 1 Oct 2026 | Schema v3 confirmed good to proceed. Remaining CS-01–CS-11 treated as policy-validation / campus go-Live requirements (not schema-design blockers). Demo university-default values are structural defaults/examples only — not authoritative LUCT policy until campus/department sign-off. CS-13 remains incremental legacy+canonical side-by-side cutover | Architecture review reply to Iman Suherman; recorded in knowledge base |
| 1 Oct 2026 | Neon Demo reseeded to Schema v3 (95 collections; six campus-policy tables). Verification checklist recorded in readiness §7 | Engineering |
| 1 Oct 2026 | LMS research posture: Raisd pages can be generated from CAP + F01–F37; no PPA LMS product inventory in workspace. Generation choice open as Q37 | Iman Suherman (research); published `docs/diagrams/lms.html` |
