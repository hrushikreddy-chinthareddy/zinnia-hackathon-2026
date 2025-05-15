export interface CallLog {
    callEntryID: number;
    callSummary?: string;
    callType: string;
    callerName: string;
    callerType: string;
    clientCode: string;
    contract: string;
    createdByUser: string;
    createdDate: string;
    notes: string;
    sessionID: string;
}

export interface CallLogResponse {
    firstPage: string;
    lastPage: string;
    limit: number;
    offset: number;
    totalCount: number;
    totalPages: number;
    items: CallLog[];
}
