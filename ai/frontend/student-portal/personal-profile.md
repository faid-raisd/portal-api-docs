# Personal, Academic, Resume, Portfolio, Documents, and Privacy & Security Profile

## Scope

Profile > Personal is a completed frontend-only route at `/profile/personal-info`, Profile > Academic is a completed read-only route at `/profile/academic`, Profile > Resume is a completed Phase 1 builder at `/profile/resume`, and Profile > Portfolio is a completed Phase 1 project builder rooted at `/profile/portfolio`. The shared Profile shell reads the logical personal-profile response through `PortalApi`, while Personal, Resume, and Portfolio update their own independent query boundaries; the current `MockPortalApi` keeps saved changes only for the active browser session and resets them on refresh. No physical database, production upload, download, authentication, or general issue-resolution service is implemented; the completed Module Registration mock flow may resolve only its own session issue.

The Profile tab set contains Personal, Academic, Resume, Portfolio, Documents, and Privacy & Security. All six tabs are implemented within the shared Profile shell. The read-only Documents library is at `/profile/documents`; the former `/documents` route redirects there with history replacement. Its title-only document rows remain no-op placeholders. Privacy & Security is at `/profile/privacy-security`; it presents campus-owned guidance and can open the existing Community IT Helpdesk without leaving the route. Full behaviour is documented in [Profile Documents](profile-documents.md) and [Privacy & Security](privacy-security.md).

## Page structure

- The Profile heading, identity summary, optional active-issue grid, and shared `TabbedPagePanel` form one route shell with 16px gaps, matching the hierarchy of the Academic title, context strip, and tabs.
- The panel owns a 16px tab inset, one divider, and a 16px content inset.
- On phones, the Profile tab row scrolls horizontally and reveals the active tab; the student summary centres its avatar, name, Faculty, programme and stacked semester badge, issue cards become one-column, `DetailField` labels stack above values, record tables become labelled cards, and edit/action rows keep full-width reachable controls. Tablet and desktop retain the same route anatomy with the shared wider gutters.
- The shared full-width `StudentSummaryCard` and active account issues sit above the tabbed panel and remain visible on Personal, Academic, Resume, Portfolio, and Documents. The same card appears above every Academic tab. It uses the page-level `surface` tier; below the student-name divider, the faculty and programme form a left column while a right-aligned large `surface-elevated` Badge states the current semester and stays vertically centred against that column.
- Personal tab content uses one panel-type `ContentSection` titled Personal Details. Its stable 36px no-action header keeps a 16px gap to the first card, while General details, Permanent Address, Current Address, Emergency Contacts, errors, and bottom actions remain in a 32px internal stack. Each detail group uses the shared `DetailSectionCard`: a transparent 8px-radius bordered wrapper whose 12px title and content regions are separated by a `border` divider.
- Academic tab content uses two panel-type `ContentSection` blocks, Academic Qualifications and English Proficiency, with 32px between them and 16px from each stable 36px header to its records or empty state. A single academic qualification uses a bordered, headerless read-only record section; when more than one qualification exists, each record uses the shared inner-section header labelled `Qualification 1`, `Qualification 2`, and so on. English Proficiency records remain headerless. All records compose `DetailField` rows, and repeated records remain 16px apart. Multiple academic qualifications are ordered by completion date from newest to oldest. Missing optional fields and documents display an em dash, while absent collections use separate shared `EmptyState` feedback.
- Resume tab content uses five panel-type `ContentSection` blocks for Professional Summary, Work Experience, Education, Skills, and Awards & Recognition. They remain 32px apart, and every action-bearing 36px header keeps a 16px gap to its content. The summary is an inline Textarea with an explicit changed-only Save Summary action; populated record sections use bordered `DataTable` compositions, while empty collections use shared subtle `EmptyState` feedback. Their secondary Add actions remain available alongside selectable edit rows and confirmed trash removal. Full behaviour is documented in [Profile Resume Builder](resume-profile.md).
- Portfolio tab content uses one panel-type `ContentSection` for the project grid and the same hierarchy for routed details and add/edit forms. Feature-owned project cards and artwork selection compose shared grid, breadcrumb, form, badge, popup, and detail patterns. Full behaviour is documented in [Profile Portfolio](portfolio-profile.md).
- `DetailField` is the reusable two-column field row. Its `readOnly` variant top-aligns values with labels; its `editable` variant vertically centres the supplied form control and validation message. `StudentSummaryCard` separates the student name from its academic summary with a `border` divider, then uses a 14px medium-weight title-colour faculty line and muted 14px programme line with a 4px gap beside the 32px current-semester Badge; field labels use 14px body typography.
- Profile issue summaries reuse the 12px-radius `IssueCard` with the severity icon at the start. They use the responsive issue `CardGrid` with 16px gaps and a 240px readable card minimum, wrapping into additional rows when space is limited; the grid is omitted when there are no active issues. One Outstanding Fees issue is derived from the allocation-backed open-invoice balance while it is positive, using that amount and currency; it cannot duplicate when multiple invoices remain open. Student Pass required, countdown, expiry, and cancellation presentation is reconciled with the shared current-pass selector, while all countdown labels use the owning campus calendar timezone. An active Module Registration issue opens Academic > Module Registration, an active Outstanding Fees issue opens Finance, and an eligible graduate's orange Graduation Clearance issue opens the exact owned Online Form. Student Pass issues without a case open the overview; an active or rejected application shows its live status and opens the exact recommended Applications step. Their hover shade is the same immediate darker semantic treatment used by Action required.
- Account attention remains student-global across all owned Programme Enrolments even while the page body follows one selected context. Each projected issue action carries its owning `programmeEnrolmentId`; navigation switches to that context before opening Finance, Module Registration, Graduation Clearance, or the exact Immigration step. A Personal Profile save updates global editable fields, contacts, and issues in the selected-context cache without replacing its programme identity with the default active enrolment.

