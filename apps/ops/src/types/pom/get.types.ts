import {
    AddressType,
    ApiBackgroundCheckStatus,
    Appointment,
    AppointmentStatus,
    BackgroundCheck,
    Channel,
    CorporationType,
    License,
    LicensesAndAppointmentsStatus,
    LicenseStatus,
    LineOfAuthorityType,
    PhoneNumberType,
    ProducerType,
} from '.';
import {
    AmlTrainingItem,
    ProductTrainingItem,
    StateTrainingItem,
} from './training-education.types';

export interface MockGetProducerResponse {
    producerType: ProducerType;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    fullName?: string;
    dateOfBirth?: string;
    socialSecurityNumber?: string;
    nationalProducerNumber?: string;
    taxPayerIdentificationNumber?: string;
    email?: string;
    trainings: {
        amlTrainings: AmlTrainingItem[];
        productTrainings: ProductTrainingItem[];
        stateTrainings: StateTrainingItem[];
    };
    phoneNumbers: {
        countryCode: string;
        number: string;
        extension: string;
        type: PhoneNumberType.PRIMARY;
    }[];
    addresses: {
        type: AddressType;
        line: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    }[];
    backgroundChecks: BackgroundCheck[];
    agencyType: CorporationType;
    channel: Channel;
    licensesAndAppointments: {
        status: LicensesAndAppointmentsStatus;
        licenses: License[];
        appointments: Appointment[];
    };
    carrierSellingCodeRoles?: Record<
        string,
        { sellingCode: string; role: string }[]
    >;
}

export interface ApiGetProducerResponse {
    producerType: ProducerType;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    nationalProducerNumber?: string;
    taxPayerIdentificationNumber?: string;
    caseId?: string;
    dateOfBirth?: string;
    socialSecurityNumber?: string;
    email?: string;
    hasLatestLicensesAndAppointments?: boolean;
    agencyType?: string;
    channel?: string;
    phoneNumbers?: {
        countryCode: string;
        number: string;
        extension?: string;
        type: string;
    }[];
    addresses: {
        type: string;
        line: string;
        line2?: string;
        city: string;
        state: string;
        country: string;
        zipCode?: string;
        effectiveDates: {
            startDate: string;
            endDate: string;
            isCurrent: boolean;
        };
    }[];
    backgroundChecks: ApiBackgroundCheck[];
    licensesAndAppointments: {
        status?: string;
        licenses: ApiLicense[];
        appointments: ApiAppointment[];
    };
    carrierShortNames?: string[];
    carrierSellingCodeRoles?: Record<
        string,
        { sellingCode: string; role: string }[]
    >;
    employers?: [
        {
            name: string;
            address: {
                type: string;
                line: string;
                line2: string;
                city: string;
                state: string;
                country: string;
                zipCode: string;
                effectiveDates: {
                    startDate: string;
                    endDate: string;
                    isCurrent: boolean;
                };
            };
            jobTitle: string;
            effectiveDates: {
                startDate: string;
                endDate: string;
                isCurrent: boolean;
            };
            contactInfo: {
                phoneNumber: {
                    countryCode: string;
                    number: string;
                    extension: string;
                    type: string;
                };
                contactPerson: {
                    firstName: string;
                    lastName: string;
                };
                email: string;
                postalAddress: {
                    type: string;
                    line: string;
                    line2: string;
                    city: string;
                    state: string;
                    country: string;
                    zipCode: string;
                    effectiveDates: {
                        startDate: string;
                        endDate: string;
                        isCurrent: boolean;
                    };
                };
            };
        }
    ];
}

export interface ApiLicense {
    type?: string;
    state?: string;
    residentState: boolean;
    // this is a string in the api
    status?: LicenseStatus;
    statusDate?: string;
    effectiveDate?: string;
    expirationDate?: string;
    number?: string;
    inactivationReason?: string;
    suspensionStartDate?: string;
    suspensionEndDate?: string;
    lineOfAuthorities?: ApiLineOfAuthority[];
}

export interface ApiLineOfAuthority {
    type?: string;
    state?: string;
    status?: string;
    statusDate?: string;
    issueDate?: string;
    expirationDate?: string;
    inactivationReason?: string;
}

export interface ApiAppointment {
    id?: string;
    type?: string;
    licenseType?: string;
    licenseCategory?: string;
    stateProducerNumber?: string;
    residentCountyCode?: string;
    counties?: string[];
    terminationReason?: string;
    carrier?: string;
    state?: string;
    resident?: boolean;
    status?: AppointmentStatus;
    effectiveDate?: string;
    company?: string;
    licenseNumber?: string;
    linesOfAuthority: LineOfAuthorityType[];
}

export interface ApiBackgroundCheck {
    requestId: string;
    status: ApiBackgroundCheckStatus;
    adjudication: {
        result: string;
        carrierResult: string;
    };
    requestDate: string;
    completionDate: string;
    carrierShortName: string;
}
