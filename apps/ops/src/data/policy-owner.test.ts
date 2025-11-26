import { Party } from '@deps/models/policy-sor-touchups/Party';
import {
    Address,
    PartyType,
    Suffix,
    Gender,
    Country,
    State,
    PreferredCommunicationType,
    AddressType,
    PhoneType,
    EmailType,
    EmploymentStatus,
    IdentificationType,
} from '@zinnia/api-types/types/sor';

import { toPolicyOwnerDto } from './policy-owner';

const partyInfo: Party = {
    partyId: 'Party_PI_1',
    beneficiaryPercentage: 0,
    partyType: PartyType.INDIVIDUAL,
    firstName: 'PRASHANT',
    middleName: 'KISHOR',
    lastName: 'SINGH-TC03',
    fullName: '',
    suffix: Suffix.JR,
    gender: Gender.MALE,
    dateOfBirth: '2004-10-05',
    birthCountry: Country.US,
    birthState: State.CA,
    trustType: undefined,
    preferredCommunicationType: PreferredCommunicationType.EMAIL,
    addresses: [
        {
            addressId: '1',
            startDate: '2023-05-11',
            endDate: '',
            addressType: AddressType.RESIDENCE,
            addressLine1: '675 RHOADS DR',
            addressLine2: '',
            addressLine3: '',
            city: 'Hillsborugh',
            state: State.PA,
            zipCode: '08844',
            zipCodeExtension: '',
            country: Country.US,
        },
    ],
    phones: [
        {
            phoneId: '1',
            startDate: '2023-05-11',
            endDate: '',
            phoneType: PhoneType.MOBILE,
            countryCode: '1',
            areaCode: '318',
            dialNumber: '9873960',
            extension: '0919',
            bestTime: '',
        },
    ],
    emails: [
        {
            emailId: '1',
            startDate: '2023-05-11',
            endDate: '',
            emailType: EmailType.PERSONAL,
            emailAddress: 'Prashant.Singh@gmail.com',
        },
    ],
    bankDetails: [],
    insured: {
        employed: true,
        employmentStatus: EmploymentStatus.RETIRED,
        existingLifeInsurance: false,
        existingLifeInsuranceAmount: 0,
        householdIncome: 0,
        isDependent: false,
        occupation: '',
        pendingOrPlanToBuyAdditional: false,
        replaceLifeInsurance: false,
    },
    timestamp: '',
    trustDate: '',
    identifications: [
        {
            identificationValue: '12345',
            identificationType: IdentificationType.SSN,
            issueState: State.CA,
            issueCountry: Country.NA,
        },
    ],
};

describe('Policy Owner Data helper', () => {
    it('returns a formatted name', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.fullName).toEqual(
            `${partyInfo.firstName} ${partyInfo.middleName?.[0]}. ${partyInfo.lastName} ${partyInfo.suffix}`
        );
    });

    it('returns a formatted ssn', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.ssn).toEqual(
            partyInfo.identifications?.[0].identificationValue
        );
    });

    it('returns a formatted birthday', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.birthDate).toEqual('10/5/2004');
    });

    it('returns a primary phone', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.primaryPhone).toEqual(partyInfo.phones?.[0]);
    });

    it('returns the correct primary phone when one is past endDate', () => {
        const initialPhone = partyInfo.phones?.[0];
        const newPhone = { ...initialPhone, dialNumber: '1234567' };

        const result = toPolicyOwnerDto({
            ...partyInfo,
            phones: [
                { ...initialPhone, endDate: initialPhone?.startDate },
                newPhone,
            ],
        });

        expect(result.primaryPhone).toEqual(newPhone);
    });

    it('returns an email address', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.email).toEqual(partyInfo.emails?.[0]);
    });

    it('returns the correct email address when one is past endDate', () => {
        const initialEmail = partyInfo.emails?.[0];
        const newEmail = { ...initialEmail, emailAddress: 'test@testing.com' };
        const result = toPolicyOwnerDto({
            ...partyInfo,
            emails: [
                { ...initialEmail, endDate: initialEmail?.startDate },
                newEmail,
            ],
        });

        expect(result.email).toEqual(newEmail);
    });

    it('returns an address', () => {
        const result = toPolicyOwnerDto(partyInfo);

        expect(result.mailingAddress).toEqual(partyInfo.addresses?.[0]);
    });

    it('returns the preferred address', () => {
        const unpreferredAddress = {
            ...partyInfo.addresses?.[0],
            addressLine1: '123 Unpreferred Road',
        };
        const result = toPolicyOwnerDto({
            ...partyInfo,
            addresses: [
                ...(partyInfo.addresses as Address[]),
                unpreferredAddress,
            ],
        });

        expect(result.mailingAddress).toEqual(partyInfo.addresses?.[0]);
    });

    it('returns the unpreferred address if the preferred address is past end date', () => {
        const initialAddress = partyInfo.addresses?.[0];
        const unpreferredAddress = {
            ...initialAddress,
            addressLine1: '123 Unpreferred Road',
        };
        const result = toPolicyOwnerDto({
            ...partyInfo,
            addresses: [
                unpreferredAddress,
                { ...initialAddress, endDate: initialAddress?.startDate },
            ],
        });

        expect(result.mailingAddress).toEqual(unpreferredAddress);
    });
});
