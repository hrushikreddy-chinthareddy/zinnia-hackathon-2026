# Transaction Builder — Transactions UI Reference

This document describes every transaction type available in the Transaction Builder, including its tabs, fields, personas, and carrier-specific overrides.

---

## Table of Contents

- [How the Builder Works](#how-the-builder-works)
- [Transaction Categories](#transaction-categories)
- [Personas](#personas)
- [Field Types & Widgets](#field-types--widgets)
- [Party Change Transactions](#party-change-transactions)
  - [Address Change](#address-change)
  - [Phone Number Change](#phone-number-change)
  - [Email Change](#email-change)
  - [Bank Account Change](#bank-account-change)
  - [Beneficiary Change](#beneficiary-change)
  - [Payee Change](#payee-change)
  - [Owner Change](#owner-change)
  - [Joint Owner Change](#joint-owner-change)
  - [Annuitant Change](#annuitant-change)
  - [Power of Attorney Change](#power-of-attorney-change)
  - [Third Party Designee Change](#third-party-designee-change)
- [Financial Transactions](#financial-transactions)
  - [Money In — One-Time Premium](#money-in--one-time-premium)
  - [Money Out — Partial Withdrawal (One-Time)](#money-out--partial-withdrawal-one-time)
  - [Money Out — Full Surrender](#money-out--full-surrender)
- [Field Registry](#field-registry)
- [Widgets Reference](#widgets-reference)
- [Templates Reference](#templates-reference)
- [Carrier Overrides Reference](#carrier-overrides-reference)

---

## How the Builder Works

The Transaction Builder is accessible at `/transaction-builder` (super-admin only). It provides a visual editor for creating and managing transaction journeys used across Zinnia Live policies.

**Core concepts:**

- **Transaction** — a named, multi-tab form journey tied to a specific policy change type (e.g. `ADDRESS_CHANGE`).
- **Tab** — a discrete step within a transaction. Each tab has an ordered list of fields drawn from the field registry.
- **Field** — a typed form input defined once in the central registry and referenced by ID in any transaction.
- **Persona** — controls field behavior (required, hidden, readOnly) per audience: `paper` (agent-assisted) or `selfServe` (customer-facing).
- **Carrier Override** — per-carrier rules that layer on top of base field definitions, allowing hidden/required/readOnly overrides and field-level label or validation changes.

**Schema resolution order (last wins):**

1. Registry base definition
2. Registry persona defaults
3. Tab-level field override
4. Carrier global override
5. Carrier persona override
6. Carrier field-level override

---

## Transaction Categories

| Category | Sub-category | Transaction IDs |
|---|---|---|
| **Party Changes** | Contact | `ADDRESS_CHANGE`, `PHONE_CHANGE`, `EMAIL_CHANGE`, `BANK_CHANGE` |
| **Party Changes** | Role | `BENE_CHANGE`, `PAYEE_CHANGE`, `OWNER_CHANGE`, `JOINT_OWNER_CHANGE`, `ANNUITANT_CHANGE` |
| **Party Changes** | Authorized Party | `POA_CHANGE`, `TPD_CHANGE` |
| **Financial — Money In** | One Time | `ONE_TIME_PREMIUM` |
| **Financial — Money Out** | One Time | `PARTIAL_WITHDRAWAL` |
| **Financial — Money Out** | Full Surrender | `FULL_SURRENDER` |

---

## Personas

| Persona | ID | Audience | Notes |
|---|---|---|---|
| Paper Form | `paper` | Agent / back-office | Agent Notes visible; Witness Name visible; fewer required fields |
| Self-Serve | `selfServe` | Policyholder (online) | Stricter required fields; Agent Notes hidden; Witness Name hidden |

---

## Field Types & Widgets

| Type | JSON Schema Type | Widget | Notes |
|---|---|---|---|
| `string` | string | Default text input | |
| `number` | number | Number input | |
| `boolean` | boolean | `CheckboxWidget` | Used for attestations |
| `date` | string (format: date) | `DateWidget` | ISO 8601 date |
| `email` | string (format: email) | Email input | Pattern validated |
| `phone` | string | Phone input | Min 10 digits |
| `ssn` | string | Masked input | Pattern `\d{3}-?\d{2}-?\d{4}`, masked in UI |
| `select` | string | Dropdown | `enum` / `enumNames` from registry |
| `multiselect` | array | Multi-select | |
| `textarea` | string | `NotesWidget` / `ProcessorNotesWidget` | maxLength enforced |
| `file` | string | File upload | |

Sensitive fields (`ssn`, `bankAccountNumber`) have `uiOptions.mask: true` set in the registry.

---

## Party Change Transactions

### Address Change

**ID:** `ADDRESS_CHANGE` | **Task Type:** `ADDRESSCHANGE_DATA_ENTRY` | **Version:** 1.0.0

Update the mailing or residence address on a policy.

#### Tab 1 — New Address

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Street Address | string | No | Yes |
| 1 | Apt / Suite / Unit | string | No | No |
| 2 | City | string | No | Yes |
| 3 | State | select | No | Yes |
| 4 | ZIP Code | string | No | Yes |
| 5 | Country | select | No | No |

#### Tab 2 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Reason for Change | textarea | No | No |
| 2 | Agent Notes | textarea | No | Hidden |
| 3 | Attestation | boolean | No | Yes |

#### Carrier Overrides

| Carrier | Hidden | Required | Read-Only |
|---|---|---|---|
| USAA | — | `reason` | — |
| MASS | — | — | `country` |

---

### Phone Number Change

**ID:** `PHONE_CHANGE` | **Task Type:** `DEFAULT_CASE_DATA_ENTRY` | **Version:** 1.0.0

Update the primary phone number and type on file for a policy.

#### Tab 1 — New Phone

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Phone Number | phone | No | Yes |
| 1 | Phone Type | select | No | No |

#### Tab 2 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Reason for Change | textarea | No | No |
| 2 | Agent Notes | textarea | No | Hidden |
| 3 | Attestation | boolean | No | Yes |

---

### Email Change

**ID:** `EMAIL_CHANGE` | **Task Type:** `DEFAULT_CASE_DATA_ENTRY` | **Version:** 1.0.0

Update the email address on file for a policy.

#### Tab 1 — New Email

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Email Address | email | No | Yes |

#### Tab 2 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Reason for Change | textarea | No | No |
| 2 | Agent Notes | textarea | No | Hidden |
| 3 | Attestation | boolean | No | Yes |

---

### Bank Account Change

**ID:** `BANK_CHANGE` | **Task Type:** `BANKCHANGE_DATA_ENTRY` | **Version:** 1.0.0

Update the bank account used for premium payments or disbursements on a policy.

#### Tab 1 — New Bank Account

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Bank Name | string | No | No |
| 1 | Account Type | select | No | No |
| 2 | Routing Number | string | No | Yes |
| 3 | Account Number | string (masked) | No | Yes |

#### Tab 2 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Reason for Change | textarea | No | No |
| 2 | Agent Notes | textarea | No | Hidden |
| 3 | Attestation | boolean | No | Yes |
| 4 | Signature | string | No | Yes |
| 5 | Signature Date | date | No | No |

#### Carrier Overrides

| Carrier | Hidden | Required | Read-Only |
|---|---|---|---|
| FNWL | — | `bankName` | — |
| USAA (selfServe only) | — | `bankName` | — |

---

### Beneficiary Change

**ID:** `BENE_CHANGE` | **Task Type:** `BENECHANGE_DATA_ENTRY` | **Version:** 1.0.0

Add, remove, or update primary and contingent beneficiaries.

#### Tab 1 — Primary Beneficiary

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | First Name | string | No | Yes |
| 1 | Middle Name | string | No | No |
| 2 | Last Name | string | No | Yes |
| 3 | Date of Birth | date | No | Yes |
| 4 | Relationship to Owner | select | No | No |
| 5 | Allocation % | number | No | No |
| 6 | Social Security Number | ssn | No | No |
| 7 | Party Type | select | No | No |

#### Tab 2 — Contingent Beneficiary

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | First Name | string | No | Yes |
| 1 | Middle Name | string | No | No |
| 2 | Last Name | string | No | Yes |
| 3 | Date of Birth | date | No | Yes |
| 4 | Relationship to Owner | select | No | No |
| 5 | Allocation % | number | No | No |
| 6 | Party Type | select | No | No |

#### Tab 3 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Notes | textarea | No | No |
| 2 | Attestation | boolean | No | Yes |
| 3 | Signature | string | No | Yes |
| 4 | Signature Date | date | No | No |

#### Carrier Overrides

| Carrier | Hidden | Required | Read-Only | Notes |
|---|---|---|---|---|
| FNWL | — | `ssn`, `dateOfBirth` (+ `relationship` for selfServe) | — | |
| SBGC | `middleName` | `allocationPercentage` | — | |

---

### Payee Change

**ID:** `PAYEE_CHANGE` | **Task Type:** `PAYEECHANGE_DATA_ENTRY` | **Version:** 1.0.0

Update the designated payee on a policy.

#### Tab 1 — Current Payee

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | First Name | string | No | Yes |
| 1 | Middle Name | string | No | No |
| 2 | Last Name | string | No | Yes |
| 3 | Date of Birth | date | No | Yes |
| 4 | Social Security Number | ssn | No | No |
| 5 | Party Type | select | No | No |

#### Tab 2 — New Payee Details

| Order | Field | Type | Required (paper) | Required (selfServe) | Notes |
|---|---|---|---|---|---|
| 0 | Party Type | select | No | No | |
| 1 | First Name | string | No | Yes | |
| 2 | Middle Name | string | No | No | |
| 3 | Last Name | string | No | Yes | |
| 4 | Trust Name | string | No | No | Tab override: `hidden: false` |
| 5 | Social Security Number | ssn | No | No | |
| 6 | Tax ID (EIN) | string | No | No | |
| 7 | Date of Birth | date | No | Yes | |
| 8 | Relationship to Owner | select | No | No | |

#### Tab 3 — Address

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0–5 | Street Address through Country | — | — | selfServe: street/city/state/zip required |

#### Tab 4 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Effective Date | date | No | No |
| 1 | Reason for Change | textarea | No | No |
| 2 | Agent Notes | textarea | No | Hidden |
| 3 | Attestation | boolean | No | Yes |
| 4 | Signature | string | No | Yes |
| 5 | Signature Date | date | No | No |

#### Carrier Overrides

| Carrier | Hidden | Required | Read-Only | Field-Level |
|---|---|---|---|---|
| USAA | `middleName` | `relationship`, `dateOfBirth` | — | — |
| FNWL | — | `trustName` | — | `reason` → "Reason for Payee Change", required |
| MASS | — | — | `effectiveDate` | — |

---

### Owner Change

**ID:** `OWNER_CHANGE` | **Task Type:** `OWNERCHANGE_DATA_ENTRY` | **Version:** 1.0.0

Transfer or update the primary owner of a policy.

#### Tab 1 — Current Owner

| Order | Field | Type |
|---|---|---|
| 0 | First Name | string |
| 1 | Middle Name | string |
| 2 | Last Name | string |
| 3 | Date of Birth | date |
| 4 | Social Security Number | ssn |

#### Tab 2 — New Owner

| Order | Field | Type | Notes |
|---|---|---|---|
| 0 | Party Type | select | |
| 1 | First Name | string | |
| 2 | Middle Name | string | |
| 3 | Last Name | string | |
| 4 | Trust Name | string | hidden: false override |
| 5 | Date of Birth | date | |
| 6 | Social Security Number | ssn | |
| 7 | Tax ID (EIN) | string | |
| 8 | Relationship to Owner | select | |

#### Tab 3 — Address

Street Address, Apt/Suite, City, State, ZIP, Country.

#### Tab 4 — Confirmation

Effective Date, Reason for Change, Agent Notes, Witness Name, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required | Field-Level |
|---|---|---|
| FNWL | `ssn`, `dateOfBirth`, `relationship` | `reason` → "Reason for Owner Change", required |
| USAA | `dateOfBirth`, `relationship` | — |

---

### Joint Owner Change

**ID:** `JOINT_OWNER_CHANGE` | **Task Type:** `OWNERCHANGE_DATA_ENTRY` | **Version:** 1.0.0

Add, remove, or replace a joint owner on a policy.

#### Tab 1 — Current Joint Owner

First Name, Last Name, Date of Birth, Social Security Number.

#### Tab 2 — New Joint Owner

Party Type, First Name, Middle Name, Last Name, Trust Name (unhidden), Date of Birth, SSN, Tax ID (EIN), Relationship to Owner.

#### Tab 3 — Address

Street Address, Apt/Suite, City, State, ZIP, Country.

#### Tab 4 — Confirmation

Effective Date, Reason for Change, Agent Notes, Witness Name, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Hidden | Required |
|---|---|---|
| FNWL | — | `ssn`, `dateOfBirth`, `relationship` |
| USAA | `middleName` | `dateOfBirth`, `relationship` |

---

### Annuitant Change

**ID:** `ANNUITANT_CHANGE` | **Task Type:** `INITIATE_ANNUITANTCHANGE_TRANSACTION` | **Version:** 1.0.0

Update the designated annuitant on a policy.

#### Tab 1 — Current Annuitant

First Name, Middle Name, Last Name, Date of Birth, SSN, Gender.

#### Tab 2 — New Annuitant

Party Type, First Name, Middle Name, Last Name, Date of Birth, SSN, Gender, Relationship to Owner.

#### Tab 3 — Address

Street Address, Apt/Suite, City, State, ZIP, Country.

#### Tab 4 — Confirmation

Effective Date, Reason for Change, Agent Notes, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required |
|---|---|
| FNWL | `ssn`, `dateOfBirth`, `gender`, `relationship` |

---

### Power of Attorney Change

**ID:** `POA_CHANGE` | **Task Type:** `DEFAULT_CASE_DATA_ENTRY` | **Version:** 1.0.0

Designate or update the power of attorney authorized to act on behalf of the policyholder.

#### Tab 1 — POA Agent Info

Party Type, First Name, Middle Name, Last Name, Date of Birth, Relationship to Owner.

#### Tab 2 — Contact

Phone Number, Phone Type, Email Address.

#### Tab 3 — Address

Street Address, Apt/Suite, City, State, ZIP, Country.

#### Tab 4 — Confirmation

Effective Date, Agent Notes, Witness Name, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required |
|---|---|
| FNWL | `dateOfBirth`, `relationship`, `phone` |
| USAA | `dateOfBirth` |

---

### Third Party Designee Change

**ID:** `TPD_CHANGE` | **Task Type:** `THIRD_PARTY_DETAIL` | **Version:** 1.0.0

Designate or update the third party authorized to receive policy notices on behalf of the policyholder.

> **Third Party Designee vs. Power of Attorney:** A TPD receives copies of lapse/cancellation notices only. A POA has broader authority to act on the policyholder's behalf.

#### Tab 1 — Current Designee

First Name, Last Name, Relationship to Owner.

#### Tab 2 — New Designee

Party Type, First Name, Middle Name, Last Name, Date of Birth, Relationship to Owner.

#### Tab 3 — Contact

Phone Number, Phone Type, Email Address.

#### Tab 4 — Address

Street Address, Apt/Suite, City, State, ZIP, Country.

#### Tab 5 — Confirmation

Effective Date, Agent Notes, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required |
|---|---|
| FNWL | `dateOfBirth`, `relationship`, `phone` |

---

## Financial Transactions

Financial transactions are grouped into two categories:

| Direction | Sub-type | Transaction ID |
|---|---|---|
| **Money In** | One-time payment | `ONE_TIME_PREMIUM` |
| **Money Out** | One-time partial | `PARTIAL_WITHDRAWAL` |
| **Money Out** | Full surrender | `FULL_SURRENDER` |

---

### Money In — One-Time Premium

**ID:** `ONE_TIME_PREMIUM` | **Task Type:** `OFTFormInputTask` | **Version:** 1.0.0

Submit a one-time premium payment to a policy.

#### Tab 1 — Payment Details

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Amount ($) | number | No | Yes |
| 1 | Payment Method | select | No | Yes |
| 2 | Effective Date | date | No | No |

Payment Method options: ACH / EFT, Check, Wire Transfer, 1035 Exchange.

#### Tab 2 — Bank Account

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Bank Name | string | No | No |
| 1 | Account Type | select | No | No |
| 2 | Routing Number | string | No | Yes |
| 3 | Account Number | string (masked) | No | Yes |

#### Tab 3 — Confirmation

Agent Notes, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required | Field-Level |
|---|---|---|
| FNWL | `bankName` | `transactionAmount` required |
| USAA | `bankName`, `bankAccountType` | — |

---

### Money Out — Partial Withdrawal (One-Time)

**ID:** `PARTIAL_WITHDRAWAL` | **Task Type:** `WithdrawalFormInputTask` | **Version:** 1.0.0

Request a one-time partial withdrawal from a policy.

#### Tab 1 — Withdrawal Details

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Amount ($) | number | No | Yes |
| 1 | Withdrawal Type | select | No | No |
| 2 | Payment Method | select | No | Yes |
| 3 | Effective Date | date | No | No |

Withdrawal Type options: Gross (before tax), Net (after tax).

#### Tab 2 — Tax Withholding

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Federal Withholding % | number | No | No |
| 1 | State Withholding % | number | No | No |

#### Tab 3 — Payee / Bank

Bank Name, Account Type, Routing Number, Account Number (masked).

#### Tab 4 — Confirmation

Reason for Change, Agent Notes, Attestation, Signature, Signature Date.

#### Carrier Overrides

| Carrier | Required | Read-Only | Field-Level |
|---|---|---|---|
| FNWL | `withdrawalType`, `federalWithholdingPct` | — | `reason` → "Reason for Withdrawal", required |
| USAA | `withdrawalType`, `bankName` | — | — |
| MASS | — | `effectiveDate` | — |

---

### Money Out — Full Surrender

**ID:** `FULL_SURRENDER` | **Task Type:** `WithdrawalFormInputTask` | **Version:** 1.0.0

Request a full surrender of a policy, liquidating all accumulated value.

#### Tab 1 — Surrender Details

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Reason for Surrender | select | No | Yes |
| 1 | Payment Method | select | No | Yes |
| 2 | Effective Date | date | No | No |

Surrender Reason options: Financial Hardship, Policy Replacement, Dissatisfied with Policy, Funds Needed, Other.

#### Tab 2 — Tax Withholding

Federal Withholding %, State Withholding %.

#### Tab 3 — Payee / Bank

Party Type, First Name, Last Name, Bank Name, Account Type, Routing Number, Account Number (masked).

#### Tab 4 — Confirmation

| Order | Field | Type | Required (paper) | Required (selfServe) |
|---|---|---|---|---|
| 0 | Agent Notes | textarea | No | Hidden |
| 1 | Witness Name | string | No | Hidden |
| 2 | Attestation | boolean | No | Yes |
| 3 | Signature | string | No | Yes |
| 4 | Signature Date | date | No | No |

#### Carrier Overrides

| Carrier | Required | Read-Only |
|---|---|---|
| FNWL | `surrenderReason`, `federalWithholdingPct`, `bankName` | — |
| USAA | `surrenderReason`, `bankName`, `bankAccountType` | — |
| MASS | `witnessName` | `effectiveDate` |
| SBGC | `federalWithholdingPct`, `stateWithholdingPct` | — |

---

## Field Registry

All fields available for use in any transaction. Fields are referenced by ID; changes to a field here propagate to every transaction that uses it.

Source: `apps/ops/src/lib/transaction-builder/field-registry.ts`

> **FieldType legend** — `string` `number` `boolean` `integer` `date` `email` `phone` `ssn` `currency` `percentage` `select` `multiselect` `radio` `textarea` `file` `attachment` `display` `calculated`

---

### Personal Information

| Field ID | Label | Type | Widget | Validation | selfServe default |
|---|---|---|---|---|---|
| `firstName` | First Name | string | TextWidget | minLength: 1, maxLength: 50 | Required |
| `middleName` | Middle Name | string | TextWidget | maxLength: 50 | — |
| `lastName` | Last Name | string | TextWidget | minLength: 1, maxLength: 50 | Required |
| `dateOfBirth` | Date of Birth | date | DateWidget | — | Required |
| `gender` | Gender | select | SelectWidget | M / F / X | — |
| `prefix` | Prefix | select | SelectWidget | Mr. / Mrs. / Ms. / Dr. / Rev. | — |
| `suffix` | Suffix | select | SelectWidget | Jr. / Sr. / II / III / IV / V | — |
| `trustName` | Trust Name | string | TextWidget | minLength: 1, maxLength: 100 | — |

### Identification

| Field ID | Label | Type | Widget | Validation | Notes |
|---|---|---|---|---|---|
| `ssn` | Social Security Number | ssn | NumbersWidget | `\d{3}-?\d{2}-?\d{4}` | Masked in UI |
| `taxId` | Tax ID (EIN) | string | TextWidget | `\d{2}-?\d{7}` | — |
| `driversLicense` | Driver's License Number | string | TextWidget | maxLength: 20 | — |

### Contact

| Field ID | Label | Type | Widget | Validation |
|---|---|---|---|---|
| `email` | Email Address | email | EmailWidget | RFC pattern |
| `phone` | Phone Number | phone | NumbersWidget | minLength: 10 |
| `phoneType` | Phone Type | select | SelectWidget | Home / Work / Mobile / Fax |

### Address

| Field ID | Label | Type | Widget | Validation | selfServe default |
|---|---|---|---|---|---|
| `addressLine1` | Street Address | string | TextWidget | minLength: 5, maxLength: 100 | Required |
| `addressLine2` | Apt / Suite / Unit | string | TextWidget | maxLength: 50 | — |
| `city` | City | string | TextWidget | minLength: 2, maxLength: 50 | Required |
| `state` | State | select | SelectWidget | All 50 US states | Required |
| `zipCode` | ZIP Code | string | TextWidget | `\d{5}(-\d{4})?` | Required |
| `country` | Country | select | SelectWidget | US / CA / MX | — |

### Party / Role

| Field ID | Label | Type | Widget | Options / Validation |
|---|---|---|---|---|
| `partyRole` | Party Role | select | PartyRoleWidget | Owner, Joint Owner, Primary Beneficiary, Contingent Beneficiary, Payee, Assignee, Annuitant, Insured |
| `partyType` | Party Type | select | SelectWidget | Person / Organization / Trust |
| `relationship` | Relationship to Owner | select | SelectWidget | Spouse, Child, Parent, Sibling, Grandchild, Grandparent, Domestic Partner, Other |
| `allocationPercentage` | Allocation % | number | AllocationPercentageWidget | min: 0, max: 100 — validates total = 100% |
| `agentCommissionPct` | Agent Commission % | percentage | AgentPercentageWidget | min: 0, max: 100 |

### Banking

| Field ID | Label | Type | Widget | Validation | Notes |
|---|---|---|---|---|---|
| `bankName` | Bank Name | string | TextWidget | minLength: 2, maxLength: 100 | — |
| `bankAccountNumber` | Account Number | string | TextWidget | minLength: 4, maxLength: 20 | Masked on blur |
| `bankRoutingNumber` | Routing Number | string | TextWidget | `\d{9}` | Masked on blur |
| `bankAccountType` | Account Type | select | RadioWidget | Checking / Savings | — |
| `nameOnAccount` | Name on Account | string | TextWidget | minLength: 1, maxLength: 100 | — |
| `reenterAccountNumber` | Re-enter Account Number | string | TextWidget | minLength: 4, maxLength: 20 | Masked; copy/paste disabled |
| `reenterRoutingNumber` | Re-enter Routing Number | string | TextWidget | `\d{9}` | Copy/paste disabled |

### Policy

| Field ID | Label | Type | Widget | Notes |
|---|---|---|---|---|
| `policyNumber` | Policy Number | string | TextWidget | Read-only in both personas |
| `effectiveDate` | Effective Date | date | DateWidget | — |
| `witnessName` | Witness Name | string | TextWidget | Hidden in selfServe |
| `taxQualification` | Tax Qualification | radio | RadioWidget | Qualified / Non-Qualified |
| `qualifiedPlanType` | Qualified Plan Type | select | SelectWidget | Traditional IRA, Roth IRA, 401(k), 403(b), SEP IRA, SIMPLE IRA, Other |
| `distributionCode` | Distribution Code (1099-R) | select | SelectWidget | Codes 1, 2, 3, 4, 7, Q, T |
| `communicationPreference` | Communication Preference | select | SelectWidget | Email / Mail / Phone |
| `policyStatus` | Policy Status | display | ValueWidget | Read-only display |
| `policyValue` | Policy Value | display | ValueWidget | Read-only, currency-formatted display |

### Financial

| Field ID | Label | Type | Widget | Validation | Notes |
|---|---|---|---|---|---|
| `transactionAmount` | Amount ($) | currency | CurrencyWidget | min: 0 | selfServe required |
| `paymentMethod` | Payment Method | select | SelectWidget | ACH/EFT, Check, Wire Transfer, 1035 Exchange | selfServe required |
| `withdrawalType` | Withdrawal Type | select | SelectWidget | Gross (before tax) / Net (after tax) | — |
| `surrenderReason` | Reason for Surrender | select | SelectWidget | Financial Hardship, Policy Replacement, Dissatisfied, Funds Needed, Other | — |
| `federalWithholdingPct` | Federal Withholding % | number | NumbersWidget | 0–100 | — |
| `stateWithholdingPct` | State Withholding % | number | NumbersWidget | 0–100 | — |
| `loanAmount` | Loan Amount ($) | currency | NumbersWidget | min: 0 | selfServe required |
| `interestRate` | Interest Rate (%) | percentage | NumbersWidget | 0–100 | — |
| `calculatedTotal` | Calculated Total | calculated | ArithmeticOperationWidget | — | Read-only auto-computed |

### Notes

| Field ID | Label | Type | Widget | Validation | Notes |
|---|---|---|---|---|---|
| `notes` | Notes | textarea | NotesWidget | maxLength: 2000 | Timestamped with user tracking |
| `agentNotes` | Agent Notes | textarea | ProcessorNotesWidget | maxLength: 2000 | Hidden in selfServe |
| `reason` | Reason for Change | textarea | TextareaWidget | maxLength: 500 | — |

### Documents

| Field ID | Label | Type | Widget | Accepted Formats | Notes |
|---|---|---|---|---|---|
| `documentUpload` | Document Upload | file | FileWidget | pdf, doc, docx, png, jpg | Generic upload |
| `voidedCheck` | Voided Check | attachment | AttachmentWidget | pdf, png, jpg | `documentType: VOIDED_CHECK` |
| `governmentId` | Government-Issued ID | attachment | AttachmentWidget | pdf, png, jpg | `documentType: GOVERNMENT_ID` |
| `signedForm` | Signed Form / Paper Document | attachment | AttachmentWidget | pdf | `documentType: SIGNED_FORM` |
| `powerOfAttorneyDocument` | Power of Attorney Document | attachment | AttachmentWidget | pdf | `documentType: POA_DOCUMENT`; selfServe required |

### Display

| Field ID | Label | Type | Widget | Notes |
|---|---|---|---|---|
| `sectionHeader` | Section Header | display | TitleWidget | Non-input section divider |
| `externalLink` | External Link | display | HyperLinkWidget | Clickable URL with icon |
| `transactionSummary` | Transaction Summary | display | SummaryWidget | Read-only review panel |

### Confirmation

| Field ID | Label | Type | Widget | Notes |
|---|---|---|---|---|
| `signatureType` | Signature Type | radio | RadioWidget | Wet Signature / Electronic Signature |
| `isDifferentPayee` | Use a Different Payee or Address | boolean | CheckboxWidget | Toggle for alternate payee flow |
| `communicationPreferenceChange` | Update Communication Preferences | boolean | CheckboxWidget | — |
| `isSigned` | Document is Signed | boolean | CheckboxWidget | Confirmation check |

### Signature

| Field ID | Label | Type | Widget | selfServe default |
|---|---|---|---|---|
| `signature` | Signature | string | TextWidget | Required |
| `signatureDate` | Signature Date | date | DateWidget | — |
| `attestation` | I certify the information above is accurate | boolean | CheckboxWidget | Required |

---

## Widgets Reference

All widgets are registered in `apps/ops/src/components/dynamic-form/customization/widgets/widgets.ts`. The knowledge base (`apps/ops/src/lib/transaction-builder/knowledge-base.ts`) contains metadata, default schemas, and configurable options for each.

### Basic Widgets

| Widget | Display Name | Schema Type | Key Options |
|---|---|---|---|
| `TextWidget` | Text Input | string | `placeholder`, `maxLength`, `minLength`, `pattern` |
| `TextareaWidget` | Text Area | string | `placeholder`, `rows`, `maxLength` |
| `NumbersWidget` | Number Input | number | `minimum`, `maximum`, `multipleOf`, `isPhone`, `pattern` |
| `EmailWidget` | Email Input | string | `placeholder` |
| `ValueWidget` | Read-only Value | string | `dataType`, `format` (currency/badge/boolean) — always `ui:readonly` |

### Selection Widgets

| Widget | Display Name | Schema Type | Key Options |
|---|---|---|---|
| `SelectWidget` | Dropdown Select | string / array | `enumOptions`, `multiple`, `placeholder`, `apiProps`, `events` |
| `RadioWidget` | Radio Buttons | string | `enumOptions`, `inline` |
| `CheckboxWidget` | Single Checkbox | boolean | `label` |
| `CheckboxesWidget` | Checkbox Group | array | `enumOptions`, `inline`, `customOptions` |
| `CheckBoxesSelectWidget` | Checkboxes with Select | array | `enumOptions` — for nested category/sub-reason patterns |

### Date Widgets

| Widget | Display Name | Notes |
|---|---|---|
| `DateWidget` | Date Picker | Standard calendar picker |
| `DateWidgetV2` | Date Picker V2 | Enhanced UX — recommended for new forms. Options: `minDate`, `maxDate`, `disablePast`, `disableFuture` |

### File / Document Widgets

| Widget | Display Name | Schema Type | Key Options |
|---|---|---|---|
| `FileWidget` | File Upload | string (format: data-url) | `accept`, `maxSize`, `multiple`, `standaloneBehavior` |
| `AttachmentWidget` | Attachment | string | `documentType`, `accept`, `multiple` — stores managed document references |

### Custom / Domain Widgets

| Widget | Display Name | Schema Type | Description |
|---|---|---|---|
| `NotesWidget` | Notes | string | Timestamped notes with user tracking; integrates with task update API |
| `ProcessorNotesWidget` | Processor Notes | string | Read-only processor comments with link to task sidebar |
| `AllocationPercentageWidget` | Allocation % | number | Validates all allocations sum to 100%; supports Payee, Primary & Contingent Beneficiary roles |
| `AgentPercentageWidget` | Agent Percentage | number | Commission split with role-based validation (Primary Writing / Servicing Agent) |
| `ArithmeticOperationWidget` | Calculated Value | number | Auto-computes from other form fields; config: `operation`, `field1`, `field2` |
| `PartyRoleWidget` | Party Role | string | Enforces per-role instance limits; config: `maxPerRole`, `validationMessage` |
| `HyperLinkWidget` | Hyperlink | string | Clickable links with optional icon; `type: 'link'` or `'action'` |

### Display / Layout Widgets

| Widget | Display Name | Schema Type | Description |
|---|---|---|---|
| `TitleWidget` | Section Title | string | Non-input section header |
| `SummaryWidget` | Summary Display | object | Review panel summarising form data; config: `fields` |
| `AgentTransactionAccordion` | Agent Transaction Accordion | object | Expandable accordion for agent change items |
| `BeneTransactionAccordion` | Beneficiary Transaction Accordion | object | Expandable accordion for beneficiary change items |

---

## Templates Reference

Templates control layout. Set on the uiSchema with `ui:ObjectFieldTemplate` or `ui:ArrayFieldTemplate`.

Source: `apps/ops/src/lib/transaction-builder/knowledge-base.ts`

### Object Templates (`ui:ObjectFieldTemplate`)

| Template | Description | Example Uses |
|---|---|---|
| `ObjectFieldTemplate` | Default stacked layout | Standard form section |
| `ObjectRowFieldTemplate` | Horizontal row layout | Inline / compact fields |
| `CardTemplate` | Card with icon, title, subtitle | Party information, Beneficiary card |
| `PartyCardFieldTemplate` | Party-specific card | Owner, Beneficiary, Agent |
| `AddressFieldTemplate` | Address-aware layout | Mailing / physical address |
| `ChangeAddressTemplate` | Before/after address layout | Address change workflow |
| `DifferenceTemplate` | Old vs new value comparison | Change review |
| `TransactionSummaryTemplate` | Transaction detail summary | Payment summary, review step |
| `InstructionsTemplate` | Help / informational text | Form instructions |

### Array Templates (`ui:ArrayFieldTemplate`)

| Template | Description | Example Uses |
|---|---|---|
| `ArrayFieldTemplate` | Default list with add/remove | Simple item lists |
| `ArrayFieldTableTemplate` | Table-style rows | Fund list, data tables |
| `TransactionsArrayFieldTemplate` | Specialised transaction list | Transaction history |
| `TransactionAccordionTemplate` | Expandable accordion items | Collapsible transaction items |
| `PartyInfoListTemplate` | Party list with cards | Beneficiaries list, owners list |
| `TextListTemplate` | Plain text item list | Notes list, simple enumerations |

### Field / Title Templates

| Template | Key | Description |
|---|---|---|
| `FieldTemplate` | `ui:FieldTemplate` | Default label + input wrapper; options: `classNames`, `displayLabel` |
| `TitleFieldTemplate` | `ui:TitleFieldTemplate` | Section/field title rendering |
| `FieldErrorTemplate` | `ui:FieldErrorTemplate` | Inline validation error display |

### Custom RJSF Fields (`ui:field`)

| Field | Description |
|---|---|
| `AutoCompleteField` | Text input with typeahead suggestions |
| `DocumentMetadataField` | View/edit document metadata object |
| `UUIDField` | Auto-generated UUID (hidden input) |

---

## Carrier Overrides Reference

Consolidated view of all carrier rules across all transactions.

| Carrier | Transaction | Hidden | Required | Read-Only | Field-Level |
|---|---|---|---|---|---|
| USAA | `ADDRESS_CHANGE` | — | `reason` | — | — |
| MASS | `ADDRESS_CHANGE` | — | — | `country` | — |
| FNWL | `BENE_CHANGE` | — | `ssn`, `dateOfBirth` (+ `relationship` selfServe) | — | — |
| SBGC | `BENE_CHANGE` | `middleName` | `allocationPercentage` | — | — |
| USAA | `PAYEE_CHANGE` | `middleName` | `relationship`, `dateOfBirth` | — | — |
| FNWL | `PAYEE_CHANGE` | — | `trustName` | — | `reason` label + required |
| MASS | `PAYEE_CHANGE` | — | — | `effectiveDate` | — |
| FNWL | `BANK_CHANGE` | — | `bankName` | — | — |
| USAA | `BANK_CHANGE` (selfServe) | — | `bankName` | — | — |
| FNWL | `OWNER_CHANGE` | — | `ssn`, `dateOfBirth`, `relationship` | — | `reason` label + required |
| USAA | `OWNER_CHANGE` | — | `dateOfBirth`, `relationship` | — | — |
| FNWL | `JOINT_OWNER_CHANGE` | — | `ssn`, `dateOfBirth`, `relationship` | — | — |
| USAA | `JOINT_OWNER_CHANGE` | `middleName` | `dateOfBirth`, `relationship` | — | — |
| FNWL | `ANNUITANT_CHANGE` | — | `ssn`, `dateOfBirth`, `gender`, `relationship` | — | — |
| FNWL | `POA_CHANGE` | — | `dateOfBirth`, `relationship`, `phone` | — | — |
| USAA | `POA_CHANGE` | — | `dateOfBirth` | — | — |
| FNWL | `TPD_CHANGE` | — | `dateOfBirth`, `relationship`, `phone` | — | — |
| FNWL | `ONE_TIME_PREMIUM` | — | `bankName`, `transactionAmount` | — | — |
| USAA | `ONE_TIME_PREMIUM` | — | `bankName`, `bankAccountType` | — | — |
| FNWL | `PARTIAL_WITHDRAWAL` | — | `withdrawalType`, `federalWithholdingPct` | — | `reason` label + required |
| USAA | `PARTIAL_WITHDRAWAL` | — | `withdrawalType`, `bankName` | — | — |
| MASS | `PARTIAL_WITHDRAWAL` | — | — | `effectiveDate` | — |
| FNWL | `FULL_SURRENDER` | — | `surrenderReason`, `federalWithholdingPct`, `bankName` | — | — |
| USAA | `FULL_SURRENDER` | — | `surrenderReason`, `bankName`, `bankAccountType` | — | — |
| MASS | `FULL_SURRENDER` | — | `witnessName` | `effectiveDate` | — |
| SBGC | `FULL_SURRENDER` | — | `federalWithholdingPct`, `stateWithholdingPct` | — | — |

---

## Adding a New Transaction

1. Go to `/transaction-builder` and click **New Transaction**.
2. Set ID (e.g. `LOAN_CHANGE`), label, description, and task type.
3. In the editor, add tabs and drag fields from the **Field Registry** sidebar.
4. Toggle between **Paper** and **Self-Serve** personas to verify field behavior.
5. Open **Carrier Config** to add carrier-specific overrides.
6. Use the **Export** tab to copy the `FormMetadata`-compatible JSON for integration.

## Adding a New Field to the Registry

Edit `apps/ops/src/lib/transaction-builder/field-registry.ts` and add an entry to `DEFAULT_FIELD_REGISTRY`. The field is immediately available in the builder and all schema compositions.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/transaction-builder/definitions` | List all transaction definitions |
| POST | `/api/transaction-builder/definitions` | Create a new transaction |
| GET | `/api/transaction-builder/definitions/[id]` | Get a single transaction |
| PUT | `/api/transaction-builder/definitions/[id]` | Update a transaction |
| DELETE | `/api/transaction-builder/definitions/[id]` | Delete a transaction |
| GET | `/api/transaction-builder/fields` | Get the full field registry |
| POST | `/api/transaction-builder/compose` | Compose a schema `{ transactionId, persona, carrierId? }` |
| POST | `/api/transaction-builder/infer-from-pdf` | Infer a transaction schema from a PDF upload |
