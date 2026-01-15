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
export const SSN_FORMAT = { format: '#########' };
export const DEFAULT_TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]';

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
    'raw-data': 'raw-data',
    events: 'events',
};

export const PolicyActivityTabValues: { [key: string]: string } = {
    transactions: 'transactions',
    notes: 'notes',
    'call-logs': 'call-logs',
};

export const AnalyticsRouteValues: { [key: string]: string } = {
    cases: 'cases',
    policies: 'policies',
    illustrations: 'illustrations',
    usage: 'usage',
};

// DEPU-2749 https://zinnia.atlassian.net/browse/DEPU-2749
export const HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 = true;
export const NODE_ENV_PRODUCTION = 'production';

export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export const DEFAULT_STEP_WIDTH = 188;
export const FUND_TRANSFER_STEP_WIDTH = 280;

export const DefaultValue = {
    maxPercentage: 100,
    minFractionDigit: 2,
    nullAmount: '$--.--',
    nullPercentage: '--%',
};
export const CALL_LOGS_TAB_QUERY_LIMIT = 100;

export const LEGACY_START_DATE = '1900-01-01';
export const LEGACY_END_DATE = '2999-12-31';

export const PartyRoleId = {
    AnnuitantRoleId: '-1|0|1',
    OwnerRoleId: '0|0|2',
};
export const DIAL_NUMBER_MAX_LEN = 7;
export const CLIENT_COPY = 'CLIENT_COPY';
export const NEW_BUSINESS = 'NEW_BUSINESS';
export const DISPLAY_NAME = 'Name Change Supporting Document';
export const SOURCE = 'Self-Service Portal';

export const NOT_YET_AVAILABLE = 'notYetAvailable';
export const DEBOUNCE_INTERVAL_200 = 200;
