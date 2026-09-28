# Calendar behaviour

The dashboard Calendar section presents the active semester as a unified monthly view. It is read-only in this frontend phase and receives all records through `PortalApi.getCalendarMonth()`.

## Event model

`CalendarEvent` is a Portal API read model rather than a physical table or a replacement for timetable, module-issue, or meetup records. It gives the calendar one stable shape for six event kinds:

- `class`: a concrete scheduled teaching occurrence.
- `assignment`: a point-in-time submission deadline; `startsAt` is the deadline and `endsAt` is null.
- `exam`: a timed assessment with a start, end, module, and optional location.
- `meetup`: a timed community event.
- `holiday`: an all-day interval whose `endsAt` is exclusive.
- `registration`: the full module-registration interval projected from the student's canonical Study Period opening and closing timestamps.

Every event belongs to a Semester. Classes, assignments, and exams also reference a Module; registration periods, meetups, and holidays use an explicit null `moduleId`. Assignment and exam events additionally require the stable `moduleLearningItemId` used by the matching Materials record; every other event kind keeps that field null. A Registration event requires a closing timestamp after its opening timestamp.

The mock adapter starts from the selected Programme Enrolment's exact Module Registrations and Offerings. It expands each canonical Class Schedule for the requested campus month, then overlays dated Class Sessions: a same-date session supplies the actual times, a cancellation removes that occurrence, and an off-pattern session adds a make-up occurrence. This also lets a newly confirmed first-term registration appear immediately while its planned term has schedules but no materialized sessions yet. Each selected Study Period contributes its complete registration window as one registration event. A future HTTP adapter must return the same actual occurrences and interval projection so cancelled classes, make-up classes, and registration timing do not require frontend-owned screen fixtures.

Released assignment and exam events come from the same offering-owned Module Learning Item and Module Assessment records as Materials and module issues. Locked items do not leak assessment details into Calendar. The response includes only Modules referenced by events in the requested month. Campus holidays use the same all-day interval and campus-timezone rules for every student scenario.

Holiday intervals must be non-empty and all-day. Month filtering and day indexing share the same campus-timezone interval calculation: every covered holiday date appears, including across month/year boundaries, while the exclusive ending date is omitted. Equivalent UTC and offset timestamps produce the same covered dates. Registration intervals retain their inclusive closing-date presentation.

## Month and day flow

- The first month is today when today falls between registration opening and semester end; otherwise it is the registration-opening month.
- Navigation begins with the selected student's registration opening and ends with the active semester. Registration dates remain selectable even though they precede teaching. Dates before registration opens or after the semester ends remain visible in boundary months but are disabled: their translucent raised cards remain visible, while their date text is muted.
- The Calendar uses four simple regions: a month selector row, the month grid, a plain event legend, and the selected-day details. The surface wrapper owns no content padding. The compact selector and grid each own an 8px inset; the legend and details keep their roomier 12px horizontal inset. Details use 20px top padding and 16px bottom padding. The shared `CalendarMonthSelector` keeps the previous control, centred month label, and next control in one normal-flow three-column row and owns the full-width divider before the grid. Academic Attendance uses the same selector instead of DayPicker's native navigation. The month label uses the high-emphasis `title` colour. The controls use the same shared arrow button as the News carousel. Weeks begin on Monday. Outside-month dates are hidden and every month reserves six rows to avoid layout shift.
- Compact day cards centre the body-style date label and event markers horizontally, with the date label aligned to the top. In-semester date labels use the high-emphasis `title` colour, while disabled boundary dates use muted text. Cards use the translucent raised surface treatment from empty timetable periods. Today is identified only by its brand-colour date label; it has no special fill, selected treatment, or hover treatment. The grid has equal 8px horizontal and vertical gutters.
- Day-card hover changes immediately; it does not animate. All enabled days, whether ordinary, selected, or today, use `surface-hover` on hover. Selected days use `surface-hover` at rest.
- Selecting a day updates the agenda below the grid. Navigating to another month selects its first valid registration-or-semester date.
- On tablet and desktop each day shows at most three visible event dots followed by a textual overflow count. On phones, up to three events use compact dots; busier days show separate counts per event kind in the matching legend colours. Counts wrap within the day card, which can grow vertically when needed. Its accessible label announces the event count and kinds. The one Registration interval is indexed onto every covered date, including both months when the seven-day window crosses a month boundary.
- The legend is left-aligned on phones and centred on larger screens. It names Class, Assignment, Exam, Meetup, Holiday, and Registration with their matching marker colour. It is a plain key: all event kinds remain visible in the grid and selected-day details.
- The agenda sorts all-day events before timed events. It always names the event kind so colour is not the only category indicator. Timed ranges use the shared 12-hour `en-MY` campus clock, for example `12:00 pm–1:00 pm`; Registration shows its full opening and closing date-time range. Upcoming Meetups in Community uses the same clock.
- Each agenda card uses `surface-raised` with 12px padding and shows the event kind, then its module code on a separate line when applicable, followed by its title. Descriptions are intentionally omitted; location and time share one icon-labelled metadata row.
- Agenda cards linked to a Module are keyboard-accessible buttons with an immediate `surface-hover` state. Assignment and exam events open their semester-specific learning-item detail route using `moduleLearningItemId`; class events open Module Details. Registration, meetup, and holiday cards remain static because their `moduleId` is null.

## Loading and performance

The section renders a layout-matched skeleton until it approaches within 400px of the viewport. Only then does it load the Calendar feature chunk and query the active month. TanStack Query caches each `semesterId` and `YYYY-MM` pair independently.

The token-adapted calendar primitive wraps `@daypicker/react`; its custom day button preserves the library's forwarded keyboard, focus, and ARIA behaviour. Month changes are immediate rather than animated. The production bundle check caps the deferred Calendar chunk at 75 KiB gzip while preserving the existing eager and largest-chunk budgets.

## Scope boundaries

The section does not add an Academic Calendar route, event creation or editing, persistence, notifications, live API integration, authentication, or mobile-specific layout. Those remain future product decisions.
