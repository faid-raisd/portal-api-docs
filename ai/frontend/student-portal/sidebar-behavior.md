# Community and chat behaviour

The frame, responsive phone drawer, tablet rail, desktop sidebar, navigation row styling, logo/footer placement, header, avatar sizing, and page gutters come from `@raisd-campus/design-system@0.2.0` `system/portal-shell`. Student route selection, nested menus, availability rules, Community data and resizing remain here. Change a shared shell behavior in the package and update this document only when the student composition changes observably.

This is a frontend-only implementation. All screen data is exposed through the `PortalApi` interface and currently supplied by `MockPortalApi`. Chat mutations live only in that in-memory service: they survive navigation during the current browser session, but a refresh resets them. The explicit IT Helpdesk service uses this same conversation flow as the agreed CAP-33 student frontend demonstration. This document records the product behaviour that a later backend adapter must preserve.

The development-only Student Scenario selector replaces the entire mock API session. Alya's registration-week Community keeps the programme and applicable services but starts with no module rows, private-message contacts, meetups, or attendees because she has not registered for modules or begun a direct conversation. As a Local student, she is not offered the Immigration service. She still belongs to the programme group immediately through her active Programme Enrolment, so its existing history and unread count are available. Modules, Messages, and Upcoming Meetups share one compact empty-state treatment: a left-aligned muted body label in a transparent bordered wrapper with 12px padding and no icon or description. Switching back to Rizal restores his separate Community directory, including Immigration for his International classification, read state, conversations, and fresh session-only chat state; no message cache crosses students.

The shared Programme Enrolment context is independent of the development student scenario. Its stable `programmeEnrolmentId` query is retained across top-level and nested navigation. A selector appears only when a student owns multiple enrolments or the selected one is inactive; the default order is active, then newest deferred, completed, and withdrawn. Changing it resets nested semester/detail state. Community programme/module groups and their histories follow the exact selected owner; inactive contexts are read-only for academic groups, while the campus Academic Support service remains available as the explicit next action for deferred or withdrawn enrolments. Account attention remains aggregated across owned enrolments, and an issue link switches to the issue owner's context before opening its destination.

When Alya confirms Module Registration, the sidebar re-projects from the new session registrations: selected module rows replace the empty state and each exact Module Offering gains its lecturer/student community group and conversation. A refresh creates a new mock session and restores the pre-registration empty state.

Community membership follows the academic hierarchy rather than a display count. The programme group contains every student with an active enrolment in any version of that programme, across all year levels, plus unique lecturers assigned to offerings in its curriculum. A module group contains only students with a confirmed `registered` record for that exact Module Offering and its assigned lecturers. Normal and repeat registrations have the same access while active; pending-confirmation, withdrawn, completed historical, deferred, and unrelated-offering records do not grant current module-group membership.

## Conversation types

Online Forms replaces Requests in the main navigation at `/online-forms`; `/requests` is a history-replacement redirect. Its sidebar badge counts distinct owned submissions with unread reviewer messages, independently of Community counts. The My Forms tab and affected table rows expose the same state. Only successfully displayed reviewer messages are acknowledged, using their sequence watermark; list browsing and student sends do not clear other updates. Form conversations reuse shared message/composer presentation inside the Online Forms page but never add Community contacts. See [Online Forms](online-forms.md).

| Kind | How you get there | Header | Bubbles | Receipts | Compose |
| --- | --- | --- | --- | --- | --- |
| Group (programme or module) | Programme or module row in Community | Identity card and roster-derived member stack | 14px medium sender names, a divider, and avatars on sender streaks | No | Yes |
| Personal (1:1) | Person card in Messages or members pane | Person card and disabled `View profile` placeholder | No names | Sent/Read outside the current student's bubble | Yes |
| Service | Community Services row | Service mark and `Student services` | No names | Same as personal | Yes |

`View profile` is intentionally a disabled placeholder in personal chat headers during this frontend phase; it does not navigate to the profile route.

IT Helpdesk is a normal service conversation with its own stable service ID and headset icon. Students can send text and attachments, reopen the conversation during the same mock session, and delete their own messages under the shared chat rules. Refresh or scenario replacement clears the mock conversation. No ticket, case number, priority, escalation, service-level commitment or staff workflow is implied; those formal request capabilities are deferred to CAP-51 and backend integration.

