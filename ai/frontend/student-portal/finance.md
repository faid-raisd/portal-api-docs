# Student Finance

## Scope

Student Finance Phase 1 is a frontend-only responsive account view backed by the replaceable `PortalApi`. Students can review their account balance, issued invoices, confirmed or reversed payments, credits and adjustments, applied scholarships and incentives, academic renewal conditions, and fictional campus payment instructions. They can also submit, replace, or withdraw metadata for one pending bank-transfer proof on an outstanding invoice.

No online payment gateway, real bank transfer, live campus verification, persistent mutation, production file upload, invoice or receipt PDF, refund, payment plan, scholarship application or acceptance, staff award assignment, allowance payout tracking, Service Tax filing/remittance, collection workflow, or notification service is implemented. Changing the development student view retains shared proof and simulated payment/approval records in the current mock session; a refresh removes them.

Academic Module Registration and the development-only CAP-15 approval/payment simulation produce Finance records in this phase. Its first successful confirmation atomically issues one aggregated semester tuition invoice and one separate registration-fee invoice, applies eligible award credits, and then locks that Study Period's registration. This remains mock-session-only and is not an invoice-creation interface inside Finance.

Finance reads follow the exact URL-backed Programme Enrolment context and therefore expose only its Finance Account, invoices, allocations, adjustments, proofs, and assigned funding. Completed, deferred, and withdrawn enrolments remain readable history. A proof submit, replacement, or withdrawal carries the same `programmeEnrolmentId` and rejects an invoice owned by another programme context; active-only issuance workflows keep their existing ownership rules.

## Routes and navigation

- `/finance` and `/finance?tab=invoices` show the Finance overview with the Invoices tab selected.
- `/finance?tab=payments` shows Payment History, and `/finance?tab=awards` shows Scholarships & Incentives. Unknown tab values fall back to Invoices.
- `/finance/invoices/:invoiceId` shows one student-owned invoice inside the existing Finance panel with Invoices active. Encoded IDs are decoded safely; unknown or foreign IDs show `Invoice unavailable` with a route back to Invoices.
- Selecting Finance in the sidebar always returns to the default overview. Nested invoice routes keep Finance active and retain the Finance tabs; selecting the active Invoices tab returns to the invoice list. The inner breadcrumb begins `Invoices > Invoice Details` rather than repeating the outer Finance heading. URL changes, breadcrumbs, browser Back/Forward, and tab changes use the shared main-scroll reset.
- One active Profile `Outstanding Fees` issue card is derived whenever the selected student has a positive open-invoice balance and is an accessible action to Finance. An unallocated confirmed payment remains visible as credit awaiting Finance allocation and does not clear the issue. Accounts with no open invoices have no fee issue; other Profile issue routing is unchanged.

## Account overview

Every Finance state uses one feature-owned page shell with the shared `pageSectionTitleVariants()` heading and 16px top-level rhythm established by Profile and Academic. Overview, loading, read error, unavailable invoice, and invoice details therefore keep the same title and root geometry. The overview keeps that heading above one `TabbedPagePanel`.

The Invoices tab starts with the shared destructive `SummaryCard` when the account has a positive open-invoice balance; accounts with no open invoices use the default subtle surface. The primary value is Amount Outstanding from open invoices, or Account Credit when the ledger is in credit. When a confirmed payment is not fully allocated, the same card adds an `Unapplied Credit` summary item and explains that Finance must apply it before it reduces the outstanding invoice amount. A right-aligned secondary `How to Pay` button occupies the card's dedicated action column, vertically centred with the label/value column, and opens the shared `Popup` with the selected campus counter location and hours, fictional beneficiary and bank details, mandatory student/invoice reference format, currency, and expected 3–5 working-day posting delay. On the destructive summary, that action has a `surface-subtle` base for contrast while retaining its normal `surface-hover` hover treatment. Each counter and bank section uses its existing `DetailSectionCard` header action slot for the contextual icon, keeping the instruction body aligned beneath its header. Payment History and Scholarships & Incentives omit the balance summary.

The Invoices table puts the canonical short invoice number above the invoice title, then shows issue date, invoice total, remaining balance, proof-pending state, and semantic status `Badge`. The previous redundant category/semester description is not repeated in this dense table. The same `INV-000001`-style number is used without display-only transformation in the list, Invoice Details, payment allocations, adjustments, proofs, instructions, and accessibility labels. Monetary columns in every Finance table are left-aligned and use tabular figures. Rows support pointer, Enter, and Space navigation. Unpaid and partially-paid invoices sort before completed invoices; each group sorts by newest issue date and then invoice number. Alya's empty state reads `No invoices have been issued yet` while the balance summary remains visible.

