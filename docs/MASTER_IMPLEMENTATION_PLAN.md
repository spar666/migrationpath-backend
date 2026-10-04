# MigrationPath Implementation Plan

## Purpose

This document translates the supplied MigrationPath requirements into an implementation sequence grounded in the current backend and frontend repositories.

The target product is an Australian migration lead-qualification, pathway pre-screening, Prospect CRM, and consultation-conversion platform.

This plan does not authorize guessed migration-law values. Legislative rules, official occupation-list data, approved public wording, and commercial intake policy must be confirmed by the appropriate owner or registered migration agent (RMA).

## Source-of-truth order

When requirements conflict, use this order:

1. 1 September requirements.
2. Employer-sponsored definitive completion specification.
3. 18 August requirements.
4. Existing code for implementation detail only.

Do not let existing behavior override an explicit product requirement.

## Non-negotiable design rules

- Use `Prospect` as the single CRM/capture entity.
- Preserve `statutory_eligible` and `client_fit` as independent values.
- Store professional-judgment issues separately as RMA-review flags.
- Never infer missing or invalid legislative configuration as `0`.
- Never invent legislation, occupation membership, thresholds, or legal exemptions.
- Preserve production data through additive and backfill migrations before destructive cleanup.
- Retain and extend working Partner, pre-screen, Calendly, Stripe, CMS, form-logic, occupation-search, and admin-auth infrastructure.
- Payment must be controlled by a feature flag and default to disabled.
- A failed or unsuitable screening result must still produce a Prospect when valid consent was supplied.

## Repository baseline

### Backend

The backend already includes:

- Prospect records, six pipeline stages, consent fields, summaries, and admin endpoints;
- Partner and employer pre-screen capture paths;
- GSM points rules and policy configuration;
- occupation records and an in-progress many-to-many list-membership model;
- five employer stream identifiers;
- Calendly, consultation, Stripe, reconciliation, and webhook infrastructure;
- staff authentication under the existing auth module;
- Nodemailer-based Prospect capture notification.

The backend working tree contains substantial uncommitted changes, including deleted Lead-module files and new migrations. These changes must be reviewed and stabilized rather than overwritten.

Current verification baseline:

- 24 backend test suites pass and 2 fail;
- 306 backend tests pass and 1 fails;
- backend TypeScript compilation fails because a points seed export and test typing are out of sync.

### Frontend

The frontend already includes:

- public Skilled, Partner, Employer, points, occupation-search, consultation, news, and Get Started pages;
- Partner and employer funnels;
- staff-only admin login;
- Prospect admin screens;
- Calendly and Stripe consultation pages;
- removal of public login/dashboard routes.

Outstanding frontend contradictions include:

- Leads screen, route, sidebar item, API constant, and test fixtures still exist;
- Get Started supports only three fixed destinations and does not store router answers;
- 485 and 858 capture destinations do not exist;
- mobile navigation does not expose Get Started;
- Points admin terminology and implementation still need alignment with `points_rules`.

## Delivery strategy

Use small pull requests with explicit exit gates. Do not combine unrelated destructive schema changes into one migration.

For destructive migrations, use this sequence:

1. Expand schema.
2. Deploy compatible code.
3. Backfill data.
4. Reconcile counts and exceptions.
5. Switch all reads and writes.
6. Observe in production or staging.
7. Remove obsolete schema in a later migration.

## Work package 1 — Stabilize the existing implementation

### Objective

Establish a green, understood baseline before adding new behavior.

### Backend work

- Review every existing uncommitted change and map it to a requirement.
- Restore or replace the missing `POINTS_RULES_SEED` test fixture contract.
- Correct the `PolicyConfigService` caching test and verify actual cache invalidation.
- Fix strict TypeScript errors in test doubles.
- Review new migrations for transaction safety, rerun behavior, table/type existence, and data assumptions.
- Split the current multi-domain irreversible migration before it is deployed anywhere shared.
- Run formatting checks without rewriting unrelated user changes.

### Exit gate