## Editable and locked information

Saved editable fields and emergency contacts survive Module Registration confirmation within the same session. Confirmation refreshes projected account issues without resetting the Personal Profile overlay.

The frontend allows session-only editing of:

- contact number;
- marital status;
- email address;
- permanent address;
- current address; and
- emergency contacts.

The student's name, nationality, derived Student Fee Category, birth details, gender, race, identification number, passport filenames, passport expiry date, and passport issuing country remain read-only. Student Fee Category displays Local when citizenship matches the enrolment campus country and International otherwise; Malaysian Service Tax eligibility still uses the canonical citizenship country code directly. Passport filenames use the reusable underlined brand `FileLink` visual without an icon, but clicking it is a no-op in this phase; it does not start a download or navigate.

Rizal is an Indonesian citizen classified as International, with a permanent address in Bandung, a current campus address in Cyberjaya, and a Malaysia Student Pass expiring on 28 September 2026. His classification keeps Immigration available in the main navigation and Community services. Alya is consistently Malaysian and classified as Local; she has no Malaysia Student Pass or Immigration entry point, and a stale direct Immigration URL returns her to Dashboard. These private profile and visa records are distinct from the limited Person Summary and Staff Member directory records used elsewhere in the portal.

Active Student Pass required, expiring, expired, and cancelled issue cards open the exact owned Immigration route. The global Action required control continues to open Profile, where the individual card provides the specific destination. An international student without a completed pass receives the derived required issue, presented as **Student Pass Required** with the current application status while a case is active; it leaves the active count when the new pass is created. Renewal completion resolves the former expiring-pass issue. Cancellation creates the separate destructive **Student Pass Cancelled** issue: it shows the cancellation and passport-collection status while that case remains active, then changes to **New application required** only after an eligible student-requested cancellation closes. It remains visible while an eligible replacement application progresses and resolves when the new pass is issued.

## Academic qualification record

Academic Qualification records retain the qualification type and name, institution, country of education, optional field of study and start date, completion or examination date, result, transcript, academic certificate, and optional certified translation and grading scale. English Proficiency records retain a formal test name, examination date, text score, optional expiry date, and certificate. The page displays the university's retained admission evidence; it does not calculate admission eligibility, interpret scores, or apply programme thresholds.

Rizal's mock record contains a Foundation in Design and senior-secondary qualification plus IELTS Academic. Alya has one senior-secondary qualification and IELTS Academic. Both scenarios are selected through their stable student IDs, and empty arrays remain valid for students without a record.

All document names use the existing underlined `FileLink` placeholder. They provide accessible download labels but do not fetch a file, start a download, upload a replacement, or expose storage URLs in this frontend phase.

At least one emergency contact is required. Edit mode can add further contacts and shows a trash control for each row; the final remaining contact cannot be removed. New contacts use a null ID in the update request and receive a generated opaque ID from the mock adapter.

The trash control uses the normal neutral action colours: muted at rest, title colour on the shared neutral hover surface. It does not use destructive red styling.

## Edit behaviour