Payment History presents pending and reviewed proof submissions separately from recorded payments so a proof cannot be mistaken for confirmed funds. Pending proofs, recorded payments, and credits/adjustments use the shared empty-state treatment when each respective list is empty. Invoice and proof records become labelled cards on phones, while recorded payments and credits/adjustments remain semantic financial tables in keyboard-focusable horizontal scroll regions. The transfer-proof view leads with Transfer Date and shows Invoice, Bank Reference, Amount, and Status; filenames remain available only in Invoice Details. Its explanatory proof statement uses muted label text so it remains supporting information. Confirmed and reversed payments remain visible newest first with method, reference, amount, status, and compact applied-invoice references. Confirmed payments with no allocation show `Awaiting allocation` plus an `Unapplied` badge; partially allocated payments show `Partially Applied`. Credits and adjustments have a separate subsection with Date, Description, Invoice, Amount, then Type columns. Reversed payments and pending proofs do not reduce balances.

Financial direction is repeated in visible amounts rather than whole-row colour: positive outstanding values, charges, balances, and debits use `destructive`; account credits, confirmed payments, allocations, and credits use `success`; zero, pending, void, and reversed amounts remain neutral. The Invoice Details activity ledger carries a visible minus sign on every confirmed payment allocation and credit that reduces the invoice. Labels and status Badges keep colour from becoming the only carrier of meaning.

## Scholarships and incentives

The third Finance tab begins with a minimal shared `SummaryCard`. `Active Awards` counts assignments whose staff-controlled lifecycle is `active`; `Credits Applied` totals every visible award-linked credit posted so far, including historical credits from completed incentives. It deliberately does not estimate future percentage savings before those invoices exist. Rizal therefore shows one active award and RM1,600 in applied credits, while Alya shows zero and RM0 before her empty state.

Every Funding Scheme assigned to the selected Programme Enrolment appears in one single-open, collapsible shared `Accordion`. Assignments retain their API order—active, upcoming, completed, suspended, then cancelled, followed by newest starting programme semester and stable award ID—and all begin collapsed. Each compact trigger shows the award title at the standard body weight plus the full lifecycle status Badge. Expanded content uses borderless read-only `DetailField` rows for the period, award identity, every benefit, one total applied-credit value, informational allowances, renewal conditions, current academic values, combined renewal status, and published-result evidence. Informational allowances appear as plain read-only values without a separate badge. No nested card or two-column benefit grid remains. Alya's shared empty state reads `No scholarships or incentives applied` beneath the zero-value summary.

Assigned benefits are one of three explicit types:

- percentage fee coverage for one invoice category;
- a fixed fee credit for one invoice category; or
- an informational allowance with amount, currency, and frequency.

Active fee benefits are represented by immediate invoice-linked credit adjustments in the canonical ledger. The credit is limited to the benefit value and remaining collectible invoice amount, cannot create account credit, and remains auditable through the exact Funding Benefit relationship. Multiple benefits use award time and stable award ID as their deterministic application order. Historical credits remain linked when an award is completed. Informational allowances never create adjustments or affect an invoice or account balance. The tab always explains that `Allowance payouts are managed outside this portal.` No payout schedule, bank details, transfer, reversal, or reconciliation is implied.

The student Finance response exposes each Funding Scheme's canonical `renewable` flag. Only renewable awards show their renewal evaluation details. Minimum CGPA and minimum semester GPA conditions use the latest published Term Result for the award's Programme Enrolment; unpublished current-semester work is ignored. A condition is `Met`, `Not Met`, or `Pending`, and the combined state is not met when any condition fails, pending when published evidence is unavailable, and met only when every condition passes. This evaluation is informational: it does not suspend or cancel an award, revoke credits, or change prior invoices.

## Invoice details

Invoice details remain inside the shared Finance `TabbedPagePanel` with Invoices active, matching Academic Module Details and Profile Portfolio Details. The tab content begins with the default subtle `SummaryCard` identity: the invoice number is its muted label, the title is its semantic heading value without local typography classes, and the large status Badge occupies the vertically centred action column. Its opt-in divided column row shows Category, Semester, Issue Date, and semantically destructive Charge Amount using the shared muted-label and medium body-value treatment. Columns are content-sized with 24px gaps and wrap only when the available width requires it.

