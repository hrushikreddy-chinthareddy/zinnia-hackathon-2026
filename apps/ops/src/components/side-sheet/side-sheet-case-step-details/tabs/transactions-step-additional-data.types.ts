import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

// StepIds with an stepadditionalData sidesheet
export enum TransactionsAdditionalDataStepIds {
    receiveClaimRequest = 'requestAck.receiveClaimRequest',
    stopSystematicPrograms = 'verifyFunds.stopSystematicPrograms',
    stopRMD = 'verifyFunds.stopRMD',
    stopSpecialPrograms = 'verifyFunds.stopSpecialPrograms',
};

export enum TransactionActionStatuses {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    NONE = 'NONE',
};

export enum TransactionActions {
    DELETE = 'DELETE',
    TERMINATE = 'TERMINATE',
    NONE = 'NONE',
};

export interface ViewTransactionsProps {
    stepAdditionalData: CaseAdditionalStepData;
    prop: string;
};