- Backend TypeScript check passes.
- Backend unit tests pass.
- Backend build passes.
- No requirement is claimed complete solely because code exists without passing tests.

## Work package 2 — Complete the Prospect domain

### Objective

Make Prospect the durable funnel spine and CRM record.

### Schema

Ensure Prospect supports:

- human reference (`MP-xxxx`);
- `party_type` or a documented mapping from the current `party` field;
- name, email, phone, company name;
- source and visa interest;
- six prescribed stages;
- `statutory_eligible`;
- `client_fit`;
- `best_fit_pathway`;
- `outcome_tag`;
- detailed `gap_codes`;
- dedicated `rma_review_flags`;
- dedicated operational risk flags where needed;
- exact consent text and timestamp;
- structured attribution;
- agent notes;
- captured/router/funnel answers.

### Service behavior

- Centralize public capture in ProspectService.
- Normalize email and source values.
- Define safe duplicate matching without merging unrelated people who share an email.
- Define explicit stage-transition rules.
- Keep booking state separate from screening state and payment policy.
- Preserve an undetermined/review-required state alongside statutory booleans where answers or verified configuration are incomplete.

### Tests

- public capture requires consent;
- consent text and time are stored;
- source and attribution are stored;
- `captured` filtering works;
- screening advances only to `pre_screened`;
- invalid or backward stage transitions are rejected or safely ignored;
- statutory and commercial review updates remain independent.

## Work package 3 — Consolidate Leads into Prospects

### Objective

Remove the operational Leads system without losing historical data.

### Migration sequence

1. Inspect production/staging Lead counts and source distributions.
2. Add any remaining Prospect fields without dropping anything.
3. Backfill each Lead to a `captured` Prospect, preserving the full legacy row in structured metadata.
4. Preserve explicit historical consent; do not fabricate consent for legacy records.
5. Record reconciliation totals and rows that could not be migrated.
6. Switch Partner, points, standard capture, and Get Started writers to Prospect.
7. Switch admin readers to Prospect stage filters.
8. Remove runtime imports/providers/controllers for Leads.
9. Drop the Leads table and enum in a later contract migration.

### Frontend work

- Remove `LeadsManager`.
- Remove `/admin/leads`.
- Remove the Leads sidebar item.
- Remove `CREATE_LEAD`.
- Remove `/leads` mocks and E2E expectations.
- Add a default or explicit `captured` filter to Prospects.

### Exit gate

- No production code imports or calls Leads.
- Every public contact path creates a Prospect.
- Lead and migrated-Prospect reconciliation is documented.
- Contract migration is run only after the compatibility deployment is verified.

## Work package 4 — Correct configuration architecture

### Objective

Maintain two legislative stores and a separate commercial-policy store.

### Points rubric

Use `points_rules` for:

- age bands;
- English levels;
- overseas employment;
- Australian employment;
- qualification;
- specialist education;
- Australian study;
- Professional Year;
- credentialled community language;
- regional study;
- partner skills.

Rename the admin screen to **Points Rubric** and make it read/write the live rules used by the calculator.

### Legislative values

Use `policy_config` for scalar values such as:

- GSM pass mark;
- combined work cap;
- 190 nomination points;
- 491 nomination points;
- GSM maximum age;
- employer income thresholds;
- employer age and experience thresholds;
- employer English thresholds.

Required policy reads must return either a validated value or an explicit configuration error/review-required result. They must not silently fall back to hardcoded values.

### Commercial policy

Use a logically and visibly separate commercial configuration area for:

- minimum salary of commercial interest;
- serviced streams/subclasses;
- ABN requirements;
- commercial age ceiling;
- other agency intake preferences.

Do not label commercial values as legislation.

### Cleanup

- Retire `points_config` only after all usage is removed.
- Archive its rows for audit before dropping the table.
- Remove obsolete `points.regionalStudyPoints` and `parent.*` policy rows only after confirming no runtime reads.
- Keep Partner evidence heuristics separate and clearly labelled as non-legislative.

### Tests

- valid, missing, invalid, inactive, and future-effective configuration;
- admin update reflected on the next calculation;
- source note and effective-date enforcement;
- no silent zero or constant fallback for required values.

