import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
} from '@deps/contexts/HistoryFiltersContext';
import { Transaction } from '@zinnia/api-types/types/sor';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

export const PeopleChangeTransactionTypes = [
    Transaction.transactionType.ADDRESS_CHANGE as Transaction.transactionType,
    Transaction.transactionType.EMAIL_CHANGE as Transaction.transactionType,
    Transaction.transactionType
        .PHONE_NUMBER_CHANGE as Transaction.transactionType,
    Transaction.transactionType
        .BANK_ACCOUNT_CHANGE as Transaction.transactionType,
];

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as Transaction.transactionType,
    MissingTransactionTypes.FundAllocationsChange as unknown as Transaction.transactionType,
    MissingTransactionTypes.FundTransfer as unknown as Transaction.transactionType,
];

export const allTransactionTypes = [
    ...Object.values(Transaction.transactionType),
    ...TransactionTypesNotInTheSpecYet,
];

const addressTransactions = [
    Transaction.transactionType.ADDRESS_CHANGE,
    Transaction.transactionType.PREFERRED_MAILING_ADDRESS_CHANGE,
];
const bankAccountTransactions = [
    Transaction.transactionType.BANK_ACCOUNT_CHANGE,
];
const beneficiaryTransactions = [
    Transaction.transactionType.BENEFICIARY_CHANGE,
];
const communicationPreferenceTransactions = [
    Transaction.transactionType.COMMUNICATION_PREFERENCE_CHANGE,
];
const emailTransactions = [Transaction.transactionType.EMAIL_CHANGE];
const nameTransactions = [
    Transaction.transactionType.EXISTING_PARTY_NAME_CHANGE,
];
const phoneNumberTransactions = [
    Transaction.transactionType.PHONE_NUMBER_CHANGE,
];
const roleTransactions = [
    Transaction.transactionType.OWNER_CHANGE,
    Transaction.transactionType.PAYEE_CHANGE,
    Transaction.transactionType.PAYOR_CHANGE,
];
const tpdTransactions = [Transaction.transactionType.TPDCHANGE];

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
    Transaction.transactionType.ANNIVERSARY,
    Transaction.transactionType.LAPSE_ASSESSMENT,
    Transaction.transactionType.MATCH_BONUS_VESTING,
];
const coverageTransactions = [
    Transaction.transactionType.CANCEL_NO_PREMIUM,
    Transaction.transactionType.DEATH_CLAIM,
];
const feesTransactions = [
    Transaction.transactionType.COST_OF_INSURANCE,
    Transaction.transactionType.EXPENSE_CHARGE,
    Transaction.transactionType.INTEREST_CREDIT,
    Transaction.transactionType.INTEREST_CREDIT_LOAN,
    Transaction.transactionType.INTEREST_CREDIT_MATCH,
    Transaction.transactionType.INTEREST_LOAN,
    Transaction.transactionType.UNIT_EXPENSE_CHARGE,
];
const keyDateTransaction = [
    Transaction.transactionType.ACTIVATION,
    Transaction.transactionType.CONVERSION_ACTIVATION,
    Transaction.transactionType.DELIVERY_DATE_SETUP,
    Transaction.transactionType.FACE_AMOUNT_CHANGE,
    Transaction.transactionType.FACE_AMOUNT_DECREASE,
    Transaction.transactionType.FACE_AMOUNT_INCREASE,
    Transaction.transactionType.FORCE_OUT,
    Transaction.transactionType.FREE_LOOK_EXPIRATION,
    Transaction.transactionType.ISSUANCE,
    Transaction.transactionType.LAPSE,
    Transaction.transactionType.NOTIFICATION_OF_DEATH_CLAIM,
    Transaction.transactionType.REINSTATEMENT,
    Transaction.transactionType.REINSTATEMENT_APPROVED,
    Transaction.transactionType.VALUE_ADJUSTMENT,
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
    Transaction.transactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    Transaction.transactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
];

export const withdrawalFinancialTransactions = [
    ...withdrawalDetailsTransactions,
    Transaction.transactionType.FULL_SURRENDER,
    Transaction.transactionType.FREE_LOOK_CANCELLATION,
];

const loanTransactions = [
    Transaction.transactionType.LOAN_REPAYMENT_ONE_TIME,
    Transaction.transactionType.NEW_LOAN,
    Transaction.transactionType.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
    Transaction.transactionType.PAYMENT_SYSTEMATIC_LOAN_REPAYMENT,
    Transaction.transactionType.SYSTEMATIC_LOAN_REPAYMENT,
];

const premiumTransactions = [
    Transaction.transactionType.INITIAL_PREMIUM,
    Transaction.transactionType.ONE_TIME_PREMIUM,
    Transaction.transactionType.PAYMENT_INITIAL_PREMIUM,
    Transaction.transactionType.PAYMENT_ONE_TIME_PREMIUM,
    Transaction.transactionType.SUBSEQUENT_PAYMENT,
    Transaction.transactionType.SUBSEQUENT_PREMIUM,
];
const systematicProgramTransactions = [
    Transaction.transactionType.SYSTEMATIC_PROGRAM_UPDATE,
    Transaction.transactionType.SYSTEMATIC_LOAN_REPAYMENT_SETUP,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
];

const withdrawalTransactions = [
    Transaction.transactionType.CLAIM_PAYOUT,
    Transaction.transactionType.DISBURSEMENT,
    Transaction.transactionType.FREE_LOOK_CANCELLATION,
    Transaction.transactionType.FULL_SURRENDER,
    Transaction.transactionType.PARTIAL_WITHDRAWAL_ONE_TIME,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL,
    Transaction.transactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP,
    Transaction.transactionType.REQUIRED_MINIMUM_DISTRIBUTION_ONE_TIME,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION,
    Transaction.transactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_SETUP,
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
