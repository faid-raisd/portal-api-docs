# Profile Documents

## Current behaviour

Profile > Documents is a read-only frontend route at `/profile/documents`. It is the fifth Profile tab, after Portfolio and before Privacy & Security. The former top-level Documents navigation item is removed. `/documents` redirects to the new route with history replacement, so browser Back does not revisit the obsolete location.

Student Documents lists the selected student's passport photo and scan, every retained academic qualification's transcript/certificate/optional translation/grading scale, English-proficiency certificates, and student-specific university letters. Personal and Academic retain their existing file displays. The former University Documents section and its Student Handbook file have moved out of Profile; Student Handbook is now a catalogue entry under [University Policies](university-policies.md).

Student Documents uses a title-only `LinkedList` rather than a table. Each row has the document icon, title and decorative chevron; it is an accessible native action and intentionally does nothing. Rows do not show filenames, sources, View/Download controls, or document metadata because file delivery remains outside this frontend phase. There are no uploads, edits, deletions, filters, summary cards, university-document panel, or document-detail routes.

## Layout references

The existing main application shell, Profile Academic, Profile Resume, and Finance Invoices were inspected before implementation. The new tab keeps their established composition:

| Concern | Profile Academic | Profile Resume / Finance | Documents decision |
| --- | --- | --- | --- |
| Heading | Shared Profile heading | Shared Profile / Finance heading | Existing Profile `pageSectionTitleVariants()` heading |
| Root rhythm and width | Profile shell, 16px hierarchy | Same shell hierarchy | Reuse Profile shell and available content width |
| Tabs and sections | `TabbedPagePanel`, panel `ContentSection` | Same panel sections, reusable `LinkedList` | One Student Documents panel using title-only document rows |
| Loading / error / empty | Tab-local feedback inside Profile | Shared Skeleton / EmptyState and tab-local errors | Same shell, section-shaped loading, one empty collection, tab-local error |
| Navigation | URL-backed active Profile tab | Routed tab/sidebar activation and scroll reset | Fifth tab, nested sidebar entry, normal Back/Forward and scroll reset |

The heading, StudentSummaryCard, optional account-issue grid, and tab panel remain 16px apart. The section retains the shared 36px header row and 16px content gap. Its `LinkedList` rows use the shared raised surface, icon, title and chevron treatment. Long document titles wrap without changing the portal width. The shared list typography is documented in the Design System.

Browser verification exposed an existing TabbedPagePanel navigation defect: Radix mouse-down/focus selection and the active-tab click handler could dispatch duplicate route changes before the controlled value caught up. The shared panel now tracks each pointer gesture, selects a new tab once, and retains a single active-tab reset action. Keyboard activation is preserved. Focused component regressions cover deferred route updates; the published design system catalogue captures the panel treatment. Main-scroll reset also observes the router location key so reselecting the current sidebar destination returns to the top.

## Canonical records and API

`PortalApi.getDocumentsProfile()` represents `PortalApi.getDocumentsProfile (`POST /v1/portal/getDocumentsProfile`)`. Its Zod-validated `DocumentsProfileResponse` returns one `studentDocuments` array. Each `ProfileDocument` has a stable opaque `id`, `title`, exact `fileName`, and display `source`. The collection can be empty; IDs must be unique across the response. No URL, binary contents, invented file size, or issuance date is returned.

The mock adapter starts from the selected stable Student Profile ID:

- Passport and qualification evidence is projected directly from existing canonical file fields. It is never copied into library fixtures or screens. Null optional file fields are omitted. CAP-50 may reference the same selected-student metadata in an immutable Online Form evidence snapshot; a case-specific replacement remains attached only to that submission and never modifies this library.
- Canonical Student Document records own additional student-specific letters through `studentProfileId`. Rizal and Alya each have an Enrolment Confirmation record.
- The University Document record and campus relationship are retired. Student Handbook belongs to the CAP-55 catalogue; its policy body or file remains outside the current release. An unknown student remains an error.
- Student Document records carry an ID, owning student ID, title, filename, and source department. Graph validation rejects unknown owners and duplicate library IDs.
- Projected IDs encode source kind, owning record ID, and file-field identity in the adapter. Consumers treat them as opaque. Reordering records or renaming a file does not change its identity. Identical filenames from different records remain distinct.
- The collection sorts by title using English comparison, then by stable identity. Projection does not mutate canonical records, and each API response is independent.

`useDocumentsProfileQuery` uses the existing scenario-scoped Portal query key. Scenario replacement clears its cache with the other student queries. Documents has no mutation or invalidation workflow of its own because all contributing file metadata is read-only in this phase.

The Data Model Explorer includes the Student Document canonical table and its student ownership relationship, source-field endpoint usage, and Profile Document derived examples. Its student filter restricts letters to the selected student. The retired University Document entity and campus relationship are absent. The derived read-model catalogue remains an explicitly labelled reference sample, as for other derived models.

## Verification

Unit tests cover exact canonical filenames in both scenarios, stable identities after ordering/filename changes, duplicate filenames, optional evidence, unknown students, the empty collection, invalid owners/IDs/metadata, response isolation, explorer relationships, tab-local query states, scenario cache replacement, and absence of the retired University Document model.

Playwright covers the legacy replacement redirect, direct URLs, responsive sidebar/tab activation, Profile shell geometry, Back/Forward, scroll reset, title-only keyboard and click no-op actions, scenario switching, loading/error feedback, long titles, the empty state, and absence of the University Documents panel and handbook file across the supported route matrix; existing detailed regression remains at 1280px and 1440px. The repository full quality gate remains required.

## Implementation references

- `src/contracts/documents-profile.ts`
- `src/contracts/portal-records.ts`
- `src/services/mock-documents-profile-api.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
- `src/components/features/profile/documents-profile-content.tsx`
- `src/components/features/profile/profile-page.tsx`
- `src/features/profile/profile-routes.ts`
- `src/app/routes.ts`
- `src/app/router.tsx`
- `src/data/portal-sidebar.ts`
- `src/tests/documents-profile.test.tsx`
- `tests/e2e/documents-profile.spec.ts`
