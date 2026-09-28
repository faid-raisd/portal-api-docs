# Academic Study Plan behaviour

The Academic Study Plan route is a frontend-only, read-only programme journey backed by `PortalApi.getAcademicStudyPlan()`. Its response is derived from the canonical Portal record graph; the page does not calculate official results, maintain a second fixture set, or connect to a live student-record system.

The projection follows the exact URL-backed Programme Enrolment context and returns only its Study Periods, registrations, attempts, results, Finance Account, and Student Pass relationships. Active, completed, deferred, and withdrawn enrolments remain selectable; inactive contexts are historical/read-only and never borrow current-period data or eligibility actions from another enrolment.

## Route and page structure

- `/academic/study-plan` renders inside the shared Academic `TabbedPagePanel` and stays synchronized with the Academic tab, sidebar, breadcrumb, and URL.
- The content uses two shared panel-type `ContentSection` blocks, Programme Overview and Semester Outline, with the established 32px major-section gap, stable 36px header rows, and 16px title-to-content gap.
- The route body and its query are lazy-loaded. Layout-matched loading, a readable API error, and the surrounding Academic page shell remain available while the deferred content resolves.

## Programme overview

- Programme Status summarizes four graduation-eligibility requirements; it is not the student's enrolment status. It displays `In Progress` while any requirement is unmet and `Eligible for Graduation` only when all four pass. The Graduation tab is the CAP-15 progress hub. Its form entry additionally requires every required semester and curriculum module to have completed, published passing results; approved administrative clearance is tracked separately.
- Programme Overview uses one shared default-subtle `SummaryCard`: Programme Status is its label/value pair and the four eligibility requirements use the divided content-sized summary-column slot. The action column is omitted while any requirement is unmet. Once all requirements pass it provides the exact **Open Graduation** route; Study Plan never exposes document collection early. For Rizal, Credits shows 60 / 120 Credit Hours and fails; Performance shows the Programme Version's Minimum 2.0 CGPA and passes against the latest published 3.33 CGPA; Outstanding shows the tax-inclusive RM1,852.00 balance and fails; Passport & Visa displays `Expiring` and fails because its expiry does not cover 19 December 2027. Alya's local Malaysian record displays Passport & Visa as `Not applicable` and passes that requirement without inventing a student pass.
- Every requirement uses the shared column label/value typography and optional indicator position, placing a solid semantic success check or destructive X beside its value with an accessible met/not-met label. The card owns the 16px insets, 4px primary and column label/value rhythm, one divider, and 24px wrapping column gap. Like every `SummaryCard` summary-column composition, the four requirements stack one per row on phones; wider layouts retain content-sized wrapping columns.
- Transcript delivery remains an intentional no-op only in the completed Graduation view; Study Plan contains no transcript control.

## Semester outline

At 30rem or less of available item width, the title and status sit together at the start of the first row, the chevron stays at the far edge, and the four metrics occupy a full-width two-by-two grid underneath. This prevents long credit labels and values from colliding with the status badge on phones. Phone labels use their natural one-line height so the value follows at the shared 4px gap; wider constrained items may reserve two label lines to preserve aligned values. Wider compact items retain the four-metric strip.

- All six programme semesters appear as one full-width vertical list using the shared single, collapsible Accordion. Every semester, including the selected student's current programme semester, starts collapsed; opening one semester closes the previous one, and the open row may be collapsed.
- Each trigger omits the academic-period subtitle and keeps a compact four-metric summary visible while collapsed: where the available component width permits, credits attempted/current/planned load, credits earned, GPA, and CGPA sit beside the semester name with fixed widths, 12px gaps, and shared-border dividers after Credits Attempted. At a constrained component width, the same four metrics move to a full-width strip below the semester name rather than colliding with the title, Badge, or chevron; only in that compact strip do labels reserve a shared two-line area so their top edges and their values' baseline stay aligned. The status Badge and chevron remain at the far right without a duplicate load label. This compact interactive-trigger content intentionally remains outside `SummaryCard`; items use one joined `surface-raised` treatment rather than nested cards.
- Expanded content contains only the shared semantic `DataTable` of modules. Its fixed layout keeps every expanded semester aligned while Status uses 120px and Credits and Grade use compact 80px columns; all three are left-aligned, and the last module row has no bottom border. Module rows are read-only and do not navigate.
- Direct prerequisite codes and minimum grades appear above their module names in the row. Repeat registrations retain their registration type and attempt number; the Semester 3 ART201 row therefore shows `Repeat · Attempt 2` and its published B+ result.

