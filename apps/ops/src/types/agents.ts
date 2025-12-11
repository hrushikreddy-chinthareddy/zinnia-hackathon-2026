// BPB note: this is being loosely typed from a QA response as the  API doesn't have a spec

import { CarrierCode } from '@deps/constants/policy';
import { PhoneType } from '@zinnia/api-types/types/sor';

import { ProducerType } from './pom';
import { AgencyRole } from './producers';

// certain string values may be enumerated, and the unknowns I just couldn't infer or didnt' need for now
export interface AgentData {
    accordiaAgentIndicator: boolean;
    advancePercent1035: number | null;
    advancedPercent403b: number | null;
    backgroundCheck: unknown | null;
    backgroundCheckRequestDate: string | null;
    backgroundCheckResultDate: string | null;
    bankAccountNumber: string | null;
    bankAccountTypeId: string | null;
    bankName: string | null;
    canSellLetterRouting: unknown;
    canSellLetterRoutingId: unknown;
    checkHoldIndicator: boolean;
    companyId: string | null;
    confirmationRouting: string | null;
    confirmationRoutingId: number | null;
    correspondenceRouting: string | null;
    correspondenceRoutingId: number | null;
    createDate: string | null;
    createUserId: string | null;
    disbursementOverrideIndicator: boolean;
    disbursementParty: unknown;
    doNotHireDate: string | null;
    doNotHireIndicator: boolean | null;
    doNotHireModifierId: string | null;
    dsoIndicator: boolean | null;
    eftIndicator: boolean | null;
    externalId: string | null;
    externalPayIndicator: boolean | null;
    externalPayTestIndicator: boolean | null;
    finra: unknown | null;
    fixedIndicator: boolean | null;
    followUpDate: unknown | null;
    garnishmentLeviesIndicator: boolean | null;
    hireDate: string | null;
    houseAccountIndicator: boolean | null;
    id: string | null;
    marketChannelTypeId: unknown | null;
    masterNumber: string | null;
    modifyDate: string | null;
    modifyUserId: string | null;
    nameType: string | null;
    nameTypeId: string | null;
    neaIndicator: boolean | null;
    netRemitIndicator: boolean | null;
    nipr: number | null;
    organizationName: string | null;
    payCommissionIndicator: boolean | null;
    payFrequency: string | null;
    payFrequencyId: number | null;
    paymentMethodId: unknown | null;
    persistencyTrailType: unknown | null;
    persistencyTrailTypeId: unknown | null;
    policyPageRouting: string | null;
    policyPageRoutingId: number | null;
    revertSalesIndicator: boolean | null;
    routingNumber: unknown | null;
    soaRouting: string | null;
    soaRoutingId: number | null;
    statementCopies: number | null;
    statementPullIndicator: boolean | null;
    status: string | null;
    statusId: string | null;
    suitability: unknown | null;
    taxId: string | null;
    taxIdType: string | null;
    taxIdTypeId: string | null;
    termDate: string | null;
    trailOption: string | null;
    type: string | null;
    typeId: number | null;
    variableIndicator: boolean | null;
    verticalSplitProfileId: string | null;
    verticalSplitRequiredIndicator: boolean | null;
    vestingCode: unknown | null;
    w2Indicator: boolean | null;
    w8BenEffDate: unknown | null;
    w8BenIndicator: boolean | null;
    welcomeLetterRouting: unknown | null;
    welcomeLetterRoutingId: unknown | null;
    wireIndicator: boolean | null;
    addresses: AgentAddress[];
    emails: AgentEmail[];
    individuals: {
        birthDate: string | null;
        businessName: string | null;
        createDate: string | null;
        createUserId: string | null;
        firstName: string | null;
        gender: string | null;
        id: string | null;
        individualType: string | null;
        individualTypeId: number | null;
        lastName: string | null;
        middleName: string | null;
        modifyDate: string | null;
        modifyUserId: string | null;
        prefix: string | null;
        prefixTypeId: number | null;
        salesEntityId: string | null;
        shortName: string | null;
        suffix: string | null;
        suffixTypeId: unknown | null;
        taxId: string | null;
        taxIdType: string | null;
        taxIdTypeId: string | null;
        fullName: string | null;
    }[];
    phones: AgentPhone[];
    // BPB - ToDo - type this when needed
    appointments: Appointment[];
    hierarchy: {
        channel: string | undefined;
        channelDescription: string | undefined;
        channelId: number | undefined;
        externalId: string | undefined;
        hierarchyKey: string | undefined;
        hierarchyTypeId: number | undefined;
        // to do - there is more data here but for now this is more than we need to display
    }[];
    // BPB - ToDo - type this when needed
    licenses: License[];
    // BPB - ToDo - type this when needed
    linesOfBusiness: unknown[];
    // BPB - ToDo - type this when needed
    otherIds: unknown[];
    // BPB - ToDo - type this when needed
    salesDesignations: unknown[];
    // BPB - ToDo - type this when needed
    salesHierarchy: unknown[];
    // BPB - ToDo - type this when needed
    training: unknown[];
}

