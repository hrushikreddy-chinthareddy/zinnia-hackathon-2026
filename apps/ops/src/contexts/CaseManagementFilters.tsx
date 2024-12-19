import { createContext } from 'react';

import { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { Statuses, Case } from '@deps/models/case/case';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

export type CaseStatusFilter = 'All' | Statuses.InProgress | Statuses.Exception;

export interface CaseSearchFilters {
    additionalFilters: CaseSearchAdditionalFilters;
    offset: number;
    total: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    searchValue: SearchViewQuery;
    toggleValue: PolicySearchKeys;
}

export interface CaseSearchAdditionalFilters {
    brokerDealerName?: string;
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    age?: string;
    caseStatus?: Statuses[];
    notInCaseStatus?: Statuses[];
    processTypes: Set<string>;
    requestSubType: Set<string>;
    carriers?: { [key: string]: string };
    products: Set<string>;
}

export const initialAdditionalFilters: CaseSearchAdditionalFilters = {
    createdDateStart: '',
    createdDateEnd: '',
    updatedDateStart: '',
    updatedDateEnd: '',
    age: '',
    processTypes: new Set([]),
    requestSubType: new Set([]),
    carriers: {},
    caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.New, Statuses.NotStarted],
    products: new Set([]),
    brokerDealerName: '',
};

export const initialFilters: CaseSearchFilters = {
    additionalFilters: initialAdditionalFilters,
    offset: 0,
    total: 0,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    searchValue: SearchBarInitialValues,
    toggleValue: 'policyNumber',
};

export interface CaseTableData {
    cases: Case[];
    total: number;
    loading: boolean;
    error: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const CaseManagementFiltersContext = createContext<[CaseSearchFilters, (filters: CaseSearchFilters) => void]>([
    initialFilters,
    noop,
]);
