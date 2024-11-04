import { EventFilterKeys, PeopleFilters, PolicyFilters, TransactionFilters } from '@deps/contexts/HistoryFiltersContext';
import { TransactionType } from '@deps/models/policy/sor-policy';

enum MissingTransactionTypes {
    CalendarProcessing = 'CalendarProcessing',
    FundAllocationsChange = 'FundAllocationsChange',
    FundTransfer = 'FundTransfer',
}

// BPB - ToDo: Remove these once the Sor spec has been updated to include them.
export const TransactionTypesNotInTheSpecYet = [
    MissingTransactionTypes.CalendarProcessing as unknown as TransactionType,
    MissingTransactionTypes.FundAllocationsChange as unknown as TransactionType,
    MissingTransactionTypes.FundTransfer as unknown as TransactionType,
];

export const allTransactionTypes = [...Object.values(TransactionType), ...TransactionTypesNotInTheSpecYet];

const addressTransactions = [TransactionType.AddressChange, TransactionType.PreferredMailingAddressChange];
const bankAccountTransactions = [TransactionType.BankAccountChange];
const beneficiaryTransactions = [TransactionType.BeneficiaryChange];
const communicationPreferenceTransactions = [TransactionType.CommunicationPreferenceChange];
const emailTransactions = [TransactionType.EmailChange];
const nameTransactions = [TransactionType.ExistingPartyNameChange];
const phoneNumberTransactions = [TransactionType.PhoneNumberChange];
const roleTransactions = [TransactionType.OwnerChange, TransactionType.PayeeChange, TransactionType.PayorChange];
const tpdTransactions = [TransactionType.TPDChange];

export const peopleTransactions = {
    [PeopleFilters.Address]: addressTransactions,
    [PeopleFilters.BankAccount]: bankAccountTransactions,
    [PeopleFilters.Beneficiary]: beneficiaryTransactions,
    [PeopleFilters.CommunicationPreference]: communicationPreferenceTransactions,
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

const anniversaryTransactions = [TransactionType.Anniversary, TransactionType.LapseAssessment, TransactionType.MatchBonusVesting];
const coverageTransactions = [TransactionType.CancelNoPremium, TransactionType.DeathClaim];
const feesTransactions = [
    TransactionType.CostOfInsurance,
    TransactionType.ExpenseCharge,
    TransactionType.InterestCredit,
    TransactionType.InterestCreditLoan,
    TransactionType.InterestCreditMatch,
    TransactionType.InterestLoan,
    TransactionType.UnitExpenseCharge,
];
const keyDateTransaction = [
    TransactionType.Activation,
    TransactionType.ConversionActivation,
    TransactionType.DeliveryDateSetup,
    TransactionType.FaceAmountChange,
    TransactionType.FaceAmountDecrease,
    TransactionType.FaceAmountIncrease,
    TransactionType.ForceOut,
    TransactionType.FreeLookExpiration,
    TransactionType.Issuance,
    TransactionType.Lapse,
    TransactionType.NotificationOfDeathClaim,
    TransactionType.Reinstatement,
    TransactionType.ReinstatementApproved,
    TransactionType.ValueAdjustment,
];

export const policyTransactions = {
    [PolicyFilters.Anniversary]: anniversaryTransactions,
    [PolicyFilters.Coverage]: coverageTransactions,
    [PolicyFilters.Fees]: feesTransactions,
    [PolicyFilters.KeyDates]: keyDateTransaction,
    all: [...anniversaryTransactions, ...coverageTransactions, ...feesTransactions, ...keyDateTransaction],
};
const loanTransactions = [
    TransactionType.LoanRepaymentOneTime,
    TransactionType.NewLoan,
    TransactionType.PaymentLoanRepaymentOneTime,
    TransactionType.PaymentSystematicLoanRepayment,
    TransactionType.SystematicLoanRepayment,
];

const premiumTransactions = [
    TransactionType.InitialPremium,
    TransactionType.OneTimePremium,
    TransactionType.PaymentInitialPremium,
    TransactionType.PaymentOneTimePremium,
    TransactionType.SubsequentPayment,
    TransactionType.SubsequentPremium,
];
const systematicProgramTransactions = [
    TransactionType.SystematicProgramUpdate,
    TransactionType.SystematicLoanRepaymentSetup,
    TransactionType.SystematicPartialWithdrawalSetup,
];
const withdrawalTransactions = [
    TransactionType.ClaimPayout,
    TransactionType.Disbursement,
    TransactionType.FreeLookCancellation,
    TransactionType.FullSurrender,
    TransactionType.PartialWithdrawalOneTime,
    TransactionType.SystematicPartialWithdrawal,
];

export const financialTransactions = {
    [TransactionFilters.Loans]: loanTransactions,
    [TransactionFilters.Premiums]: premiumTransactions,
    [TransactionFilters.SystematicPrograms]: systematicProgramTransactions,
    [TransactionFilters.Withdrawals]: withdrawalTransactions,
    all: [...loanTransactions, ...premiumTransactions, ...systematicProgramTransactions, ...withdrawalTransactions],
};

export const allTransactions = {
    [EventFilterKeys.Transactions]: financialTransactions,
    [EventFilterKeys.Policy]: policyTransactions,
    [EventFilterKeys.People]: peopleTransactions,
    all: [...financialTransactions.all, ...policyTransactions.all, ...peopleTransactions.all],
};
