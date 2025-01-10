export type GetProducerResponse = Agent | Agency;

export interface Agent {
    producerType: ProducerType.Individual;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    caseId?: string;
    taxId?: string;
    dateOfBirth?: string;
    socialSecurityNumber?: string;
    taxPayerIdentificationNumber?: string;
    nationalProducerNumber?: string;
    email?: string;
    phoneNumbers?: [
        {
            countryCode?: string;
            number?: string;
            extension?: string;
            type?: PhoneType;
        }
    ];
    addresses?: [
        {
            line?: string;
            line2?: string;
            city?: string;
            state?: string;
            country?: string;
            zipCode?: string;
            effectiveDates?: {
                startDate?: string;
                endDate?: string;
                isCurrent?: boolean;
            };
        }
    ];
    employers?: [
        {
            name?: string;
            address?: {
                line?: string;
                line2?: string;
                city?: string;
                state?: string;
                country?: string;
                zipCode?: string;
                effectiveDates?: {
                    startDate?: string;
                    endDate?: string;
                    isCurrent?: boolean;
                };
            };
            jobTitle?: string;
            effectiveDates?: {
                startDate?: string;
                endDate?: string;
                isCurrent?: boolean;
            };
            contactInfo?: {
                phoneNumber?: {
                    countryCode?: string;
                    number?: string;
                    extension?: string;
                    type?: PhoneType;
                };
                contactPerson?: {
                    firstName?: string;
                    lastName?: string;
                };
                email?: string;
                postalAddress?: {
                    line?: string;
                    line2?: string;
                    city?: string;
                    state?: string;
                    country?: string;
                    zipCode?: string;
                    effectiveDates?: {
                        startDate?: string;
                        endDate?: string;
                        isCurrent?: boolean;
                    };
                };
            };
        }
    ];
    backgroundCheck?: {
        requestId?: string;
        status?: BackgroundCheckStatus;
        adjudication?: {
            result?: BackgroundCheckAdjudicationResult;
        };
        requestDate?: string;
        completionDate?: string;
    };
    licenses?: [
        {
            type?: string;
            state?: string;
            status?: string;
            statusDate?: string;
            effectiveDate?: string;
            expirationDate?: string;
            number?: string;
            inactivationReason?: string;
            suspensionStartDate?: string;
            suspensionEndDate?: string;
        }
    ];
    appointments?: [
        {
            id?: string;
            state?: string;
            type?: string;
            effectiveDate?: string;
            status?: AppointmentStatus;
            company?: string;
            licenseType?: string;
            licenseCategory?: string;
            stateProducerNumber?: string;
            residentCountyCode?: string;
            counties?: string[];
            terminationReason?: string;
        }
    ];
    lineOfAuthorities?: [
        {
            type?: string;
            state?: string;
            status?: string;
            statusDate?: string;
            issueDate?: string;
            expirationDate?: string;
            inactivationReason?: string;
        }
    ];
    hasLatestLnA?: boolean;
}

export interface Agency {
    producerType: ProducerType.Corporation;
    fullName?: string;
    caseId?: string;
    taxId?: string;
    socialSecurityNumber?: string;
    taxPayerIdentificationNumber?: string;
    nationalProducerNumber?: string;
    email?: string;
    phoneNumbers?: [
        {
            countryCode?: string;
            number?: string;
            extension?: string;
            type?: PhoneType;
        }
    ];
    addresses?: [
        {
            line?: string;
            line2?: string;
            city?: string;
            state?: string;
            country?: string;
            zipCode?: string;
            effectiveDates?: {
                startDate?: string;
                endDate?: string;
                isCurrent?: boolean;
            };
        }
    ];
    licenses?: [
        {
            type?: string;
            state?: string;
            status?: string;
            statusDate?: string;
            effectiveDate?: string;
            expirationDate?: string;
            number?: string;
            inactivationReason?: string;
            suspensionStartDate?: string;
            suspensionEndDate?: string;
        }
    ];
    appointments?: [
        {
            id?: string;
            state?: string;
            type?: string;
            effectiveDate?: string;
            status?: AppointmentStatus;
            company?: string;
            licenseType?: string;
            licenseCategory?: string;
            stateProducerNumber?: string;
            residentCountyCode?: string;
            counties?: string[];
            terminationReason?: string;
        }
    ];
    lineOfAuthorities?: [
        {
            type?: string;
            state?: string;
            status?: string;
            statusDate?: string;
            issueDate?: string;
            expirationDate?: string;
            inactivationReason?: string;
        }
    ];
    hasLatestLnA?: boolean;
}

export enum ProducerType {
    Corporation,
    Individual,
}

export enum PhoneType {
    Primary,
    Alternate,
    Residential,
    Business,
    Cellular,
    FaxNumber,
    TollFreeNumber,
    Unknown,
}

export enum AppointmentStatus {
    Pending,
    Active,
    Inactive,
    Terminated,
}

export enum BackgroundCheckStatus {
    Pending,
    Completed,
    Cancelled,
    Error,
}

export enum BackgroundCheckAdjudicationResult {
    Pass,
    Fail,
    Review,
}
