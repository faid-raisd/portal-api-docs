# Malaysian Student Pass and Immigration — CAP-50

CAP-50 is a session-only frontend demonstration for international students enrolled at the Cyberjaya campus. `/immigration` opens the URL-backed **Student Pass** overview; `/immigration?tab=applications` opens **Applications**, where a current case uses Graduation-style steps. A legacy URL containing only `step` still opens Applications. The feature reuses Online Forms for applications and case conversations, Finance for invoices and transfer proofs, and the existing development-only Admin Actions workspace for simulated review and progress.

Refresh creates a new mock session. No application, upload, payment, government decision, passport movement, or staff action reaches EMGS, Malaysian Immigration, Limkokwing systems, or persistent storage.

The overview, Applications, Online Form, Finance invoice, and Profile issue links all preserve the exact URL-backed `programmeEnrolmentId`. Inactive enrolments remain readable history but cannot borrow a pass, case, evidence, or reapplication eligibility from another programme. Direct actions continue to require the active eligible enrolment; inactive states identify the International Office as owner of the next step.

## Layout and navigation

- Immigration remains visible in the main navigation and Community services only when the selected student's citizenship differs from the owning campus country. Local students have no Immigration entry point, and direct or stale access returns them to Dashboard. The Student Pass overview uses the shared empty-state layout with warning styling when a required pass is missing, and a `SummaryCard` plus `DetailSectionCard` when a pass is valid, expiring, expired, or cancelled. Valid uses success, expiring uses warning, and expired or cancelled uses destructive presentation. Start, renewal, cancellation, and progress actions sit in the bottom `PageActionBar`; an office-gated terminal pass has guidance without a misleading Applications action.
- The route uses the same responsive page heading, content width, major-section rhythm, loading/error geometry, horizontally revealable tabs, stacked actions, and portal shell as the completed route pages.
- Applications without a current case use the same neutral `EmptyState` pattern as other student workflows. Its underlined **View Student Pass** link sits inside the state; it does not add a separate action bar.
- The progress area follows Graduation's URL-backed `SegmentedTabs` pattern and omits a completion tab. New applications use five numbered steps, renewals four, and cancellations three. Selecting a step writes `?step=1|2|3|4|5` as applicable; browser Back/Forward restores it. A legacy `step=complete` URL parses as Step 5 and falls back to the case's recommended step when that case has fewer steps.
- Every step starts with one `SummaryCard`. Its action slot owns a phase-specific status badge: a submitted case reads **Under review**, while storage-oriented labels such as **Submitted** are not exposed as the student's workflow status. Document checks occupy Step 1's flush-divided `footerContent`. A Case history footer lists only milestones owned by the selected numbered step; New Student Pass Step 3 therefore shows only **EMGS processing** and **eVAL approved**. Checked markers and connectors use the same solid success token as completed badges; the current marker uses the same solid warning token as its status badge. Each connector reaches the next marker. Unfinished connectors are dashed, unfinished markers are numbered, and labels use canonical **EMGS**/**eVAL** casing.
- Step actions are owned by the selected phase. Application review exposes only its Online Form. Once checks are accepted, the completed application summary keeps the checks and adds secondary **View Application Form** plus primary **Proceed to Step 2**. A new-pass or renewal invoice appears only on Step 2; cancellation owns its fee in Step 1. Outstanding fee steps expose only **View Immigration Invoice**. A settled fee changes that link to secondary and adds primary **Proceed to Step 3**. Generic **Go to Current Step** controls are not used, and future-step actions do not appear on earlier steps.
- A numbered step may contain consecutive presentation phases. Cancellation Step 1 moves from request/document review to fee pending before it becomes complete. New-pass and renewal Step 2 moves from fee pending to fee settled. Full settlement atomically advances those cases to **EMGS processing**, so Step 3 never exposes an intermediate not-started processing state. New-pass Step 4 is a status-and-navigation step: it opens the exact case-linked Online Form, which owns the instructions, draft, upload, confirmation, immutable submission, withdrawal, and review lifecycle. Immigration reflects that form as not started, draft, under review, or accepted through the same single-summary anatomy.
- Neutral styling represents a service that has not started or a gated step. Warning represents student or university work in progress. Rejected cases use destructive styling. Completed process steps use success styling.
- When collection completes, the case leaves the current Applications projection and that tab returns to the shared **No application in progress** empty state. The new or updated Student Pass remains visible on the Student Pass overview.

## Workflows

Only one active Immigration case may exist for the selected Programme Enrolment. A rejected case remains visible with its decision and form link. Completed cases and ended Student Passes remain in the session graph for audit and exact case ownership but are no longer presented as the current Applications case. One shared selector returns the single valid/expiring pass when present, otherwise the most recently cancelled or expired record.

### New Student Pass

1. **Application:** the student submits the New Student Pass Online Form and required embedded documents. The International Office can accept each check, request corrections, request information, or reject the application.
2. **Review and fee:** accepting every document issues the configured international-services invoice. Processing cannot advance until Finance records full settlement.
3. **EMGS and eVAL:** payment starts EMGS processing immediately. The university advances this stage through eVAL approval. Its Case history contains only those two stage-owned milestones.
4. **Medical screening:** after eVAL approval, the student follows International Office timing and panel-clinic instructions, then submits one PDF, JPEG, or PNG result of at most 25 MB. The file becomes immutable case metadata. The International Office reviews it before requesting the passport.
5. **Passport and endorsement:** after the medical result is accepted, the university requests and receives the passport, processes endorsement, records the updated Student Pass expiry, releases the passport for collection, and records collection. The SummaryCard footer shows exactly these six milestones as a connected Case history throughout Step 5. Collection creates the session Student Pass record and returns Applications to its empty state.

The **Before you start** card states that a New Student Pass applicant must be outside Malaysia when the application is submitted. The International Office confirms eligibility and advises about departure, a Check Out Memo, or other required steps during review; the frontend does not add a self-attested location field.

The enrolled student retains portal access throughout this flow. Academic Module Registration remains available for planning, but fee preview and final confirmation stay locked until the new case reaches **eVAL approved**. Arrival medical screening and physical Student Pass endorsement may remain incomplete when module confirmation becomes available. This is a Cyberjaya prototype policy pending campus operational confirmation.

### Student Pass renewal

1. **Application:** the student confirms the university-held passport copy and photograph or supplies a case-specific replacement. Academic standing and attendance are university-owned review checks.
2. **Review and fee:** accepted documents issue the renewal invoice; full payment gates further progress.
3. **EMGS processing:** payment starts EMGS processing immediately. The summary reports the processing state directly without repeating a one-row Case history, and becomes complete when the case can proceed to passport handover.
4. **Passport and endorsement:** the university requests and receives the passport, processes endorsement, records the new expiry, releases the passport for collection, and records collection. The same scoped six-milestone Case history appears in the SummaryCard footer. Collection updates the exact Student Pass record and returns Applications to its empty state.

An expired Student Pass is not presented as an ordinary renewal. The route tells the student to contact the International Office for the applicable resolution.

### Student Pass cancellation

1. **Request and fee:** a student-requested cancellation uses the Online Form and configured invoice. A graduation-triggered cancellation reuses the same CAP-50 case, starts after document acceptance, and waives the separate Immigration fee.
2. **Passport handover:** the route tells the student when to hand over the passport and then records receipt.
3. **Cancellation and collection:** the university records processing, cancellation completion, ready for collection, and passport collection in the full milestone timeline. The cancellation-complete milestone marks the exact Student Pass `cancelled`, records `cancelledAt`, preserves the original expiry, and drives the red Profile issue and Student Pass overview. Collection closes the case and returns Applications to its empty state.

Graduation Step 4 projects the linked graduation-triggered cancellation instead of maintaining a second passport state machine. The Graduation hub maps CAP-50 passport receipt, cancellation, ready-for-collection, and completion states into its Student pass summary.

After a completed student-requested cancellation, an international student with the same active eligible Cyberjaya enrolment and no other active Immigration case receives **Start New Student Pass Application**. This reuses the ordinary five-step new application and creates a new immutable form, evidence snapshot, case, Finance invoice, and eventually a case-owned Student Pass ID and number. The cancelled pass remains linked to the cancellation case. A graduation-triggered or university-directed cancellation, inactive enrolment, naturally expired pass, or statutory revocation does not expose direct reapplication; the overview directs the student to the International Office.

## Online Forms

CAP-50 owns three campus application templates in the shared Online Forms catalogue and one case-linked medical-result form that is hidden from the general catalogue:

| Template | Student-owned fields | University-owned checks |
| --- | --- | --- |
| New Student Pass Application | Reused passport copy, photograph, recorded passport expiry, offer letter, academic records, and English certificate; uploaded health declaration | The five reused evidence groups plus the submitted health declaration |
| Student Pass Renewal | Reused passport copy and photograph, or case-specific replacements | Passport copy, passport photograph, academic standing, attendance record |
| Student Pass Cancellation | Cancellation reason, expected departure date, and reused passport copy or replacement | Passport copy |
| Medical Screening Result | One PDF, JPEG, or PNG medical result after eVAL approval | Exact active new-pass case and staff review before passport handover |

The existing Online Forms rules remain authoritative. Context responses expose student-owned admission evidence by form field. Starting an application draft snapshots those references; required upload validation accepts an owned snapshot or a case-specific upload, and an uploaded replacement takes precedence when creating the Immigration document check. Replacements do not modify Profile Documents. A reapplication uses the same evidence rules: available records remain read-only on-file evidence and any missing record uses the ordinary case-specific upload. The medical-result form becomes eligible only for the exact active new-pass case after eVAL approval, snapshots that case ID on draft creation, and accepts one non-empty PDF, JPEG, or PNG under the shared 25 MiB limit. Its withdrawal returns the same case to eVAL-approved Step 4; staff acceptance completes the form and opens Step 5. Drafts and files are session-only, submission is immutable, and corrections or additional evidence use the case conversation. Withdrawing an application form closes its linked active Immigration case without editing the original submission. Eligibility is rechecked at the API boundary against the selected student, exact Programme Enrolment, campus configuration, current pass, cancellation trigger, enrolment status, and other active cases.

## Finance

Document acceptance issues one invoice through the shared Finance ledger and global invoice-number sequence:

| Case | Base fee | 6% SST | Total |
| --- | ---: | ---: | ---: |
| New Student Pass | RM2,500 | RM150 | RM2,650 |
| Student Pass renewal | RM900 | RM54 | RM954 |
| Student Pass cancellation | RM50 | RM3 | RM53 |
| Graduation-triggered cancellation | Waived | None | No invoice |

These international-services charges use the existing Cyberjaya issuance-time Service Tax engine and immutable tax snapshot. The amounts and taxable treatment are prototype assumptions requiring campus Finance or Malaysian tax-adviser confirmation.

Students open the ordinary Finance invoice detail and use its existing bank-transfer proof controls. Its shared `PageActionBar` divider is flush with the standard panel inset. Proof submission never settles an invoice. Admin Actions surfaces an unpaid case invoice in its Immigration panel: a pending proof can be verified there, while the counter-payment shortcut selects and pre-fills the exact invoice in the shared Finance payment controls. A full verified or counter payment advances new and renewal cases to EMGS processing in the same transaction. Finance proof mutations invalidate both Finance and Immigration projections so the current step immediately reflects pending or settled payment state.

## Data and API boundary

The canonical graph adds:

- campus/programme-version `CampusImmigrationConfiguration` records with fee-item IDs, office identity, and passport collection location;
- enrolment-owned `ImmigrationCase` records for `new`, `renewal`, and `cancellation`;
- a cancellation trigger of `student-requested`, `graduation`, or `university-directed`;
- case-owned `ImmigrationDocumentCheck` and `ImmigrationCaseEvent` records;
- immutable metadata for the student-submitted medical result on a new application; and
- exact links to application and medical-result Online Form submissions, current or historical Student Visa / Pass, Finance invoice, student, Programme Enrolment, and campus.

The contracts require stable IDs, ISO timestamps, explicit nulls, monotonic case revisions, a completion timestamp only for completed cases, and an updated expiry only for non-cancellation cases. Student Pass status is `valid`, `expiring`, `expired`, or `cancelled`; only cancelled records carry `cancelledAt`, and an enrolment may have only one valid/expiring pass. New cases require medical-result metadata from the medical-review stage onward; renewal and cancellation cases reject it. Graduation cases are always fee-waived cancellations without a separate Online Form or invoice.

`PortalApi.getImmigration()` returns the selected student's detached, Zod-validated route read model. It includes applicability, campus details, current Student Pass, available application actions and reasons, the selected case with joined invoice/documents/events/medical result, the linked medical-form ID and status, a derived complete milestone projection, case-specific step definitions, and the recommended step. The ordinary Online Forms start/save/submit/withdraw boundary validates the current student, enrolment, campus, exact new-pass case, eVAL state, revision, session generation, MIME type, non-empty file, and size before snapshotting metadata and advancing or reopening medical review. Module Registration separately derives both irreversible confirmation access and the longer-lived Student Pass progress notice from these same canonical enrolment, pass, configuration and case relationships, so screens do not import Immigration fixtures or trust a cached UI state.

Mutations reject mismatched student, enrolment, pass, submission, invoice, case revision, or mock-session generation. Scenario switching clears selected-student query caches while retaining shared workflow records in the same session. Session disposal rejects late staff responses before UI success callbacks run.

## Development simulation

`/dev/admin-actions` remains outside `PortalApi`, loads only in development, and is excluded from production bundles. For any scenario student it can:

- accept a document or request its correction;
- accept the full document set and issue the case invoice;
- request information or reject a case with a reviewer reason;
- verify/reject Finance proofs or post counter payments;
- advance EMGS, eVAL, medical review, passport, endorsement, cancellation, ready-for-collection, and collection milestones; and
- record the updated Student Pass expiry before a new or renewed case completes.

The Admin Actions page has its own viewport-contained vertical scroller so every Immigration and Finance control remains reachable. **Open Student Immigration** switches to the owning scenario without resetting the shared mock session.

## Current scenarios

- **Mei Lin — New Student Pass:** an already enrolled international student with no Student Pass, used for the new-application path.
- **Rizal Hakim — Mid-programme:** an international student with a current Student Pass, eligible for renewal or student-requested cancellation.
- **Nadia Pratama — Graduation ready:** an international completed student whose Registry approval creates the fee-waived CAP-50 cancellation used by Graduation Step 4.
- **Alya Putri — Registration week:** a Malaysian citizen classified as Local, with no fabricated Student Pass and no Immigration route access.

Mei and Alya are the first-semester comparison: both can use the portal and prepare module selections, while only Mei's irreversible registration transaction is held for eVAL approval. Rizal and Nadia retain their existing mid-programme and graduation scenarios.

## Research and assumptions

The new-application evidence follows the [EMGS application guidelines](https://visa.educationmalaysia.gov.my/guidelines/), including passport, offer, health, academic, English-language, and photo evidence. The renewal review reflects EMGS guidance for a passport with sufficient remaining validity, academic results, attendance of at least 80%, and CGPA of at least 2.0. New international students are told to follow the Malaysian panel-clinic screening process described in the [EMGS medical-screening guidance](https://visa.educationmalaysia.gov.my/guidelines/medical-screening); renewal does not invent a repeat in-country medical step.

The overall Student Pass context is also checked against the [Malaysian Immigration Student Pass guidance](https://www.imi.gov.my/index.php/en/main-services/pass/student-pass/), the [Education Malaysia FAQ](https://educationmalaysia.gov.my/get-in-touch/faq), and the [EMGS refund policy](https://visa.educationmalaysia.gov.my/legal/refund-policy). These support treating a later application as a fresh application and fee lifecycle, subject to departure and Immigration conditions. External rules can change, and the portal copy is an operational prototype rather than legal or immigration advice.

This iteration covers Malaysia and Cyberjaya only. The `cancelled` state represents ordinary institution-managed cancellation or shortening; statutory Immigration revocation is not self-service. Dependants, progression, variation, Graduate Pass, Special Pass, overstay/expired-pass resolution, live EMGS/STARS integration, production uploads, government status synchronization, persistent case records, production staff authorization/audit, and physical-device certification remain outside scope.

## Main implementation files

- `src/contracts/immigration-records.ts`
- `src/contracts/immigration.ts`
- `src/mocks/immigration-fixtures.ts`
- `src/mocks/online-forms-fixtures.ts`
- `src/services/mock-immigration-api.ts`
- `src/services/immigration-queries.ts`
- `src/services/portal-api.ts`
- `src/components/features/immigration/immigration-page.tsx`
- `src/dev/admin-actions-model.ts`
- `src/dev/admin-actions-page.tsx`
- `src/tests/immigration.test.ts`
- `tests/e2e/immigration.spec.ts`

## Verification

Unit coverage exercises contracts, student/campus/enrolment ownership, availability and state gating, exact application and medical-form linkage, medical draft/submit/withdraw/review behavior, document review, immutable metadata, SST invoice issuance, fee waiver, cancellation reuse, case completion, pass updates, and stale-session rejection. Playwright coverage exercises new, renewal, cancellation, information-required, rejection, payment-pending, the Step 4 Online Forms handoff and draft/resume/submit/review states, passport collection, completion, timeline geometry and semantic tokens, Community dock/overlay behavior, local-student route rejection, responsive overflow, and automated accessibility checks. Existing end-to-end coverage remains at 1280/1440 while the responsive route matrix and focused phone workflows cover the narrower supported widths. Exact gate results and warnings are recorded in [handoff](handoff.md).

## Presentation statuses vs API statuses

Immigration Applications URL steps (`?step=1|2|3|4|5`) and unavailable-step **Not started** badges are frontend presentation only. Case, document-check, pass, and Online Form statuses remain the Zod contracts returned by `getImmigration` and the Online Forms methods.
