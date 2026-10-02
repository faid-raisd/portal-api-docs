# Lecturer portal — agent knowledge

**Repository:** [`raisd-campus/lecturer-portal`](https://github.com/raisd-campus/lecturer-portal)  
**SDD:** [SDD-06](../../sdd/06-lecturer-portal.md)  
**Campus agents:** [../AGENTS.md](../AGENTS.md)

## Status

Not started as a checked-in application. Target: publish materials, take attendance, mark, communicate with class.

## Agent rules

1. Implement against SDD-06 and campus [AGENTS.md](../AGENTS.md).
2. Talk only to the Portal API.
3. Student-portal lecturer-review (CAP-30) is a **student-facing** session Demo; do not treat it as the lecturer portal.
4. Install a released `@raisd-campus/design-system` version when application UI begins. Follow [component ownership and setup](../design/component-library.md) instead of copying student portal UI.
5. When UI appears, add docs under `docs/ai/frontend/lecturer-portal/` and update [../MANIFEST.yaml](../MANIFEST.yaml).

## Pairing

Student learning surfaces: [student-portal/AGENTS.md](student-portal/AGENTS.md). Staff/QA: [staff-portal.md](staff-portal.md).

## Field standard for future UI

Use released shared `Input`, `DropdownSelect` and `DatePicker` controls at 36px height, 14px text and 20px line height across all views and pointer modes. Keep textareas multiline and preserve the geometry of uploads, checkboxes and radios. Follow the [shared component guide](../design/component-library.md#standard-field-sizing); do not implement portal-local sizing overrides.
