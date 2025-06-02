import { faker } from '@faker-js/faker';
import { Gender, PartyType, PreferredCommunicationType, State, Country, TrustType, EntityType } from '@zinnia/api-types/types/sor';

import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { Party } from '@deps/models/policy-sor-touchups/Party';

import { generateAddress } from './mockAddresses';
import { generateBankDetails } from './mockBankDetails';
import { generateEmail } from './mockEmails';
import { generateIdentification } from './mockIdentifications';
import { generatePhone } from './mockPhones';

export const generateParty = (partyId: string): Party => {
    const gender = faker.person.sexType();
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName(gender);

    const dateOfBirth = faker.date
        .past({ years: 65, refDate: new Date().getDate() - 18 })
        .toISOString()
        .split('T')[0];

    const identifications = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => generateIdentification());
    const addresses = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => generateAddress());
    const phones = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => generatePhone());
    const emails = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => generateEmail());
    const bankDetails = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
        generateBankDetails(partyId, `${firstName} ${lastName}`)
    );

    return {
        partyId: partyId,
        beneficiaryPercentage: faker.number.int(100),
        partyPercentage: faker.number.int(100),
        partyType: PartyType.INDIVIDUAL,
        firstName: firstName,
        middleName: faker.person.middleName(gender),
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        gender: gender.toUpperCase() as Gender,
        dateOfBirth: dateOfBirth,
        attainedAge: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
        birthCountry: Country.US,
        birthState: faker.location.state({ abbreviated: true }) as State,
        trustDate: faker.date.past({ years: 20 }).toISOString().split('T')[0],
        trustType: TrustType.INDIVIDUALTRUST,
        doingBusinessAs: `${firstName} Enterprises`,
        abbreviatedName: firstName,
        organizationCode: `${faker.number.int({ min: 100, max: 999 })}-${faker.string.alpha(3)}`,
        entityType: EntityType.SOLEPROPRIETORSHIP,
        preferredCommunicationType: faker.helpers.arrayElement(Object.values(PreferredCommunicationType)),
        identifications: identifications,
        addresses: addresses,
        phones: phones,
        emails: emails,
        bankDetails: bankDetails,
    };
};

export const generateClassParty = (partyId: string): PolicyParty => {
    const party = generateParty(partyId);
    const policyParty = new PolicyParty(party);
    return policyParty;
};
