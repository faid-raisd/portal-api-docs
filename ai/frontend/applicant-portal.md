# Applicant portal — agent knowledge

**Repository:** [`raisd-campus/applicant-portal`](https://github.com/raisd-campus/applicant-portal)  
**SDD:** [SDD-04](../../sdd/04-applicant-portal.md)  
**Campus agents:** [../AGENTS.md](../AGENTS.md)

## Status

A frontend-only UI preview is implemented with shared package 0.6.1; application and message state remain session-only. This portal is the **Admissions launch** surface (milestone 2): account, application, evidence, declarations, track status, offer, accept enrolment. Registry remains the decision owner.

## Agent rules

1. Implement against SDD-04 and the campus [AGENTS.md](../AGENTS.md). Do not invent a second admissions architecture.
2. Talk only to the Portal API. No direct CMS or database access.
3. Pin a released `@raisd-campus/design-system` version when application UI begins. Compose the shared `system/portal-shell` family with applicant-owned routes, navigation, account details and actions. Follow [component ownership and setup](../design/component-library.md); do not copy student portal components or shells.
4. Cap scope to Cyberjaya admissions journeys first.
5. When UI or API contracts appear, add feature docs under `docs/ai/frontend/applicant-portal/` and register them in [../MANIFEST.yaml](../MANIFEST.yaml).

## Submitted application UI preview — 1 October 2026

The working Applicant UI pins shared package 0.6.1. This is frontend-only preview behavior, not saved admissions records or Portal API integration. All application snapshots, original `File` objects, conversations, prepared message attachments, read/response watermarks and unsent drafts stay in React memory across navigation; refresh resets them. Existing draft and checklist flows remain independent.

- `/applications/:applicationId` shows **My Applications → Application Details**. Draft cards still open `/edit`; submitted cards open the detail route. Unavailable IDs show an unavailable state and a return action; submitted records cannot reopen the editor.
- The shared `PagePanelLayout` groups the review summary and five step accordions with its standard inset, matching Student's enclosing panel. Application Messages remains below the panel. The shared `SummaryCard` keeps its orange `warning` surface during review, including when a reviewer reply is required; **Action Required** is conveyed by its title and orange status badge; the list card uses the same warning tone. It contains reference, review stage/status, programme and dates, plus a shared document-check `DataTable`. The table sits in `SummaryCard.footerContent`, retaining the divider above it, and contains only **Payment Proof** and **Document Check**, with a **Department** column: Finance for payment proof and Registry for document checks. These are frontend preview labels; integration must confirm actual reviewer routing. The active review stage is **Under review**; the other row is **Pending review**. Payment proof shows its filename or **Not provided**; Document Check shows **Awaiting review**. Individual submitted files remain in the read-only step accordions. Phone uses the table's documented compact-card presentation.
- Review starts at **Payment Proof Under Review**. **Documents Under Review** is represented as a second stage but no preview action advances it. A **Submitted Application** heading introduces the five step accordions. The default shared accordion primitives compose the existing raised, padded header pattern for Study Preferences, Personal Details, Academic Qualifications, Documents and Application Fee. All begin collapsed; multiple may open. Shared read-only `DetailField` rows preserve conditional sections and repeat records. Accordion titles use white 14px body text. File rows use `readOnly` with read-only `FileUploadField` tiles in the same value column as other fields; no replace/remove/edit actions are supplied. The submitted Application Fee accordion contains only Transfer Proof (Bank Reference Number and Payment Proof); bank transfer instructions remain in the editable application step. The editable fee summary always uses the orange warning variant, including before Student Type is selected.
- **Application Messages** reuses shared message rows, date dividers and the controlled composer. The Applicant adapter accepts text, attachments or both, with Student's five-file, 25 MiB per-file and 75 MiB total limits and error wording. Raster previews use JPEG/PNG/GIF/WebP; other files show metadata. Removed draft previews are released, and sent previews remain owned by the session.
- Each submission creates exactly one clearly labelled sample reviewer message asking for the payment reference. An unanswered reviewer message gives **Action Required** priority over the review stage on both summary and list card. Actually visible reviewer rows advance the unread watermark; reading keeps the response requirement. Sending an applicant reply satisfies it and restores the current review-stage label without approving a document or advancing review. There are no reviewer controls or automatic replies.
- The shared unread `IssueCard` banner sits below the Application Details heading and focuses and scrolls to Application Messages. My Applications has no unread banner; each card still shows Action Required when a reviewer response is needed. Drafts and attachments remain isolated per application.

- The completed Documents Checklist footer uses the existing shared `PageActionBar`: secondary **Edit Answers**, followed by primary **Create Application** linking to `/applications/new`. Starting an application retains the checklist's session answers and prepared checkboxes.

Verification uses TypeScript/build and manual UI review during this stage; no Applicant automated tests or persistent storage are introduced. Live reviewer identity, authorization, notifications, file delivery and admissions decisions remain integration responsibilities.

## Related CAP focus

Admissions and identity capabilities in [SDD-11](../../sdd/11-capability-catalog.md) (see Applicant rows). CAP-53 is on the critical path for Live.
