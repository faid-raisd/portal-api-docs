# Profile Portfolio

## Scope

Profile > Portfolio is a completed Phase 1 frontend route rooted at `/profile/portfolio`. It lets the selected student browse, add, edit, and delete portfolio projects through the replaceable `PortalApi`. The current `MockPortalApi` stores changes and local artwork previews only in memory for the active student scenario; refresh or scenario replacement restores the canonical fixtures and releases temporary blob URLs.

Phase 1 does not include a public portfolio, sharing URL, visibility settings, categories, manual ordering, likes, comments, galleries, PDF export, cloud storage, uploads, or persistent storage. PDF artwork is a supported preview format, not an exported Portfolio document. Share remains a visible disabled action with an accessible unavailable explanation.

## Profile shell and routes

The shared Profile heading, `StudentSummaryCard`, active issue cards, and `TabbedPagePanel` remain visible in every Portfolio state. Selecting the Portfolio tab always returns to the grid. Nested routes keep the Profile > Portfolio sidebar and tab state active:

- `/profile/portfolio` — project grid.
- `/profile/portfolio/new` — add form.
- `/profile/portfolio/:projectId` — project details.
- `/profile/portfolio/:projectId/edit` — edit form.

Nested views use `ContentBreadcrumb`; Back and Cancel return to their documented parent view, and all route changes reset the main portal scroller. An unknown or foreign project ID shows `Portfolio project unavailable` with a route back to the grid.

## Project grid

The grid uses a panel-type `ContentSection` titled Portfolio and the shared responsive `CardGrid` portfolio variant: one column on phones, two on tablet-sized containers, and up to four on desktop. Projects are ordered by creation date newest first, then alphabetically for equal dates. Each feature-owned `PortfolioProjectCard` contains a 4:3 artwork preview or labelled PDF artwork tile, a regular-weight title-colour body-style project name, formatted creation date, a full-card detail action, and a sibling overflow menu with Edit and Delete actions. Its artwork opacity and metadata-row surface update immediately on hover; neither project-card effect is animated. Keeping the menu outside the detail button avoids nested interactive controls.

Delete opens the shared confirmation `Popup`. A dashed, keyboard-accessible Add Project tile is always the final grid item. It is the sole item for a student without projects and then includes first-project guidance.

## Project details and forms

Project details show a large cover-fit image that preserves its source aspect ratio while cropping to its available container, or a labelled PDF artwork tile, beside a borderless compact metadata column. Selecting the artwork opens the same shared `MediaPreviewLightbox` used by chat image thumbnails: raster images retain zoom, pan, and close behaviour, while PDFs open in the modal's embedded document viewer. The shared stacked read-only `DetailField` variant places each label above its value; Tools use large elevated neutral `Badge` components and no tools displays an em dash. The first action row contains full-width Edit and disabled Share controls, while a visibly separated second row provides Delete Project as a muted plain link that becomes title-colour and underlined on hover. Edit opens the edit route, Delete Project uses the shared confirmation popup, and Share remains disabled and non-functional.

Add and Edit reuse `Input`, `DatePicker`, `Textarea`, `Button`, `ContentSection`, validation feedback, and a separate bottom `PageActionBar`. The Cancel and save controls sit below both form columns, with an edge-to-edge panel divider and the standard action inset. The feature-owned `PortfolioArtworkPicker` supports pointer and keyboard file selection, current or pending preview, and replacement. Its empty drop target uses the same transparent, dashed action treatment as the Add Project tile. New projects require artwork; submitting without it shows the concise `Select artwork to continue.` field error. An edit keeps the current artwork unless a valid replacement is selected. Validation and API failures keep the draft visible, while a successful save opens the saved project's detail route.

Tools are entered as an optional comma-separated field. Entries are trimmed, blanks are removed, and duplicates are removed case-insensitively while preserving the casing of the first entry.

## Data and API boundary

Each canonical Portfolio Project belongs directly to one stable Student Profile and contains an opaque ID, project name, `YYYY-MM-DD` creation date, description, ordered tools, and artwork filename, MIME type, byte size, and preview URL. Artwork accepts exactly one non-empty JPEG, PNG, WebP, GIF, or PDF file up to 25 MiB.

Logical Portal API boundaries are:

- `PortalApi.getPortfolioProfile (`POST /v1/portal/getPortfolioProfile`)` returns `PortfolioProfileResponse`.
- `PortalApi.createPortfolioProject (`POST /v1/portal/createPortfolioProject`)` validates `CreatePortfolioProjectInput` and returns the saved project with a generated opaque ID.
- `PortalApi.updatePortfolioProject (`POST /v1/portal/updatePortfolioProject`)` validates `UpdatePortfolioProjectInput` and returns the saved project.
- `PortalApi.deletePortfolioProject (`POST /v1/portal/deletePortfolioProject`)` removes the selected student's project.

The mock adapter rejects project IDs owned by another student. It stores only file metadata and an object URL for a newly selected local preview; there is no upload. Replacing or deleting a session-created preview revokes its object URL. Query mutations upsert or remove the saved record without changing other Profile query caches.

Creation dates use shared real-calendar validation, rejecting impossible leap days and month/day combinations before allocating a preview. Scenario replacement and runtime unmount dispose saved Portfolio and chat preview URLs. In-flight artwork creation/replacement cannot allocate a new preview after its session has been disposed. This resource cleanup is internal to the development adapter and does not add scenario methods to the production-facing `PortalApi`.

## Reference scenarios

Rizal has three canonical projects and Alya has an empty collection. Their projects are always selected through the active stable student ID. Scenario selection reconstructs the mock API and clears student-scoped query caches, so no project or preview crosses between students.

## Main implementation files

- `src/contracts/portfolio-profile.ts`
- `src/services/mock-portfolio-profile-api.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
- `src/components/features/profile/portfolio-profile-content.tsx`
- `src/components/features/profile/profile-page.tsx`
- `src/app/routes.ts`
- `src/mocks/portal-record-fixtures.ts`
- `src/data-model/canonical-registry.ts`
