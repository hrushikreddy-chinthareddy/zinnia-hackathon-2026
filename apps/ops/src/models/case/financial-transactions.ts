export type FinancialTransactionRecord = {
    correlationId: string;
    carrier: string;
    source: string;
    entityType: string;
    entity: FinancialTransactionEntity;
    identifiers?: Array<{
        identifier: string;
        value: string;
    }>;
    createdTs: {
        $date: string;
    };
    updatedTs: {
        $date: string;
    };
};

export type FinancialTransactionEntity = {
    transaction: FinancialTransactionEntityTransaction;
    cash?: {
        businessUnit: string;
        journalId: string | null;
        category: string | null;
        amount: number;
        date: string | null;
    };
    bankReconciliation?: {
        reconciledDate: string;
        journalReference: string | null;
        bankName: string | null;
        accountNumber: string | null;
    };
    ledger?: any | null;
};

export type FinancialTransactionEntityTransaction = {
    id: string;
    amount: number;
    date: string | null;
    method?: string | null;
    bankName?: string | null;
    bankAccountNumber?: string;
    suspenseResolutionStatus?: string | null;
};