## Work package 5 — Complete GSM points calculation

### Objective

Provide one shared, configurable GSM calculator for subclasses 189, 190, and 491.

### Calculation behavior

- Score every required category from active `points_rules`.
- Enforce one claim per mutually exclusive category.
- Calculate overseas and Australian employment separately.
- Apply the configured combined-work cap after individual work scores.
- Apply subclass nomination separately from the shared rubric:
  - 189: 0;
  - 190: configured state nomination points;
  - 491: configured regional nomination points.
- Enforce configured age limits and pass marks.
- Fail safely when required rules/configuration are absent.

### Public flow

1. Ask calculator questions.
2. Calculate and display the indicative score free of charge.
3. Show effective date and general-information disclaimer.
4. Offer optional contact/consent capture.
5. Create a Prospect.
6. Offer Get Started or consultation according to the agreed conversion policy.

The contact form must not block display of the score.

### Open stage decision

Product/RMA must confirm whether a complete GSM calculation is considered a complete engine assessment (`pre_screened`) or only a tool capture (`captured`). The implementation and tests must use one documented interpretation consistently.

### Tests

- every scoring row and boundary;
- work cap;
- qualification exclusivity;
- partner-choice exclusivity;
- 190 and 491 nomination;
- over-age behavior;
- missing rules/configuration;
- score returned before capture;
- capture creates the agreed Prospect stage.

## Work package 6 — Finalize occupation-list membership

### Objective

Represent each occupation's membership in any number of official lists.

### Schema and service

- Keep occupation details in the existing occupation table.
- Use a membership table keyed by occupation code and list code.
- Store source note and effective date on imported membership data.
- Make `isOnAnyList(code, lists)` use the full membership set.
- Return a distinct unknown result for an unknown occupation code where screening needs to distinguish unknown from absent.

### Data import

- Use official supplied datasets or reproducible import tooling.
- Validate list codes and ANZSCO normalization.
- Make imports idempotent.
- Produce import counts and rejected-row reports.
- Do not invent membership.

### Tests

- CSOL only;
- ROL only;
- multiple lists;
- no relevant membership;
- unknown ANZSCO;
- duplicate import;
- newer effective data superseding older data.

## Work package 7 — Complete the five employer streams

### Objective

Evaluate all applicable employer pathways in one submission while respecting stream-specific rules.

### Required stream keys

- `482-core`;
- `482-specialist`;
- `186-de`;
- `186-trt`;
- `494-es`.

### Required structural behavior

- Evaluate every applicable stream, regardless of the visitor's preferred stream.
- Select one best-fit pathway.
- Persist one Prospect, not one Prospect per stream.
- Save each stream assessment in structured engine output for agent review.

### Stream gates

#### 482 Core

- approved sponsor;
- CSOL membership;
- salary at or above verified CSIT;
- configured English requirement;
- experience requirement;
- skills/assessment facts captured for RMA review where judgment is required.

#### 482 Specialist

- no CSOL gate;
- configured allowed ANZSCO major groups;
- salary at or above verified SSIT;
- approved sponsor;
- configured English requirement.

#### 186 Direct Entry

- configured age limit;
- CSOL membership;
- configured experience requirement;
- skills assessment;
- configured English requirement;
- salary at or above verified CSIT;
- possible exemptions flagged for RMA review.

#### 186 TRT

- no occupation-list gate;
- current or previous 457/482 status;
- configured sponsored-employment duration;
- employer nomination data;
- age and English;
- exemptions flagged rather than adjudicated.

#### 494 Employer Sponsored

- regional sponsor/role;
- RMA-confirmed occupation-list behavior;
- skills assessment;
- configured age, experience, English, and CSIT thresholds.

### Professional-review boundary

Never automatically determine:

- Labour Agreement eligibility;
- legal exemptions;
- AMSR;
- complex skills-assessment validity;
- genuine position;
- LMT adequacy;
- health or character outcomes;
- Australian-values issues;
- immigration debt;
- complex immigration history;
- subsequent-entrant eligibility.

