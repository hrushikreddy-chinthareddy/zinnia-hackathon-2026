import { TFunction } from 'next-i18next';

import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { PartyStatus, Rider, Status } from '@zinnia/api-types/types/sor';

import { getRiderInsured, getRiderStatusText } from './riders-table-helpers';
import { RIDER_NOT_ELECTED } from '../../policy-extras-cards/consts';

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogWarn: jest.fn(),
}));

const mockBrowserLogWarn = browserLogWarn as jest.Mock;

const t = ((key: string) => key) as unknown as TFunction;

const baseRider = {
    amount: undefined,
    charge: undefined,
    claimStatus: undefined,
    coverageId: undefined,
    effectiveDate: undefined,
    maximumChronicIllnessBenefitPercentage: undefined,
    maximumCriticalIllnessBenefitPercentage: undefined,
    maximumPeriodicPaymentPeriod: undefined,
    nextEvaluationDate: undefined,
    riderCode: undefined,
    riderElected: undefined,
    riderMinimumPaymentAmount: undefined,
    riderName: undefined,
    riderParticipant: [],
    riderPaymentDate: undefined,
    status: undefined,
    terminalRiderPaymentAmount: undefined,
    terminationDate: undefined,
    timestamp: undefined,
    type: undefined,
} as Rider;

describe('getRiderStatusText', () => {
    it('returns notElected text when rider is not elected', () => {
        const rider = {
            ...baseRider,
            riderElected: RIDER_NOT_ELECTED,
            status: 'active' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Policy.extras.riders.notelected');
    });

    it('returns available text when rider status is active', () => {
        const rider = {
            ...baseRider,
            status: 'active' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Policy.extras.riders.available');
    });

    it('returns active text when rider status is pending', () => {
        const rider = {
            ...baseRider,
            status: 'pending' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Policy.extras.riders.active');
    });

    it('returns terminated text when rider status is terminated', () => {
        const rider = {
            ...baseRider,
            status: 'terminated' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Policy.extras.riders.terminated');
    });

    it('returns rider status and logs error for unknown status', () => {
        const rider = {
            ...baseRider,
            status: 'unknown_status' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Unknown_status');
        expect(mockBrowserLogWarn).toHaveBeenCalledWith(
            'getRiderStatusText::Invalid or unsupported rider type',
            { riderStatus: 'unknown_status' }
        );
    });

    it('returns empty string for unknown status when rider.status is undefined', () => {
        const rider = {
            ...baseRider,
            status: undefined,
        } as Rider;

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('');
        expect(mockBrowserLogWarn).toHaveBeenCalledWith(
            'getRiderStatusText::Invalid or unsupported rider type',
            { riderStatus: undefined }
        );
    });

    it('prioritizes notElected check over status', () => {
        const rider = {
            ...baseRider,
            riderElected: RIDER_NOT_ELECTED,
            status: 'terminated' as Status,
        };

        const result = getRiderStatusText(rider, t);
        expect(result).toBe('Policy.extras.riders.notelected');
    });
});

const mockPolicyDetails = (overrides: {
    coveredPeople?: Partial<PolicyParty>[];
    getPartyById?: (id: string | undefined) => Partial<PolicyParty> | undefined;
    planCode?: string;
    policyNumber?: string;
}) =>
    ({
        coveredPeople: overrides.coveredPeople ?? [],
        getPartyById: overrides.getPartyById ?? (() => undefined),
        planCode: overrides.planCode ?? 'PLAN1',
        policyNumber: overrides.policyNumber ?? 'POL123',
    } as unknown as PolicyDetails);

describe('getRiderInsured', () => {
    it('returns DEFAULT_ERROR_STRING when rider has no participants', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [],
        } as Rider;
        const policyDetails = mockPolicyDetails({});

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([{ name: '--' }]);
    });

    it('returns DEFAULT_ERROR_STRING when riderParticipant is undefined', () => {
        const rider = {
            ...baseRider,
            riderParticipant: undefined,
        } as unknown as Rider;
        const policyDetails = mockPolicyDetails({});

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([{ name: '--' }]);
    });

    it('returns insured data with href when party is linkable', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [{ insuredId: 'Party_1' }],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [{ partyId: 'Party_1' }],
            getPartyById: () => ({
                fullName: 'John Doe',
                partyId: 'Party_1',
                party: { partyStatus: PartyStatus.APPROVED },
            }),
            planCode: 'PLAN1',
            policyNumber: 'POL123',
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([
            {
                name: 'John Doe',
                partyId: 'Party_1',
                href: '/policies/PLAN1/POL123/people/Party_1',
            },
        ]);
    });

    it('returns insured data without href when no covered people', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [{ insuredId: 'Party_1' }],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [],
            getPartyById: () => ({
                fullName: 'Jane Doe',
                partyId: 'Party_1',
                party: { partyStatus: PartyStatus.APPROVED },
            }),
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([
            {
                name: 'Jane Doe',
            },
        ]);
    });

    it('returns insured data without href when party has no partyId', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [{ insuredId: 'Party_1' }],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [{ partyId: 'Party_1' }],
            getPartyById: () => ({
                fullName: 'No Id Person',
                partyId: undefined,
                party: { partyStatus: PartyStatus.APPROVED },
            }),
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([
            {
                name: 'No Id Person',
            },
        ]);
    });

    it('filters out not-approved parties', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [
                { insuredId: 'Party_1' },
                { insuredId: 'Party_2' },
            ],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [{ partyId: 'Party_1' }, { partyId: 'Party_2' }],
            getPartyById: (id) => {
                if (id === 'Party_1') {
                    return {
                        fullName: 'Approved Person',
                        partyId: 'Party_1',
                        party: { partyStatus: PartyStatus.APPROVED },
                    };
                }
                return {
                    fullName: 'Not Approved Person',
                    partyId: 'Party_2',
                    party: { partyStatus: PartyStatus.NOTAPPROVED },
                };
            },
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([
            {
                name: 'Approved Person',
                partyId: 'Party_1',
                href: '/policies/PLAN1/POL123/people/Party_1',
            },
        ]);
    });

    it('returns DEFAULT_ERROR_STRING for name when party has no fullName', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [{ insuredId: 'Party_1' }],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [],
            getPartyById: () => ({
                fullName: undefined as unknown as string,
                partyId: undefined,
                party: { partyStatus: PartyStatus.APPROVED },
            }),
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toEqual([
            {
                name: '--',
            },
        ]);
    });

    it('handles multiple valid participants', () => {
        const rider = {
            ...baseRider,
            riderParticipant: [
                { insuredId: 'Party_1' },
                { insuredId: 'Party_2' },
            ],
        } as Rider;
        const policyDetails = mockPolicyDetails({
            coveredPeople: [{ partyId: 'Party_1' }, { partyId: 'Party_2' }],
            getPartyById: (id) => ({
                fullName: `Person ${id}`,
                partyId: id,
                party: { partyStatus: PartyStatus.APPROVED },
            }),
        });

        const result = getRiderInsured(policyDetails, rider);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Person Party_1');
        expect(result[1].name).toBe('Person Party_2');
        expect(result[0].href).toContain('Party_1');
        expect(result[1].href).toContain('Party_2');
    });
});
