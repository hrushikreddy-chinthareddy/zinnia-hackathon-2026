import type { LiteralUnion, ValueOf } from 'type-fest';

export interface GetHierarchyResponse {
    producerLookupId: string;
    carrier: Carrier;
    products: Product[];
    effectiveDate: string;
    expiryDate?: string;
    upline: Upline | null;
    payTo?: PayTo;
    paidAffiliate?: PaidAffiliate;
    level: number;
    sellingCode: string;
    role: ProducerRole;
}

export const PRODUCER_ROLES = {
    GENERAL_AGENCY: 'GeneralAgency',
    BROKER_DEALER: 'BrokerDealer',
    INDEPENDENT_MARKETING_ORGANIZATION: 'IndependentMarketingOrganization',
    THIRD_PARTY_MARKETER: 'ThirdPartyMarketer',
    REGISTERED_INVESTMENT_ADVISOR: 'RegisteredInvestmentAdvisor',
    REP: 'Rep',
} as const;

export type ProducerRole = LiteralUnion<ValueOf<typeof PRODUCER_ROLES>, string>;

export const MAIN_AGENCY_ROLE = PRODUCER_ROLES.GENERAL_AGENCY;

export type AgencyRole =
    | typeof MAIN_AGENCY_ROLE
    | 'BrokerDealer'
    | 'IndependentMarketingOrganization'
    | 'ThirdPartyMarketer'
    | 'RegisteredInvestmentAdvisor'
    | 'Rep';

export interface GetDownlineResponse {
    sellingCode: string | null;
    npn: string | null;
    role: ProducerRole;
    level: number;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    emailAddress: string;
}

export interface Carrier {
    carrierShortName: string;
    name: string;
    externalMasterId?: string;
    externalCarrierCode?: string;
    id: string;
    parentCompany?: Carrier;
    childrenCompanies?: Carrier[];
}

export interface Product {
    name: string;
}

export type Upline = UplineItem[];

export interface UplineItem {
    firstName: string;
    lastName: string;
    middleName: string;
    fullName: string;
    addresses: Address[];
    producerType: string;
    nationalProducerNumber: string;
    payoutFrequencyPreference?: string;
    paymentMethod?: string;
    paymentInfo?: PaymentInfo;
    hierarchyId: string;
    level: number;
    role: ProducerRole;
    sellingCode: string;
}

export interface Address {
    type: string;
    line: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    effectiveDates?: EffectiveDates;
}

export interface EffectiveDates {
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

export interface PaymentInfo {
    taxId: string;
    bankingInformation: BankingInformation;
}

export interface BankingInformation {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    branchNumber: string;
}

export interface PayTo {
    firstName: string;
    lastName: string;
    middleName: string;
    fullName: string;
    addresses: Address[];
    producerType: string;
    nationalProducerNumber: string;
    payoutFrequencyPreference: string;
    paymentMethod: string;
    hierarchyId: string;
    level: number;
    role: string;
}

export interface PaidAffiliate {
    name: string;
    address: Address;
    taxIdentification: TaxIdentification;
}

export interface TaxIdentification {
    value: string;
    type: string;
}

export interface ProducersResponse {
    producers: ProducerSearchResult[];
}

export const PRODUCER_SEARCH_RESULT_TYPES = {
    INDIVIDUAL: 'Individual',
    CORPORATION: 'Corporation',
} as const;

export type ProducerSearchResultType = LiteralUnion<
    ValueOf<typeof PRODUCER_SEARCH_RESULT_TYPES>,
    string
>;

export interface ProducerSearchResult {
    name: string;
    type: ProducerSearchResultType;
    email: string;
    lookupId: string;
}
