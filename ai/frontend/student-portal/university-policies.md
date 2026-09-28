# University Policies

## Current behaviour

University Policies is a standalone CAP-55 destination at `/policies`, immediately after Announcements in the main sidebar. The shared page heading and breadcrumb both read **University Policies**. The route is a frontend-only responsive catalogue; it does not provide policy bodies or policy transactions.

The page uses a navigation-free `PagePanelLayout`. Its first child is the shared copy-free, gradient-free 288px banner with the existing Cyberjaya library photograph.

The panel content contains full-width, URL-backed `SegmentedTabs` for **All**, **Academic**, **Student Life**, **Finance**, and **Privacy & IT**. All is the default. Category URLs use `?category=academic`, `student-life`, `finance`, or `privacy-it`; an absent or unknown value presents All without rewriting the URL. Normal browser Back and Forward restore the selected category. Inactive-neighbour dividers use the shared SegmentedTabs default, and the selected list begins 24px below the filters. On phones, the rounded black tab frame remains solid while only its tab content scrolls and fades at whichever edge has more tabs available.

Every policy appears as a raised `LinkedList` action row with a policy-document icon, title, concise summary and decorative chevron. It is an enabled native button, so pointer, Enter and Space activation work. Activation deliberately performs no action and leaves the route unchanged until approved policy details exist. The student UI does not show demo, mockup, availability, acknowledgement, version or effective-date labels.

Loading, read-error and campus-empty states retain the page heading and the rounded panel geometry. Loading reserves the 288px banner, filter and list rows. A read error keeps the real banner and provides **Try again**. An empty campus retains the real banner and displays **No policies available**.

## Catalogue fixture assumptions

All titles and summaries below are synthetic product fixtures. They are not approved university policy text and must be replaced or confirmed by the owning campus before any production release.

| Category | Title | Synthetic summary |
| --- | --- | --- |
| Academic | Academic Regulations | Rules for enrolment, academic standing, progression and awards. |
| Academic | Attendance Policy | Attendance expectations, monitoring and the handling of missed classes. |
| Academic | Assessment and Examination Policy | Requirements for coursework, examinations, submissions and published results. |
| Academic | Academic Integrity Policy | Standards for original work and the process for handling academic misconduct. |
| Academic | Academic Appeals Policy | Grounds, steps and timelines for appealing an academic decision. |
| Student Life | Student Handbook | A general guide to student responsibilities, university services and campus expectations. |
| Student Life | Student Code of Conduct | Expected behaviour and responsibilities across university and campus life. |
| Student Life | Student Complaints and Grievances Policy | How students can raise concerns and how complaints are reviewed. |
| Student Life | Respect, Harassment and Sexual Misconduct Policy | Standards for respectful conduct and routes for reporting harmful behaviour. |
| Student Life | Accessibility and Inclusion Policy | Principles for inclusive study and routes for requesting accessibility support. |
| Student Life | Health, Safety and Emergency Policy | Student responsibilities and guidance for staying safe on campus. |
| Finance | Student Fees and Refunds Policy | Rules covering fees, payment responsibilities, withdrawals and refunds. |
| Privacy & IT | Student Privacy Notice | How student information is used, shared and protected. |
| Privacy & IT | Acceptable Use of IT and Digital Services Policy | Rules for university accounts, networks, devices and online services. |

The table order is the explicit campus display order. Category filters preserve that order rather than sorting titles independently.

## Canonical records and API

`UniversityPolicyRecord` is campus-owned and contains stable `id`, `campusId`, fixed `category`, `title`, `summary`, and non-negative integer `displayOrder`. The canonical graph rejects unknown campuses and duplicate policy IDs. Equal display positions remain deterministic through stable ID tie-breaking.

`PortalApi.getUniversityPolicies()` represents `PortalApi.getUniversityPolicies (`POST /v1/portal/getUniversityPolicies`)`. Its Zod-validated `UniversityPoliciesResponse` contains detached `UniversityPolicySummary` rows without `campusId`. The mock projection starts from the selected Student Profile, resolves the exact URL-backed Programme Enrolment and campus, filters only that campus's records, then sorts by `displayOrder` with stable ID tie-breaking. When the route omits an enrolment ID, the shared selector uses its documented deterministic default. A configured campus without records returns an empty collection; an unknown student or foreign/missing enrolment is rejected. It never substitutes another campus's catalogue.

`useUniversityPoliciesQuery` uses the existing scenario and session generation cache scope. The catalogue has no mutation or cache invalidation workflow. Both canonical and derived Data Model Explorer entries use the same fixtures and relationships.

The Student Handbook previously existed as the sole University Document in Profile Documents. CAP-55 replaces it with the corresponding policy record and removes the unused University Document contract, relationship, response collection and panel.

## Shared component changes

- `LinkedListItem.onSelect` creates a native full-row button. `to` continues to create a route link, and an item with neither action retains the disabled presentation.
- `PagePanelLayout.navigation` is optional. Supplying it retains the existing navigation row and divider; omitting it lets a banner begin the panel directly.
- The published design system catalogue captures the route, action and disabled LinkedList states plus the navigation-free page-panel state.

## Status and exclusions

CAP-55 Student Frontend remains **Partial**. Actual policy bodies, detail routes, files/downloads, search, version history, effective dates, acknowledgements, notifications, administrative publishing, and production data remain outside this release.

## Verification

Unit coverage validates contracts, unique IDs, categories, ordering, campus isolation, missing enrolments, unknown students, response independence, explorer registration, category URL fallback, shared-component variants, states, no-op actions, and Profile Documents removal.

Playwright covers route/sidebar/breadcrumb activation, lazy loading, responsive banner and panel geometry, scrollable category tabs, dividers, category URLs and history, card copy/order, pointer and keyboard no-op activation, loading/error/empty states, accessibility and horizontal overflow across the supported browser widths. Existing Community open, resized and closed checks remain at 1280px and 1440px. The full repository quality gate remains required.

## Implementation references

- `src/contracts/university-policies.ts`
- `src/mocks/university-policy-fixtures.ts`
- `src/services/mock-university-policies-api.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
- `src/components/features/policies/university-policies-page.tsx`
- `src/components/features/policies/university-policies-page-shell.tsx`
- `src/features/policies/university-policy-routes.ts`
- `src/components/system/linked-list.tsx`
- `@raisd-campus/design-system/system/page-panel-layout`
- `src/tests/university-policies.test.tsx`
- `tests/e2e/university-policies.spec.ts`