Capture the relevant facts and add a reason-specific RMA-review flag.

### Tests

- clean 482 Core pass;
- Specialist pass without CSOL membership when major group and SSIT pass;
- multi-list occupation;
- TRT pass without occupation-list membership;
- income near miss still creates Prospect with reason and gap;
- possible exemption returns RMA review rather than a definitive result;
- missing verified policy returns undetermined/review-required, not false eligibility.

## Work package 8 — Normalize employer outcomes and client fit

### Objective

Persist explainable legal, commercial, and professional-review outcomes.

### Outcome fields

- `best_fit_pathway`;
- `statutory_eligible`;
- `client_fit`;
- `outcome_tag`;
- `gap_codes`;
- `rma_review_flags`;
- full per-stream assessments.

### Outcome tags

Use reason-oriented tags such as:

- `eligible`;
- `occupation_not_listed`;
- `income_below_threshold`;
- `english_below`;
- `age_over_cap`;
- `experience_short`;
- `not_regional`;
- `no_sponsor`;
- `major_group_ineligible`;
- `subclass_not_serviced`.

Do not mix these with CRM priority labels. If CRM prioritization is later required, derive it into a separate field.

### Booking policy

Document how statutory eligibility, client fit, RMA review, and payment flag affect booking. Do not erase or overwrite any of these source values merely to calculate `can_book`.

## Work package 9 — Get Started router and standard capture forms

### Objective

Route visitors using simple questions and capture pathways that do not have a full screening engine.

### Router

- Ask plain-language questions.
- Support multiple matches.
- Route to Skilled, Partner, Employer Sponsored, 485, and 858.
- Store router answers, matched pathways, and source when the visitor submits contact details.
- Do not present the router as legal eligibility advice.

### Reusable standard form

Implement one form for 485, 858, and other approved simple-capture pathways containing:

- name;
- email;
- phone;
- visa/pathway of interest;
- situation/free text;
- explicit consent;
- attribution.

On submit, create a `captured` Prospect and route into the standard consultation journey.

## Work package 10 — Email, uploads, and payment flag

### Transactional email

- Introduce an email-provider interface.
- Configure the approved provider exclusively through environment variables.
- Implement capture confirmation, result copy, candidate invitation, and admin reset if the current auth flow requires it.
- Record delivery attempts without exposing secrets or full sensitive payloads.
- Do not build marketing nurture automation.

### Funnel attachments

- Support one résumé or one employer job description where requested.
- Use the approved existing storage architecture if available.
- Validate type and size server-side.
- Persist storage key, original filename, content type, size, purpose, and uploader relationship.
- Use signed access where appropriate.
- Do not recreate a customer document vault.

### Payment flag

- Add `paymentEnabled`, default false.
- When disabled: capture, schedule, and confirm booking without Stripe being required.
- When enabled: reuse the existing Stripe checkout and webhook flow.
- Do not create duplicate Calendly/booking implementations.
- Define how existing pending bookings behave when the flag changes.

## Work package 11 — Candidate invitation

### Objective

Allow a business Prospect to invite a candidate into the applicant funnel.

### Behavior

- Capture candidate name, nationality, and email.
- Apply the approved deduplication policy.
- Create or link the applicant Prospect.
- Persist the relationship between business, sponsor, nomination, and applicant Prospect.
- Send an expiring, single-purpose invitation.
- Make invitation creation and acceptance idempotent.
- Do not expose one party's private screening answers to the other party.

This package depends on transactional email.

## Work package 12 — Navigation, content, and legacy cleanup

### Public navigation

Desktop target:

- Logo;
- Pathways: Skilled, Partner, Employer;
- Points Calculator;
- Occupation Search;
- Migration News;
- Get Started.

Remove public Get Quote and Log In while preserving `/admin/login`.

Update mobile navigation to expose the intended Get Started journey and remove duplicate/dead search behavior.

### Content corrections

