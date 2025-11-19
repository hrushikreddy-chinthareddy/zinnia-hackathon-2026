import { TransactionType } from '@zinnia/api-types/types/sor';

import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

export const PeopleChangeTransactionTypes = [
    TransactionType.ADDRESS_CHANGE as TransactionType,
    TransactionType.EMAIL_CHANGE as TransactionType,
    TransactionType.PHONE_NUMBER_CHANGE as TransactionType,
    TransactionType.BANK_ACCOUNT_CHANGE as TransactionType,
];

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as TransactionType,
    MissingTransactionTypes.FundAllocationsChange as unknown as TransactionType,
    MissingTransactionTypes.FundTransfer as unknown as TransactionType,
];

export const allTransactionTypes = [
    ...Object.values(TransactionType),
    ...TransactionTypesNotInTheSpecYet,
];

const addressTransactions = [
    TransactionType.ADDRESS_CHANGE,
    TransactionType.PREFERRED_MAILING_ADDRESS_CHANGE,
];
const bankAccountTransactions = [TransactionType.BANK_ACCOUNT_CHANGE];
const beneficiaryTransactions = [TransactionType.BENEFICIARY_CHANGE];
const communicationPreferenceTransactions = [
    TransactionType.COMMUNICATION_PREFERENCE_CHANGE,
];
const emailTransactions = [TransactionType.EMAIL_CHANGE];
const nameTransactions = [TransactionType.EXISTING_PARTY_NAME_CHANGE];
const phoneNumberTransactions = [TransactionType.PHONE_NUMBER_CHANGE];
const roleTransactions = [
    TransactionType.OWNER_CHANGE,
    TransactionType.PAYEE_CHANGE,
    TransactionType.PAYOR_CHANGE,
];
const tpdTransactions = [TransactionType.TPDCHANGE];

export const peopleTransactions = {
    [PeopleFilters.Address]: addressTransactions,
    [PeopleFilters.BankAccount]: bankAccountTransactions,
    [PeopleFilters.Beneficiary]: beneficiaryTransactions,
    [PeopleFilters.CommunicationPreference]:
        communicationPreferenceTransactions,
    [PeopleFilters.Email]: emailTransactions,
    [PeopleFilters.Name]: nameTransactions,
    [PeopleFilters.Phone]: phoneNumberTransactions,
    [PeopleFilters.Role]: roleTransactions,
    [PeopleFilters.TPD]: tpdTransactions,
    all: [
        ...addressTransactions,
        ...bankAccountTransactions,
        ...beneficiaryTransactions,
        ...communicationPreferenceTransactions,
        ...emailTransactions,
        ...nameTransactions,
        ...phoneNumberTransactions,
        ...roleTransactions,
        ...tpdTransactions,
    ],
};

const anniversaryTransactions = [
    TransactionType.ANNIVERSARY,
    TransactionType.LAPSE_ASSESSMENT,
    TransactionType.MATCH_BONUS_VESTING,
];
const coverageTransactions = [
    TransactionType.CANCEL_NO_PREMIUM,
    TransactionType.DEATH_CLAIM,
];
const feesTransactions = [
    TransactionType.COST_OF_INSURANCE,
    TransactionType.EXPENSE_CHARGE,
    TransactionType.INTEREST_CREDIT,
    TransactionType.INTEREST_CREDIT_LOAN,
    TransactionType.INTEREST_CREDIT_MATCH,
    TransactionType.INTEREST_LOAN,
    TransactionType.UNIT_EXPENSE_CHARGE,
];
const keyDateTransaction = [
    TransactionType.ACTIVATION,
    TransactionType.CONVERSION_ACTIVATION,
    TransactionType.DELIVERY_DATE_SETUP,
    TransactionType.FACE_AMOUNT_CHANGE,
    TransactionType.FACE_AMOUNT_DECREASE,
    TransactionType.FACE_AMOUNT_INCREASE,
    TransactionType.FORCE_OUT,
    TransactionType.FREE_LOOK_EXPIRATION,
    TransactionType.ISSUANCE,
    TransactionType.LAPSE,
    TransactionType.NOTIFICATION_OF_DEATH_CLAIM,
    TransactionType.REINSTATEMENT,
    TransactionType.REINSTATEMENT_APPROVED,
    TransactionType.VALUE_ADJUSTMENT,
];

export const policyTransactions = {
    [PolicyFilters.Anniversary]: anniversaryTransactions,
    [PolicyFilters.Coverage]: coverageTransactions,
    [PolicyFilters.Fees]: feesTransactions,
    [PolicyFilters.KeyDates]: keyDateTransaction,
    all: [
        ...anniversaryTransactions,
        ...coverageTransactions,
        ...feesTransactions,
        ...keyDateTransaction,
    ],
};

export const withdrawalDetailsTransactions = [
    TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const withdrawalFinancialTransactions = [
    ...withdrawalDetailsTransactions,
    TransactionType.FULL_SURRENDER,
    TransactionType.FREE_LOOK_CANCELLATION,
];

const loanTransactions = [
    TransactionType.LOAN_REPAYMENT_ONE_TIME,
    TransactionType.NEW_LOAN,
    TransactionType.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
    TransactionType.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT,
    TransactionType.SYSTEMATIC_LOAN_REPAYMENT,
];

const premiumTransactions = [
    TransactionType.INITIAL_PREMIUM,
    TransactionType.ONE_TIME_PREMIUM,
    TransactionType.PAYMENT_INITIAL_PREMIUM,
    TransactionType.PAYMENT_ONE_TIME_PREMIUM,
    TransactionType.SUBSEQUENT_PAYMENT,
    TransactionType.SUBSEQUENT_PREMIUM,
];
const systematicProgramTransactions = [
    TransactionType.SYSTEMATIC_PROGRAM_UPDATE,
    TransactionType.SYSTEMATIC_LOAN_REPAYMENT_SETUP,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
];

const withdrawalTransactions = [
    TransactionType.CLAIM_PAYOUT,
    TransactionType.DISBURSEMENT,
    TransactionType.FREE_LOOK_CANCELLATION,
    TransactionType.FULL_SURRENDER,
    TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const financialTransactions = {
    [TransactionFilters.Loans]: loanTransactions,
    [TransactionFilters.Premiums]: premiumTransactions,
    [TransactionFilters.SystematicPrograms]: systematicProgramTransactions,
    [TransactionFilters.Withdrawals]: withdrawalTransactions,
    all: [
        ...loanTransactions,
        ...premiumTransactions,
        ...systematicProgramTransactions,
        ...withdrawalTransactions,
    ],
};

export const allTransactions = {
    [EventFilterKeys.Transactions]: financialTransactions,
    [EventFilterKeys.Policy]: policyTransactions,
    [EventFilterKeys.People]: peopleTransactions,
    all: [
        ...financialTransactions.all,
        ...policyTransactions.all,
        ...peopleTransactions.all,
    ],
} as const;
