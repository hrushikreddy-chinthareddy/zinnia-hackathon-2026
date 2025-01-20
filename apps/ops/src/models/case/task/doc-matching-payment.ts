export type PotentialMatches = {
    id?: string;
    entityType: string; // todo:vijaya: add enum for mapping
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

export type TransactionData = [
    {
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
        identifiers: [
            {
                identifier: string;
                value: string;
            }
        ];
    }
];

type Entity = {
    paymentRecordId: string;
    payment: {
        id: string;
        paymentMethod: string;
        netAmount: number;
        grossAmount: number;
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
