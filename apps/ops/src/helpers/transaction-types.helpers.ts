import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { SchemaEnum as TransactionTypeSchemaEnum } from '@zinnia/api-types/types/sor';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

export const PeopleChangeTransactionTypes = [
    TransactionTypeSchemaEnum.ADDRESS_CHANGE as TransactionTypeSchemaEnum,
    TransactionTypeSchemaEnum.EMAIL_CHANGE as TransactionTypeSchemaEnum,
    TransactionTypeSchemaEnum.PHONE_NUMBER_CHANGE as TransactionTypeSchemaEnum,
    TransactionTypeSchemaEnum.BANK_ACCOUNT_CHANGE as TransactionTypeSchemaEnum,
];

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as TransactionTypeSchemaEnum,
    MissingTransactionTypes.FundAllocationsChange as unknown as TransactionTypeSchemaEnum,
    MissingTransactionTypes.FundTransfer as unknown as TransactionTypeSchemaEnum,
];

export const allTransactionTypes = [
    ...Object.values(TransactionTypeSchemaEnum),
    ...TransactionTypesNotInTheSpecYet,
];

const addressTransactions = [
    TransactionTypeSchemaEnum.ADDRESS_CHANGE,
    TransactionTypeSchemaEnum.PREFERRED_MAILING_ADDRESS_CHANGE,
];
const bankAccountTransactions = [TransactionTypeSchemaEnum.BANK_ACCOUNT_CHANGE];
const beneficiaryTransactions = [TransactionTypeSchemaEnum.BENEFICIARY_CHANGE];
const communicationPreferenceTransactions = [
    TransactionTypeSchemaEnum.COMMUNICATION_PREFERENCE_CHANGE,
];
const emailTransactions = [TransactionTypeSchemaEnum.EMAIL_CHANGE];
const nameTransactions = [TransactionTypeSchemaEnum.EXISTING_PARTY_NAME_CHANGE];
const phoneNumberTransactions = [TransactionTypeSchemaEnum.PHONE_NUMBER_CHANGE];
const roleTransactions = [
    TransactionTypeSchemaEnum.OWNER_CHANGE,
    TransactionTypeSchemaEnum.PAYEE_CHANGE,
    TransactionTypeSchemaEnum.PAYOR_CHANGE,
];
const tpdTransactions = [TransactionTypeSchemaEnum.TPD_CHANGE];

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
    TransactionTypeSchemaEnum.ANNIVERSARY,
    TransactionTypeSchemaEnum.LAPSE_ASSESSMENT,
    TransactionTypeSchemaEnum.MATCH_BONUS_VESTING,
];
const coverageTransactions = [
    TransactionTypeSchemaEnum.CANCEL_NO_PREMIUM,
    TransactionTypeSchemaEnum.DEATH_CLAIM,
];
const feesTransactions = [
    TransactionTypeSchemaEnum.COST_OF_INSURANCE,
    TransactionTypeSchemaEnum.EXPENSE_CHARGE,
    TransactionTypeSchemaEnum.INTEREST_CREDIT,
    TransactionTypeSchemaEnum.INTEREST_CREDIT_LOAN,
    TransactionTypeSchemaEnum.INTEREST_CREDIT_MATCH,
    TransactionTypeSchemaEnum.INTEREST_LOAN,
    TransactionTypeSchemaEnum.UNIT_EXPENSE_CHARGE,
];
const keyDateTransaction = [
    TransactionTypeSchemaEnum.ACTIVATION,
    TransactionTypeSchemaEnum.CONVERSION_ACTIVATION,
    TransactionTypeSchemaEnum.DELIVERY_DATE_SETUP,
    TransactionTypeSchemaEnum.FACE_AMOUNT_CHANGE,
    TransactionTypeSchemaEnum.FACE_AMOUNT_DECREASE,
    TransactionTypeSchemaEnum.FACE_AMOUNT_INCREASE,
    TransactionTypeSchemaEnum.FORCE_OUT,
    TransactionTypeSchemaEnum.FREE_LOOK_EXPIRATION,
    TransactionTypeSchemaEnum.ISSUANCE,
    TransactionTypeSchemaEnum.LAPSE,
    TransactionTypeSchemaEnum.NOTIFICATION_OF_DEATH_CLAIM,
    TransactionTypeSchemaEnum.REINSTATEMENT,
    TransactionTypeSchemaEnum.REINSTATEMENT_APPROVED,
    TransactionTypeSchemaEnum.VALUE_ADJUSTMENT,
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
    TransactionTypeSchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeSchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const withdrawalFinancialTransactions = [
    ...withdrawalDetailsTransactions,
    TransactionTypeSchemaEnum.FULL_SURRENDER,
    TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION,
];

const loanTransactions = [
    TransactionTypeSchemaEnum.LOAN_REPAYMENT_ONE_TIME,
    TransactionTypeSchemaEnum.NEW_LOAN,
    TransactionTypeSchemaEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
    TransactionTypeSchemaEnum.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT,
    TransactionTypeSchemaEnum.SYSTEMATIC_LOAN_REPAYMENT,
];

const premiumTransactions = [
    TransactionTypeSchemaEnum.INITIAL_PREMIUM,
    TransactionTypeSchemaEnum.ONE_TIME_PREMIUM,
    TransactionTypeSchemaEnum.PAYMENT_INITIAL_PREMIUM,
    TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
    TransactionTypeSchemaEnum.SUBSEQUENT_PAYMENT,
    TransactionTypeSchemaEnum.SUBSEQUENT_PREMIUM,
];
const systematicProgramTransactions = [
    TransactionTypeSchemaEnum.SYSTEMATIC_PROGRAM_UPDATE,
    TransactionTypeSchemaEnum.SYSTEMATIC_LOAN_REPAYMENT_SETUP,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
];

const withdrawalTransactions = [
    TransactionTypeSchemaEnum.CLAIM_PAYOUT,
    TransactionTypeSchemaEnum.DISBURSEMENT,
    TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION,
    TransactionTypeSchemaEnum.FULL_SURRENDER,
    TransactionTypeSchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeSchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeSchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeSchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
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
