export interface ClientCase {
    id: string;
    title: string;
    caseManagementCaseId: string;
    eAppId: string;
    agentDetails: {
        agencyId: string;
        npn: string;
        firstName: string;
        lastName: string;
    };
    insuredDetails: {
        firstName: string;
        lastName: string;
        sexAtBirth: string;
        dateOfBirth: Date;
        nicotineUser: boolean;
        state: string;
        illustrateAtOlderAge: boolean;
        issueAge: number;
        riskClass: string;
    };
    illustrations: Illustration[];
    lastModified: Date;
}

export interface Illustration {
    id: string;
    productType: string;
    status: string;
    name: string;
}

export type SellingCodeWithCarrier = {
    sellingCode: string;
    carrierShortName: string;
};
