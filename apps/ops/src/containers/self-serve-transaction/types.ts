export const enum SelfServeTransaction {
    ASSIGNEE_CHANGE = 'ASSIGNEE_CHANGE',
    BENE_CHANGE = 'BENE_CHANGE',
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
