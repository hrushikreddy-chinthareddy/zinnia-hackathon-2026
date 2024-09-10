import { cleanup, render } from '@testing-library/react';

import { BadgeTest, RidersCardsTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { IndicatorCode, PolicyFeature, Rider, Status } from '@deps/models/policy/sor-policy';
import { mockT } from '@deps/setupTests';

import PolicyExtrasCards from './policy-extras-cards';
import { CoverageId } from './policy-extras-cards-helper';

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
    amount: 123.45,
    coverageId: CoverageId.ChronicIllness,
    maximumChronicIllnessBenefitPercentage: 23.45,
    maximumPeriodicPaymentPeriod: 3.45,
    riderName: 'Available Rider 1',
    riderParticipant: [{ insuredId: 'Party_PI_1' }, { insuredId: 'Party_PI_2' }],
    status: 'ACTIVE' as Status,
    type: IndicatorCode.RIDER,
};

const activeRider = {
    ...baseRider,
    coverageId: CoverageId.CriticalIllness,
    riderName: 'Pending Rider 1',
    riderParticipant: [{}],
    status: 'PENDING' as Status,
    tierOneMaximumCriticalIllnessBenefitAmount: 29.99,
    tierOneMaximumCriticalIllnessBenefitPercentage: 12.5,
    tierTwoMaximumCriticalIllnessBenefitAmount: 8675309,
    tierTwoMaximumCriticalIllnessBenefitPercentage: 10,
    type: IndicatorCode.RIDERINCREASE,
};

const terminatedRider = {
    ...baseRider,
    coverageId: CoverageId.OverloanProtection,
    riderName: 'Terminated Rider 1',
    riderParticipant: [{ insuredId: 'Party_PI_1' }, { insuredId: 'Party_PI_2' }, { insuredId: 'Party_PI_3' }],
    status: 'TERMINATED' as Status,
    type: IndicatorCode.INTEGRATEDRIDER,
};

let ogRiders: Rider[] | undefined;
let ogFeatures: PolicyFeature[] | undefined;

describe('Policy Riders Cards', () => {
    beforeEach(() => {
        ogFeatures = mockPolicy.policyFeatures;
        ogRiders = mockPolicy.riders;
        mockPolicy.riders = [availableRider, activeRider, terminatedRider];
        mockPolicy.policyFeatures = [];
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    afterAll(() => {
        mockPolicy.policyFeatures = ogFeatures;
        mockPolicy.riders = ogRiders;
    });

    it('should provide the correct label of rider.type', () => {
        const { getAllByText } = render(<PolicyExtrasCards policy={mockPolicy} filterValues={null} />);

        expect(getAllByText('Rider').length).toBe(1);
        expect(getAllByText('Riderincrease').length).toBe(1);
        expect(getAllByText('Integratedrider').length).toBe(1);
    });

    it('should provide the riderName for the header field', () => {
        const { getAllByText } = render(<PolicyExtrasCards policy={mockPolicy} filterValues={null} />);

        expect(getAllByText('Available rider 1').length).toBe(1);
        expect(getAllByText('Pending rider 1').length).toBe(1);
        expect(getAllByText('Terminated rider 1').length).toBe(1);
    });

    it('should map the subheader based on the subheader description table', () => {
        const { getByText, findByText } = render(<PolicyExtrasCards policy={mockPolicy} filterValues={null} />);

        expect(getByText('Riders.chronicillnessbenefit')).toBeTruthy();
        expect(getByText('riders.criticalIllnessBenefit1')).toBeTruthy(); // Can't sentence case this one as there is interesting logic here.
        expect(findByText('Riders.overloanprotection')).resolves.toBeFalsy(); // Overloan has no subheader
        expect(mockT.mock.calls).toContainEqual(['riders.chronicIllnessBenefit', { percent: '23', period: '3' }]);
        expect(mockT.mock.calls).toContainEqual([
            'riders.criticalIllnessBenefit1',
            {
                t1Percent: '13',
                t1Amount: '$29.99',
            },
        ]);
        expect(mockT.mock.calls).toContainEqual([
            'riders.criticalIllnessBenefit2',
            {
                t2Percent: '10',
                t2Amount: '$8,675,309.00',
            },
        ]);
    });

    it('should correctly handle the status badge logic', () => {
        const { getAllByTestId } = render(<PolicyExtrasCards policy={mockPolicy} filterValues={null} />);
        // badge logic:
        // status === 'Available': "Active"
        // status ===  'Active': "Pending"
        // status === 'Terminated': "Terminated"
        const badges = getAllByTestId(BadgeTest.Badge);
        expect(badges[0]).toHaveTextContent('Riders.available');
        expect(badges[1]).toHaveTextContent('Riders.active');
        expect(badges[2]).toHaveTextContent('Riders.terminated');
    });

    it('should render an insured element for each riderParticipant', () => {
        const { getAllByTestId } = render(<PolicyExtrasCards policy={mockPolicy} filterValues={null} />);
        const available = getAllByTestId(`${RidersCardsTest.Insured}-${availableRider.riderName}-values`);
        const active = getAllByTestId(`${RidersCardsTest.Insured}-${activeRider.riderName}-values`);
        const terminated = getAllByTestId(`${RidersCardsTest.Insured}-${terminatedRider.riderName}-values`);

        expect(available[0].children.length).toBe(2);
        expect(active[0].children.length).toBe(1);
        expect(terminated[0].children.length).toBe(3);
    });
});