New outgoing personal and service messages begin with `receiptStatus: "sent"`; group messages do not show receipts. Selecting an outgoing bubble opens its delete action. Deleting the last message removes a newly created personal or service conversation from the current session. Text, attachment drafts, and per-conversation scroll positions are retained while moving between Community layers during the session.

Programme conversation contexts include the stable Programme and Community Group IDs. Module conversation contexts include the stable Community Group, Module Offering, Module, and semester IDs in addition to their display label. Personal contexts use the stable community person ID; service contexts use the stable service ID. Both Community module rows and the module chat identity header place the supplied module code in the shared spaced muted `type-label` style above the module name. The module group header's `View module details` link opens that exact semester-specific offering; it does not redirect to the general Modules list. The Community module rows themselves continue to open chat as their primary action.

`CommunityResponse` returns the current stable person ID plus safe community people, groups, and membership rows. Programme and module cards, avatar stacks, totals, and members panes all join the same membership rows, so no independent `memberCount` can drift from the displayed list. Conversation summaries are a separate read model: programme/module badges show messages unread by the current person, never member totals, and exclude messages sent by that person. Opening one conversation advances only that participant row's session read marker. Refresh restores the fixture read state.

The Messages directory is derived only from existing personal-conversation summaries, ordered by latest activity. Opening a member who has no personal conversation shows an empty thread but does not add the person to Messages. The person appears there only after the current student sends the first message. The current student remains visible in eligible programme/module rosters with `Student` and `You` tags, but the card is disabled and the API rejects self-directed messages. Lecturers appear first, followed by students; each group is alphabetical and every member carries a `Lecturer` or `Student` tag.

## Navigation

Navigation and Community overlays accept a deliberate left swipe beginning outside links, buttons, fields and other interactive controls. Their shared pointer handler uses `touch-action: pan-y pinch-zoom`, so native horizontal touch events reach dismissal while vertical scrolling and pinch zoom remain available. Pointer cancellation discards the gesture. Regression coverage dispatches native Chromium touch input, rather than only synthetic pointer events.

The shell has three responsive modes. Below 768px, the navigation opens as a full-viewport-width, full-height drawer with flush square outer edges; its content and footer span the same width, and it slides in and out from the left without panel fading before closing after a destination is selected. Its header trigger is a burger icon, while the Community overlay trigger uses a chat bubble. From 768px through 1199px, navigation is a persistent 3rem icon rail: every icon has an accessible name and labelled tooltip, while Academic, Profile, and Services open keyboard-accessible child flyouts. From 1200px, the full labelled navigation returns. The active destination remains visible in every mode and all required pointer targets reach the shared coarse-pointer minimum.

Community is docked and resizable only from 1200px. Phone and tablet open it as a full-screen overlay that slides from the left with the same slide-only 300ms ease-out motion as the navigation drawer, with a reachable close control and focus return to the Community toggle. The overlay header is the single visible **Community** title and owns a permanently rendered Back chevron: it is muted and disabled at the Community root, then enabled for every nested layer. The duplicate root heading and the desktop in-content Back control are hidden only while the content is hosted in the overlay. One mounted `CommunityColumn` moves between dock and overlay, preserving the active layer, conversation, draft text, selected attachments, pending send state, and per-conversation scroll position during viewport changes. Opening Community closes the phone navigation drawer so the two modal layers cannot compete.

Policies is a standalone top-level destination immediately after Announcements. Selecting it opens `/policies`, marks the Policies row active, and shows **University Policies** in the shared page breadcrumb. Category filters are URL-backed within the route; policy-card activation deliberately leaves the location unchanged during the catalogue-only CAP-55 release. See [University Policies](university-policies.md).

The right column has one `Community` root headed by the shared 18px section style. There is no Community/Chat tab switch. Selecting a programme, module, person, or service replaces the root with that focused chat layer; Back returns through the layer stack.

Message-directory cards use the shared neutral hover surface, while their truncated person-name labels retain the normal body colour on hover.

Selecting the university logo in the navigation sidebar returns the portal to Dashboard.

