# Profile Resume Builder

## Scope

Profile > Resume is a completed Phase 1 frontend route at `/profile/resume`. It lets the selected student maintain a professional summary, work experience, education, skills, and awards or recognition through the replaceable `PortalApi`. The current `MockPortalApi` stores changes only in memory for the active session; refresh or student-scenario replacement restores the canonical fixtures.

Phase 1 does not include a resume preview, templates, section visibility/settings, import from Academic Qualifications, PDF generation/export, downloads, uploads, or persistent storage. Portfolio is a separate, independently implemented Profile feature and does not import Resume records.

## Page structure

The shared Profile heading, `StudentSummaryCard`, active issues, and tab panel remain unchanged and visible above Resume. Inside the panel, sections appear in this order with 32px gaps:

1. Professional Summary
2. Work Experience
3. Education
4. Skills
5. Awards & Recognition

Every section uses the shared `ContentSection` with `type="panel"`. Its action and no-action states reserve the same 36px header row, and each header remains 16px from its section content. Resume currently supplies an action for all five headers, including Save Summary and the four Add actions.

At phone widths, work, education, skill, and recognition records use the shared labelled-card DataTable presentation. Each card places its remaining-width View details action first and the outlined Remove control at the right edge of the component-owned bottom action row. Shared `FormGrid` collapses date pairs to one column when its container is narrow, and popup content scrolls independently so every field and confirmation action remains reachable.

Professional Summary uses the shared `Textarea`. `Save Summary` is disabled until the trimmed value differs from the last response and while a mutation is pending. Whitespace-only content saves as null.

The four record sections use panel-type `ContentSection`, the bordered `DataTable`, and a secondary Add button with a leading plus icon. Empty collections use the shared `EmptyState` on the `surface-subtle` tier while keeping the Add action available. Selecting a table row by pointer, Enter, or Space opens its edit form in the same controlled `Popup` used by Add. The trash action is independent from row selection and opens a confirmation Popup. Popup saves close only after the mock mutation succeeds; validation or API errors retain the draft.

## Fields and ordering

- Work Experience: Job Title, Company, Start Date, and optional End Date.
- Education: Qualification, Institution, Start Date, optional End Date, and optional free-text Score.
- Skills: Skill Name.
- Awards & Recognition: Recognition and Year.

Date values use `YYYY-MM-DD`. Shared `DatePicker` controls use a DayPicker calendar and display dates in `en-MY` format. A blank end date is stored as null and displayed as `Present`; an end date cannot precede its start date. Current work and education appear first, followed by completed entries from newest to oldest. Skills sort alphabetically, and recognition sorts by year descending. Phase 1 has no manual or drag ordering.

## Data and API boundary

Date contracts validate actual Gregorian dates as well as `YYYY-MM-DD` shape. Invalid leap days, day zero, and dates beyond a month's end are rejected before session state changes; they are never silently normalized to another date.

One canonical Student Resume belongs to the selected stable Student Profile. Resume Work Experience, Resume Education, Resume Skill, and Resume Recognition records belong to that Resume. The route-facing `ResumeProfileResponse` returns the Resume and four child collections; empty collections are valid.

The complete `UpdateResumeProfileInput` is the payload for `PortalApi.updateResumeProfile (`POST /v1/portal/updateResumeProfile`)`. Existing rows retain their opaque IDs, new rows send null and receive generated IDs, and the mock adapter rejects IDs that do not belong to the selected Resume. Successful mutations replace the scenario-scoped Resume query cache.

Private query keys also include session generation. A reset invalidates pending mutation results before their success callbacks can update caches, even if the student switches away and back to the same scenario. Resume writes also check the mock adapter's resource generation after asynchronous preparation. Current-session saves and validation behavior are unchanged.

Resume Education is a student-maintained presentation record. It is deliberately independent from the admissions-owned Academic Qualification and English Proficiency records displayed in Profile > Academic.

Rizal's fixture is populated across all five sections. Alya's Resume exists with a null summary and empty child collections so every empty table still exposes its Add action.

## Loading, error, and validation

The tab reserves the five-section layout with skeletons while loading. A failed read shows `Resume unavailable`. Empty record collections use section-specific shared `EmptyState` feedback on the subtle surface tier without removing the secondary Add action. Required text, valid `YYYY-MM-DD` values, chronological date order, optional score handling, and four-digit recognition years are validated by Zod before the API update.

## Main implementation files

- `src/components/features/profile/resume-profile-content.tsx`
- `@raisd-campus/design-system/ui/textarea`
- `@raisd-campus/design-system/ui/date-picker`
- `src/contracts/resume-profile.ts`
- `src/contracts/portal-records.ts`
- `src/features/profile/resume-profile-model.ts`
- `src/services/mock-resume-profile-api.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