- Read-only mode ends with a 36px brand `Edit` button with a transparent border.
- Edit mode ends with a bordered secondary `Cancel` and brand `Save Changes` buttons at the same 36px height.
- The full-width Add another emergency contact row is an explicit 36px transparent, field-radius dashed-outline action with regular white text; its hover uses the neutral hover surface and a softer muted dashed border.
- Text inputs and the marital-status selector share the same 36px raised surface, neutral hover surface, and ring-free focus treatment. Hover changes are immediate.
- Cancel restores the last response returned by the current `PortalApi` instance.
- Save validates the complete editable payload with Zod before sending it to the API boundary.
- Validation and API errors keep edit mode and the current draft visible.
- A successful mock save updates the query cache and remains visible while navigating during the same session.
- Refreshing or restarting the browser reconstructs the mock adapter and restores the fixtures.

## Documents library

Documents collects the existing passport and qualification filenames directly from their owning records alongside student-specific letters and campus handbooks. Personal and Academic retain their file displays. Two panel-type `ContentSection` blocks reuse a feature-owned table composition built from bordered `DataTable`, shared `IconButton`, and `EmptyState`. No functional file preview, download, or document management is introduced. See [Profile Documents](profile-documents.md).

## Logical API contract

- The response is selected by the active Portal API student ID. Account issues remain independent: Alya has the registration action only; Rizal's signed positive Finance balance derives one outstanding-fees action beside his canonical expiring-visa action; Nadia starts with the Graduation Clearance action and resolves it when she submits the form.
PortalApi.getPersonalProfile (`POST /v1/portal/getPersonalProfile`) is represented by `PersonalProfileResponse`. It combines the current Student, selected Programme, StudentPersonalProfile, EmergencyContact collection, and student-global StudentAccountIssue collection required by the shared Profile shell and Personal tab. The shell owns this existing query and passes its loaded response into Personal. `StudentSummaryCard` instead receives the narrow student/programme/semester identity from the existing `AcademicContextResponse`; no separate Profile-context endpoint is introduced.

PortalApi.updatePersonalProfile (`POST /v1/portal/updatePersonalProfile`) is represented by `UpdatePersonalProfileInput`. It accepts only the editable fields listed above. The future backend must enforce ownership and field-level authorization; the frontend's locked presentation is not a security boundary.

PortalApi.getAcademicProfile (`POST /v1/portal/getAcademicProfile`) is represented by `AcademicProfileResponse`. It returns the selected student's Academic Qualification and English Proficiency collections from canonical student-owned records. The dedicated query is scenario-scoped, read-only, and independent of the Personal mutation cache.

`PortalApi.getResumeProfile (`POST /v1/portal/getResumeProfile`)` and `PortalApi.updateResumeProfile (`POST /v1/portal/updateResumeProfile`)` boundaries are represented by `ResumeProfileResponse` and `UpdateResumeProfileInput`. They are scenario-scoped and independent of Personal and Academic Profile. Resume Education is not imported from or synchronized with Academic Qualifications.

`PortalApi.getPortfolioProfile (`POST /v1/portal/getPortfolioProfile`)`, `PortalApi.createPortfolioProject (`POST /v1/portal/createPortfolioProject`)`, `PortalApi.updatePortfolioProject (`POST /v1/portal/updatePortfolioProject`)`, and `PortalApi.deletePortfolioProject (`POST /v1/portal/deletePortfolioProject`)` boundaries provide student-scoped Portfolio CRUD. They are scenario-scoped, session-only, and independent of the other Profile caches. Local artwork selection stores only validated metadata and a temporary preview URL in the mock session.

PortalApi.getDocumentsProfile (`POST /v1/portal/getDocumentsProfile`) is represented by `DocumentsProfileResponse`, with independently empty student and university document collections. `useDocumentsProfileQuery` uses the same student-scoped query boundary as the other Profile tabs.

PortalApi.getPrivacySecurity (`POST /v1/portal/getPrivacySecurity`) is represented by `PrivacySecurityResponse`. It resolves the exact selected Programme Enrolment campus, returns only that campus's optional `CampusPrivacySecurityRecord`, and derives the frontend access summary. No mutation, consent, password, session, policy-acknowledgement or privacy-request contract is introduced.

## Main implementation files

- `src/components/system/student-summary-card.tsx`
- `src/components/features/profile/profile-page.tsx`
- `src/components/features/profile/academic-profile-content.tsx`
- `src/components/features/profile/resume-profile-content.tsx`
- `src/components/features/profile/portfolio-profile-content.tsx`
- `src/contracts/academic-profile.ts`
- `src/contracts/academic-context.ts`
- `src/contracts/resume-profile.ts`
- `src/contracts/portfolio-profile.ts`
- `@raisd-campus/design-system/system/detail-field`
- `src/features/profile/personal-profile-model.ts`
- `src/features/profile/profile-routes.ts`
- `src/contracts/portal.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
- `src/services/mock-academic-profile-api.ts`
