import { createContext } from 'react';

import { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { Statuses, Case } from '@deps/models/case/case';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

export type CaseStatusFilter = 'All' | Statuses.InProgress | Statuses.Exception;

export const caseSearchPageSizeOptions = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
];

export interface CaseSearchFilters {
    additionalFilters: CaseSearchAdditionalFilters;
    limit: number;
    offset: number;
    total: number;
    sortDirection: 'asc' | 'desc';
    statusCounterTileFilter: CaseStatusFilter;
    searchValue: SearchViewQuery;
    toggleValue: PolicySearchKeys;
}

export interface CaseSearchAdditionalFilters {
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    age?: string;
    caseStatus?: Statuses[];
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
};

export const initialFilters: CaseSearchFilters = {
    additionalFilters: initialAdditionalFilters,
    limit: 25,
    offset: 0,
    total: 0,
    sortDirection: 'desc',
    statusCounterTileFilter: 'All',
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