- Remove unsupported usage or success claims.
- Remove invented invitation thresholds and deterministic invitation language.
- Use directional occupation and calculator wording.
- Add approved 491/494 to 191 pathway wording where required.
- Ensure no CTA targets a removed dashboard.
- Add Partner and Employer funnel CTAs.

### Legacy removal sequence

For each removal candidate:

1. Search all imports, routes, services, tests, migrations, and data dependencies.
2. Remove consumers first.
3. Build and test.
4. Remove the implementation.
5. Use a new migration for database removal.

Candidates include quote/pricing, Parent, Onshore, Student, regional-postcode admin, unused visa recommendation, live invitations, public accounts/dashboard, user progress, old notifications/profile surfaces, Courses, and the old document vault.

Keep admin auth and funnel-specific attachments.

## Work package 13 — Full regression and release qualification

### Automated verification

- Backend lint/check, unit tests, build, and E2E tests.
- Frontend lint, typecheck, unit tests, build, and Playwright tests.
- Contract tests for every frontend API consumer.
- Migration tests from a production-shaped pre-change schema.
- Migration rerun/failure recovery tests where supported.
- Consent and source tests for every public capture path.
- Payment-enabled and payment-disabled booking tests.

### Data verification

- Lead counts before migration.
- Prospect counts after migration by source and stage.
- Duplicate and rejected migration report.
- Occupation membership counts by list and effective date.
- Required policy configuration completeness report.

### Security and privacy

- Verify every admin endpoint requires staff authorization.
- Rate-limit public write and public status endpoints.
- Validate public status identifiers and response minimization.
- Verify file authorization and signed-link expiry.
- Avoid sensitive answers in logs and email.
- Verify candidate/business data separation.

### Go-live gate

Do not remove the current go-live safeguard until:

- required configuration exists and is verified;
- official occupation data is loaded and reconciled;
- RMA confirms legislative values and result wording;
- commercial-policy owners approve intake values;
- migrations pass against production-shaped data;
- core engine tests pass;
- every public capture stores consent correctly;
- Prospect capture and stage filtering are verified;
- admin authentication works;
- payment is disabled unless its activation is explicitly approved.

## Required external decisions and blockers

Record each item as either `BLOCKED`, `CONFIRMED`, or `NOT REQUIRED` before go-live:

- current CSIT;
- current SSIT;
- English thresholds for each employer stream;
- eligible Specialist major groups;
- official CSOL and ROL datasets, sources, and effective dates;
- exact 494 occupation-list behavior;
- commercial salary threshold;
- commercial age ceiling;
- ABN intake requirement;
- serviced subclasses and streams;
- approved eligibility and disclaimer wording;
- approved 491/494 to 191 wording;
- email provider and sender identity;
- storage provider, bucket, retention, and deletion policy;
- candidate deduplication/matching policy;
- whether GSM calculation creates `captured` or `pre_screened` Prospects;
- consultation eligibility when an RMA review flag exists;
- payment activation authority.

## Per-work-package completion report

After each work package, report:

```text
Completed
Files changed
Database migrations
Tests added or updated
Commands run and results
Known blockers
Requirements still pending
```

## Definition of done

This scope is complete only when:

- no separate operational Leads system remains;
- all public capture paths create Prospects;
- the six Prospect stages and consent requirements work;
- GSM uses the correct rubric and policy stores;
- required configuration cannot silently become zero or an unverified fallback;
- 189, 190, and 491 scoring is complete;
- occupation membership supports multiple lists;
- all five employer streams are evaluated correctly;
- Specialist does not use a CSOL gate;
- TRT does not use an occupation-list gate;
- statutory eligibility, client fit, and RMA review remain separate;
- outcome tags and gap codes are persisted;
- Get Started supports multi-match routing and the required pathways;
- 485 and 858 standard captures feed Prospects;
- transactional email and funnel attachments work;
- candidate invitations safely link the two parties;
- payment is feature-flagged and defaults off;
- obsolete public accounts, quote flows, and approved legacy features are removed safely;
- admin login remains operational;
- relevant automated tests and builds pass;
- RMA/data blockers are documented;
- the go-live safeguard remains until compliance sign-off.
