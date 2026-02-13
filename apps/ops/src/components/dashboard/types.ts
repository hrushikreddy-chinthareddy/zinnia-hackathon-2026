export interface CarrierListItem {
    [key: string]: string;
}
export const AnalyticsTabs = {
    ACTIVE_APPLICATIONS: 'active-applications',
    CLOSED_TRANSACTIONS: 'closed-transactions',
    NIGO_ANALYSIS: 'nigo-analysis',
    TASKS_VOLUME: 'tasks-volume',
} as const;

export type TAnalyticsTab = keyof typeof AnalyticsTabs;

export const TabTitles = {
    OPEN: 'OPENCASES',
    CLOSED: 'CLOSEDCASES',
    ISSUES: 'ISSUES',
    TASKS: 'TASKS',
} as const;

export type TabTitle = keyof typeof TabTitles;

// Policies and Contracts
export const PoliciesContractsTabs = {
    RETENTION_ATTRITION: 'retention-attrition',
} as const;

export type TPoliciesContractsTab = keyof typeof PoliciesContractsTabs;

export const PoliciesContractsTabTitles = {
    RETENTIONATTRITION: 'RETENTIONATTRITION',
} as const;

export type PoliciesContractsTabTitle = keyof typeof PoliciesContractsTabTitles;

// Usage
export const UsageTabs = {
    LOGINS: 'logins',
    PAGE_VIEWS: 'page-views',
    ACTIVITY: 'activity',
} as const;

export type TUsageTab = keyof typeof UsageTabs;

export const UsageTabTitles = {
    LOGINS: 'LOGINS',
    PAGEVIEWS: 'PAGEVIEWS',
    ACTIVITY: 'ACTIVITY',
} as const;

export type UsageTabTitle = keyof typeof UsageTabTitles;
