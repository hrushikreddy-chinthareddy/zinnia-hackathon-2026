import { CaseAdditionalStepData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';

// StepIds with an stepAdditionalData side sheet
export enum TransactionsAdditionalDataStepIds {
    receiveClaimRequest = 'requestAck.receiveClaimRequest',
    stopSystematicPrograms = 'verifyFunds.stopSystematicPrograms',
    stopRMD = 'verifyFunds.stopRMD',
    stopSpecialPrograms = 'verifyFunds.stopSpecialPrograms',
    stopUncashedTransactions = 'verifyFunds.stopUncashedTransactions',
    claimsFundRelease = 'claims.fundRelease',
    outboundDeathScrub = 'requestAck.outboundDeathScrub',
    inboundDeathScrub = 'requestAck.inboundDeathScrub',
    performDAFileCaseMatch = 'matchDoc.performDAFileCaseMatch',
    matchDocPerformMatch = 'matchDoc.performMatch',
    requestBillingPartner = 'requestAck.requestBillingPartner',
    receiveNewDocument = 'requestAck.createQualificationCase',
    receiveNewDocument2 = 'requestAck.createMatchingCase',
    complianceDbUpdate = 'requestAck.complianceDbUpdate',
    receiveRequest = 'receiveRequest',
    docIndentification = 'docIndentification',
    docFieldExtraction = 'docFieldExtraction',
    docSend = 'docSend',
    docIndexedAndCaseCreated = 'docIndexedAndCaseCreated',
    unableToIdentifyDocument = 'unableToIdentifyDocument',
}

export enum BeneNotification {
    INITIAL_BENE_NOTIFICATION = 'initiateBeneNotification',
    BENE_ENTITY_TYPE = 'bene',
}

export enum TransactionActionStatuses {
    SUCCESS = 'SUCCESS',
    FAIL = 'FAIL',
    NONE = 'NONE',
}

export enum TransactionActions {
    DELETE = 'DELETE',
    TERMINATE = 'TERMINATE',
    NONE = 'NONE',
}

export enum UncashedTransactionStatus {
    OUTSTANDING = 'OUTSTANDING',
    STOP = 'STOP',
    REVERSED = 'REVERSED',
    SEND_CHECK_TO_ESTATE = 'SEND_CHECK_TO_ESTATE',
}
export enum UncashedTransactionStatusLabel {
    OUTSTANDING = 'outstanding',
    STOP = 'stopped',
    REVERSED = 'reversed',
    SEND_CHECK_TO_ESTATE = 'checkToEstate',
}

export interface ViewTransactionsProps {
    stepAdditionalData: CaseAdditionalStepData;
    prop: string;
}

export enum StepProgramTypes {
    SYSTEMATICPROGRAMS = 'systematicPrograms',
    RMDPROGRAMS = 'rmdPrograms',
    SPECIALPROGRAMS = 'specialPrograms',
    UNCASHED = 'uncashed',
}
