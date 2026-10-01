# Raisd LMS — research posture (agent knowledge)

**Human pages:**  
- Hub: [`docs/diagrams/lms.html`](../../diagrams/lms.html)  
- Architecture: [`docs/diagrams/lms-architecture.html`](../../diagrams/lms-architecture.html)  
- Features: [`docs/diagrams/lms-features.html`](../../diagrams/lms-features.html)  

**Binding product baseline:** [SDD-05](../../sdd/05-student-portal.md), [SDD-06](../../sdd/06-lecturer-portal.md), [SDD-09](../../sdd/09-requirements-traceability.md) (BASE-44), [SDD-11](../../sdd/11-capability-catalog.md) learning CAPs.

**Status:** **Proposed / research-backed** — not a Live LMS product. Do not invent PPA LMS features or present Materials as a complete LMS.

## Decision (1 October 2026 · SDD-10 Q37)

**Option 1:** Generate Raisd LMS pages from CAP + `INPUT-F01`–`F37` only. Architecture + features pages are published. No PPA LMS comparison in this set.

## Student LMS features (Moodle-like)

Raisd is **not** Moodle. Use Moodle only as familiar vocabulary for the **enrolled-student learning surface** on the student portal via Portal API. Lecturer/staff write-paths are separate role surfaces. Materials alone is not an LMS ([BASE-44](../../sdd/09-requirements-traceability.md)). Full table: [lms.html#student](../../diagrams/lms.html#student).

## Architecture

LMS is **role surfaces on the Portal API** (student / lecturer / staff), not a fifth portal product. Detail: [lms-architecture.html](../../diagrams/lms-architecture.html).

- Student — consume materials, assignments, quizzes, live join (when agreed)
- Lecturer — publish, mark, deliver live class, workspace ([CAP-44](../../sdd/11-capability-catalog.md#cap-44))
- Staff — approvals / QA / orientation where CAP-owned
- Existing CMS remains SoR this phase (ADR-1); durable **file store** required for Live ([Q5](../../sdd/10-open-questions.md))

## Features matrix (F01–F37)

Full domain × CAP × Demo × milestone: [lms-features.html](../../diagrams/lms-features.html). Source sheet `LMS_Feature_Requirements_8_Countried.xlsx` (mirrored in student-portal planning JSON). Supplied research, not universal mandates ([SDD-09](../../sdd/09-requirements-traceability.md)).

## PPA LMS (local finding)

Infra intent / client IDs only in related Officeless and Insights sources. Raisd `control-plane` has **no** PPA LMS product catalogue. Do not invent PPA features from those IDs.

## Rules agents must not violate

- Do not claim Raisd has a Live LMS.
- Do not treat student Materials / Demo learning UI as CAP-44 complete LMS.
- Do not invent PPA LMS screens or feature lists from infra client IDs alone.
- Do not present F01–F37 as government mandates ([SDD-09](../../sdd/09-requirements-traceability.md)).
- Do not imply Raisd is Moodle or Moodle feature parity is the delivery contract.
- Demo ≠ Live for assignments, quizzes, live class, and file delivery.

## Related

| Topic | Path |
|---|---|
| Hub | [lms.html](../../diagrams/lms.html) |
| Architecture page | [lms-architecture.html](../../diagrams/lms-architecture.html) |
| Features page | [lms-features.html](../../diagrams/lms-features.html) |
| Student portal | [../frontend/student-portal/AGENTS.md](../frontend/student-portal/AGENTS.md) |
| Capability catalogue | [SDD-11](../../sdd/11-capability-catalog.md) |
| Traceability / BASE-44 | [SDD-09](../../sdd/09-requirements-traceability.md) |
