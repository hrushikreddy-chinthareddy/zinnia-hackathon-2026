# Payee Change Transaction — Testing Instructions

Testing instructions for the Payee Change transaction feature (DEPU-9243).

---

## Prerequisites

### Feature flag

-   **Optimizely flag:** `payee_change_transaction` (`FEATURE_FLAGS.PAYEE_CHANGE_TRANSACTION`)
-   Must be **enabled** for the Payee Change UI to appear

### Eligibility

-   Policy must have a **Payee** role
-   User must pass the **Manage Payee eligibility** check (`checkManagRoleEligibilityQuery` for `PolicyRole.PAYEE`)
-   Policy must be eligible for Payee Change per carrier/BPM configuration

---

## Test scenarios

### 1. Self-serve flow — policy page

**Path:** Policy Details → People → Manage payee

1. Open a policy: `/policies/{planCode}/{policyNumber}/policy/policy-details`
2. Go to the **People** tab
3. Confirm **Manage payee** (or "Manage Payees") appears in the quick actions
4. Click **Manage payee**
5. You should land on: `/policies/{planCode}/{policyNumber}/people/payeechange`
6. Complete the transaction:
    - **Start** step: "Manage Payees"
    - Fill payee details (add/change/remove actions, percentages, contact info)
    - **Confirm** step: Review and submit
7. Expect a success message: "Payee Change updates were submitted."

---

### 2. Direct URL (policy slug)

**URL:** `/policies/{planCode}/{policyNumber}/people/payeechange`

Example: `/policies/IU0101/L906478977959/people/payeechange`

-   Uses the same self-serve flow as the People tab
-   Requires the feature flag and eligibility

---

### 3. Create Case flow

1. Go to **Create Case**
2. Select process **Payee Change** / **Policy Update** with sub-type **Payee Change**
3. Choose a policy with an existing payee
4. Complete the form (Start → Payees → Confirm)
5. Submit and verify a case is created

---

### 4. Case Management (Ops) — Payee Change Data Entry task

For cases that include a **Payee Change Data Entry** task:

1. Open the case, e.g. `/cases/{caseId}`
2. Open the **Payee Change Data Entry** task
3. Verify:
    - Policy and payee data load
    - Form tabs (Owner Details, Payee Details, Summary, etc.)
    - NIGO (decline reason) handling when `issueResolved === false`
    - **Confirm** step and submit behavior

**Mock task data (local/dev):**

-   `src/jsonschema-mock-service/tasks-data/DEFAULT/payeechange-data-entry.json`
-   Task type: `PAYEECHANGE_DATA_ENTRY`
-   Example identifiers: `planCode: IU0101`, `policyNumber: FIUL844450420`

---

### 5. API behavior

**Endpoints:**

-   **Validate:** `POST /api/nonfinancial/payeeChangeTransaction` with `operation: 'validatePayee'`
-   **Submit:** same route with `operation: 'addPayeeChangeTransaction'`

**Request body (submit):**

-   `planCode`, `policyNumber`
-   `operation`: `'addPayeeChangeTransaction'`
-   Payee payload (`actionData`, `contractInfo`, etc.) as built by the form

---

## Validation checklist

| Check        | Description                                                      |
| ------------ | ---------------------------------------------------------------- |
| Feature flag | Payee Change appears when flag is on, hidden when off            |
| Eligibility  | Manage Payee only shown for eligible policies                    |
| Add payee    | Can add a new payee                                              |
| Change payee | Can update existing payee details                                |
| Remove payee | Can remove a payee (soft delete)                                 |
| Allocation   | Percentage allocation totals 100% when required                  |
| Validation   | Client and API validation behave as expected                     |
| Submit       | Submission succeeds and shows confirmation                       |
| NIGO         | Decline reasons work correctly when API returns exception status |
| Navigation   | Back/Cancel/Submit navigation works                              |

---

## Environment

-   **Local dev:** `pnpm dev` in `apps/ops`
-   **Feature flag:** Ensure `payee_change_transaction` is enabled in Optimizely (or use local override if available)
-   **Backend:** BPM API at `/bpm/v1/policies/{planCode}/{policyNumber}/parties/payee` must be configured

---

## Related files

| File                              | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `payeechange-data-entry.ts`       | Task handler, `formatPartyData`, `getContractInfo`            |
| `payee-change-transaction.ts`     | Self-serve submit handler, initial form data                  |
| `payee-change-steps.tsx`          | Steps config for Payee Change task                            |
| `payeeChangeTransaction.ts` (API) | Route for validate/submit                                     |
| `web-non-financial.ts`            | `validatePayeeChangeTransaction`, `addPayeeChangeTransaction` |
