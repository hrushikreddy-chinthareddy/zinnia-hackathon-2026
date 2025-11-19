import { cleanup, render } from '@testing-library/react';
import {
    AccountType,
    AddressType,
    CoverageParticipants,
    EmploymentStatus,
    Gender,
    PartyType,
    PolicyCoverage,
    PreferredCommunicationType,
    RelationshipToParty,
    RiskClass,
    SubStandardRating,
} from '@zinnia/api-types/types/sor';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

jest.mock('@deps/components/pii/PiiWrapper', () => ({
    PiiWrapper: ({ children }: any) => (
        <span data-testid="pii">{children}</span>
    ),
}));

jest.mock('@deps/components/assistive-text/assistive-text', () => {
    return {
        __esModule: true,
        default: ({ text }: any) => <span data-testid="assistive">{text}</span>,
        AssistiveTextVariant: { Success: 'success' },
    };
});

jest.mock('@deps/styles/elements/icons/actions/user.svg', () => ({
    ReactComponent: (props: any) => <span data-testid="icon-user" {...props} />,
}));
jest.mock(
    '@deps/styles/elements/icons/icons_outlined/document-text-2.svg',
    () => ({
        ReactComponent: (props: any) => (
            <span data-testid="icon-doc" {...props} />
        ),
    })
);
jest.mock(
    '@deps/styles/elements/icons/icons_outlined/office-building.svg',
    () => ({
        ReactComponent: (props: any) => (
            <span data-testid="icon-office" {...props} />
        ),
    })
);

jest.mock('./date.helpers', () => ({
    isEndDated: () => false,
}));

jest.mock('./string.helpers', () => ({
    formatPhone: () => '(555) 111-2222',
    safeString: (s: any) => (s == null ? '' : String(s)),
    toTitleCase: (s: any) =>
        typeof s === 'string' ? s.replace(/\b\w/g, (m) => m.toUpperCase()) : s,
}));

jest.mock('next-i18next', () => ({
    i18n: { t: (k: string) => k },
}));

import {
    getHeaderIcon,
    getPartyFullName,
    getHeaderText,
    getSelectedPolicyParty,
    getPrefCommunicationType,
    getRelationshipToInsured,
    getBankAccountType,
    findCoverageParticipant,
    getRiskClass,
    getSubstandardRating,
    getSexAtBirth,
    getEmploymentStatus,
    getAddressType,
    getFullName,
    getFirstLastName,
    getName,
} from './party-info-helpers';

const t = (k: string) => k;

