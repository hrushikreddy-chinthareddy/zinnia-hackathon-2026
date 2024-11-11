import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

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
    brokerDealerName?: string;
    policyNumber?: string;
    ssn?: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    process?: string[];
    caseIds?: string[];
    caseStatus?: Statuses[];
    carrier?: string | string[];
    groupBy: string[];
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
}

export interface CaseDashboardStatsQuery {
    /**
     * Dashboard search filter.
     see {@link DashboardSearchFilter} for more details.*/
    filter?: DashboardSearchFilter;
    /**
     * Array of group by options.
     * see {@link GroupByOptions} for more details.*/
    groupBy?: GroupByOptions[];
}

export interface DashboardSearchFilter {
    /**
     * Policy number.
     * Ex: '12345678'
     */
    policyNumber?: string;
    /**
     * Array of processes.
     * Ex: ['NewBusiness', 'Renewal']
     * see {@link Processes} for more details.
     */
    process?: Array<Processes>;
    /**
     * Array of carriers.
     * Ex: ['SB', 'ELIC']
     */
    carrier?: string | string[];
    /**
     * Array of request sub types.
     * Ex: ['Transfers', 'Internal Conversion']
     */
    requestSubType?: string[];
    /**
     * Array of product names.
     * Ex: ['SB Universal Life', 'Everly ULIC']
     */
    productName?: string[];
    /**
     * Array of case status (InProgress, Exception, Completed, NotStarted, Canceled, New).
     * Ex: ['InProgress', 'Exception']
     */
    caseStatus?: Statuses[];
    /**
     * Start date in ISO 8601 format (inclusive).
     * Ex: '2023-02-15T00:00:00.000Z'
     */
    createdDateStart?: string;
    /**
     * End date in ISO 8601 format (exclusive).
     * Ex: '2023-02-16T00:00:00.000Z'
     */
    createdDateEnd?: string;
    /**
     * Start date in ISO 8601 format (inclusive).
     * Ex: '2023-02-15T00:00:00.000Z'
     */
    updatedDateStart?: string;
    /**
     * End date in ISO 8601 format (exclusive).
     * Ex: '2023-02-16T00:00:00.000Z'
     */
    updatedDateEnd?: string;
    /**
     * Broker dealer name.
     * Ex: 'Advisors Excel LLC'
     */
    brokerDealerName?: string[];
}

export interface CaseInsightsQuery {
    prompt: string;
    content: any;
}
