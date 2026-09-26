# Profile Privacy & Security (CAP-39)

## Scope

Privacy & Security is the sixth Profile tab at `/profile/privacy-security`. It is a read-only Student frontend demonstration that explains the information used by the portal, the actions currently available to the selected student and practical account-security guidance. It does not claim an approved legal basis, retention period, regulatory compliance or production security.

Real authentication, authorization, encryption, retention enforcement, backups, audit logging and cybersecurity operations remain backend and institutional responsibilities. Formal access, correction or deletion requests, supporting documents, receipts and case tracking belong to CAP-51.

## Page behaviour

- The route keeps the shared Profile heading, student summary, account issues, tabs and 16px panel inset.
- **Your information** lists identity/contact, academic, finance and portal-activity categories with plain-language purposes in a bordered table.
- **Your portal access** shows what the current frontend demonstrates for Profile, Academic, Finance and Community. This is explanatory UI, not an authorization boundary.
- **Keeping your account secure** renders ordered campus guidance through the reusable feature-owned `PrivacySecurityGuidanceCard`. Each card pairs a responsive 16:9 campus-owned illustration with its title and guidance; failed media retains the same geometry and an accessible security fallback.
- **Privacy questions and requests** links to Online Forms for the campus's available templates and IT Helpdesk for privacy questions. Both actions stack at full width on phones and return to content-sized controls from tablet upward. The initial five CAP-51 templates do not include a dedicated privacy access/correction/deletion request. **Open IT Helpdesk** expands Community, opens its existing service conversation, keeps the current route and moves focus to the message composer. The action is disabled with an explanation when that service is unavailable.
- Loading, retryable error and campus-empty states stay inside the Profile panel. A campus without published content receives an empty state and never falls back to Cyberjaya.

## Data boundary

`CampusPrivacySecurityRecord` is campus-owned canonical content with stable IDs, an optional review date, ordered information categories and ordered security guidance with responsive local imagery. The canonical graph permits at most one record per campus and validates campus ownership plus unique nested IDs/display orders.

`PortalApi.getPrivacySecurity (`POST /v1/portal/getPrivacySecurity`)` returns `PrivacySecurityResponse`. The mock projection resolves selected student → exact URL-backed Programme Enrolment → campus, selects only that campus's record and derives a stable student access summary. When the route omits an enrolment ID, the shared selector uses its documented deterministic default; foreign or missing enrolments are errors. `usePrivacySecurityQuery` scopes the response to the scenario, session generation, and Programme Enrolment; there are no mutations.

Cyberjaya supplies neutral synthetic guidance for both current student scenarios. Other campuses require their own approved content.

The four Cyberjaya security-card illustrations are synthetic project assets generated for this frontend demonstration. They contain no policy text, people, campus marks or external-source material. Each is delivered as local 960px and 480px WebP variants under `public/privacy-security/cyberjaya`; approved campus imagery can replace them through the same content contract.

## Verification boundary

Browser checks cover 375–1440px responsive route and overflow behavior, with existing 1280px and 1440px Community dock/resizing, route/history, tab activation, focus placement, loading/error/empty states, long content and accessibility coverage retained. Record-oriented information and access tables become labelled cards on phones. CAP-39 Backend remains Needs checking, and physical-device or assistive-technology certification remains outstanding. The engineering accessibility audit is supporting evidence, not certification.
