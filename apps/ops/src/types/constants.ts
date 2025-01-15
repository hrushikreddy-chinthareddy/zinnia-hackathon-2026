export const DEFAULT_ERROR_STRING = '--';
export const SPLITTER = '|||';
export enum SCREEN_BREAKPOINTS {
    xs = 320,
    sm = 500,
    md = 768,
    mid = 996,
    lg = 1025,
    page = 1130,
    xl = 1440,
    welcomeXL = 1500,
}

export const isResetQueryParam = '?isReset=true';

export const NUMERIC_DATE_FORMAT = 'MMDDYYYY';
export const DEFAULT_DATE_FORMAT = 'M/D/YYYY';
export const DEFAULT_EXTENDED_DATE_FORMAT = 'MM/DD/YYYY';
export const DEFAULT_EXTENDED_DAY_DATE_FORMAT = 'M/DD/YYYY';
export const DEFAULT_EXTENDED_MONTH_DATE_FORMAT = 'MM/D/YYYY';
export const ZAHARA_API_DATE_FORMAT = 'YYYY-MM-DD';
export const DEFAULT_DATE_DISPLAY_FORMAT = 'MM/DD/YYYY';
export const DEFAULT_DATETIME_DISPLAY_FORMAT = 'MM/DD/YYYY; hh:mm';
export const EDS_DATE_DISPLAY_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

export const NOOP = () => {
    // do nothing
};

export const POLICY_SEARCH_FILTERS_STORAGE_KEY = 'POLICY_SEARCH_FILTERS';
export const PRODUCTION_HOST_NAME = 'open.zinnia.com';

export const CaseDetailsTabValues: { [key: string]: string } = {
    progress: 'progress',
    documents: 'documents',
    notes: 'notes',
    'call-logs': 'call-logs',
};

export const PolicyActivityTabValues: { [key: string]: string } = {
    transactions: 'transactions',
    notes: 'notes',
    callLogs: 'callLogs',
};

// DEPU-2749 https://zinnia.atlassian.net/browse/DEPU-2749
export const HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 = true;
export const NODE_ENV_PRODUCTION = 'production';
