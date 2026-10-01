# Raisd LMS — research posture (agent knowledge)

**Human / diagram page:** [`docs/diagrams/lms.html`](../../diagrams/lms.html)  
**Binding product baseline:** [SDD-05](../../sdd/05-student-portal.md), [SDD-06](../../sdd/06-lecturer-portal.md), [SDD-09](../../sdd/09-requirements-traceability.md) (BASE-44), [SDD-11](../../sdd/11-capability-catalog.md) learning CAPs.

**Status:** **Proposed / research-backed** — not a Live LMS product. Do not invent PPA LMS features or present Materials as a complete LMS.

## Verdict (1 October 2026)

We can document Raisd LMS **architecture** and **student features** from existing campus sources (CAP + `INPUT-F01`–`F37`). This workspace has no PPA LMS product inventory (infra intent / client IDs only).

## Student LMS features (Moodle-like)

Raisd is **not** Moodle. Use Moodle only as familiar vocabulary for the **enrolled-student learning surface** on the student portal via Portal API. Lecturer/staff write-paths are separate role surfaces. Materials alone is not an LMS ([BASE-44](../../sdd/09-requirements-traceability.md)).

| Moodle-like area | Student experience (proposed) | CAP | Demo today | Live target |
|---|---|---|---|---|
| Course home / topics | Module hub, weeks/topics, outcomes, release-aware lists | 23, 27 | Partial Materials | M3 / M5 |
| Resources | Study guides, notes, media, authorised downloads | 17, 18 | Placeholder / Partial | M3 |
| Assignments | Briefs; submit / replace / withdraw | 19, 20 | Partial / Demo metadata | M3 + file store |
| Quizzes / online exams | Attempts + integrity guidance | 24, 29 | Placeholder / Not started | M5 |
| Practice / revision | Revision activities, past papers | 21, 22 | Not started | M3 |
| Gradebook / feedback | Results, marks, lecturer feedback | 13, 28 | Demo / Not started | M3 |
| Calendar / attendance | Timetable, attendance | 11, 12 | Demo | M3 |
| Forums / messaging | Student–lecturer and peer comms | 25 | Demo (session) | M5 |
| Live class | Join approved live sessions | 26 | Not started | M5 (tool TBC) |
| Completion / release | Self-paced path, dated release, completion | 27 | Partial (date lock) | M5 |
| Announcements | Campus / module announcements | 16 | Partial | M3 |
| Study plan | Programme plan and prerequisites | 14 | Demo | M3 |
| Library / e-resources | Digital library | 31 | Not started | M5 |
| Induction | Orientation and digital-learning skills | 32 | Not started | M3 |
| Feedback / surveys | Course evaluation | 30 | Placeholder | M5 |
| Help & accessibility | Helpdesk, learner support, accessibility | 33, 35 | Partial / Demo | M3 / M2 |

Research domains F04–F16 and F19–F24 map onto these student surfaces — supplied research, not universal mandates ([SDD-09](../../sdd/09-requirements-traceability.md)).

## Architecture sketch

LMS is **role surfaces on the Portal API** (student / lecturer / staff), not a fifth portal product:

- Student — consume materials, assignments, quizzes, live join (when agreed)
- Lecturer — publish, mark, deliver live class, workspace ([CAP-44](../../sdd/11-capability-catalog.md#cap-44))
- Staff — approvals / QA / orientation where CAP-owned
- Existing CMS remains SoR this phase (ADR-1); durable **file store** required for Live evidence and Live class artefacts ([Q5](../../sdd/10-open-questions.md) / CAP-20 family)

## What Raisd already has (enough for pages)

- **37 research domains** `INPUT-F01`–`F37` → mapped to CAPs (`LMS_Feature_Requirements_8_Countried.xlsx`; also mirrored in student-portal planning JSON).
- Learning CAPs mostly **Not started / Placeholder / Partial** — see [SDD-11](../../sdd/11-capability-catalog.md).
- Diagrams hub: [`lms.html`](../../diagrams/lms.html) (student Moodle map published); dedicated `lms-architecture.html` / `lms-features.html` still proposed.

## PPA LMS (local finding)

| Source | What it has |
|---|---|
| External Officeless control plane (`ppa-lms` client) | Infra intent only — Gen2 ST **planned**, not provisioned |
| Teknopus Insights | Client IDs `ppa-lms-dev` / `ppa-lms-prod` |
| Raisd `control-plane` | **No** PPA LMS docs, screens, or feature catalogue |

Do not invent PPA product features from infra client IDs alone.

## Recommended generate set

| Artefact | Role |
|---|---|
| [`docs/diagrams/lms-architecture.html`](../../diagrams/lms-architecture.html) | *(proposed)* LMS as role surfaces on Portal API; CMS SoR; file store for Live |
| [`docs/diagrams/lms-features.html`](../../diagrams/lms-features.html) | *(proposed)* Full F01–F37 × CAP matrix; student Moodle map already on `lms.html` |
| This file + [`lms.html`](../../diagrams/lms.html) | Agent + human source of truth |

Mark generated pages **proposed / research-backed**, not Live product.

## Generation options (open)

1. **Raisd LMS pages from CAP + F01–F37** — can continue now  
2. **Wait for PPA LMS URL/export**, then add a reference comparison  
3. **Both** once PPA LMS access is shared  

Record choice in [SDD-10](../../sdd/10-open-questions.md) Q37 when decided.

## Rules agents must not violate

- Do not claim Raisd has a Live LMS.
- Do not treat student Materials / Demo learning UI as CAP-44 complete LMS.
- Do not invent PPA LMS screens, modules, or feature lists from infra client IDs alone.
- Do not present F01–F37 research domains as government mandates ([SDD-09](../../sdd/09-requirements-traceability.md)).
- Do not imply Raisd is Moodle or that Moodle feature parity is the delivery contract.
- Demo ≠ Live for assignments, quizzes, live class, and file delivery.

## Related

| Topic | Path |
|---|---|
| Diagrams hub page | [lms.html](../../diagrams/lms.html) |
| Student portal | [../frontend/student-portal/AGENTS.md](../frontend/student-portal/AGENTS.md) |
| Lecturer portal | [../frontend/lecturer-portal.md](../frontend/lecturer-portal.md) |
| Capability catalogue | [SDD-11](../../sdd/11-capability-catalog.md) |
| Traceability / BASE-44 | [SDD-09](../../sdd/09-requirements-traceability.md) |
| Distributed CMS pattern | [distributed-cms-target.md](distributed-cms-target.md) |