Immigration availability follows the selected student's campus-relative Student Fee Category. International students retain the main navigation item, Community service, and implemented `/immigration` CAP-50 progress hub. Local students receive none of those entry points; a direct or stale `/immigration` location is replaced with Dashboard, including after a scenario change. The shell hides the item while eligibility is unresolved and fails closed if the Profile query cannot establish access. This frontend visibility rule is not an authorization boundary; a future backend must enforce the same student eligibility. The Immigration page itself rechecks selected-student, enrolment and campus configuration through `PortalApi.getImmigration()`.

The Navigation and Community columns are separated by a full-height shared left border on Community. Navigation keeps its scrolling items above an edge-to-edge shared-divider footer containing a bottom-aligned `Log out` control. Active chat composition uses a matching edge-to-edge shared-divider footer, so its 36px control row aligns with Log out at the bottom of the adjoining column. Main navigation rows, accordion triggers, and that Log out control share an explicit non-shrinking 36px height; when expanded navigation exceeds the available space, the Navigation list scrolls instead. Nested Profile links retain their compact child-row treatment. Log out is the sole visible frontend-only logout placeholder; no authentication session is changed until real logout enters scope.

Services children come from the selected enrolment campus rather than a fixed sidebar list. Cyberjaya currently orders Transportation, Dining, Wellness, Accessibility Support, Connectivity, Shopping and Recreation. Accessibility Support is an information placeholder only; it does not create a Community contact or a request route. Another campus with no configured page receives no Cyberjaya fallback. Accommodation has no navigation or Community entry; the retired `/accommodation` path replaces to Dashboard.

Every portal URL change resets the main content scroller to the top, including sidebar and breadcrumb navigation, nested detail links, query-driven tabs and semester changes, and browser Back/Forward. Community or chat interactions that do not change the URL keep their local scroll state.

The portal shell is fixed to the viewport. The document itself never becomes a second scroll container: page content scrolls only in the main portal area, while the independently scrollable navigation/community sidebar remains available for its own longer content. In an active phone or tablet conversation, the identity card participates in the conversation scroller and moves away with the messages while the overlay Back control remains in the Community header and the composer stays fixed at the bottom. On desktop, the labelled Back/identity header stays sticky at the top of the docked conversation. Conversation message lists keep a 12px bottom inset above the composer divider so the final message remains visually separated from the footer.

The main header starts with the shared page breadcrumb, reflecting the active route and its navigation hierarchy rather than a programme-and-year summary. On phone, the breadcrumb occupies the header-row space between the Community control and the account/profile controls; nested trails show only the current page label there, while tablet and desktop retain the complete trail. The active account issue is a circular icon action beside the profile avatar and retains the same Profile > Personal destination.

Profile expands to Personal, Academic, Resume, Portfolio, Documents, and Privacy & Security. Documents is the fifth Profile tab and sidebar child at `/profile/documents`; the former top-level Documents entry is removed and `/documents` redirects with history replacement. Privacy & Security follows it at `/profile/privacy-security`. Its IT Helpdesk action expands Community and opens the existing service conversation while preserving the Profile route and focusing the composer. The visible submenu labels are separate from their internal route identities, so Profile > Academic remains distinct from the main Academic navigation group. Personal is implemented at `/profile/personal-info`, the read-only qualification record at `/profile/academic`, the session-editable Resume builder at `/profile/resume`, and the session-editable Portfolio at `/profile/portfolio` with nested new, detail, and edit routes. Every nested Portfolio route keeps Profile and Portfolio active; selecting the Portfolio tab or sidebar item returns to the project grid. Profile shell behaviour is documented in [Personal Profile](personal-profile.md), with feature details in [Profile Documents](profile-documents.md), [Privacy & Security](privacy-security.md), [Profile Resume Builder](resume-profile.md), and [Profile Portfolio](portfolio-profile.md).

Finance is implemented at `/finance`, with a common signed-balance summary and How to Pay popup inside the query-driven Invoices and Payment History panel plus nested `/finance/invoices/:invoiceId` details. Every Finance URL keeps the Finance sidebar item active. Invoice Details retains the Finance tabs with Invoices active and uses `Invoices > Invoice Details` as its inner breadcrumb; selecting the active Invoices tab or breadcrumb returns to the list. Selecting Finance in the sidebar returns to the default Invoices overview, while invoice rows and browser Back/Forward retain normal routed behaviour and main-scroll reset. The aggregate Profile Outstanding Fees issue also routes to Finance. Full behaviour is documented in [Student Finance](finance.md).

