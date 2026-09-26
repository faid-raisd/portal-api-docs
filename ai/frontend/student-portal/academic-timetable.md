# Academic Timetable and Attendance behaviour

Academic Timetable and Attendance are completed frontend-only, read-only routes at `/academic/timetable` and `/academic/attendance`. Both consume the same `PortalApi.getAcademicTimetable()` read model and do not connect to a live timetabling or attendance system.

## Page structure

- Timetable and Attendance are consecutive route-controlled tabs inside the shared Academic `TabbedPagePanel`, with Attendance immediately after Timetable. Both retain the same 16px content inset, divider, 12px panel radius, and active-tab behaviour as Performance and Modules. The Academic sidebar exposes the same two destinations in the same order.
- Each tab has its own labelled Semester selector followed by one panel-type `ContentSection`: Timetable contains only the recurring grid, while Attendance contains the programme summary, calendar, legend, and selected-day details. The programme Attendance Rate uses the default subtle `SummaryCard` with metric emphasis, semantic value colour, and the minimum requirement as supporting copy; it has no action or summary columns. Both tabs preserve the shared 32px major-block gap, stable 36px section-header row, 16px `type-title` heading, and 16px title-to-content gap. The dashboard uses the same component's page type to retain its larger section heading while reusing the extracted `TimetableCard` grid.
- Semester state is independently shareable on both routes through `?semesterId=...`. Semester 4 is the default active term. All six programme semesters are selectable; future Semesters 5–6 use muted option text but remain available through direct selection and arrow navigation.
- Timetable class cards remain keyboard-accessible Module Details actions. Online classes retain the shared laptop tooltip, and current-class presentation is derived from the browser machine date/time in the API-supplied campus timezone.
- On tablet and desktop, the shared timetable positions entries in exact minutes, including classes shorter than an hour. Its default 07:00–19:00 range expands to whole-hour boundaries around earlier/later entries; classes are never clamped to another time. Expanded ranges scroll inside the card, retaining readable hourly labels. Phone layouts present the same selected-semester records as the shared `TabbedPagePanel` weekday controls and a chronological day agenda. The active day uses the same animated selection background, inset and divider as other tabbed page panels, with arrow-key selection and a horizontally scrollable strip for all registration weekdays. The agenda presents the records, retaining exact time, location, delivery mode, and Module Details navigation. Accessible class names include the original start/end time; keyboard focus reveals offscreen classes.

## Timetable and attendance data

- Timetable Entries are recurring read models derived from canonical Class Schedules. They carry weekday, campus-local start/end time, and inclusive effective dates instead of one arbitrary first-week timestamp.
- Attendance Sessions are dated read models derived from canonical Class Sessions, Module Offerings, Modules, Module Registrations, and optional Attendance Records. Their `enrolmentId` preserves the exact normal or repeat module attempt used by programme and module views.
- The canonical Attendance Record supports only `present` and `absent`. A future scheduled session has no Attendance Record and is shown as `Not taken`; that phrase is presentation state rather than a third stored status.
- Cancelled sessions are omitted from the attendance calendar. Future terms have no registered timetable entries or generated class sessions.
- Programme Version owns the minimum attendance threshold, currently 80%. Attendance percentage is rounded from Present divided by recorded Present plus Absent sessions. Not-taken sessions are excluded. When no attendance is recorded, the page says so instead of showing a false zero.
- Module Attendance uses the same selected-student enrolment traversal as programme Attendance for the selected scenario. Campus timezone and programme threshold come from the owning records, never the first array element or a Cyberjaya fallback. Missing enrolment/configuration produces the existing scoped unavailable state; dated sessions remain joined to the exact module registration.

Timetable projections traverse the exact selected Programme Enrolment, its Study Periods, and non-withdrawn Module Registrations, then select exact offering schedules. Historical completed, deferred, or withdrawn contexts remain readable but expose no active-only write. A class registered only by another student is excluded, even if it teaches a module in the same curriculum. Attendance is joined by both Module Registration ID and Class Session ID; another student's mark can never fill a missing mark. Rizal's seeded attendance explicitly references his registrations.

## Attendance calendar

- The existing DayPicker-backed Calendar primitive displays one semester-bounded month at a time, starts weeks on Monday, preserves six rows, and disables boundary dates outside the semester. It shares the dashboard's `CalendarMonthSelector`: previous control, centred 16px month title, and next control remain in one full-width row with a divider before the grid.
- Each scheduled class on a date creates one 8px-high horizontal segment across the bottom of the day card. One session is fully rounded; with multiple sessions, only the outer bar ends are rounded and they have 4px gaps. On phones, dates with more than two sessions replace those compressed segments with compact colour-coded counts grouped by Present, Absent and Not taken. The counts wrap inside the day card, while the selected-day details continue to list every class session.
- Present uses `success`, Absent uses `destructive`, and Not taken uses `surface-elevated`. The centred legend names all three states.
- The attendance calendar fills the Attendance section width and its outer `surface` uses the shared `border` token.
- Today is identified only by its brand-colour date label. All enabled attendance day cards use the same `surface-hover` selection and hover treatment.
- Selecting a date updates details below the calendar. Each raised-surface row shows module code/title, campus-local time, location, and status. Selecting a row opens that semester's Module Details.
- Module Details reuses a read-only calendar mode filtered to one enrolment. It keeps month navigation and the legend but renders static status-labelled days with no selection, hover, session details, or self-navigation.

## API and scope boundaries

PortalApi boundary: `PortalApi.getAcademicTimetable (`POST /v1/portal/getAcademicTimetable`)`. Both frontend routes reuse this response, which includes Programme, active/selected semester IDs, every Semester option, campus timezone, programme attendance threshold, referenced Modules, recurring Timetable Entries, and dated Attendance Sessions. A valid future semester stays selected and returns empty module, timetable, and attendance collections instead of falling back to Semester 4. Splitting the presentation into two tabs does not create a duplicate attendance endpoint or fixture set.

The response is student-scoped through the active Portal API scenario. Alya has institution-prepared class schedules but no Module Registrations before confirmation, so Timetable and Attendance return empty collections rather than exposing classes she does not yet own. A successful session registration immediately projects only her selected class sections into Timetable; Attendance remains a valid no-record state until dated sessions are taken. Rizal retains the completed/current session history described above.

Timetable and Attendance use the shared illustrated `EmptyState` for these valid empty responses. Their context-specific copy explains that the semester has not started, while the populated Semester 4 layouts remain unchanged.

The routes do not add attendance editing, lateness/excused statuses, appeals, lecturer workflows, notifications, live APIs, authentication, or persistence. Module Details uses its own deferred module-filtered attendance read boundary.

## Completed enrolments

The selected student may have a completed enrolment with no current semester. `activeSemesterId` is null in that case; the selector defaults to the latest owned historical study period. Reads never borrow another student's timetable or invent a current period. Nadia's completed scenario has published academic history and no scheduled current classes. Restricted registration and submission actions remain gated separately.
