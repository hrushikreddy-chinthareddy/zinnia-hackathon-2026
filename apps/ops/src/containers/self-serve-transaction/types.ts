export const enum SelfServeTransaction {
    ASSIGNEE_CHANGE = 'ASSIGNEE_CHANGE',
    PAYEE_CHANGE = 'PAYEE_CHANGE',
    BENE_CHANGE = 'BENE_CHANGE',
    ANNUITANT_CHANGE = 'ANNUITANT_CHANGE',
    /** In-memory AI-generated paper flow on policy People route (mock submit). */
    AI_PAPER = 'AI_PAPER',
}

export const enum ValidationSummaryStatus {
    SUCCESS = 'success',
    FAILURE = 'failure',
}

export type SelfServeTransactionSubmitResult = {
    response: any | null;
    isSuccess: boolean;
    caseId?: string | null;
    submitNigo?: boolean;
};