The docked community panel and full desktop navigation use a 200ms ease-out width transition; reduced-motion mode removes that duration. Hiding or restoring either layer does not rerender the dashboard feature body. Pointer resizing previews the clamped community width at most once per animation frame through layout custom properties and commits React state once when the pointer ends or is cancelled. Arrow-key resizing continues to use 16px steps. Community width is clamped so the desktop main area retains at least 480px; the overlay modes use the viewport instead of that stored width. The community and navigation content remain mounted across visibility changes so their current tab, chat layer, scroll, and collapsible state are retained.

The layer stack (`ChatLayer`) behaves as follows:

1. Selecting a programme or module creates a group layer.
2. Selecting a group header's avatar stack pushes a members layer.
3. Selecting a person in Messages or members pushes a direct-message layer.
4. Selecting a service creates a service layer.

Back removes one layer. Removing the final layer returns to the Community root.

## Current mock-data notes

Services is an expandable navigation group populated by the selected enrolment campus's service catalogue. Cyberjaya currently lists Transportation, Dining, Wellness, Accessibility Support, Connectivity, Shopping and Recreation. Dynamic child URLs, tabs and breadcrumbs share the same labels/order. `/services`, `/services/accommodation`, the retired Services Finance URL and unknown service paths open Transportation with history replacement; unconfigured campuses display an empty root. Community Services no longer includes Accommodation. Full route, retry and campus behavior is in [Campus Services](campus-services.md).

Registration adds the newly eligible module groups to the existing chat store. It preserves sent messages, deleted messages, existing conversations, and read markers; both conversation lists and detail queries refresh after confirmation. A rejected message validates all attachment metadata before adding conversation, participant, or message records, so rejection leaves no empty conversation behind.

The composer awaits the send mutation, disables duplicate sending and attachment edits while that draft is pending, and clears text/files only on success. On failure it retains the draft and previews, shows an accessible retry message, and allows Send again. Completing an older send cannot clear another conversation's draft. Preview ownership transfers to the saved message on success and is released on deletion or session disposal.

The pending send belongs to the shared in-memory draft, so closing and reopening the composer restores the pending state and observes its completion without allowing a duplicate send. On coarse pointers the composer field has a 44px minimum height, matching the attachment/send targets, with balanced vertical padding and the requested 14px body font. It still grows for multiline drafts.

Sidebar expansion remains in React memory. Toggling it does not write cookies or other persistent browser storage.

These are temporary fixture choices, not the backend contract:

- Normalized `Conversation`, `ConversationParticipant`, `Message`, and `Attachment` fixture records are joined to the selected scenario's community graph by stable IDs. Components never import those fixtures.
- Upcoming Meetups uses the same 12-hour `en-MY` campus clock as the Calendar agenda, including the unspaced en-dash range.
- Group headers take their avatars directly from the eligible roster and show at most six before the contained `+N` count badge. Counts above 99 display as `99+` to preserve the circular badge while its accessible label retains the exact total.
- The reference programme contains 11 active students across Years 1-3 and five assigned lecturers. Current core-module rosters are smaller; DMP201 additionally includes Thomas Hassan through an active second-attempt repeat registration.
- Service visuals are selected from semantic service codes. They are presentation concerns and are not stored as icon components in the contract. The `helpdesk` code maps to the shared headset identity and reuses the semantic blue service accent.
- Local attachment previews use blob URLs. Deleting the message revokes those URLs; refreshing the page discards all session messages.
- Rizal's Community Messages initially shows six existing personal conversations. Alya's directory is empty until she sends a first direct message.

## Attachment policy

- Any file type can be selected.
- A message can contain at most 5 files.
- Each file can be at most 25 MB.
- All attachments in one message can total at most 75 MB.
- Only safe raster image types are previewed inline. Other files, including SVG and HTML, use the generic file presentation.
- The chat composer uses a compact raised-surface menu-style attachment control beside the bordered message field; this changes only its visible affordance, not the selection policy or session-only attachment lifecycle.