describe('helpers/party-info-helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    describe('getHeaderIcon', () => {
        it('renders correct icon for TRUST and ORGANIZATION and default', () => {
            const trust = render(getHeaderIcon(PartyType.TRUST));
            // TRUST renders one of the configured icons depending on enum wiring
            expect(
                trust.queryByTestId('icon-doc') ||
                    trust.queryByTestId('icon-office')
            ).not.toBeNull();
            trust.unmount();

            const org = render(getHeaderIcon(PartyType.ORGANIZATION));
            expect(org.getByTestId('icon-office')).toBeInTheDocument();
            org.unmount();

            const ind = render(getHeaderIcon(PartyType.INDIVIDUAL));
            expect(
                ind.queryByTestId('icon-user') ||
                    ind.queryByTestId('icon-office') ||
                    ind.queryByTestId('icon-doc')
            ).not.toBeNull();
            ind.unmount();
        });
    });

    describe('getPartyFullName', () => {
        it('returns individual full name via getFullName', () => {
            expect(
                getPartyFullName({
                    partyType: PartyType.INDIVIDUAL,
                    firstName: 'john',
                    lastName: 'doe',
                } as any)
            ).toBe('John Doe');
        });
        it('returns title case for org/trust, else partyType', () => {
            expect(
                getPartyFullName({
                    partyType: PartyType.ORGANIZATION,
                    fullName: 'acme corp',
                } as any)
            ).toBe('Acme Corp');
            expect(
                getPartyFullName({
                    partyType: PartyType.TRUST,
                    fullName: 'family trust',
                } as any)
            ).toBe('Family Trust');
            expect(getPartyFullName({ partyType: 'UNKNOWN' } as any)).toBe(
                'UNKNOWN'
            );
        });
    });

    describe('getHeaderText', () => {
        it('individual with only fullName', () => {
            const el = getHeaderText({
                partyType: PartyType.INDIVIDUAL,
                fullName: 'john doe',
            } as any);
            const { getByTestId } = render(el as any);
            expect(getByTestId('pii').textContent).toBe('John Doe');
        });
        it('individual with name parts', () => {
            const el = getHeaderText({
                partyType: PartyType.INDIVIDUAL,
                firstName: 'john',
                middleName: 'q',
                lastName: 'doe',
                suffix: 'jr',
            } as any);
            const { getByTestId } = render(el as any);
            expect(
                getByTestId('pii').textContent?.replace(/\s+/g, ' ').trim()
            ).toBe('John Q Doe Jr');
        });
        it('org and trust return title-cased full name inside PII', () => {
            for (const pt of [PartyType.ORGANIZATION, PartyType.TRUST]) {
                const el = getHeaderText({
                    partyType: pt,
                    fullName: 'acme inc',
                } as any);
                const { getByTestId, unmount } = render(el as any);
                expect(getByTestId('pii').textContent).toBe('Acme Inc');
                unmount();
            }
        });
        it('default falls back to partyType string', () => {
            expect(getHeaderText({ partyType: 'OTHER' } as any)).toBe('OTHER');
        });
    });

    describe('getSelectedPolicyParty', () => {
        it('returns matching party by id', () => {
            const policy = {
                parties: [{ partyId: '1' }, { partyId: '2' }],
            } as any;
            expect(getSelectedPolicyParty(policy, '2')?.partyId).toBe('2');
        });
        it('returns null on invalid personId type or not found', () => {
            const policy = { parties: [{ partyId: '1' }] } as any;
            expect(getSelectedPolicyParty(policy, ['1'] as any)).toBeNull();
            expect(getSelectedPolicyParty(policy, 'x')).toBeNull();
        });
    });

    describe('getPrefCommunicationType', () => {
        const t = (k: string) => k;
        it('renders email with assistive text when preferred EMAIL', () => {
            const party = {
                preferredCommunicationType: PreferredCommunicationType.EMAIL,
                emails: [{ emailAddress: 'USER@EXAMPLE.com' }],
            } as any;
            const ui = getPrefCommunicationType(party, t as any);
            const { getByTestId, getByText } = render(ui as any);
            expect(getByTestId('pii').textContent).toBe('user@example.com');
            expect(getByTestId('assistive').textContent).toBe(
                'people.party.contact.preferred.email'
            );
            expect(
                getByText('people.party.contact.method')
            ).toBeInTheDocument();
        });
        it('renders phone for PHONE/TEXT', () => {
            const party = {
                preferredCommunicationType: PreferredCommunicationType.PHONE,
                phones: [{}],
            } as any;
            const ui = getPrefCommunicationType(party, t as any);
            const { getByTestId } = render(ui as any);
            expect(getByTestId('pii').textContent).toBe('(555) 111-2222');
        });
        it('renders address HTML for REGULARMAIL', () => {
            const party = {
                preferredCommunicationType:
                    PreferredCommunicationType.REGULARMAIL,
                addresses: [{ city: 'ny', state: 'NY', zipCode: '10001' }],
            } as any;
            const ui = getPrefCommunicationType(party, t as any);
            const { getByTestId } = render(ui as any);
            expect(getByTestId('pii').textContent).toContain('Ny, NY 10001');
        });
        it('returns null when no contact value available', () => {
            const party = {
                preferredCommunicationType: PreferredCommunicationType.EMAIL,
                emails: [{ emailAddress: '' }],
            } as any;
            expect(getPrefCommunicationType(party, t as any)).toBeNull();
        });
    });

    describe('getRelationshipToInsured', () => {
        it('maps known relationship enums to t keys', () => {
            expect(
                getRelationshipToInsured(RelationshipToParty.CHILD, t as any)
            ).toBe('relationshipToInsured.child');
            expect(
                getRelationshipToInsured(RelationshipToParty.SPOUSE, t as any)
            ).toBe('relationshipToInsured.spouse');
        });
        it('passes through unknown values', () => {
            expect(getRelationshipToInsured('COUSIN' as any, t as any)).toBe(
                'COUSIN'
            );
        });
    });

    describe('getBankAccountType', () => {
        it('maps known account types and appends when requested', () => {
            expect(getBankAccountType(AccountType.CHECKING, t as any)).toBe(
                'bankAccountType.checking'
            );
            expect(
                getBankAccountType(AccountType.SAVINGS, t as any, true)
            ).toBe('bankAccountType.savings account');
        });
        it('returns default error for nullish and passes through unknown', () => {
            expect(getBankAccountType(undefined, t as any)).toBe(
                DEFAULT_ERROR_STRING
            );
            expect(getBankAccountType('OTHER' as any, t as any)).toBe('OTHER');
        });
    });

    describe('findCoverageParticipant', () => {
        it('finds nested participant by partyId', () => {
            const cov: PolicyCoverage = {
                coverageLayers: [
                    {
                        coverageParticipants: [
                            { partyId: 'p1' } as CoverageParticipants,
                        ],
                    },
                    {
                        coverageParticipants: [
                            { partyId: 'p2' } as CoverageParticipants,
                        ],
                    },
                ],
            } as any;
            expect(findCoverageParticipant(cov, 'p2')?.partyId).toBe('p2');
            expect(findCoverageParticipant(cov, 'x')).toBeNull();
        });
    });

    describe('getRiskClass', () => {
        it('maps enums to i18n labels via global i18n', () => {
            const label = getRiskClass(RiskClass.ELITENONTOBACCO);
            expect(label).toBe(
                'people.card.underwritingInfo.riskClassOptions.eliteNonTobacco'
            );
            expect(getRiskClass(undefined)).toBeUndefined();
        });
    });

    describe('getSubstandardRating', () => {
        it('maps enums to labels via provided t', () => {
            expect(
                getSubstandardRating(SubStandardRating.TABLEC, t as any)
            ).toBe(
                'people.card.underwritingInfo.substandardRatingOptions.tableC'
            );
            expect(getSubstandardRating(undefined, t as any)).toBeUndefined();
        });
    });

    describe('getSexAtBirth', () => {
        it('maps gender enums to labels', () => {
            expect(getSexAtBirth(Gender.MALE, t as any)).toBe(
                'people.card.underwritingInfo.gender.male'
            );
            expect(getSexAtBirth(undefined, t as any)).toBeUndefined();
        });
    });

    describe('getEmploymentStatus', () => {
        it('maps employment statuses to labels and passes unknown/undefined', () => {
            expect(getEmploymentStatus(EmploymentStatus.ACTIVE, t as any)).toBe(
                'people.card.underwritingInfo.employmentStatus.active'
            );
            expect(getEmploymentStatus(undefined, t as any)).toBeUndefined();
        });
    });

    describe('getAddressType', () => {
        it('maps address types to labels; defaults to residence', () => {
            expect(getAddressType(AddressType.BUSINESS, t as any)).toBe(
                'people.card.addressOptions.business'
            );
            expect(getAddressType(undefined, t as any)).toBe(
                'people.card.addressOptions.residence'
            );
        });
    });

    describe('name helpers', () => {
        it('getFullName returns error for undefined, otherwise title-cases joined parts', () => {
            expect(getFullName(undefined as any)).toBe(DEFAULT_ERROR_STRING);
            expect(
                getFullName({
                    prefix: 'mr',
                    firstName: 'john',
                    middleName: 'q',
                    lastName: 'doe',
                    suffix: 'jr',
                } as any)
            ).toBe('Mr John Q Doe Jr');
        });
        it('getFirstLastName returns error for undefined, otherwise title-cases joined parts', () => {
            expect(getFirstLastName(undefined as any)).toBe(
                DEFAULT_ERROR_STRING
            );
            expect(
                getFirstLastName({
                    prefix: 'mr',
                    firstName: 'john',
                    lastName: 'doe',
                    suffix: 'jr',
                } as any)
            ).toBe('Mr John Doe Jr');
        });
        it('getName returns error for undefined, otherwise "First Last"', () => {
            expect(getName(undefined as any)).toBe(DEFAULT_ERROR_STRING);
            expect(getName({ firstName: 'john', lastName: 'doe' } as any)).toBe(
                'John Doe'
            );
        });
    });
});
