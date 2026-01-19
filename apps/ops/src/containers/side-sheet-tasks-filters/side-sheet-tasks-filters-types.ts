export type Errors = {
    scheduledDateStart?: string;
    scheduledDateEnd?: string;
};

export type Carriers = {
    [key: string]: string;
};

export type AdditionalFilters = {
    carriers: Carriers;
    group: string[];
    assignees: string[];
    escalated?: boolean | null;
    scheduledDateStart?: string;
    scheduledDateEnd?: string;
};
