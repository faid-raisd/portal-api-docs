# Academic Performance behaviour

The Academic Performance route is a frontend-only, read-only view backed by `PortalApi.getAcademicPerformance()`. It does not calculate official results or connect to a live student-record system.

## Page structure

- `/academic/performance` displays the page heading `Academic` and one reusable `TabbedPagePanel`, separated by 32px.
- The panel contains Performance, Modules, Timetable, Attendance, Study Plan, Module Registration, and Graduation route tabs. Selecting a tab updates the URL, sidebar selection, breadcrumb, and active tab. Performance, Modules, Timetable, Attendance, Study Plan, and Module Registration are complete in this phase; Graduation is the CAP-15 clearance and collection hub described in [Academic Graduation](academic-graduation.md).
- Every Academic route renders the shared `StudentSummaryCard` between the `Academic` title and tabbed panel. It displays the active student's avatar, name, faculty, programme, and current programme-relative Semester Badge using the same composition as Profile; it does not change when a page-level semester selector views historical data.
- The tab row and content region each own 16px padding. A single shared divider separates them, and the surface wrapper clips its 12px rounded corners. Tab labels use regular weight, 4px gaps, and the shared sliding neutral indicator.
- Performance content is ordered as the labelled Semester selector, CGPA and GPA charts, then Grades, with 32px between these major blocks. The shared selector owns its visible muted label and 8px label-to-control gap. CGPA/GPA and Grades each use panel-type `ContentSection`, which supplies a stable 36px header row, 16px `type-title` heading, and 16px title-to-content gap whether actions are present or absent. The selector offers all programme semesters in its dropdown field, with separate previous and next controls for one-step navigation that disable at the programme boundaries. The two charts use a responsive `CardGrid` with 16px gaps: chart cards remain at least 352px wide and wrap to a new row rather than overflowing or becoming too narrow. Charts use the quiet `surface-subtle` inset tier; grade accordions use `surface-raised`. Academic chart cards add a secondary `View breakdown` action beside the current value; dashboard chart cards intentionally omit it.

## Semester flow

- The page is student-scoped through the active Portal API scenario. Alya's six-semester timeline has no published results during first-semester registration week, so the page uses the same illustrated no-results treatment without inventing GPA, CGPA, grades, offerings, or assessments. Rizal retains the published Semester 1-3 history described below. Nadia has six completed semesters with published 3.00 GPA/CGPA and 120 cumulative credits. Her `activeSemesterId` is null, the selector opens the latest published semester, and the shared summary displays No current semester.
- The chart timeline and page selector are derived from `Programme.totalSemesterCount`, so the current programme shows Semester 1 through Semester 6. Future Semesters 5 and 6 remain enabled but use muted option text to signal that data is not available yet.
- The initial selection is the latest published StudentSemesterPerformance record, currently Semester 3. Semester 4 is ongoing on 26 August 2026 and has no official result.
- The reference published values are Semester 1 GPA/CGPA 3.27/3.27, Semester 2 2.67/2.97, and Semester 3 3.39/3.33. Semester 3 includes the passed ART201 repeat; its 24 term credits and 64 transcript-attempt credits remain distinct from the 60 credits used by the current cumulative calculation.
- Selecting a published semester updates the selector, both chart values and active semester controls, and the module-grade list together. Selecting a semester through either chart also updates the page selection and grades.
- Selecting current Semester 4 replaces the charts and grades with an illustrated in-progress result state. Selecting future Semester 5 or 6 shows the corresponding not-started result state. No selection reuses stale data from another semester.

## Result model

The academic-performance response contains the Programme, published StudentSemesterPerformance records, referenced Modules, StudentModuleResult records, matching ModuleOfferings, ModuleAssessment outlines, and StudentAssessmentResult records. Each module result supplies stable student, semester, and module IDs plus:

- `grade`: the institution's display label.
- `outcome`: explicit `pass` or `fail`, used for semantic colour and accessible wording.
- `points`: the official numeric points supplied for the published module result.
- `creditsAttempted`: the positive credit value attempted for the module.
- `creditsEarned`: the credit value actually earned; failed mock results explicitly supply zero rather than making the UI infer it.
- `finalPoints`: the official points-times-credits-attempted value used in the semester GPA calculation.

Each StudentSemesterPerformance record additionally supplies `totalCreditsAttempted`, `totalCreditsEarned`, and `totalPoints` through that semester. Contract validation checks earned credits against the explicit outcome, checks final points against points times credits attempted, checks semester module totals against the published GPA, and checks total points divided by total credits attempted against the published CGPA. These are explanation and integrity inputs from the Portal API; the frontend does not own the institution's grading scale or policy.

Each StudentAssessmentResult links the published module result to one assessment in the matching semester offering. It supplies an unweighted score percentage and the official weighted contribution. The response validates one result for every assessment, prevents contributions above the assessment weight, and requires every outline to total 100%.

The frontend does not invent GPA, CGPA, grade labels, grade-point mappings, or pass/fail outcomes. It presents the published values and uses the supplied numeric inputs to explain and validate them. Official academic policy remains owned by the future backend or academic system.

## GPA and CGPA breakdown popups

- `View breakdown` opens the reusable accessible `Popup` component and preserves keyboard focus/close behaviour from the shared dialog primitive.
- GPA includes the shared SemesterSelector above the module table with a 24px bottom margin. It is limited to published semesters and immediately updates the popup title, rows, totals, and formula. Each table shows the selected semester's module code/title and a success/destructive colour-coded grade with Points, Credits attempted, Credits earned, and Final points. The total row and formula use final points divided by credits attempted.
- CGPA shows every published semester through the current selection with its GPA, Total credits attempted, Total credits earned, Total points, and CGPA. Its columns use equal widths, and its formula uses the selected semester's published totals.
- Both tables use the generic semantic `DataTable`; the same component also renders assessment rows inside grade accordions.
- Study Plan repeats only the supplied GPA and CGPA values for orientation. Detailed GPA/CGPA calculation breakdowns remain on Performance and are not duplicated in the Study Plan semester rows.

## Grade accordion behaviour

- Grade rows use the reusable Radix-backed Accordion primitive and retain grade, module code/title, credits, and explicit outcome in the collapsed header.
- Collapsed headers use one grid row from the `sm` breakpoint upward. On narrower screens, credits occupy a second row and the chevron spans both; wider headers must not retain an empty second row or its gap.
- One row can be open at a time. Selecting an open row collapses it; selecting another closes the previous row. The complete header supports pointer, keyboard, focus, and screen-reader interaction.
- Expanded rows show each assessment in outline order with Assessment, Weight, Score, and Contribution columns in the reusable `DataTable`, followed by the summed weighted mark out of 100.
- Hover and neutral keyboard focus use `surface-hover` without a blue ring or hover transition. Grade rows do not navigate to Module Details or another results route.

## Loading, empty, and failure behaviour

- The completed Performance tab body is a deferred production chunk. The shared Academic heading, tabs, and page panel render first with a layout-matched semester-and-card fallback, so the surrounding route stays stable while the tab code arrives.
- After the tab body loads, the dedicated query shows its more specific semester, chart, and grade skeleton while Portal API data is pending.
- API failure shows a destructive but readable page-level error inside the panel.
- A published semester with no module rows uses the Grades empty state.
- An unpublished current or future semester uses the shared illustrated `EmptyState` with context-specific copy and does not render stale charts or grades.

## Scope boundaries

The page does not add editing, appeals, transcript downloads, grading-policy calculations, authentication, persistence, live API integration, or mobile-specific remediation. The dashboard Performance section remains available and keeps its existing behavior without breakdown actions.
