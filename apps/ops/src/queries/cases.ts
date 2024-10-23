import { Statuses } from '@deps/models/case/case';

export interface CaseSearchQuery {
    carrier?: string[];
    caseStatus?: Statuses[];
    limit: number;
    offset: number;
    ownerFirstName?: string;
    ownerLastName?: string;
    policyNumber?: string;
    sortDirection?: string;
    sortBy?: string;
    ssn?: string;
    createdDateStart?: any; // Should be a string but Typescript complains
    createdDateEnd?: any; // Should be a string but Typescript complains
    updatedDateStart?: any; // Should be a string but Typescript complains
    updatedDateEnd?: any; // Should be a string but Typescript complains
}

export interface CaseStatsQuery {
    brokerDealerName?: string
    policyNumber?: string;
    ssn?: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    process?: string[];
    caseIds?: string[];
    caseStatus?: Statuses[];
    carrier?: string[];
    groupBy: string[];
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
}