export interface PomAgentData {
    alternateIds: AlternateIds[];
    businessPhone: AgentPhone;
    businessAddress: AgentAddress;
    carrierSellingCodes: CarrierSellingCodes;
    email: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    middleName: string | undefined;
    nationalProducerNumber: string | undefined;
    partyId: string | undefined;
    producerType: ProducerType;
    producerName: string | undefined;
    socialSecurityNumber: string | undefined;
}
export type AlternateIds = {
    carrierShortName: typeof CarrierCode;
    key: string | null;
    value: string | null;
};

export interface SellingCode {
    sellingCode: string | null;
    role: AgencyRole;
}

export type CarrierSellingCodes = {
    [key in CarrierCode]: SellingCode[];
};

export interface LineOfAuthority {
    id: string;
    salesAppointmentId: string;
    lineOfAuthorityTypeId: number;
    type: string;
    createDate: string;
    createUserId: string;
    modifyDate: string;
    modifyUserId: string;
}

export interface Appointment {
    appointmentDate: string;
    assumeInXDayps: number;
    createDate: string;
    createUserId: string;
    externalAppointmentId: string | null;
    externalLicenseId: string | null;
    id: string;
    licenseId: string;
    modifyUserId: string;
    naicId: string | null;
    niprId: string | null;
    productCompanyId: string | null;
    residentStateIndicator: boolean;
    salesEntityId: string;
    state: string;
    stateFullName: string;
    stateRequirementId: number;
    status: string;
    statusId: number;
    terminationDate: string;
    terminationReasonId: number | null;
    trackEducationIndicator: boolean;
    linesOfAuthority: LineOfAuthority[];
}
export interface AgentAddress {
    addressLine1: string | null;
    addressLine2: string | null;
    addressLine3: string | null;
    addressLine4: string | null;
    addressType: string | null;
    addressTypeId: number | null;
    city: string | null;
    country: string | null; // 3-letter country code?
    countryCodeId: number | null;
    createDate: string | null;
    createUserId: string | null;
    id: string | null;
    linkId: string | null;
    modifyDate: string | null;
    modifyUserId: string | null;
    salesEntityId: string | null;
    stateCode: string | null; // 2-digit state code?
    zip: string | null;
    type: string | null;
    line: string | null;
    line2: string | null;
    state: string | null;
    zipCode: string | null;
}

export interface AgentPhone {
    areaCode: string | null;
    countryCode: string | null;
    createDate: string | null;
    createUser: string | null;
    extension: string | null;
    id: string | null;
    modifyDate: string | null;
    modifyUser: string | null;
    number: string | null;
    phoneType: string | null;
    phoneTypeId: number | null;
    salesEntityId: string | null;
    type: PhoneType | null;
}

export interface AgentEmail {
    createDate: string | null;
    createUserId: string | null;
    email: string | null;
    emailType: string | null;
    emailTypeId: number | null;
    id: string | null;
    modifyDate: string | null;
    modifyUserId: string | null;
    salesEntityId: string | null;
}

export interface AgentDataResponse {
    items: AgentData[];
    sql: null;
    totalCount: number;
}

type License = {
    assumeInXDays: number;
    createDate: string;
    createUserId: string;
    description: string;
    effectiveDate: string;
    entityName: string | null;
    entityTin: string | null;
    expireDate: string;
    externalLicenseId: string | null;
    id: string;
    licenseRenewalDate: string;
    modifyDate: string;
    modifyUserId: string;
    number: string;
    residentStateIndicator: boolean;
    salesEntityId: string;
    state: string;
    stateFullName: string;
    stateRequirementId: number;
    trackEducationIndicator: boolean;
    type: string;
    typeId: number;
    linesOfAuthority: LineOfAuthority[];
};
