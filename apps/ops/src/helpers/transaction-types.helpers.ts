import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { SchemaEnum } from '@zinnia/api-types/types/sor';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

export const PeopleChangeTransactionTypes = [
    SchemaEnum.ADDRESS_CHANGE as SchemaEnum,
    SchemaEnum.EMAIL_CHANGE as SchemaEnum,
    SchemaEnum.PHONE_NUMBER_CHANGE as SchemaEnum,
    SchemaEnum.BANK_ACCOUNT_CHANGE as SchemaEnum,
];

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as SchemaEnum,
    MissingTransactionTypes.FundAllocationsChange as unknown as SchemaEnum,
    MissingTransactionTypes.FundTransfer as unknown as SchemaEnum,
];

export const allTransactionTypes = [
    ...Object.values(SchemaEnum),
    ...TransactionTypesNotInTheSpecYet,
];

const addressTransactions = [
    SchemaEnum.ADDRESS_CHANGE,
    SchemaEnum.PREFERRED_MAILING_ADDRESS_CHANGE,
];
const bankAccountTransactions = [SchemaEnum.BANK_ACCOUNT_CHANGE];
const beneficiaryTransactions = [SchemaEnum.BENEFICIARY_CHANGE];
const communicationPreferenceTransactions = [
    SchemaEnum.COMMUNICATION_PREFERENCE_CHANGE,
];
const emailTransactions = [SchemaEnum.EMAIL_CHANGE];
const nameTransactions = [SchemaEnum.EXISTING_PARTY_NAME_CHANGE];
const phoneNumberTransactions = [SchemaEnum.PHONE_NUMBER_CHANGE];
const roleTransactions = [
    SchemaEnum.OWNER_CHANGE,
    SchemaEnum.PAYEE_CHANGE,
    SchemaEnum.PAYOR_CHANGE,
];
const tpdTransactions = [SchemaEnum.TPD_CHANGE];

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
    SchemaEnum.ANNIVERSARY,
    SchemaEnum.LAPSE_ASSESSMENT,
    SchemaEnum.MATCH_BONUS_VESTING,
];
const coverageTransactions = [
    SchemaEnum.CANCEL_NO_PREMIUM,
    SchemaEnum.DEATH_CLAIM,
];
const feesTransactions = [
    SchemaEnum.COST_OF_INSURANCE,
    SchemaEnum.EXPENSE_CHARGE,
    SchemaEnum.INTEREST_CREDIT,
    SchemaEnum.INTEREST_CREDIT_LOAN,
    SchemaEnum.INTEREST_CREDIT_MATCH,
    SchemaEnum.INTEREST_LOAN,
    SchemaEnum.UNIT_EXPENSE_CHARGE,
];
const keyDateTransaction = [
    SchemaEnum.ACTIVATION,
    SchemaEnum.CONVERSION_ACTIVATION,
    SchemaEnum.DELIVERY_DATE_SETUP,
    SchemaEnum.FACE_AMOUNT_CHANGE,
    SchemaEnum.FACE_AMOUNT_DECREASE,
    SchemaEnum.FACE_AMOUNT_INCREASE,
    SchemaEnum.FORCE_OUT,
    SchemaEnum.FREE_LOOK_EXPIRATION,
    SchemaEnum.ISSUANCE,
    SchemaEnum.LAPSE,
    SchemaEnum.NOTIFICATION_OF_DEATH_CLAIM,
    SchemaEnum.REINSTATEMENT,
    SchemaEnum.REINSTATEMENT_APPROVED,
    SchemaEnum.VALUE_ADJUSTMENT,
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
    SchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    SchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const withdrawalFinancialTransactions = [
    ...withdrawalDetailsTransactions,
    SchemaEnum.FULL_SURRENDER,
    SchemaEnum.FREE_LOOK_CANCELLATION,
];

const loanTransactions = [
    SchemaEnum.LOAN_REPAYMENT_ONE_TIME,
    SchemaEnum.NEW_LOAN,
    SchemaEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
    SchemaEnum.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT,
    SchemaEnum.SYSTEMATIC_LOAN_REPAYMENT,
];

const premiumTransactions = [
    SchemaEnum.INITIAL_PREMIUM,
    SchemaEnum.ONE_TIME_PREMIUM,
    SchemaEnum.PAYMENT_INITIAL_PREMIUM,
    SchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
    SchemaEnum.SUBSEQUENT_PAYMENT,
    SchemaEnum.SUBSEQUENT_PREMIUM,
];
const systematicProgramTransactions = [
    SchemaEnum.SYSTEMATIC_PROGRAM_UPDATE,
    SchemaEnum.SYSTEMATIC_LOAN_REPAYMENT_SETUP,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
];

const withdrawalTransactions = [
    SchemaEnum.CLAIM_PAYOUT,
    SchemaEnum.DISBURSEMENT,
    SchemaEnum.FREE_LOOK_CANCELLATION,
    SchemaEnum.FULL_SURRENDER,
    SchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    SchemaEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    SchemaEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    SchemaEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
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
