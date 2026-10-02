# Raisd LMS — research posture (agent knowledge)

**Human pages:**  
- Hub: [`docs/diagrams/lms.html`](../../diagrams/lms.html) (Moodle map + **CAP capability detail**)  
- Architecture: [`docs/diagrams/lms-architecture.html`](../../diagrams/lms-architecture.html)  
- Features: [`docs/diagrams/lms-features.html`](../../diagrams/lms-features.html)  

**Binding product baseline:** [SDD-05](../../sdd/05-student-portal.md), [SDD-06](../../sdd/06-lecturer-portal.md), [SDD-09](../../sdd/09-requirements-traceability.md) (BASE-44), [SDD-11](../../sdd/11-capability-catalog.md) learning CAPs.

**Status:** **Proposed / research-backed** — not a Live LMS product. Do not present Materials as a complete LMS.

## Decision (1 October 2026 · SDD-10 Q37)

**Option 1:** Generate Raisd LMS pages from CAP + `INPUT-F01`–`F37` only. Architecture + features + hub capability detail are published.

## Student LMS features (Moodle-like)

Raisd is **not** Moodle. Use Moodle only as familiar vocabulary for the **enrolled-student learning surface** on the student portal via Portal API. Materials alone is not an LMS ([BASE-44](../../sdd/09-requirements-traceability.md)). Map: [lms.html#student](../../diagrams/lms.html#student).

## Capability details (SDD-11 LMS slice)

Hub section [lms.html#capabilities](../../diagrams/lms.html#capabilities) lists Frontend / Backend / Milestone / next action for:

- **Student** learning CAPs (11–14, 16–35 learning subset)
- **Lecturer** publish / mark / deliver / workspace (incl. CAP-40, 43, 44)
- **Staff** assurance (outcomes approve, QA, copyright, orientation, workspace)

Authoritative rows remain [SDD-11](../../sdd/11-capability-catalog.md).

## Architecture

LMS is **role surfaces on the Portal API** (student / lecturer / staff), not a fifth portal product. Detail: [lms-architecture.html](../../diagrams/lms-architecture.html).

## Features matrix (F01–F37)

Full domain × CAP × Demo × milestone: [lms-features.html](../../diagrams/lms-features.html). Supplied research, not universal mandates ([SDD-09](../../sdd/09-requirements-traceability.md)).

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
| Hub + capabilities | [lms.html](../../diagrams/lms.html) |
| Architecture page | [lms-architecture.html](../../diagrams/lms-architecture.html) |
| Features page | [lms-features.html](../../diagrams/lms-features.html) |
| Capability catalogue | [SDD-11](../../sdd/11-capability-catalog.md) |
| Student / lecturer SDD | [SDD-05](../../sdd/05-student-portal.md), [SDD-06](../../sdd/06-lecturer-portal.md) |
