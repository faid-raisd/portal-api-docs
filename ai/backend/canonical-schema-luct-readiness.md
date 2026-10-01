# Canonical record schema — LUCT readiness and proposed changes

**Status:** Partially implemented (1 October 2026). §4 contract, fixtures, projections, portal-api store (schema version, audit, reporting views), Finance UI corrections and published ERD are in place. Deferred items are listed in §7.  
**Scope:** the canonical `PortalRecordGraph` model behind the Portal API Demo and the published ERD. Under [ADR-1](../architecture/overview.md) the existing CMS remains system of record; these changes shape the canonical model the Portal API translates into ([CAP-53](../../sdd/11-capability-catalog.md#cap-53)) and the longer-term [M5](../../sdd/03-delivery-milestones.md#m5) unified CMS. They do not authorise duplicating CMS operations at launch.  
**Origin:** schema review of the 76-table ERD against problems met in LUCT reporting work (semester status filtering, EMGS active-student reconciliation, 127 vs 131 credit totals, SST reporting, passport mismatches).
**Contract version:** `PORTAL_RECORD_SCHEMA_VERSION = 2` in `student-portal/src/contracts/portal-records.ts`.

---

## 1. What the schema actually is

| Layer | Location | Notes |
|---|---|---|
| Canonical contract | `student-portal/src/contracts/portal-records.ts` plus `graduation-records.ts`, `immigration-records.ts`, `online-forms.ts`, `lecturer-review.ts`, … | Zod record schemas. Referential integrity and business invariants live in the graph-wide `superRefine` on `portalRecordGraphSchema`. |
| Postgres projection | `portal-api/src/record-store.ts` | One table per collection: `id`, `position`, `record jsonb` (source of truth), `updated_at`, plus read-only generated columns for browsing. **No FK constraints.** |
| ERD | `db-admin/api/erd.ts` | Introspects Postgres. Declared FKs are drawn as-is; every other edge is **inferred from `<entity>_id` column names**. |

Consequences for anyone reading the ERD:

- Only top-level contract fields become columns. Nested references (for example `graduation_records.studentPass.visaPassId`) exist in the contract but appear only as a `jsonb` column.
- Until 1 October 2026 the generated columns came from the keys present in seed rows, so collections with no seed rows (`graduation_records`, `immigration_cases`, `immigration_case_events`, `immigration_document_checks`, `assignment_submissions`, `lecturer_reviews`, `education_service_tax_exemptions`) showed as disconnected. Columns are now derived from the contract, so these tables show their references. They were always linked in the contract.
- Absence of a column in the ERD is not evidence of absence in the contract. Check the Zod schema.

---

## 2. Strengths to keep

- **Programme enrolment as the academic root.** `programme_enrolments → student_profiles, programme_versions, campuses`. Status, campus, programme version and dates belong to the enrolment, not the student. At most one `active` enrolment per student.
- **Programme versions.** `programmes → programme_versions → curriculum_modules`. Enrolment holds a required `programmeVersionId`, so curriculum edits cannot rewrite an existing student's requirements.
- **Study period between enrolment and registration.** `programme_enrolments → study_periods → module_registrations`, unique by enrolment/term and enrolment/programme-semester.
- **Module registration state.** `status` (`registered | completed | withdrawn | pending-confirmation`), `registrationType` (`normal | repeat | exemption`) and `attemptNumber`.
- **Credit fields on results.** `module_results` carries `creditsAttempted`, `creditsEarned`, `includedInCgpa`; `term_results` carries GPA, CGPA and cumulative GPA credits, earned credits and points.
- **Invoice-based finance.** `finance_accounts → invoices → invoice_lines`, `payments → payment_allocations → invoices`, instead of a single statement ledger like `b_statement`.
- **SST snapshot.** `invoice_service_taxes` stores the issuance-time tax profile, rate, taxable base, outcome and exemption reason, and validation recomputes them. Historical tax is never recalculated from today's configuration.
- **Immigration history.** `immigration_case_events` must be ordered and end at the case's current status. This is the pattern §4.2 generalises.

---

## 3. Readiness against the LUCT acceptance criteria

| # | Criterion | Status | Evidence / gap |
|---|---|---|---|
| 1 | Programme enrolment lifecycle explicit | Partial | `active \| completed \| withdrawn \| deferred` with status events. Suspended / terminated / transferred-out still deferred. |
| 2 | Study-period lifecycle matches LUCT semantics | Met (demo) | Timeline `status` + Registry `academicStatus`; valid set equals EMGS filter. Campus meaning confirmation still open (§6). |
| 3 | Status history / effective dating | Met | Enrolment, study-period and module-registration status events. |
| 4 | Latest valid semester derived from valid periods | Met | `latestValidStudyPeriod` + SQL view. |
| 5 | Module registration has explicit state/type | Met | See §2. |
| 6 | Credit transfer / exemption / substitution modelled | Met | Transfers, substitutions, equivalencies; Nina fixture has a credit-transfer period. |
| 7 | Attempted / earned / GPA credits distinguishable | Met (derivation) | Term totals must equal derived values; outcome still only `pass \| fail`. |
| 8 | Programme version bound to enrolment | Met | Required `programmeVersionId`. |
| 9 | External identifiers with history | Met | `studentIdentifiers` + visa `passportIdentifierId`. |
| 10 | Graduation / immigration / assignment tables linked | Met (logical) | References exist in the contract (§1). No database FK constraints. §4.11 |
| 11 | Auth / RBAC separate from staff identity | Met (demo) | Accounts / roles / permissions; real matrix deferred. |
| 12 | Refund / reversal / credit-note semantics | Met | First-class correction records + adjustment categories. |
| 13 | Audit trail for academic and finance changes | Met | `audit_events` on every graph save. |
| 14 | Canonical reporting definitions | Met | Four TS helpers + matching SQL views. |
| 15 | All reports use those definitions | Partial | Demo/API surfaces use them; Live CMS reports still on legacy until CAP-53. |

---

## 4. Proposed changes

Each item lists the proposal, the invariants validation must enforce, and the questions that need a named owner before it can be built. Field names follow the contract's camelCase; tables are the snake-case projection.

### 4.1 Study-period academic status (criteria 2, 4)

Split the two meanings that `studyPeriods.status` currently mixes:

```text
study_periods
  timelineState       derived from academic_terms dates: planned | current | completed  (not stored)
  academicStatus      active | repeat | outstanding | enrolled | credit-transfer | deferred | inactive | deleted
  statusChangedAt     timestamp
  statusReason        text, nullable
  registeredAt        timestamp, nullable
```

- `academicStatus` values start from the LUCT `SemesterStatus` set used in the EMGS reconciliation (`Active`, `Repeat`, `Outstanding`, `Enrolled`, `CredTransfer`, `Deferred`, `Inactive`, `Deleted`). The legacy lookup is `r_zstdsemesterstatus` in each campus dump; the mapping must be confirmed per campus, not assumed.
- A study period counts as **valid** when `academicStatus ∈ {active, repeat, outstanding, enrolled, credit-transfer}`. `deleted` periods stay stored for audit but are excluded everywhere.
- **Latest valid study period** = the valid period with the highest `programmeSemesterNumber` (tie-break: term `sequenceNumber`). Never "latest term ID" or "latest row".
- `academic_terms.status` becomes derived from `startsAt` / `endsAt` the same way.

Invariants: at most one valid period per enrolment and term; `credit-transfer` periods may have zero module registrations; `deleted` periods may not own new registrations, results or invoices.

Open questions: does LUCT treat `Outstanding` as active for EMGS and for portal access alike? Is `Inactive` distinct from `Deferred` in any report?

### 4.2 Status history (criterion 3)

One history table per lifecycle entity, following the `immigration_case_events` pattern:

```text
<entity>_status_events
  id
  <entity>Id
  status
  effectiveFrom
  effectiveTo         nullable; null = current
  changedByUserId     nullable for system/batch changes
  reason              nullable
  source              portal | cms-sync | batch | migration
```

Apply to `programme_enrolments`, `study_periods`, `module_registrations`, `student_visa_passes`, `student_funding_awards` and `graduation_records`.

Invariants: events per entity are contiguous and non-overlapping; the open event's status equals the entity's current status. Point-in-time reports ("active on 31 July") read events, not current status.

### 4.3 Credit transfer, exemption and equivalence (criterion 6)

```text
student_credit_transfers
  id, programmeEnrolmentId, studyPeriodId (nullable)
  sourceInstitution, sourceProgrammeEnrolmentId (nullable, for internal transfers)
  sourceModuleCode, sourceModuleTitle, sourceGrade (nullable)
  targetCurriculumModuleId
  creditsGranted
  kind                credit-transfer | exemption
  approvedByStaffMemberId, approvedAt, evidenceReference

module_equivalencies
  id, moduleId, equivalentModuleId, effectiveFrom, effectiveTo, scope (campus/programme version)

curriculum_substitutions
  id, programmeEnrolmentId, replacedCurriculumModuleId, substituteModuleId, approvedBy, approvedAt, reason
```

- Credit transfers and exemptions do not need a module offering or registration. They count toward earned credits and graduation requirements, not toward GPA.
- `module_registrations.registrationType = exemption` should be retired in favour of `student_credit_transfers.kind = exemption`.

Invariants: a curriculum module is satisfied by at most one of a passing result, a credit transfer or a substitution; `creditsGranted ≤` the target curriculum module's credits.

### 4.4 Credit classification and derived term results (criterion 7)

Extend `module_results.outcome` and classify credits explicitly:

| Outcome | Attempted | Earned | GPA credits |
|---|---|---|---|
| `pass` | yes | yes | yes |
| `fail` | yes | no | yes |
| `pass-only` | campus rule | yes | no |
| `audit` | no | no | no |
| `withdrawn` | campus rule | no | no |

Credit transfers and exemptions (§4.3) contribute earned credits only.

Add term-level fields to `term_results`: `termCreditsEarned`, `termGpaCredits`, `termPoints`.

Treat `term_results` as a **published snapshot of a derivation**, and add the invariant that its totals equal the sum over the period's module results and credit transfers, cumulatively across valid study periods of the same enrolment. Replaced attempts (repeat passed later) must follow an explicit campus rule (`includedInCgpa`) rather than an implicit one. This is the check that would have caught the 127 vs 131 credit discrepancy.

Open question: which "campus rule" cells apply at LUCT (Registry to confirm).

### 4.5 Student identifiers (criterion 9)

```text
student_identifiers
  id, studentProfileId
  type                student-number | passport | nric | national-id | emgs-reference | other
  value, issuingCountryCode (nullable)
  validFrom, validUntil (nullable)
  isPrimary
  supersededByIdentifierId (nullable)
```

- `student_visa_passes.passportNumber` becomes `passportIdentifierId`.
- Passport renewal adds an identifier and supersedes the old one; it never creates a new student.
- EMGS reconciliation matches on any identifier of the right type, current or historical, and reports mismatches instead of silently dropping them.

Invariants: one primary identifier per type per student; `(type, value, issuingCountryCode)` is unique across students.

### 4.6 People as the permanent identity

Invert the current `people → studentProfileId / staffMemberId` shape:

```text
people            id, displayName, avatarUrl, …
student_profiles  id, personId
staff_members     id, personId
```

A person may hold student and staff roles at the same time, and keeps one identity from student to graduate to staff. `personType` is removed; roles are derived from which profiles exist.

### 4.7 Authentication and authorisation (criterion 11)

```text
user_accounts        id, personId, loginName, status (active | disabled | locked), disabledAt, disabledReason
roles                id, code (student, lecturer, registry, bursary, admin, …)
permissions          id, code
role_permissions     roleId, permissionId
user_role_grants     id, userAccountId, roleId, campusId (nullable), facultyId (nullable), effectiveFrom, effectiveTo
```

- Disabling a login never deletes staff, lecturer or student history.
- LUCT/CMS gates such as `LoginActive` (set nightly from balance, VIP, PTPTN and term rules in `portal.sql`, see [cms-feature-comparison.md](cms-feature-comparison.md)) become an access-policy evaluation over canonical data, not a stored column. `StaffUserLevel`, `s_staff` and `f_lecturer` map to role grants, not to new tables of the same shape.

### 4.8 Finance reversals, refunds and credit notes (criterion 12)

```text
payment_reversals    id, paymentId, reversedAt, reason (bounced | duplicate | chargeback | error), reversedByUserId
refunds              id, financeAccountId, sourcePaymentId (nullable), amountMinor, currencyCode, paidAt, method, reason, approvedByUserId
credit_notes         id, invoiceId, creditNoteNumber, issuedAt, amountMinor, serviceTaxAmountMinor, reason
invoice_voids        id, invoiceId, voidedAt, reason, replacementInvoiceId (nullable)
```

- `financial_adjustments.kind` becomes a closed enum of business meanings (`funding-credit`, `late-fee`, `write-off`, `rounding`, …), not `credit | debit` plus free text.
- Payment and invoice status become derived from the existence of reversal/void records; the original rows are never edited.
- Credit notes carry their own SST snapshot, so tax reports net correctly by period.

### 4.9 Audit trail (criterion 13)

An append-only `audit_events` record for every write to academic, identity and finance records: `occurredAt`, `actorUserId`, `source`, `collection`, `recordId`, `action` (create | update | delete), `before` / `after` (jsonb), `requestId`. Status history (§4.2) is the queryable business view; `audit_events` is the forensic one. Neither replaces the other.

### 4.10 Canonical reporting projections (criteria 4, 14, 15)

Define these once, as database views or Portal API projections, and require every report, dashboard, EMGS reconciliation and portal surface to consume them:

| Projection | Draft definition |
|---|---|
| `current_programme_enrolment` | Per student: the single `active` enrolment, else newest `deferred`, `completed`, `withdrawn` (the existing API selector rule). |
| `latest_valid_study_period` | Per enrolment: §4.1 rule. |
| `current_active_students` | Enrolment `active` **and** its latest valid study period's term contains the reference date **and** that period's `academicStatus ∈ {active, repeat, outstanding, enrolled, credit-transfer}`. Module registrations are **not** required (credit-transfer periods have none). |
| `student_credit_summary` | §4.4 derivation per enrolment: attempted, earned, GPA credits, points, GPA, CGPA. |
| `student_outstanding_balance` | Issued, non-voided invoice totals plus SST, minus allocated non-reversed payments, credit notes and adjustments. |

Every projection takes an explicit reference date so historical reports reproduce. The `current_active_students` draft mirrors the filter used in the EMGS reconciliation; Registry must confirm it before it is called canonical. Botswana already carries legacy `rep_activestudent` / `rep_activestudentyear` tables, which are candidates to retire once this projection exists.

### 4.11 Physical integrity

The jsonb record store is a Demo projection. When a relational schema replaces it, every contract reference becomes a declared FK, and the ERD stops relying on name inference. Until then, the graph `superRefine` remains the only integrity check and must be extended for every invariant in this document.

---

## 5. Suggested order

1. §4.1 study-period status and §4.10 `current_active_students` — highest reporting risk.
2. §4.4 derived term results and §4.3 credit transfers — transcript and graduation correctness.
3. §4.5 identifiers — EMGS reconciliation.
4. §4.2 status history and §4.9 audit — before any Live write path.
5. §4.8 finance reversal semantics.
6. §4.6 people inversion and §4.7 RBAC — with Portal API identity work ([portal-api-development-plan.md](portal-api-development-plan.md)).

## 6. Questions for the schema owner and Registry

Published agenda (CS-01–CS-13) for GitHub Pages:
[docs/diagrams/canonical-schema-confirmations.html](../../diagrams/canonical-schema-confirmations.html).
Mirrored into SDD-10 as Q29–Q36.

| ID | Question | Owner | Blocks |
|---|---|---|---|
| CS-01 | Map legacy `SemesterStatus` / `ProgramStatus` to `academicStatus` and enrolment status **per campus** | Registry | EMGS, CAP-53, Live reports |
| CS-02 | May EMGS, portal access and management dashboards share one `current_active_students` definition? | Registry + International Office | Cohort counts |
| CS-03 | Is `Outstanding` active for EMGS and portal alike? Is `Inactive` distinct from `Deferred`? | Registry | CS-01 / CS-02 |
| CS-04 | Enrolment statuses beyond `active \| completed \| withdrawn \| deferred`? | Registry / product | Enrolment history |
| CS-05 | Which “campus rule” cells apply for `pass-only`, `audit`, `withdrawn`? | Registry | Transcripts |
| CS-06 | Confirm latest-attempt CGPA replacement while failed attempts count in term GPA | Registry | Credit totals |
| CS-07 | Extend `module_results.outcome` beyond `pass \| fail` after CS-05 | Registry + Portal API | Contract bump |
| CS-08 | Are refunds / credit notes issued in the CMS today, and by which desks? | Bursary | Finance Live |
| CS-09 | Authoritative credit-note / refund document numbers (vs Demo `CN-######`) | Bursary | Numbering |
| CS-10 | Do adjustment categories cover Live bursary practice? | Bursary | Ledger meaning |
| CS-11 | Real RBAC matrix and LoginActive / StaffUserLevel mapping | Product + IT / Registry | Access Live |
| CS-12 | Physical FK constraints on Demo tables | Engineering | §4.11 |
| CS-13 | Live CMS reports consume the four reporting views | Engineering after CS-02 | CAP-53 |

## 7. Implementation status (1 October 2026)

| Area | Status | Where |
|---|---|---|
| §4.1 Study-period `academicStatus` + timeline `status` | Done | `canonical-lifecycle-records.ts`, study period fields on the graph |
| §4.2 Status history (enrolment / period / registration) | Done | `*StatusEvents` collections + `record-status-history.ts` |
| §4.3 Credit transfer / substitution / equivalency | Done | collections + graph validation + graduation completion path |
| §4.4 Derived term / CGPA totals | Done | `academic-credit-derivation.ts`; term results must match |
| §4.5 Student identifiers + visa passport link | Done | `studentIdentifiers`, `passportIdentifierId` |
| §4.6 People ownership of profile/staff | Done | required `personId` back-pointers |
| §4.7 User accounts / roles / permissions | Done (demo matrix) | seeds + login gate for disabled/locked |
| §4.8 Finance corrections | Done | reversals, refunds, credit notes, voids, adjustment `category`; Finance statement UI |
| §4.9 Audit trail | Done | `audit_events` written on every graph save |
| §4.10 Reporting projections | Done | TS helpers + SQL views `latest_valid_study_periods`, `current_active_students`, `student_credit_summary`, `student_outstanding_balances` |
| Schema-version reseed | Done | `portal_meta.schema_version`; mismatch drops record tables, keeps student state + audit |
| Published ERD / db-admin inference | Done | `docs/diagrams/erd.html`, `db-admin` IRREGULAR map |
| Outcome enum extension beyond pass/fail | Deferred | needs Registry |
| Real RBAC matrix (not demo codes) | Deferred | needs product owner |
| Physical FK constraints | Deferred | §4.11 — jsonb Demo store unchanged |
| LUCT status meaning confirmation per campus | Deferred | §6 questions |