One full-width `Invoice Activity` `DetailSectionCard` combines charge lines, positive Service Tax where charged, confirmed payment allocations, credits, and debits in an oldest-to-newest `DataTable`. Charge and SST rows use the invoice issue timestamp, payment rows use the payment timestamp, and adjustments use their applied timestamp; source type and stable record ID provide deterministic tie-breakers. Date, Type, Description, and left-aligned Amount columns remain fixed inside a labelled keyboard-scrollable region when the viewport is narrower than the ledger. A shared footer divider separates the rows from one net `Outstanding Balance` total. Charges, SST, and debits are red positive values, while payments and credits are green negative values. Zero-value exempt or not-applicable tax decisions remain in the response but do not add activity rows. A pending submission remains a separate Transfer Proof section.

The canonical ledger retains one tuition line per Module, but the student response aggregates all lines on the same semester tuition invoice into one `Semester N Tuition Fee` line. Module codes, names, quantities, and individual prices never reach this student-facing response. Miscellaneous invoices keep their general descriptions.

Invoice actions use a compact bottom-right block inside the shared `PageActionBar`; its divider flushes across the standard panel inset while the buttons remain aligned with the content. On phones, every available Invoice Details action stacks as a full-width button. From tablet upward, eligible equal-width `Submit Transfer Proof` and disabled secondary `Download Invoice` actions share one row. The Submit action includes the reusable inline tooltip icon; focusing or hovering the button explains that proof submission does not confirm payment or reduce the balance without introducing a nested control. Download keeps an accessible unavailable label without visible helper copy. For a pending proof, disabled `Download Invoice`, `Change Transfer Proof`, and `Withdraw Transfer Proof` share the same three-button action row from tablet upward and stack on phones; the Transfer Proof section retains only the saved values and muted supporting explanation. Paid and void states collapse the block to available actions. Loading, Finance read-error, and unavailable-ID states retain the same parent tabs, active Invoices state, breadcrumb hierarchy, and corresponding inner geometry.

## Bank-transfer proof

Outstanding invoice details expose `Submit transfer proof`. The shared `Popup` contains an editable amount, transfer date, trimmed bank reference, and Finance-owned file picker. Amount defaults to the current invoice balance and date defaults to the campus-local current date. Validation and API failures leave the draft visible, and the submit control shows saving and disabled states.

A submission requires:

- an amount greater than zero and no greater than the current invoice balance;
- a non-future `YYYY-MM-DD` transfer date;
- a non-empty trimmed bank reference; and
- one non-empty PDF, JPEG, or PNG file no larger than 10 MiB.

One pending proof is allowed per invoice. A saved proof stores only transfer fields, filename, MIME type, byte size, submitted timestamp, and `pending` status in the current mock session. It never creates a Payment or Payment Allocation and never changes the invoice or account balance. The details page labels it `Pending verification`, displays its saved values, and offers Change and confirmed Withdraw actions. Paid, void, foreign, and unavailable invoices reject proof mutations.

## Data and reconciliation

`FeePlan` belongs to one Programme Version and currency. Each `FeeItem` has an explicit amount, category, label, and nullable Module relationship. Tuition items require a Module; miscellaneous items must not reference one. The supported categories are `tuition`, `registration`, `books`, `resource`, `international-services`, `repeat-administration`, and `other`. Current module amounts are explicitly seeded from the former RM650-per-credit results and are not calculated from credits at runtime.

Each Finance Account belongs to one Programme Enrolment and currency. A campus-owned Finance Profile supplies same-currency payment instructions. An Invoice belongs to the account, has a category and display title, and may omit a Study Period for non-semester charges. Its canonical lifecycle is `issued` or `void`; the student display status is derived as `unpaid`, `partially-paid`, `paid`, or `void` from confirmed allocations and invoice adjustments. Canonical `dueAt` remains validated for future use but does not cross the student Finance boundary and does not affect status or sorting.

Every issued Invoice has one globally unique canonical number in the exact `INV-######` format. `INV-000000` is reserved and never issued. The current mock graph uses `INV-000001` through `INV-000018` for Rizal's historical ledger; a successful Alya registration reserves `INV-000019` for tuition and `INV-000020` for registration in one atomic confirmation. Preview-only tax-calculation records are internal placeholders and never enter the canonical graph or Finance response. The mock adapter increments the highest issued suffix deterministically and rejects malformed numbers, collisions, or sequence exhaustion without partial mutation. A production backend must own the permanent sequence and concurrent allocation.

