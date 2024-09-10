import { render } from '@testing-library/react';

import { PolicyAllOfPartiesItem, PolicyCoverage, RelationshipToInsured } from '@deps/models/policy/sor-policy';
import { mockT as t } from '@deps/setupTests';

import {
    findCoverageParticipant,
    getBankAccountType,
    getEmploymentStatus,
    getHeaderIcon,
    getHeaderText,
    getPrefCommunicationType,
    getRelationshipToInsured,
    getRiskClass,
    getSexAtBirth,
    getSubstandardRating,
    getAddressType,
    getFullName,
} from './party-info-helper';

const partyInfo: PolicyAllOfPartiesItem = {
    partyId: 'Party_PI_1',
    beneficiaryPercentage: 0,
    partyType: 'INDIVIDUAL',
    firstName: 'PRASHANT',
    middleName: 'KISHOR',
    lastName: 'SINGH-TC03',
    fullName: '',
    prefix: 'MR',
    suffix: 'JR',
    gender: 'MALE',
    dateOfBirth: '2004-10-05',
    birthCountry: 'US',
    birthState: 'CA',
    trustType: '',
    preferredCommunicationType: 'EMAIL',
    addresses: [
        {
            addressId: '1',
            startDate: '2023-05-11',
            endDate: '',
            addressType: 'RESIDENCE',
            addressLine1: '675 RHOADS DR',
            addressLine2: '',
            addressLine3: '',
            city: 'Hillsborugh',
            state: 'PA',
            zipCode: '08844',
            zipCodeExtension: '',
            country: 'US',
        },
    ],
    phones: [
        {
            phoneId: '1',
            startDate: '2023-05-11',
            endDate: '',
            phoneType: 'MOBILE',
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
            emailType: 'PERSONAL',
            emailAddress: 'Prashant.Singh@gmail.com',
        },
    ],
    bankDetails: [
        {
            accountNumber: '123x456789006569',
            accountStatus: 'ACTIVEBANKACCOUNT',
            accountType: 'CHECKING',
            appliesToPartyId: 'Party_PI_1',
            branchName: 'BANK OF AMERICA',
            endDate: '',
            bankId: 'BANK_1',
            internationalBankAccountNumber: '123',
            nameOnAccount: 'FLORENCE ANDERSON',
            routingNumber: '121000358',
            startDate: '2023-11-17',
        },
    ],
    insured: {
        employed: true,
        employmentStatus: 'RETIRED',
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
    identifications: [],
};

const coverage: PolicyCoverage = {
    coverageLayers: [
        {
            coverageParticipants: [
                {
                    flatExtra: [],
                    issueAge: 18,
                    partyId: 'Party_PI_1',
                    riskClass: 'STANDARDTOBACCO',
                    substandardRating: 'NONETABLE',
                },
            ],
        },
    ],
};

describe('getHeaderIcon', () => {
    it('should return an icon for individual party', () => {
        const icon = getHeaderIcon(partyInfo.partyType);
        expect(icon).not.toBeNull();
    });
});

describe('getHeaderText', () => {
    it('should return correct JSX for individual party', () => {
        const result = getHeaderText(partyInfo);

        if (typeof result === 'string') {
            throw new Error('Expected JSX.Element but got string');
        }

        const { container } = render(result);
        expect(container.textContent?.trim()).toBe('Prashant Kishor Singh-tc03 Jr');
    });
});

describe('getPrefCommunicationType', () => {
    it('should return correct JSX for preferred communication type', () => {
        const result: JSX.Element | null = getPrefCommunicationType(partyInfo, t);
        if (result) {
            const { container } = render(result);
            expect(container.textContent?.trim()).toContain('prashant.singh@gmail.com');
        } else {
            fail('Component did not render');
        }
    });
});

describe('getRelationshipToInsured', () => {
    it('should return correct relationship to insured', () => {
        const relationshipToInsured = getRelationshipToInsured(RelationshipToInsured.STEPFATHER, t);

        expect(relationshipToInsured).toBe(t('relationshipToInsured.stepfather'));
    });
});

describe('getBankAccountType', () => {
    it('should return correct account type', () => {
        let bankAccountType;
        if (partyInfo?.bankDetails) {
            bankAccountType = getBankAccountType(partyInfo.bankDetails[0].accountType, t);
        }
        expect(bankAccountType).toBe(t('bankAccountType.checking'));
    });
});

describe('getBankAccountTypeAndAccount', () => {
    it('should return correct account type with account string appended', () => {
        let bankAccountType;
        if (partyInfo?.bankDetails) {
            bankAccountType = getBankAccountType(partyInfo.bankDetails[0].accountType, t, true);
        }
        expect(bankAccountType).toBe(`${t('bankAccountType.checking')} ${t('account')}`);
    });
});

describe('findCoverageParticipant', () => {
    it('should return correct coverage participant', () => {
        const coverageParticipant = findCoverageParticipant(coverage, partyInfo.partyId);
        expect(coverageParticipant?.partyId).toBe('Party_PI_1');
    });
});

describe('getRiskClass', () => {
    it('should return correct risk class', () => {
        let riskClass;
        const coverageParticipant = findCoverageParticipant(coverage, partyInfo.partyId);
        if (coverageParticipant) {
            riskClass = getRiskClass(coverageParticipant.riskClass, t);
        }
        expect(riskClass).toBe(t('people.card.underwritingInfo.riskClassOptions.standardTobacco'));
    });
});

describe('getSubstandardRating', () => {
    it('should return correct substandard rating', () => {
        let substandardRating;
        const coverageParticipant = findCoverageParticipant(coverage, partyInfo.partyId);
        if (coverageParticipant) {
            substandardRating = getSubstandardRating(coverageParticipant.substandardRating, t);
        }
        expect(substandardRating).toBe(t('people.card.underwritingInfo.substandardRatingOptions.none'));
    });
});

describe('getSexAtBirth', () => {
    it('should return correct sex at birth', () => {
        const gender = getSexAtBirth(partyInfo.gender, t);
        expect(gender).toBe(t('people.card.underwritingInfo.gender.male'));
    });
});

describe('getEmploymentStatus', () => {
    it('should return correct employment status', () => {
        let employmentStatus;
        if (partyInfo?.insured) {
            employmentStatus = getEmploymentStatus(partyInfo?.insured.employmentStatus, t);
        }
        expect(employmentStatus).toBe(t('people.card.underwritingInfo.employmentStatus.retired'));
    });
});

describe('getAddressType', () => {
    it('should return correct address Type', () => {
        let addressType;
        if (partyInfo?.addresses) {
            addressType = getAddressType(partyInfo?.addresses[0]?.addressType, t);
        }
        expect(addressType).toBe(t('people.card.addressOptions.residence'));
    });
});

describe('getFullName', () => {
    it('should join name properties with a space', () => {
        const fullName = getFullName(partyInfo);

        expect(fullName).toBe('Mr Prashant Kishor Singh-tc03 Jr');
    });

    it('should not add a space for empty name properties', () => {
        partyInfo.suffix = undefined;
        partyInfo.prefix = undefined;
        const fullName = getFullName(partyInfo);

        expect(fullName).toBe('Prashant Kishor Singh-tc03');
    });
});
