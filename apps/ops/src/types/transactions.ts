// POLICY TRANSACTION HISTORY
import { Transaction as DetailedTransaction } from '@zinnia/api-types/types/sor';

// when viewDetails = false, we get a summary view of the transaction.
export type TransactionSummary = Pick<
    Transaction,
    | 'transactionId'
    | 'policyNumber'
    | 'correlationId'
    | 'status'
    | 'transactionType'
    | 'effectiveDate'
    | 'processDate'
    | 'requestDate'
    | 'reversalDate'
> & {
    id?: string;
    appliedAmount?: NonNullable<
        Transaction['transactionAmounts']
    >['appliedAmount'];
    requestedAmount?: NonNullable<
        Transaction['transactionAmounts']
    >['requestedAmount'];
};

export type Transaction = DetailedTransaction;
