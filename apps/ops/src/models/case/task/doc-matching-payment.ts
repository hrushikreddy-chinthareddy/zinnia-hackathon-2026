export type PotentialMatches = {
    id?: string;
    entityType: string;
    applicationId: string;
    zlCaseId: string;
    policyNumber: string;
    taxId: string;
    firstName: string;
    lastName: string;
    processSubtype: string;
    correlationid: string;
};

export enum MatchingCaseTypes {
    NB_APPLICATION_DATA = 'Incoming Transfer',
    RMD_APP_DATA = 'RMD Application',
}

export type TransactionData = {
    recordId: string;
    correlationId: string;
    transactionType: string;
    carrier: string;
    source: string;
    entityType: string;
    entityId: string;
    entity: Entity;
    expireTs: string;
    createdTs: string;
    updatedTs: string;
    createdBy: string;
    updatedBy: string;
    identifiers?: TransactionIdentifier[];
};

export enum MatchingCase {
    REINDEX = 'REINDEX',
    MATCH_FOUND = 'MATCH_FOUND',
    NO_MATCH = 'NO_MATCH',
    DUPLICATE = 'DUPLICATE',
    ENTERED = 'ENTERED',
    NOT_APPLICABLE = 'NOT_APPLICABLE',
}

type Entity = {
    paymentRecordId: string;
    status?: string;
    payment: {
        id: string;
        paymentMethod: string;
        netAmount: number;
        grossAmount: number;
        companyName?: string;
        taxInfo: {
            taxYear: string;
            currentContribAmount: number;
            priorContribAmount: number;
            totalBasis: string;
            pretefraBasis: string;
        };
        currentAlloc: string;
        moneySrcId: number;
        waivePremium: number;
        exchangeReplace: {
            id: string;
            companyName: string;
            address: {
                city: string;
                state: string;
                zip: string;
                country: string;
                addressLines: [];
            };
            type: number;
            amountRequested: number;
            signedDate: string;
            sourcePolicyNumber: string;
            previousPlanType: string;
            replacementIndicator: false;
            costBasisUnknownInd: false;
            applyRateLock: string;
            replacementInd: number;
            erExchangeType: number;
            erUnknownCbIndn: number;
        };
    };
    paymentRecordStatus: 'COMPLETED';
};

type TransactionIdentifier = {
    identifier: string;
    value: string;
};

export enum EntityTypes {
    NB_PAYMENT_RECORD = 'NB_PAYMENT_RECORD',
}
