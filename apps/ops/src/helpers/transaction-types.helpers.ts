import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { TransactionTypeEnum } from '@zinnia/api-types/types/sor';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

export const PeopleChangeTransactionTypes = [
    TransactionTypeEnum.ADDRESS_CHANGE as TransactionTypeEnum,
    TransactionTypeEnum.EMAIL_CHANGE as TransactionTypeEnum,
    TransactionTypeEnum.PHONE_NUMBER_CHANGE as TransactionTypeEnum,
    TransactionTypeEnum.BANK_ACCOUNT_CHANGE as TransactionTypeEnum,
];

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as TransactionTypeEnum,
    MissingTransactionTypes.FundAllocationsChange as unknown as TransactionTypeEnum,
    MissingTransactionTypes.FundTransfer as unknown as TransactionTypeEnum,
];

export const allTransactionTypes = [
    ...Object.values(TransactionTypeEnum),
    ...TransactionTypesNotInTheSpecYet,
];

const addressTransactions = [
    TransactionTypeEnum.ADDRESS_CHANGE,
    TransactionTypeEnum.PREFERRED_MAILING_ADDRESS_CHANGE,
];
const bankAccountTransactions = [TransactionTypeEnum.BANK_ACCOUNT_CHANGE];
const beneficiaryTransactions = [TransactionTypeEnum.BENEFICIARY_CHANGE];
const communicationPreferenceTransactions = [
    TransactionTypeEnum.COMMUNICATION_PREFERENCE_CHANGE,
];
const emailTransactions = [TransactionTypeEnum.EMAIL_CHANGE];
const nameTransactions = [TransactionTypeEnum.EXISTING_PARTY_NAME_CHANGE];
const phoneNumberTransactions = [TransactionTypeEnum.PHONE_NUMBER_CHANGE];
const roleTransactions = [
    TransactionTypeEnum.OWNER_CHANGE,
    TransactionTypeEnum.PAYEE_CHANGE,
    TransactionTypeEnum.PAYOR_CHANGE,
];
const tpdTransactions = [TransactionTypeEnum.TPD_CHANGE];

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
    TransactionTypeEnum.ANNIVERSARY,
    TransactionTypeEnum.LAPSE_ASSESSMENT,
    TransactionTypeEnum.MATCH_BONUS_VESTING,
];
const coverageTransactions = [
    TransactionTypeEnum.CANCEL_NO_PREMIUM,
    TransactionTypeEnum.DEATH_CLAIM,
];
const feesTransactions = [
    TransactionTypeEnum.COST_OF_INSURANCE,
    TransactionTypeEnum.EXPENSE_CHARGE,
    TransactionTypeEnum.INTEREST_CREDIT,
    TransactionTypeEnum.INTEREST_CREDIT_LOAN,
    TransactionTypeEnum.INTEREST_CREDIT_MATCH,
    TransactionTypeEnum.INTEREST_LOAN,
    TransactionTypeEnum.UNIT_EXPENSE_CHARGE,
];
const keyDateTransaction = [
    TransactionTypeEnum.ACTIVATION,
    TransactionTypeEnum.CONVERSION_ACTIVATION,
    TransactionTypeEnum.DELIVERY_DATE_SETUP,
    TransactionTypeEnum.FACE_AMOUNT_CHANGE,
    TransactionTypeEnum.FACE_AMOUNT_DECREASE,
    TransactionTypeEnum.FACE_AMOUNT_INCREASE,
    TransactionTypeEnum.FORCE_OUT,
    TransactionTypeEnum.FREE_LOOK_EXPIRATION,
    TransactionTypeEnum.ISSUANCE,
    TransactionTypeEnum.LAPSE,
    TransactionTypeEnum.NOTIFICATION_OF_DEATH_CLAIM,
    TransactionTypeEnum.REINSTATEMENT,
    TransactionTypeEnum.REINSTATEMENT_APPROVED,
    TransactionTypeEnum.VALUE_ADJUSTMENT,
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
    TransactionTypeEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const withdrawalFinancialTransactions = [
    ...withdrawalDetailsTransactions,
    TransactionTypeEnum.FULL_SURRENDER,
    TransactionTypeEnum.FREE_LOOK_CANCELLATION,
];

const loanTransactions = [
    TransactionTypeEnum.LOAN_REPAYMENT_ONE_TIME,
    TransactionTypeEnum.NEW_LOAN,
    TransactionTypeEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
    TransactionTypeEnum.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT,
    TransactionTypeEnum.SYSTEMATIC_LOAN_REPAYMENT,
];

const premiumTransactions = [
    TransactionTypeEnum.INITIAL_PREMIUM,
    TransactionTypeEnum.ONE_TIME_PREMIUM,
    TransactionTypeEnum.PAYMENT_INITIAL_PREMIUM,
    TransactionTypeEnum.PAYMENT_ONE_TIME_PREMIUM,
    TransactionTypeEnum.SUBSEQUENT_PAYMENT,
    TransactionTypeEnum.SUBSEQUENT_PREMIUM,
];
const systematicProgramTransactions = [
    TransactionTypeEnum.SYSTEMATIC_PROGRAM_UPDATE,
    TransactionTypeEnum.SYSTEMATIC_LOAN_REPAYMENT_SETUP,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
];

const withdrawalTransactions = [
    TransactionTypeEnum.CLAIM_PAYOUT,
    TransactionTypeEnum.DISBURSEMENT,
    TransactionTypeEnum.FREE_LOOK_CANCELLATION,
    TransactionTypeEnum.FULL_SURRENDER,
    TransactionTypeEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    TransactionTypeEnum.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    TransactionTypeEnum.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    TransactionTypeEnum.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
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
