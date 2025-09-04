export const DEFAULT_PAGE_LIMIT = 10;
export const DEFAULT_OFFSET_COUNT = 0;

export const initialCaseSearchCriteria = {
    limit: DEFAULT_PAGE_LIMIT,
    offset: DEFAULT_OFFSET_COUNT,
    sortDirection: 'desc',
    sortBy: 'createdAt',
    isIncludeSecondary: true,
};

export const caseListSearchPageSizeOptions = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
];
