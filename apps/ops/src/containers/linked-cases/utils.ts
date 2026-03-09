export type CaseDetails = {
    casegroup: string;
    createdAt: string;
    id: string;
    process: string;
    processSubType: string;
    status: string;
    updatedAt: string;
    reason: string;
    caseType: string;
};
export type LinkedCase = {
    linkType: string;
    linkReason: string;
    associatedCaseDetails: CaseDetails;
    caseDetails: CaseDetails;
    linkedCases: LinkedCase[];
    status?: string;
};

export enum CaseStatus {
    Completed = 'COMPLETED',
    InProgress = 'IN_PROGRESS',
}

export enum LinkType {
    Related = 'RELATED',
}
