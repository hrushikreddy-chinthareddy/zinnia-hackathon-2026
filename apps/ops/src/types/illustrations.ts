import { ProductTypes } from './product';

export interface IllustraionsClientCaseSearchResponse {
    limit: number;
    offset: number;
    results: IllustrationsClientCase[];
    total: number;
    count: number;
}

export interface IllustrationsClientCase {
    id: string;
    title?: string;
    caseManagementCaseId?: string;
    eAppId?: string;
    agentDetails?: IllustrationAgentDetails;
    insuredDetails?: IllustrationInsuredDetails;
    lastModified?: string;
    illustrations?: IllustrationSummary[];
    illustrationsCount?: number;
    productTypes: string[];
    agencyId: string;
    agencyName: string;
}

export interface IllustrationSummary {
    id: string;
    productType: IllustrationProductType;
    productId: string; // this is storing carrierProductId, final desition on which field pending
    status: IllustrationStatus;
    title?: string;
}

export interface IllustrationAgentDetails {
    firstName?: string;
    lastName?: string;
    agencyId?: string;
    npn?: string;
    email?: string;
}

export interface IllustrationInsuredDetails {
    firstName?: string;
    lastName?: string;
    sexAtBirth?: string;
    dateOfBirth?: Date;
    nicotineUser?: boolean;
    state?: string;
    illustrateAtOlderAge?: boolean;
    issueAge?: number;
    riskClass?: string;
    riskClassCode?: number;
}

export interface ClientCaseSearchInputs {
    eAppId?: string;
    title?: string;
    agentFirstName?: string;
    agentLastName?: string;
    insuredFirstName?: string;
    insuredLastName?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDir?: string;
}

export type SexAtBirth = 'Male' | 'Female'; /// this willchange to a a full upper case on enum for BE.
export type RiskClass =
    | 'platinum'
    | 'platinumChoice'
    | 'platinumPlus'
    | 'platinumElite'
    | 'platinumSubstandard'
    | 'gold'
    | 'goldPlus'
    | 'goldSubstandard'
    | 'juvenile'
    | 'juvenileSubstandard';

export enum IllustrationStatuses {
    SUBMITTED = 'SUBMITTED',
    SELECTED = 'SELECTED',
    ARCHIVED = 'ARCHIVED',
    EXPIRED = 'EXPIRED',
    ACTIVE = 'ACTIVE',
}

export type IllustrationType = 'INFORCE' | 'NEW_BUSINESS';

export type IllustrationProductType =
    | ProductTypes.INDEX_UNIVERSAL_LIFE
    | ProductTypes.UNIVERSAL_LIFE
    | ProductTypes.TERM;

export type IllustrationStatus =
    | IllustrationStatuses.SUBMITTED
    | IllustrationStatuses.SELECTED
    | IllustrationStatuses.ARCHIVED
    | IllustrationStatuses.EXPIRED
    | IllustrationStatuses.ACTIVE;

export interface searchClientCaseQuery {
    title?: string;
    agentFirstName?: string;
    agentLastName?: string;
    insuredFirstName?: string;
    insuredLastName?: string;
    eAppId?: string;
    caseManagementCaseId?: string;
}
