import { LiteralUnion, ValueOf } from 'type-fest';

import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';

import { ProductTypes } from './product';

export interface IllustraionsClientCaseSearchResponse {
    limit: number;
    offset: number;
    results: IllustrationsClientCase[];
    total: number;
    count: number;
}

export enum TransactionType {
    REPLACEMENT = 'REPLACEMENT',
    NONREPLACEMENT = 'NONREPLACEMENT',
    CONVERSION = 'CONVERSION',
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
    originalFaceAmount?: number;
    isMec?: boolean;
    transactionType?: TransactionType;
    carrierCode?: string[];
}

export interface IllustrationSummary {
    id: string;
    productType: IllustrationProductType;
    productId: string; // this is storing carrierProductId, final desition on which field pending
    status: IllustrationStatus;
    title?: string;
    inputs?: string;
}

export interface IllustrationAgentDetails {
    firstName?: string;
    lastName?: string;
    sellingCode?: string;
    npn?: string;
    email?: string;
}

export type SexAtBirthType = LiteralUnion<'MALE' | 'FEMALE', string>;

export interface IllustrationInsuredDetails {
    firstName?: string;
    lastName?: string;
    sexAtBirth?: SexAtBirthType;
    dateOfBirth?: Date;
    nicotineUser?: boolean;
    state?: string;
    illustrateAtOlderAge?: boolean;
    issueAge?: number;
    underwritingClass?: UnderwritingClass;
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

export const RIDER_NAMES = {
    ACCIDENTAL_DEATH_BENEFIT: 'accidentalDeathBenefit',
    ACCELERATED_DEATH_BENEFIT: 'acceleratedDeathBenefit',
    ACCELERATED_DEATH_BENEFIT_FOR_TERMINAL_ILLNESS:
        'acceleratedDeathBenefitForTerminalIllness',
    ACCELERATED_DEATH_BENEFIT_FOR_CHRONIC_ILLNESS:
        'acceleratedDeathBenefitForChronicIllness',
    CHARITABLE_GIVING: 'charitableGiving',
    CHILDRENS_TERM: 'childrensTerm',
    OVERLOAN_PROTECTION: 'overloanProtection',
    WAIVER_OF_DEDUCTION: 'waiverOfDeduction',
    WAIVER_OF_PREMIUM: 'waiverOfPremium',
    GUARANTEED_INSURABILITY_BENEFIT: 'guaranteedInsurabilityBenefit',
    OWNER_WAIVER_OF_DEDUCTION: 'ownerWaiverOfDeduction',
} as const;

export type RiderName = ValueOf<typeof RIDER_NAMES>;