## Main implementation files

- `src/services/portal-api.ts` defines the list/detail API boundary, read markers, validation, and session-only mutations.
- `src/services/portal-queries.ts` gives conversation summaries and the active detail separate targeted caches.
- `src/contracts/portal.ts` owns normalized entities and attachment limits.
- `src/mocks/chat-fixtures.ts` creates normalized scenario-aware chat records.
- `src/components/portal-sidebar/chat-feed.tsx` renders only the active detail and coordinates sends, deletes, read state, drafts, and scroll restoration.
- `src/components/portal-sidebar/chat-header.tsx` renders conversation identities.
- `src/features/chat/chat-context.ts` owns conversation key and caption helpers.
- `src/components/portal-sidebar/portal-sidebar.tsx` coordinates navigation, Community, chat layers, and resizing.
- `src/app/main-content.tsx` isolates the dashboard feature body from sidebar-only state changes.

## Loading and performance

- Community loads the small conversation-summary list needed for unread badges and the Messages directory. Message bodies and attachment metadata load only for the active conversation.
- The deferred chat UI chunk is warmed during browser idle time and on pointer/focus intent; conversation details are prefetched on intent when a summary already exists.
- Chat message lists and participant lookup data use stable memoized derivations. The image lightbox remains a separate lazy chunk and mounts only when opened.
- The production bundle gate keeps Chat deferred and limits its entry chunk to 20 KiB gzip while retaining the existing eager and feature budgets.

Profile, Academic, and Finance tab gestures dispatch one route selection even when mouse-down and focus precede the controlled route update. Selecting the active tab retains its parent-list reset behaviour. Main-scroll reset also observes router location keys, so reselecting the current sidebar destination returns to the top.

## Announcements navigation

Announcements appears immediately after Dashboard. Both `/announcements` and its nested article routes select that same sidebar destination and outer breadcrumb. The inner article breadcrumb returns to the announcement list. Standalone destinations expose their active state using `aria-current=page`, as submenu destinations already do. Dashboard announcement cards link to the same article IDs; View all opens the table. Carousel links retain keyboard activation and scrolling without accidental drag navigation. No read markers, unread badge, or notification delivery is added. See [Announcements](announcements.md).

## Graduation and completed-student navigation

Academic > Graduation is the CAP-15 progress hub. Graduation remains the active Academic tab/sidebar item through its document anchor; a scrollable Academic tab bar reveals the active tab at narrow desktop content widths. Study Plan opens the hub at `#documents`. Online Forms and Finance remain the owning destinations for applications/messages and invoice/payment instructions.

The development scenario picker includes Nadia Pratama (Graduation ready) and Mei Lin (New Student Pass) without changing the default Alya scenario or Rizal records. Nadia has no current semester: Community has no current module list and no invented current-period badge. Its safe programme roster can include the selected completed student. Mei is an already enrolled Cyberjaya international student without a current Student Pass, allowing CAP-50's new-application path to be exercised. Selecting a scenario changes the student view and clears scoped query caches while retaining shared Graduation, Immigration and Finance workflow records in the current mock session. In development, **Admin Actions** and Log out are adjacent controls in one padded sidebar footer group, separated only by the standard button gap and without a divider. Admin Actions opens the all-student review workspace through client-side routing. This preserves submissions and proofs in the current mock session; direct address-bar navigation or refresh resets it.

## Immigration navigation

The CAP-50 route follows the same URL-backed segmented progression pattern as Graduation, with no Complete tab. New applications expose five numbered steps, renewals four, and cancellations three. A missing or invalid query value renders the current recommended step; selecting an available case step writes `?step=` and remains compatible with browser Back/Forward and main-scroll reset. Legacy `step=complete` resolves to Step 5 before the active case is applied; if that case has fewer steps, the page falls back to its recommended step. A completed case returns Applications to its empty state. Finance invoice and Online Form detail links retain their owning main-navigation state when followed, and **Open Student Immigration** returns from development Admin Actions after switching to the selected case owner in the same mock session. Full workflow behaviour is documented in [Immigration](immigration.md).
