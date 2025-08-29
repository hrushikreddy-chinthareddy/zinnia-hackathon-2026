import { Policy } from '@zinnia/api-types/types/sor';

import { Case } from '@deps/models/case/case';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

import { Order, SortObject } from './sort';

export type View = 'Summary' | 'Details';
export type SearchOperations = 'equals' | 'partial';
export type PolicySearchKeys =
    | 'firstName'
    | 'lastName'
    | 'ownerFirstName'
    | 'ownerLastName'
    | 'ssn'
    | 'policyNumber'
    | 'caseId'
    | 'firmName'
    | 'agentName'
    | 'agentFirstName'
    | 'agentLastName'
    | 'documentNumber'
    | 'taskName';

export interface PolicySearchResult {
    carrierId: string;
    companyName: string;
    firstName: string;
    id: string;
    lastName: string;
    lastUpdated: string;
    lineOfBusiness: string;
    partyIds: [string, string];
    planCode: string;
    policyNumber: string;
    policyStatus: string;
    productName: string;
    productType: string;
    source: string;
    ssn: string;
}

export enum Source {
    ZAHARA = 'zahara',
}

export interface SearchViewQuery {
    firstName?: string;
    lastName?: string;
    policyNumber?: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    ssn?: string;
    caseIds?: string[];
    agentFirstName?: string;
    agentLastName?: string;
    brokerDealerName?: string;
    [key: string]: any; // used to loop over the object
    documentNumber?: string;
}

export interface SearchParams {
    searchValue?: string;
    operation?: SearchOperations;
    sort?: SortObject<string>;
    order?: Order;
}

export interface SortResponse {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

export interface CaseSearchBody {
    carrier?: string[];
    caseStatus?: string[];
    createdDateEnd?: number;
    createdDateStart?: number;
    limit?: number;
    notInCaseStatus?: string[];
    offset?: number;
    ownerName?: string;
    pageNumber?: number;
    pageSize?: number;
    policyNumber?: string;
    process?: string[];
    sortDirection?: string;
    sortBy?: string;
    ssn?: string;
    updatedDateEnd?: number;
    updatedDateStart?: number;
    caseIds?: string[];
    caseResultDetail?: string;
    caseResult?: string;
    requestSubType?: string[];
    documentNumber?: string;
}

export interface GeneralSearchResponse {
    count: number;
    limit: number;
    offset: number;
    total: number;
    status: number;
    message: string;
}

export interface CaseSearchResponse extends GeneralSearchResponse {
    data: Case[];
}

export interface CaseTaskSearchResponse extends GeneralSearchResponse {
    data: ManagementTask<TaskStatus>[];
}

export interface CaseSearchErrorResponse {
    data: {
        err: string;
    };
    status: number;
    message: string;
}

export interface PolicyReferenceSearchResponse {
    count: number;
    next: string;
    previous: string;
    results: PolicySearchResult[];
    total: number;
}

export interface PolicySearchResponse {
    count: number;
    next: string;
    previous: string;
    results: Policy[];
    failures: string[]; // the Policy Numbers of failed getPolicy requests
    total: number;
}

export enum PolicyMetricValues {
    CostOfInsurance = 'CostOfInsurance',
    InterestCredit = 'InterestCredit',
    ExpenseCharge = 'ExpenseCharge',
    LapseProtection = 'LapseProtection',
}