## Result and credit rules

- Semesters 1 through 3 show only canonical published Term and Module Results: 3.27/3.27, 2.67/2.97, and 3.39/3.33 GPA/CGPA respectively.
- Semester 4 is current and shows its five confirmed `registered` attempts and 20-credit load without earned credits, GPA, CGPA, or module grades. Semesters 5 and 6 show their 20-credit curriculum plans without completed registrations or results.
- The 120-credit curriculum counts each Curriculum Module once. The repeated ART201 attempt remains visible in Semester 3 but does not increase the programme requirement.
- The eligibility read model's 60 earned credits and latest 3.33 CGPA must reconcile with the published semester journey. Detailed calculation explanations remain on Academic Performance.

## Data boundary and validation

- The projection begins with the active scenario's stable student ID. Alya's registration-week plan shows the complete prescribed curriculum with zero registered/earned credits and no published GPA/CGPA before confirmation; a successful mock-session registration updates Semester 1 registered credits and attempt rows without inventing grades. Rizal retains the reconciled mid-programme history. Shared curriculum rows are never mistaken for student Module Registrations.
- `PortalApi.getAcademicStudyPlan (`POST /v1/portal/getAcademicStudyPlan`)` is the logical read boundary. The mock adapter joins the exact selected Programme Enrolment to Programme Version, Faculty, Academic Terms and Study Periods, Curriculum Modules, named Module Prerequisites, exact Module Registrations and attempts, published Module and Term Results, the tax-inclusive Finance Account and allocation-derived open invoices, and Student Visa / Pass only when applicable.
- Programme Version owns the 2.0 minimum graduation CGPA. The final planned semester end date is the expected completion date. Credits pass when earned credits meet the curriculum requirement; Performance passes when the latest published CGPA meets the programme minimum; Finance is `clear` only when every invoice balance is zero. A confirmed but unapplied payment remains Finance-owned credit and cannot clear Study Plan eligibility. Passport & Visa is an applicable/not-applicable union derived from citizenship against the exact enrolment campus: international students pass only when their pass is not expired and covers expected completion, while campus-local students receive `Not applicable` and pass. All four checks must pass for `Eligible for Graduation`.
- Zod validation enforces unique semester positions, current-period identity, curriculum and earned-credit totals, latest-CGPA reconciliation, expected-completion identity, every requirement flag, the combined programme status, repeat-attempt identity, and the rule that unpublished semesters cannot expose results.
- The Data Model Explorer annotates every contributing canonical record with the Study Plan access path. These entities describe the frontend contract and do not prescribe physical backend tables.

## Verification expectations

- Unit coverage validates the eligibility projection and requirement flags, API cloning boundary, repeat and prerequisite relationships, and rejection of current-semester results.
- Desktop browser coverage at 1280px and 1440px verifies the programme status, four accessible check/X requirements, document-section navigation, six equal-width vertical semester items, initially collapsed disclosures, one-open behavior, repeat history, named prerequisites, and unpublished current/planned values.

## Completed student reading

Nadia has six completed semesters, 120 earned credits and published 3.00 CGPA without a current semester. `currentStudyPeriodId` is nullable; completed history remains readable through the owned enrolment. Once her four eligibility requirements pass, **Open Graduation** links to `/academic/graduation`; the Graduation hub chooses the recommended current step. Graduation approval and its new invoice do not rewrite published results. Study Plan continues to reflect the current Finance balance, while the [Graduation hub](academic-graduation.md) preserves the approved administrative journey.
