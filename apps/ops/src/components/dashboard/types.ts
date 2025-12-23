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
