# Student Announcements — CAP-16

## Current behaviour

Announcements is the sidebar destination immediately after Dashboard. `/announcements` uses the visible shared page heading, a copy-free, gradient-free 288px campus-courtyard banner, then **Important Announcements** and **All Announcements** sections inside one navigation-free page panel. Both sections use raised `LinkedList` rows with a decorative 112px-by-64px cover or fallback thumbnail, title, short summary and decorative chevron. Each row is one native action that opens the article route through pointer, Enter or Space. Important Announcements contains the pinned subset and is omitted when none are pinned; All Announcements contains the complete collection. Both collections retain the API's publication timestamp descending order with stable ID tie-breaking. Loading, errors and empty collections retain the heading, banner and panel geometry. There are no filters, pagination, read/unread markers or student mutations.

`/announcements/:announcementId` retains the Announcements heading, shared page panel and active sidebar item. `Announcements → Announcement Details` returns to the list. The breadcrumb sits in the panel header, followed by its divider, a flush 288px cover banner, then the widely inset article content. Dashboard cards link to these exact records and routes; View all opens the list. The Dashboard carousel continues to contain all ten notices, regardless of pinned state, in the same newest-first order. Both carousels retain arrow/trackpad scrolling. Their opt-in link dragging starts after eight pixels of movement, suppressing the resulting pointer click without preventing subsequent clicks or keyboard activation. Other `useHorizontalScroll` consumers retain their defaults.

## Layout references

| Concern | Services reference | Finance/Portfolio reference | Announcements |
| --- | --- | --- | --- |
| Page heading and rhythm | `pageSectionTitleVariants()`, root gap 16px | University Policies | Same heading utility and 16px root gap |
| Panel navigation | Navigation-free panel | Nested breadcrumbs remain inside the parent panel | Overview has no navigation header; detail keeps the breadcrumb header |
| Banner | 288px image banner without overlay copy or gradient | University Policies | Campus-courtyard banner on overview; article cover/fallback on detail |
| Content | Titled sections with raised list rows | Detail sections use established panel spacing | Important/All sections use `LinkedList`; detail uses 16px phone and 60px tablet/desktop reader insets with 32px major gaps |
| States/navigation | Banner remains through list states | Breadcrumb return and unavailable states stay in shell | Overview states retain heading/banner/panel; detail loading reserves banner/body geometry; active sidebar, history and scroll reset remain unchanged |

`PagePanelLayout` is the portal-wide structural owner shared with `TabbedPagePanel`: it can omit navigation, or render a 16px navigation header and divider, and supports an optional flush banner plus standard (16px), responsive wide (16px below 768px and 60px above), or no content inset. The overview uses the navigation-free composition; details retain the breadcrumb. Article components remain feature-owned: `AnnouncementHeader`, `AnnouncementBody`, `AnnouncementImage` and `AnnouncementBanner`. `AnnouncementOverviewList` adapts published summaries into shared `LinkedList` actions.

The Announcement reader uses the wide panel inset and a left-aligned 80ch maximum at `type-body` size. Its 24px `type-section-lg` title and 12px metadata appear below the banner, followed by a divider and 32px major spacing before the body. Detail covers crop with `object-cover` inside the fixed 288px banner; dashboard cards retain 16:9 covers. An absent or failed detail cover renders the matching faded-blue geometry with one centred announcement icon and accessible alternative text. Inline images preserve intrinsic proportions and optional captions. Detail covers load eagerly and inline/dashboard images load lazily. `ResponsiveMedia` chooses variants from rendered width, including Community resizing.

## Canonical content and API

`announcementRecordSchema` owns stable ID, campus, title, summary, department, ISO publication timestamp, required `isPinned` flag, nullable cover and ordered body blocks. Pinning controls only inclusion in the Important section; it does not change campus access, list visibility or ordering. Body blocks support paragraphs, level-three/four headings beneath the article title, ordered/unordered lists, quotations with optional attribution, images and rectangular tables. Text runs permit bold, italic and portal-path/HTTPS links. React renders escaped text; raw HTML, scripts and embeds are not supported. External links open a new tab with `noopener noreferrer`. This logical rich-content format is a frontend handoff contract, not a required editor package or CMS storage schema.

