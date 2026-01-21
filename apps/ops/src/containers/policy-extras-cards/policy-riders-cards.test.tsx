import { cleanup, render, waitFor } from '@testing-library/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { RidersCardsTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import {
    BenefitId,
    CoverageId,
    ConfiguredSettingId,
    CoverageToBenefitId,
} from '@deps/types/product-rate';
import {
    RiderType,
    PolicyFeature,
    Rider,
    Status,
} from '@zinnia/api-types/types/sor';

import { RIDER_NOT_ELECTED } from './consts';
import PolicyExtrasCards, { ExtrasCardType } from './policy-extras-cards';

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
    riderParticipant: [
        {
            insuredAgeAtIssue: undefined,
            insuredID: undefined,
        },
    ],
    riderPaymentDate: undefined,
    status: undefined,
    terminalRiderPaymentAmount: undefined,
    terminationDate: undefined,
    tierOneCriticalRiderPaymentAmount: undefined,
    tierOneCriticalRiderPaymentDate: undefined,
    tierOneMaximumCriticalIllnessBenefitAmount: undefined,
    tierOneMaximumCriticalIllnessBenefitPercentage: undefined,
    tierTwoCriticalRiderPaymentAmount: undefined,
    tierTwoCriticalRiderPaymentDate: undefined,
    tierTwoMaximumCriticalIllnessBenefitAmount: undefined,
    tierTwoMaximumCriticalIllnessBenefitPercentage: undefined,
    timestamp: undefined,
    type: undefined,
} as Rider;

const availableRider = {
    ...baseRider,
    coverageId: CoverageId.ChronicIllness,
    riderName: 'Available Rider 1',
    riderParticipant: [
        { insuredID: 'Party_PI_1' },
        { insuredID: 'Party_PI_2' },
    ],
    status: 'ACTIVE' as Status,
    type: RiderType.RIDER,
};

const activeRider = {
    ...baseRider,
    coverageId: CoverageId.CriticalIllness,
    riderName: 'Pending Rider 1',
    riderParticipant: [{}],
    status: 'PENDING' as Status,
    type: RiderType.RIDERINCREASE,
};

const termIllnessRider = {
    ...baseRider,
    coverageId: CoverageId.TerminalIllness,
    riderName: 'TermIllness Rider 1',
    riderParticipant: [{}],
    status: 'ACTIVE' as Status,
    type: RiderType.RIDER,
};

const notElectedRider = {
    ...baseRider,
    coverageId: CoverageId.OverloanProtection,
    riderElected: RIDER_NOT_ELECTED,
    riderName: 'Not Elected Rider 1',
    riderParticipant: [
        { insuredID: 'Party_PI_1' },
        { insuredID: 'Party_PI_2' },
        { insuredID: 'Party_PI_3' },
    ],
    type: RiderType.RIDER,
};

const terminatedRider = {
    ...baseRider,
    coverageId: CoverageId.OverloanProtection,
    riderName: 'Terminated Rider 1',
    riderParticipant: [
        { insuredID: 'Party_PI_1' },
        { insuredID: 'Party_PI_2' },
        { insuredID: 'Party_PI_3' },
    ],
    status: 'TERMINATED' as Status,
    type: RiderType.INTEGRATEDRIDER,
};

let ogRiders: Rider[] | undefined;
let ogFeatures: PolicyFeature[] | undefined;
let policyDetails: PolicyDetails;

jest.mock('@deps/queries/api/product-rate', () => ({
    getRiderBenefitData: jest.fn((policy, rider) => {
        const benefitId = CoverageToBenefitId[rider.coverageId as CoverageId];
        switch (benefitId) {
            case BenefitId.ChronicIllness:
                return {
                    benefitId,
                    [ConfiguredSettingId.MaxNumberOfYearsToPay]: 3,
                    [ConfiguredSettingId.MaxBenefitPercentage]: 23,
                    [ConfiguredSettingId.MaxNumberOfClaims]: 1,
                };
            case BenefitId.CriticalIllness:
                return {
                    benefitId,
                    [ConfiguredSettingId.MaxBenefitPercentage]: 13,
                    [ConfiguredSettingId.MaxBenefitPercentageT2]: 10,
                    [ConfiguredSettingId.MaxAmount]: 29.99,
                    [ConfiguredSettingId.MaxAmountT2]: 8675309,
                    [ConfiguredSettingId.MaxNumberOfClaims]: 3,
                };
            case BenefitId.TerminalIllness:
                return {
                    benefitId,
                    [ConfiguredSettingId.MaxBenefitPercentage]: 15,
                    [ConfiguredSettingId.MaxNumberOfClaims]: 5,
                    [ConfiguredSettingId.MaxAmount]: 500000,
                };
            default:
                return null;
        }
    }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: () => {} }),
}));

// TODO: Fix tests here after DEPU-2125 is done
describe('Policy Riders Cards', () => {
    beforeEach(() => {
        ogFeatures = mockPolicy.policyFeatures;
        ogRiders = mockPolicy.riders;
        mockPolicy.riders = [
            availableRider,
            activeRider,
            termIllnessRider,
            notElectedRider,
            terminatedRider,
        ];
        mockPolicy.policyFeatures = [];
        policyDetails = new PolicyDetails(mockPolicy);
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    afterAll(() => {
        mockPolicy.policyFeatures = ogFeatures;
        mockPolicy.riders = ogRiders;
    });

    it('should provide the correct label of rider.type', async () => {
        const { getAllByText } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={{ key: ExtrasCardType.Rider, value: 'All' }}
                selectedTab={ExtrasCardType.Rider}
            />
        );

        await waitFor(() => expect(getAllByText(/Rider/i).length).toBe(44));
    });

    it('should provide the riderName for the header field', async () => {
        const { getAllByText } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={{ key: ExtrasCardType.Rider, value: 'All' }}
                selectedTab={ExtrasCardType.Rider}
            />
        );

        await waitFor(() =>
            expect(getAllByText('Available rider 1').length).toBe(1)
        );
        await waitFor(() =>
            expect(getAllByText('Pending rider 1').length).toBe(1)
        );
        await waitFor(() =>
            expect(getAllByText('Terminated rider 1').length).toBe(1)
        );
        await waitFor(() =>
            expect(getAllByText('Not elected rider 1').length).toBe(1)
        );
    });

    // NOTE: This property is not included in the requirement for using the `policy` endpoint instead of `policy-rate` per DEPU-5743 spreadsheet
    it.skip('should render an insured element for each riderParticipant', async () => {
        const { getAllByTestId } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={{ key: ExtrasCardType.Rider, value: 'All' }}
                selectedTab={ExtrasCardType.Rider}
            />
        );

        await waitFor(() => {
            const available = getAllByTestId(
                `${RidersCardsTest.Insured}-${availableRider.riderName}-values`
            );
            expect(available[0].children.length).toBe(2);
        });

        await waitFor(() => {
            const active = getAllByTestId(
                `${RidersCardsTest.Insured}-${activeRider.riderName}-values`
            );
            expect(active[0].children.length).toBe(1);
        });

        await waitFor(() => {
            const terminated = getAllByTestId(
                `${RidersCardsTest.Insured}-${terminatedRider.riderName}-values`
            );
            expect(terminated[0].children.length).toBe(3);
        });

        await waitFor(() => {
            const notElected = getAllByTestId(
                `${RidersCardsTest.Insured}-${notElectedRider.riderName}-values`
            );
            expect(notElected[0].children.length).toBe(3);
        });
    });
});
