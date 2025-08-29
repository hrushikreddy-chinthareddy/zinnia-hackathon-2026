export interface GetHierarchyResponse {
    producerLookupId: string;
    carrier: Carrier;
    products: Product[];
    effectiveDate: string;
    expiryDate: string;
    upline: Upline[];
    payTo: PayTo;
    paidAffiliate: PaidAffiliate;
    level: number;
    sellingCode: string;
    role: string;
}

export const MAIN_AGENCY_ROLE = 'GeneralAgency';

type AgencyRole =
    | typeof MAIN_AGENCY_ROLE
    | 'BrokerDealer'
    | 'IndependentMarketingOrganization'
    | 'ThirdPartyMarketer'
    | 'RegisteredInvestmentAdvisor'
    | 'Rep';

export interface GetDownlineResponse {
    sellingCode: string;
    npn: string;
    role: AgencyRole;
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
    externalMasterId: string;
    externalCarrierCode: string;
    id: string;
    parentCompany?: Carrier;
    childrenCompanies?: Carrier[];
}

export interface Product {
    name: string;
}

export interface Upline {
    firstName: string;
    lastName: string;
    middleName: string;
    fullName: string;
    addresses: Address[];
    producerType: string;
    nationalProducerNumber: string;
    payoutFrequencyPreference: string;
    paymentMethod: string;
    paymentInfo?: PaymentInfo;
    hierarchyId: string;
    level: number;
    role: string;
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