`PortalRecordGraph.announcements` checks campus references and unique record identities. Body block identities, table geometry and image dimensions/variants are validated. The reusable `contentImageSchema` lives in `contracts/content-media.ts`; Services re-exports it under its existing name without changing its contract.

`PortalApi.getAnnouncements()` returns summaries. `getAnnouncement({ announcementId })` returns one full article or null. Both start at the selected student and exact URL-backed Programme Enrolment, then resolve its campus; no array-position inference or cross-campus fallback is allowed. When the route omits an enrolment ID, the shared selector uses its documented deterministic default. A foreign or missing enrolment is rejected, while a configured campus with no records returns an empty collection/null detail. Summary dates carry the owning campus timezone. These records represent already-published notices; scheduling, expiry and audience rules are not implemented.

Dashboard `articles` uses the same announcement summary schema and canonical projection, including `isPinned`, while continuing to render the complete campus collection. The Announcement overview filters its Important section locally from that already sorted response. Summaries omit the rich body. API parsing returns independent response objects. Queries include the current student scenario/session generation, so cancelled late responses cannot populate another session's current view.

## Mock articles and image provenance

All ten articles and their dates, departments, pin states and operational arrangements are **synthetic fixture assumptions**, not approved campus notices. Semester registration, examination preparation, Wi-Fi maintenance, student-record updates and campus transport guidance are pinned for the prototype. Both existing Cyberjaya scenarios receive the same ten campus-wide records. Backend must confirm publishing ownership and audience rules. No eight-campus rollout is implied.

| Article | Cover | Inline image |
| --- | --- | --- |
| Check your semester registration | None | None |
| Prepare for your semester examinations | None | None |
| Get to know your campus library | `library` | `limkokwing-library` |
| Academic writing: build a stronger argument | None | None |
| Prepare your work for the student showcase | `wings-art` | None |
| Plan ahead for print-workshop visits | `print` | None |
| Campus Wi-Fi maintenance on 12 September | None | `wifi-sercie` |
| Make room for wellbeing between classes | `wellness-center` | `one-world` |
| Plan your journey to campus | `rapidkl` | None |
| Keep your student contact details current | None | None |

Article images refer to existing 800/1600px WebP variants under `public/services/cyberjaya`. The overview banner uses a separate locally generated campus-courtyard image at `public/announcements/campus-courtyard-1600.webp` with an 800px responsive variant; its source prompt and original PNG are retained at `assets/announcements/campus-courtyard-source.png`. It is a synthetic visual assumption for this frontend demonstration and makes no claim to depict the Cyberjaya campus. Original source URLs, restoration exceptions and delivery checksums for article images remain in the Services source inventory linked from [Campus Services](campus-services.md). The source filename `rapidkl` actually depicts a KLIA Ekspres train; its announcement alt text describes that photograph accurately. `wifi-sercie` is illustrative laptop photography, not a photograph of campus IT infrastructure.

## Verification and boundaries

Phone list thumbnails use 64px by 48px instead of the wider-view 112px by 64px, giving the cover or fallback mark more presence without compressing the copy. Announcement summaries clamp to two lines on phones and remain complete at wider sizes. Dashboard phone carousel snapping advances in pairs, matching its two visible cards and arrow actions. Touch scrolling uses native browser physics without the mouse-drag offset handler; desktop mouse dragging remains available.

Contract/API tests cover content inventory, required pin state, campus ownership, missing enrolments, stable ordering with reordered fixtures, malformed content, safe links, optional images, independent responses and scenario cache isolation. Component checks cover the pinned and complete clickable lists, no-pinned omission, visible heading/banner/panel geometry, 112px-by-64px cover/fallback thumbnails, loading/error/empty states, escaped HTML and detail states. Browser coverage checks the responsive banner/list composition, pointer and keyboard activation, routes/history/reset, detail banners and content insets, Community dock/overlay behavior, and unavailable states across supported widths; the established desktop regression remains at 1280/1440px. Exact completed gate results are recorded in [handoff](handoff.md).

CAP-16 Student frontend is **Demo**. Responsive browser support is implemented and Backend remains **Needs checking**. Admin/editor/publishing workflows, applicant notices, notification delivery, acknowledgement tracking, attachments, persistence, authentication, server authorization, and physical-device certification remain outside this slice. The live checklist is unchanged; local planning evidence records the delivered mock viewing journey.
