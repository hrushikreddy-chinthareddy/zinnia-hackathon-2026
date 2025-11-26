import dayjs from 'dayjs';

import { Timerange } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import {
    UserActivityGroupByEnum,
    UserViewsGroupByEnum,
} from '@zinnia/api-types/types/analytics';

export const friendlyGroupByName: Record<UserActivityGroupByEnum, string> = {
    [UserActivityGroupByEnum.ACTIVITY_DAY]: 'Activity day',
    [UserActivityGroupByEnum.SYSTEM_SOURCE]: 'System source',
    [UserActivityGroupByEnum.USER_ROLE]: 'User role',
    [UserActivityGroupByEnum.USER_STATUS]: 'User status',
};

export const friendlyGroupByNameForUserViews: Record<
    UserViewsGroupByEnum,
    string
> = {
    [UserViewsGroupByEnum.ACTIVITY_DAY]: 'Activity day',
    [UserViewsGroupByEnum.CARRIER]: 'Carrier',
    [UserViewsGroupByEnum.PAGE_TYPE]: 'Page Type',
    [UserViewsGroupByEnum.PROCESS]: 'Process',
    [UserViewsGroupByEnum.PROCESS_SUB_TYPE]: 'Process Sub Type',
    [UserViewsGroupByEnum.USER_ROLE]: 'User Role',
};

// === Roles (API + UI) ===============================================

// Role values as they come from the API
export enum ApiRoles {
    All = 'All',
    Agent = 'Agent',
    CallCenter = 'Call Center',
    Operations = 'Operations',
    SellingAgent = 'Selling Agent',
    ZinniaCallCenter = 'Zinnia Call Center',
    ZinniaOperations = 'Zinnia Operations',
    ZinniaUser = 'Zinnia User',
}

// How we *show* roles in charts/legend
export enum UiRoles {
    Agent = 'Agent',
    ZinniaCallCenter = 'Zinnia Call Center',
    ZinniaOperations = 'Zinnia Operations',
}

// Dropdown options for the “Role” select
export const ROLE_OPTIONS = [
    { value: ApiRoles.All, label: 'All' },
    { value: ApiRoles.Agent, label: 'Agent' },
    { value: ApiRoles.ZinniaCallCenter, label: 'Zinnia Call Center' },
    { value: ApiRoles.ZinniaOperations, label: 'Zinnia Operations' },
];

// The order we want series displayed in charts/exports
export const UI_ROLE_ORDER = [
    UiRoles.Agent,
    UiRoles.ZinniaCallCenter,
    UiRoles.ZinniaOperations,
];

// Map from API roles → our visible UI roles (undefined = hidden)
export const API_TO_UI_ROLE: Record<ApiRoles, UiRoles | undefined> = {
    [ApiRoles.Agent]: UiRoles.Agent,
    [ApiRoles.ZinniaCallCenter]: UiRoles.ZinniaCallCenter,
    [ApiRoles.ZinniaOperations]: UiRoles.ZinniaOperations,
    [ApiRoles.All]: undefined,
    [ApiRoles.ZinniaUser]: undefined,
    [ApiRoles.CallCenter]: undefined,
    [ApiRoles.Operations]: undefined,
    [ApiRoles.SellingAgent]: undefined,
};

// Helper to map arbitrary strings from API → UiRole | undefined
export const toUiRole = (apiRoleName: string): UiRoles | undefined =>
    API_TO_UI_ROLE[apiRoleName as ApiRoles];

export const TRANSACTION_CATEGORY_DISPLAY_MAP: Record<string, string> = {
    financial: 'Payments & Distributions',
    non_financial: 'Policy & Contract Servicing',
    policy_update: 'Party Management',
};

// Transaction type mapping
export const TRANSACTION_TYPE_DISPLAY_MAP: Record<string, string> = {
    premium: 'Premium',
    loan: 'Loan',
    withdrawal: 'Withdrawal',
    surrender: 'Surrender',
    death_claim: 'Death Claim',
    free_look: 'Free Look',
    email: 'Email',
    name: 'Name',
    phone: 'Phone',
    address: 'Address',
    bank_info: 'Bank Info',
    beneficiary: 'Beneficiary',
    newloan: 'New Loan',
};

export const PageType = {
    Cases: 'Cases',
    Illustrations: 'Illustrations',
    Policies: 'Policies',
} as const;

export type PageType = keyof typeof PageType;

export const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateCSVFileName = ({
    title,
    timerange,
    role,
    optionaltitle,
}: {
    title: string;
    timerange: Timerange;
    role?: string;
    optionaltitle?: string;
}) => {
    const rolePart = role === 'All' ? 'All Roles' : role;
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${title} ${rolePart || ''} ${
        optionaltitle || ''
    } ${fromDate} to ${toDate}`;
};

export const colors = [
    '#00628B',
    '#072838',
    '#6CC2F6',
    '#D47ACC',
    '#C0C64F',
    '#F26003',
    '#E89510',
    '#DA021C',
    '#752671',
    '#489A9D',
    '#BB3D05',
    '#3A3E01',
    '#560F08',
    '#9D5400',
];

export const ProductType = {
    IUL: 'INDEX_UNIVERSAL_LIFE',
    Term: 'TERM',
    ROP: 'ROP',
} as const;

// Dropdown options for the "Product Type" select
export const PRODUCT_TYPE_OPTIONS = [
    { value: ProductType.IUL, label: 'IUL' },
    { value: ProductType.Term, label: 'Term' },
    { value: ProductType.ROP, label: 'ROP' },
];

export const ActivityType = {
    Created: 'Created',
    Duplicated: 'Duplicated',
    Selected: 'Selected',
} as const;

export const generateIllustrationsCSVFileName = (
    title: string,
    productType: string,
    timerange: Timerange
) => {
    const fromDate = dayjs(timerange.from).format(defaultDateFormat);
    const toDate = dayjs(timerange.to).format(defaultDateFormat);

    return `${productType} ${title || ''} ${fromDate} to ${toDate}`;
};
