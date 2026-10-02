# Canonical record schema — LUCT readiness and proposed changes

**Status:** Schema v3 campus policy layer implemented and Neon Demo reseeded (1 October 2026). Architecture review confirmed Schema v3 good to proceed; remaining CS-01–CS-11 are policy-validation / campus go-Live requirements (Demo university defaults are structural examples only until campus/department sign-off). CS-12 stays deferred for the JSONB Demo; CS-13 is an incremental, campus-scoped report migration. Remaining engineering/deferred items are listed in §7.  
**Scope:** the canonical `PortalRecordGraph` model behind the Portal API Demo and the published ERD. Under [ADR-1](../architecture/overview.md) the existing CMS remains system of record; these changes shape the canonical model the Portal API translates into ([CAP-53](../../sdd/11-capability-catalog.md#cap-53)) and the longer-term [M5](../../sdd/03-delivery-milestones.md#m5) unified CMS. They do not authorise duplicating CMS operations at launch.  
**Origin:** schema review of the 76-table ERD against problems met in LUCT reporting work (semester status filtering, EMGS active-student reconciliation, 127 vs 131 credit totals, SST reporting, passport mismatches).
**Contract version:** `PORTAL_RECORD_SCHEMA_VERSION = 3` in `student-portal/src/contracts/portal-records.ts`.
**Policy decision (1 October 2026):** architecture recommendation recorded to Iman Suherman — Canonical Schema defines shared vocabulary, relationships and invariants; university default policy then campus override (effective-dated) control behaviour. A campus that has not confirmed its policy cannot activate the affected Live feature, but does not hold back Schema or another campus. Published agenda: [canonical-schema-confirmations.html](../../diagrams/canonical-schema-confirmations.html).

---

## 0. Policy hierarchy (canonical vs campus)

```text
Canonical model & invariants
        ↓
University / default policy   (sensible baseline configuration)
        ↓
Campus policy override        (approved campus practice)
```

| Layer | Owns | Must not |
|---|---|---|
| Canonical model | Vocabulary, relationships, invariants (e.g. latest valid study period from ordered periods; every attempt retained; first-class finance corrections) | Fork schema per campus; encode one campus’s operational rule as a hard-coded global |
| University default | Seeded baseline (e.g. LUCT active-student status set, universal credit rows for pass/fail/credit-transfer/exemption/audit) | Pretend Demo defaults are Live for an unconfirmed campus |
| Campus override | Effective-dated mapping and policy tables (§0.1); approved before that campus/feature goes Live | Rewrite historical results when policy changes — use `effectiveFrom` / `effectiveTo` |

**Principle:** Canonical Schema proceeds without requiring every LUCT campus to agree identical operational rules first. Incomplete campus policy confirmation blocks that campus’s Live feature activation only. Schema v3 Demo implements the policy collections (§0.1 / §7).

### 0.1 Campus configuration shapes (implemented)

| Config (graph collection → table) | Purpose |
|---|---|
| `campusStatusMappings` → `campus_status_mappings` | `campusId`, `sourceSystem`, `sourceStatus` → `canonicalStatus`, `target`, `effectiveFrom`, `effectiveTo` |
| `campusAcademicStatusPolicies` → `campus_academic_status_policies` | Per status: `countsAsValidStudyPeriod`, `countsAsActiveStudent`, effective dates |
| `campusCreditPolicies` → `campus_credit_policies` | Per outcome: `countsAsAttempted`, `countsAsEarned`, `countsInGpa`, effective dates |
| `campusCgpaPolicies` → `campus_cgpa_policies` | `repeatRule` (`all-attempts` \| `latest-attempt` \| `latest-passing-attempt` \| `highest-attempt` \| `explicit-included-in-cgpa`), effective dates |
| `campusDocumentNumberPolicies` → `campus_document_number_policies` | Per `documentType`: prefix, sequence pattern, effective dates |
| `campusAdjustmentPolicies` → `campus_adjustment_policies` | Per category: enabled, approval requirement, effective dates |

Resolution: `campusId: null` is the university default; a campus-specific row overrides it when both are effective on the reference date (`student-portal/src/lib/campus-policy.ts`). Seeds: `mocks/campus-policy-fixtures.ts`. Projections and SQL views for active/valid study periods consume academic-status policy.

Historical migrated `includedInCgpa` (and similar) values are preserved; new results follow the policy effective on the result date. Access / finance / VIP / PTPTN login rules stay in a separate access-policy layer — not inside `current_active_students`.

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
| 1 | Programme enrolment lifecycle explicit | Met (baseline) | `active \| completed \| withdrawn \| deferred` with status events. Extra lifecycle states only when a campus process proves distinct canonical meaning (CS-04). |
| 2 | Study-period lifecycle matches LUCT semantics | Met (demo) | Timeline `status` + Registry `academicStatus`; default valid set equals EMGS filter. Per-campus mapping/policy is Live readiness (§0, CS-01–CS-03), not a Schema blocker (Demo policy tables exist in Schema v3). |
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

- `academicStatus` values start from the LUCT `SemesterStatus` set used in the EMGS reconciliation (`Active`, `Repeat`, `Outstanding`, `Enrolled`, `CredTransfer`, `Deferred`, `Inactive`, `Deleted`). The legacy lookup is `r_zstdsemesterstatus` in each campus dump; **legacy → canonical mapping is effective-dated and campus-configurable** (`campus_status_mapping`, §0.1) — never hard-coded as identical across campuses.
- **Default** university policy: a study period counts as **valid** / active-student when `academicStatus ∈ {active, repeat, outstanding, enrolled, credit-transfer}`. Membership is policy-driven via `campus_academic_status_policies`. `deleted` periods stay stored for audit but are excluded everywhere.
- **Canonical invariant (fixed):** **Latest valid study period** = the valid period with the highest `programmeSemesterNumber` (tie-break: term `sequenceNumber`). Never “latest term ID”, “latest row”, or “latest TermID”.
- `Outstanding`, `Deferred`, and `Inactive` remain three distinct canonical concepts. Default seed: Outstanding → valid+active; Deferred / Inactive → not currently active. Do not collapse Inactive into Deferred.
- `academic_terms.status` becomes derived from `startsAt` / `endsAt` the same way.

Invariants: at most one valid period per enrolment and term; `credit-transfer` periods may have zero module registrations; `deleted` periods may not own new registrations, results or invoices.

Campus Live readiness (not Schema blockers): confirm each campus’s status mapping and academic-status policy before that campus treats Demo statuses as Live (CS-01–CS-03).

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

Classify credits explicitly; keep the initial result contract conservative (`pass | fail`) until CS-07:

Universal default rows (Schema v3 university-default seed):

| Outcome | Attempted | Earned | GPA credits |
|---|---|---|---|
| `pass` | yes | yes | yes |
| `fail` | yes | no | yes |
| Credit transfer | no normal attempt | yes | no |
| Exemption | no normal attempt | yes | no |
| `audit` | no | no | no |

Potentially campus-dependent rows (`pass-only`, `withdrawn`, …) live in `campus_credit_policy` (§0.1). Initial contract may stay `pass | fail`; extend the enum when a campus Live path needs the outcome and its credit classification is defined (CS-05, CS-07).

Credit transfers and exemptions (§4.3) remain first-class academic records (earned only, never GPA) — not fake module results.

**CGPA invariant:** every academic attempt is retained permanently. Which attempt contributes to cumulative CGPA is `campus_cgpa_policy.repeatRule` (effective-dated). Migrated historical `includedInCgpa` is preserved; do not retrospectively recalculate old transcripts under a newly introduced rule (CS-06).

Add term-level fields to `term_results`: `termCreditsEarned`, `termGpaCredits`, `termPoints`.

Treat `term_results` as a **published snapshot of a derivation**, and add the invariant that its totals equal the sum over the period's module results and credit transfers, cumulatively across valid study periods of the same enrolment. This is the check that would have caught the 127 vs 131 credit discrepancy.

Campus Live readiness: approve credit and CGPA policy before transcripts / credit calculations go Live for that campus.

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
- LUCT/CMS gates such as `LoginActive` (set nightly from balance, VIP, PTPTN and term rules in `portal.sql`, see [cms-feature-comparison.md](cms-feature-comparison.md)) become an access-policy evaluation over canonical data, not a stored column and **not** a direct map to `user_account.status` (`active | disabled | locked` is account/security state only). `StaffUserLevel`, `s_staff` and `f_lecturer` map to role grants / teaching capability, not to new tables of the same shape.

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
| `current_active_students` | Active programme enrolment **and** latest valid study period **and** that period’s term contains the reference date **and** the period’s academic status satisfies `campus_academic_status_policies` (default seed: `{active, repeat, outstanding, enrolled, credit-transfer}`). Module registrations are **not** required (credit-transfer periods have none). |
| `student_credit_summary` | §4.4 derivation per enrolment: attempted, earned, GPA credits, points, GPA, CGPA. |
| `student_outstanding_balance` | Issued, non-voided invoice totals plus SST, minus allocated non-reversed payments, credit notes and adjustments. |

Every projection takes explicit `campusId` and `referenceDate`, and resolves the campus policy effective on that date so historical reports reproduce. Prefer logging or report metadata that names the resolved policy/version.

**`current_active_students` defines academic status, not Portal authorization.** Portal access may consume it; finance restrictions, VIP/PTPTN and other login rules remain a separate access-policy layer (CS-02, CS-11).

Default seed mirrors the EMGS reconciliation filter; per-campus membership is Live readiness, not a Schema blocker. Botswana legacy `rep_activestudent` / `rep_activestudentyear` are candidates to retire after campus-scoped cutover (CS-13).

**CS-13 rollout (incremental, not big-bang):** campus policy configured → canonical views in shadow mode → legacy + canonical side-by-side → record-level semantic diff (student IDs in/out, enrolment, latest valid period, include/exclude reason, credits, GPA/CGPA, outstanding balance, policy version + reference date) → enable per campus/report behind a feature flag → observe → retire legacy. Acceptance: zero unexplained record-level differences; known intentional differences documented as reconciliation cases. Finance amounts: exact to system currency precision. Two wrong queries agreeing on a count is not acceptance.

### 4.11 Physical integrity

The jsonb record store is a Demo projection (`id`, `position`, `record jsonb`, `updated_at` per collection). **Do not** add artificial FKs against generated browsing columns to make the Demo ERD look relational (CS-12).

Until a relational Live store replaces it:

- `portalRecordGraphSchema.superRefine` is the authoritative write-time integrity check;
- every canonical reference must have graph validation;
- automated tests should create orphan / mismatched records and verify rejection;
- CI validates canonical fixtures against the full graph schema;
- an integrity diagnostic should detect orphan references in persisted Demo data.

**Relational Live migration (mandatory acceptance for physical FKs):** (1) create normalized tables → (2) backfill → (3) orphan/integrity checks → (4) add FKs → (5) validate → (6) switch application reads/writes. On PostgreSQL, where table size warrants it, introduce FKs with `NOT VALID` then `VALIDATE CONSTRAINT` after data checks. Prefer `RESTRICT` / `NO ACTION` for required historical relationships; `SET NULL` for optional; `CASCADE` only for true dependent/join records with explicit justification — never cascade-delete material academic or financial history when removing a student, programme or invoice.

---

## 5. Suggested order

1. §4.1 study-period status and §4.10 `current_active_students` — highest reporting risk.
2. §4.4 derived term results and §4.3 credit transfers — transcript and graduation correctness.
3. §4.5 identifiers — EMGS reconciliation.
4. §4.2 status history and §4.9 audit — before any Live write path.
5. §4.8 finance reversal semantics.
6. §4.6 people inversion and §4.7 RBAC — with Portal API identity work ([portal-api-development-plan.md](portal-api-development-plan.md)).

## 6. CS-01–CS-13 treatment (1 October 2026)

Published page:
[docs/diagrams/canonical-schema-confirmations.html](../../diagrams/canonical-schema-confirmations.html).
Mirrored into SDD-10 as Q29–Q36.

**Overall decision:** Schema proceeds (Demo policy layer = Schema v3). Campus-dependent answers become effective-dated configuration (§0) approved before that campus/feature goes Live. Incomplete campus confirmation does not block Schema or another campus.

| ID | Topic | Treatment | Live readiness owner |
|---|---|---|---|
| CS-01 | Legacy → canonical academic / enrolment status mapping | Non-blocking for Schema. Retain canonical academic statuses and enrolment lifecycle baseline. Use effective-dated `campus_status_mappings` (Demo seeded). Fixed invariant: latest valid period from ordered study periods. | Registry (per campus, at migration/onboarding) |
| CS-02 | `current_active_students` | One calculation mechanism; status membership policy-driven (`campus_academic_status_policies`). Defines academic status only — not Portal authz. | Registry + International Office (policy); Product for access-policy layer |
| CS-03 | Outstanding / Inactive / Deferred | Keep three distinct concepts. Default: Outstanding valid+active; Deferred/Inactive not currently active. Operational classification via campus academic-status policy. | Registry (per campus) |
| CS-04 | Programme enrolment lifecycle | Keep `active \| completed \| withdrawn \| deferred`. Do not add speculative statuses until a real campus process needs them. | Registry / product (extend enum only when required) |
| CS-05 | Credit classification | Schema separates attempted / earned / GPA; campus variation in `campus_credit_policy`. Universal pass/fail/CT/exemption/audit rows fixed. | Registry (before transcripts Live) |
| CS-06 | Repeat / CGPA replacement | Every attempt retained; `campus_cgpa_policy` chooses contribution rule; preserve migrated `includedInCgpa`. | Registry (before CGPA Live) |
| CS-07 | Additional result outcomes | Keep `pass \| fail` initially; add outcomes when required and credit-classified. CT/exemption stay outside `module_results`. | Registry + Portal API |
| CS-08 | Refunds / credit notes | First-class correction records stay in schema; campuses enable supported Finance workflows at Live. | Bursary (per campus Live) |
| CS-09 | Finance document numbering | `campus_document_number_policy`; Demo `CN-######` stays Demo-only. | Bursary (per campus Live) |
| CS-10 | Adjustment categories | Canonical adjustment model; `campus_adjustment_policy` enables categories. | Bursary (per campus Live) |
| CS-11 | RBAC / legacy access mapping | Keep accounts/roles/permissions separate from Student/Staff identity. Map `s_staff` / `f_lecturer` / `StaffUserLevel` as migration inputs; do **not** map `LoginActive` to `user_account.status`. | Product + IT / Registry (per campus Live) |
| CS-12 | Physical FKs | No physical FKs required for JSONB Demo; mandatory acceptance for relational Live store (§4.11). | Engineering |
| CS-13 | Live CMS reports on canonical views | Canonical views are the long-term source; adopt via shadow compare, record-level reconciliation, per-campus/report feature flags (§4.10). | Engineering + Registry/Bursary per report |

## 7. Implementation status (1 October 2026; Schema v3 policy layer)

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
| §4.10 Reporting projections | Done (Demo) | TS helpers + SQL views; Live CMS report cutover is CS-13 |
| Schema-version reseed | Done | `portal_meta.schema_version`; mismatch drops record tables, keeps student state + audit. Neon Demo reseeded 1 Oct 2026 → version **3**, 95 collections |
| Published ERD / db-admin inference | Done | `docs/diagrams/erd.html` (policy tables + reporting joins), `db-admin` IRREGULAR map for Schema v3 policy stems |
| §0 Campus policy tables (mapping / academic-status / credit / CGPA / document / adjustment) | Done (Demo) | Schema v3 collections + university-default seeds; Data Model Explorer entities; published ERD; `campus-policy.ts` resolver; projections + SQL views; `/v1/meta.schemaVersion` (contract + Neon); db-admin IRREGULAR map. **Production Vercel API still needs redeploy** for `schemaVersion` on `/v1/meta` |
| Neon physical Schema v3 verification | Done (1 Oct 2026) | Checklist: six policy tables present; university-default seeds; reporting views return expected rows; `db:seed` idempotent; campus override can change membership without altering view SQL. See decision log |
| Outcome enum extension beyond pass/fail | Deferred | CS-07 — when a campus Live path needs it |
| Real RBAC matrix (not demo codes) | Deferred | CS-11 — campus Live readiness |
| Physical FK constraints | Deferred (Demo) | CS-12 — mandatory on relational Live store |
| Per-campus policy confirmation | Live readiness | CS-01–CS-11 — policy-validation / campus go-Live (not Schema blockers). Demo defaults are structural examples only until campus/department sign-off |
| Live report shadow / cutover | Not started | CS-13 — incremental legacy + canonical side-by-side, record-level reconcile, per-campus feature-flag cutover |
