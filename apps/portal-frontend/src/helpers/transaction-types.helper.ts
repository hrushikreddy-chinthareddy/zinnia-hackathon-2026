import { TransactionType } from '@deps/models/policy/sor-policy';

export const bilateralTransactionTypes = [
    TransactionType.Activation,
    TransactionType.AddressChange,
    TransactionType.Anniversary,
    TransactionType.BankAccountChange,
    TransactionType.CommunicationPreferenceChange,
    TransactionType.DeathClaim,
    TransactionType.EmailChange,
    TransactionType.FullSurrender,
    TransactionType.Lapse,
    TransactionType.PartialWithdrawalOneTime,
    TransactionType.PhoneNumberChange,
];

export const completedTransactionTypes = [
    TransactionType.InitialPremium,
    TransactionType.SubsequentPremium,
    TransactionType.OneTimePremium,
    'LoanRepaymentOneTime' as TransactionType,
    TransactionType.SystematicLoanRepayment,
    TransactionType.NewLoan,
];

export const pendingTransactionTypes = [
    TransactionType.PaymentInitialPremium,
    TransactionType.SubsequentPayment,
    TransactionType.PaymentOneTimePremium,
    TransactionType.PaymentLoanRepaymentOneTime,
    TransactionType.PaymentSystematicLoanRepayment,
    TransactionType.NewLoan,
];

export const canceledTransactionTypes = [TransactionType.PaymentOneTimePremium];

export const allPendingTransactionTypes = [...bilateralTransactionTypes, ...pendingTransactionTypes];
// We are doing this as we are getting the completed and cancleded requests together
export const allCompletedTransactionTypes = [...bilateralTransactionTypes, ...completedTransactionTypes, ...canceledTransactionTypes];
export const allCanceledTransactionTypes = [...bilateralTransactionTypes, ...canceledTransactionTypes];
