# Staff portal — agent knowledge

**Repository:** [`raisd-campus/staff-portal`](https://github.com/raisd-campus/staff-portal)  
**SDD:** [SDD-07](../../sdd/07-admin-staff-cms.md)  
**Campus agents:** [../AGENTS.md](../AGENTS.md)

## Status

Not started as a checked-in application. Desks: Registry, Faculty, Bursary/Finance, QA, Marketing, and remaining verified gaps.

## Agent rules

1. Implement against SDD-07 and campus [AGENTS.md](../AGENTS.md).
2. **Build only verified gaps** — if the existing CMS already runs the workflow, do not duplicate it in staff-portal without an explicit decision.
3. Talk only to the Portal API. Staff tokens must not work inside student shells.
4. Student-portal “Admin Actions” are **development-only mock commands**, not production staff UI.
5. Install a released `@raisd-campus/design-system` version when application UI begins. Follow [component ownership and setup](../design/component-library.md) instead of copying student portal UI.
6. When UI appears, add docs under `docs/ai/frontend/staff-portal/` and update [../MANIFEST.yaml](../MANIFEST.yaml).

## Field standard for future UI

Use released shared `Input`, `DropdownSelect` and `DatePicker` controls at 36px height, 14px text and 20px line height across all views and pointer modes. Keep textareas multiline and preserve the geometry of uploads, checkboxes and radios. Follow the [shared component guide](../design/component-library.md#standard-field-sizing); do not implement portal-local sizing overrides.
