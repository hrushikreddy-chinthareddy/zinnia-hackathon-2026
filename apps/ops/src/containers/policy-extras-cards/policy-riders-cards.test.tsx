import { act, cleanup, render } from '@testing-library/react';
import {
    RiderType,
    PolicyFeature,
    Rider,
    Status,
} from '@zinnia/api-types/types/sor';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import {
    BadgeTest,
    RidersCardsTest,
} from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { mockT } from '@deps/setupTests';
import {
    BenefitId,
    CoverageId,
    ConfiguredSettingId,
    CoverageToBenefitId,
} from '@deps/types/product-rate';

import PolicyExtrasCards from './policy-extras-cards';
import { RIDER_NOT_ELECTED } from './policy-extras-cards-helpers';

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
            insuredId: undefined,
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
        { insuredId: 'Party_PI_1' },
        { insuredId: 'Party_PI_2' },
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
        { insuredId: 'Party_PI_1' },
        { insuredId: 'Party_PI_2' },
        { insuredId: 'Party_PI_3' },
    ],
    type: RiderType.RIDER,
};

const terminatedRider = {
    ...baseRider,
    coverageId: CoverageId.OverloanProtection,
    riderName: 'Terminated Rider 1',
    riderParticipant: [
        { insuredId: 'Party_PI_1' },
        { insuredId: 'Party_PI_2' },
        { insuredId: 'Party_PI_3' },
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

// TODO: Fix tests here after DEPU-2125 is done
describe.skip('Policy Riders Cards', () => {
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
                filterValues={null}
            />
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        expect(getAllByText('Rider').length).toBe(3);
        expect(getAllByText('Riderincrease').length).toBe(1);
        expect(getAllByText('Integratedrider').length).toBe(1);
    });

    it('should provide the riderName for the header field', async () => {
        const { getAllByText } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={null}
            />
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        expect(getAllByText('Available rider 1').length).toBe(1);
        expect(getAllByText('Pending rider 1').length).toBe(1);
        expect(getAllByText('Terminated rider 1').length).toBe(1);
        expect(getAllByText('Not elected rider 1').length).toBe(1);
    });

    it('should render max claims element for each illness rider', async () => {
        const { getAllByTestId } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={null}
            />
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        const chronic = getAllByTestId(
            `${RidersCardsTest.MaxClaims}-${availableRider.riderName}`
        );
        const critical = getAllByTestId(
            `${RidersCardsTest.MaxClaims}-${activeRider.riderName}`
        );
        const terminal = getAllByTestId(
            `${RidersCardsTest.MaxClaims}-${termIllnessRider.riderName}`
        );

        expect(chronic[0].textContent).toBe('Riders.maxclaims1');
        expect(critical[0].textContent).toBe('Riders.maxclaims3');
        expect(terminal[0].textContent).toBe('Riders.maxclaims5');
    });

    it('should map the subheader based on the subheader description table', async () => {
        const { getByText, findByText } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={null}
            />
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        expect(getByText('Riders.chronicillnessbenefit')).toBeTruthy();
        expect(getByText('Riders.criticalIllnessBenefit1')).toBeTruthy(); // Can't sentence case this one as there is interesting logic here.
        expect(findByText('Riders.overloanprotection')).resolves.toBeFalsy(); // Overloan has no subheader

        expect(mockT.mock.calls).toContainEqual([
            'Riders.chronicIllnessBenefit',
            {
                percent: '23',
                period: '3',
            },
        ]);
        expect(mockT.mock.calls).toContainEqual([
            'Riders.criticalIllnessBenefit1',
            {
                t1Percent: '13',
                t1Amount: '$29.99',
            },
        ]);
        expect(mockT.mock.calls).toContainEqual([
            'Riders.criticalIllnessBenefit2',
            {
                t2Percent: '10',
                t2Amount: '$8,675,309.00',
            },
        ]);
    });

    it('should correctly handle the status badge logic', () => {
        const { getAllByTestId } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={null}
            />
        );
        // badge logic:
        // status === 'Available': "Active"
        // status ===  'Active': "Pending"
        // status === 'Terminated': "Terminated"
        // riderElected === 'NOT ELECTED': "Not elected"
        const badges = getAllByTestId(BadgeTest.Badge);
        expect(badges[0]).toHaveTextContent('Riders.available');
        expect(badges[1]).toHaveTextContent('Riders.notelected');
        expect(badges[2]).toHaveTextContent('Riders.active');
        expect(badges[3]).toHaveTextContent('Riders.available');
        expect(badges[4]).toHaveTextContent('Riders.terminated');
    });

    it('should render an insured element for each riderParticipant', () => {
        const { getAllByTestId } = render(
            <PolicyExtrasCards
                policyDetails={policyDetails}
                filterValues={null}
            />
        );
        const available = getAllByTestId(
            `${RidersCardsTest.Insured}-${availableRider.riderName}-values`
        );
        const active = getAllByTestId(
            `${RidersCardsTest.Insured}-${activeRider.riderName}-values`
        );
        const terminated = getAllByTestId(
            `${RidersCardsTest.Insured}-${terminatedRider.riderName}-values`
        );
        const notElected = getAllByTestId(
            `${RidersCardsTest.Insured}-${notElectedRider.riderName}-values`
        );

        expect(available[0].children.length).toBe(2);
        expect(active[0].children.length).toBe(1);
        expect(terminated[0].children.length).toBe(3);
        expect(notElected[0].children.length).toBe(3);
    });
});
