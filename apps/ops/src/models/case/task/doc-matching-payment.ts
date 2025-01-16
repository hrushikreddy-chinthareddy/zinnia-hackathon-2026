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
    correlationId: string;
};