Every canonical invoice has exactly one immutable Service Tax decision captured at issuance. `Invoice.totalMinor` is tax-inclusive and must equal the Invoice Line subtotal plus the snapshot tax amount. The student Finance response exposes the subtotal and structured `charged`, `exempt`, or `not-applicable` decision, including taxable base, basis-point rate, amount, and reason. The compact invoice list shows only the inclusive Invoice Total; positive SST appears separately only inside Invoice Activity.

Cyberjaya has an effective-dated Malaysian Service Tax Profile from 1 July 2025 with a 6% rate. Student eligibility uses citizenship country code, not the display nationality or campus-relative Local/International label. Malaysian citizens are exempt. For non-citizens, tuition, registration, resource, repeat-administration, and general international-services items are taxable; books are explicitly exempt. CAP-50 Student Pass Fee Items explicitly use this taxable international-services treatment in the prototype. Valid enrolment-owned full-sponsorship or diplomat-dependant evidence can exempt its scoped categories. Institutional award credits reduce the taxable base before the half-up sen calculation, and later payments or proof submissions never recalculate the snapshot.

The citizen exemption, non-citizen higher-education scope, 6% rate, and 1 July 2025 effective date follow the [RMCD Education FAQ](https://mysst.customs.gov.my/faq-expansion-of-service-tax-scope-2025/). The approved sponsor, diplomat-dependant, and award-netting rules remain prototype policy pending campus Finance or Malaysian tax-adviser confirmation. In particular, the same RMCD FAQ says company-sponsored tuition remains taxable and that an institution providing a full scholarship must account for Service Tax, so this frontend model must not be treated as production tax advice or filing logic.

Invoice balances use confirmed allocations and invoice-specific credits/debits. The response separately exposes the sum of open invoice balances, the signed account ledger balance, and the unallocated portion of confirmed payments. Amount Outstanding, the Profile fee issue, Study Plan eligibility, and Graduation Finance gating use open invoices, so confirmed money does not settle an invoice until Finance records its allocation. Account balance continues to use all non-void invoice totals, all confirmed payments, and all account/invoice adjustments, including fee-benefit credits. Reversed payments, pending proofs, and informational allowances are visible where relevant but do not reduce a balance. Graph validation enforces fee ownership, invoice totals, line ownership, allocation limits, adjustment ownership, award/student/period ownership, benefit unions, fee-credit eligibility and limits, currency agreement, and student/campus relationships.

## Portal API contract

Stage 1 HTTP is the PortalApi RPC surface (`POST /v1/portal/{method}`), not REST resource paths.

- `PortalApi.getFinanceStatement` → `POST /v1/portal/getFinanceStatement` returns the scenario-scoped `FinanceStatementResponse`.
- `PortalApi.submitFinancePaymentProof` → `POST /v1/portal/submitFinancePaymentProof` creates or replaces the selected invoice's pending proof and returns the updated statement.
- `PortalApi.deleteFinancePaymentProof` → `POST /v1/portal/deleteFinancePaymentProof` withdraws the pending proof and returns the updated statement.

Proof verification and counter-payment remain staff/Admin Actions until a Live staff PortalApi exists. Successful proof mutations replace the scenario-scoped Finance query cache directly. Components consume only query results and do not import canonical fixtures.

## Current fixtures

Rizal's reconciled ledger contains separate invoices:

- Semester 1: RM13,000 tuition plus separate RM400 registration, RM700 resource, and RM400 international-services invoices; the completed `Early Confirmation Incentive` supplies the historical RM300 tuition credit and RM14,200 confirmed payment clears the period.
- Semester 2: RM14,500 in pre-tax charges plus RM870 SST, fully paid through two confirmed payments totalling RM15,370.
- Semester 3: RM17,400 in pre-tax charges plus RM1,044 SST, fully paid by RM18,444 in confirmed funds.
- Semester 4: RM13,000 tuition plus RM400 registration, RM700 resource, RM400 international-services, and RM250 books, for RM14,750 in pre-tax charges. The active `Creative Excellence Scholarship` posts a RM1,300 tuition credit before tax. SST is RM702 on the remaining RM11,700 tuition base plus RM90 across registration, resource, and international-services; books are exempt. RM12,390 confirmed payments leave only the tuition invoice open at RM1,852.
- One reversed payment remains visible without changing the balance. Semesters 5–6 are planned and have no invoices.

The renewable Creative Excellence Scholarship covers Semesters 4–6, requires a minimum 3.00 CGPA, and evaluates as Met against Rizal's latest published 3.33 CGPA. Its RM480-per-semester study allowance is information only and has no ledger effect. Together with the completed, non-renewable Early Confirmation Incentive, Rizal has RM1,600 in award-linked credits applied so far.

Alya is a Malaysian citizen classified as Local. She starts each registration-week mock session with an active MYR Finance Account, zero balance, and empty invoices, payments, adjustments, proofs, and award assignments. Confirming the standard three-module registration immediately issues `INV-000019` for RM7,800 tuition and `INV-000020` for RM400 registration with Malaysian-citizen exemption snapshots, so the amount due remains RM8,200; refresh restores the zero-invoice fixture. The campus counter, bank, supplier-registration, and tax-reference values are prototype fixtures.

Finance transfer-proof validation derives today's date from the current submission instant in the campus timezone, including sessions spanning midnight. `submittedAt` records that same instant. Invoice issuance uses the current confirmation instant; resolving the effective SST profile and exemption dates first normalizes it to the owning campus date, so equivalent UTC and offset timestamps produce the same immutable decision. Later proof changes still do not recalculate tax.

## Main implementation files

- `src/contracts/finance.ts`
- `src/contracts/portal-records.ts`
- `src/mocks/portal-record-fixtures.ts`
- `src/features/finance/service-tax-model.ts`
- `src/services/portal-record-projections.ts`
- `src/services/mock-academic-module-registration-api.ts`
- `src/services/portal-api.ts`
- `src/services/portal-queries.ts`
- `src/features/finance/finance-model.ts`
- `src/features/finance/funding-award-model.ts`
- `src/features/finance/service-tax-model.ts`
- `src/components/features/finance/finance-page.tsx`
- `src/components/features/finance/finance-proof-picker.tsx`
- `src/app/routes.ts`
- `src/app/main-content.tsx`

## CAP-15 and development-only payment review

[Academic Graduation](academic-graduation.md) issues one RM500 base fee atomically with Registry approval, using the existing global invoice sequence and issuance-time SST snapshot. The sample taxable-education classification is an assumption; Nadia owes RM530 with the existing 6% tax profile. Invoice due dates remain internal, and attendance does not affect the fee.

`/dev/admin-actions` can verify/reject pending proofs and record partial/full counter payments for any scenario student's open invoice. Proof cards and invoice choices identify their owning student. These commands are absent from `PortalApi` and their implementation is excluded from production builds. Verification posts one confirmed Payment and exact Allocation; submission alone never settles debt. Payment dates use the owning campus timezone. Mismatched student/invoice ownership, duplicate references, overpayment, future dates and stale/consumed proofs are rejected. Reviewed proof status, timestamp, reason and linked payment are retained in the student Finance history; replacing or withdrawing a pending proof cannot erase reviewed outcomes. Counter payments invalidate an oversized pending proof with a retained reason. Graduation and related account-issue queries refresh against the same session graph. No live bank reconciliation, payment gateway, persistent ledger or staff portal is introduced.

## CAP-50 Immigration fees

[Immigration](immigration.md) issues one international-services invoice only after the International Office accepts every required document check. The configured prototype amounts are RM2,500 plus RM150 SST for a new Student Pass, RM900 plus RM54 SST for renewal, and RM50 plus RM3 SST for student-requested cancellation. An eligible application after cancellation is a fresh New Student Pass case and therefore receives its own distinct RM2,650 invoice and immutable SST snapshot; it never reopens or reuses the cancellation invoice. A graduation-triggered cancellation is explicitly fee-waived and creates no CAP-50 invoice. These amounts and their taxable classification require campus Finance or Malaysian tax-adviser confirmation before backend implementation.

The invoice uses the existing global `INV-######` sequence, Finance Account ownership, Invoice Line, immutable issuance-time Service Tax snapshot, invoice detail route, payment instructions, proof mutation and counter-payment controls. CAP-50 does not duplicate payment controls on `/immigration`. A pending proof remains visible there as awaiting Finance validation but does not unlock Immigration progress; only a fully paid invoice does. Successful proof changes invalidate both Finance and Immigration query caches. Development review verifies the exact proof/invoice/student relationship and all existing amount, date, reference and stale-session rules.
