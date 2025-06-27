import { cleanup, render } from '@testing-library/react';
import { PolicyFeature, FeatureType, Rider } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { FeaturesCardsTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { mockT } from '@deps/setupTests';
import {
    DEFAULT_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

import PolicyExtrasCards from './policy-extras-cards';

const availableFeature: PolicyFeature = {
    timestamp: '123',
    featureType: FeatureType.LAPSEPROTECTION, // Used in UI Logic
    startDate: dayjs().subtract(11, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    endDate: dayjs().add(11, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    status: true,
    period: 12345, // Used in UI Logic
    effectiveDate: 'string',
    totalRequiredAmount: 0,
    totalMinimumRequiredAmount: 0,
    paymentAmount: 100.23, // Used in UI Logic
    totalPaymentAmount: 1000.34, // Used in UI Logic
    underwritingDecision: false,
    approvalDate: undefined, // Used in UI Logic
};

const activeFeature: PolicyFeature = {
    timestamp: '456',
    featureType: FeatureType.LAPSEPROTECTION, // Used in UI Logic
    startDate: dayjs().subtract(1, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    endDate: dayjs().add(1, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    status: true,
    period: 10, // Used in UI Logic
    effectiveDate: 'string',
    totalRequiredAmount: 0,
    totalMinimumRequiredAmount: 0,
    paymentAmount: 0, // Used in UI Logic
    totalPaymentAmount: 0, // Used in UI Logic
    underwritingDecision: false,
    approvalDate: dayjs().format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
};

const terminatedFeature: PolicyFeature = {
    timestamp: '789',
    featureType: FeatureType.LAPSEPROTECTION, // Used in UI Logic
    startDate: dayjs().subtract(2, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    endDate: dayjs().subtract(1, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    status: true,
    period: 30, // Used in UI Logic
    effectiveDate: 'string',
    totalRequiredAmount: 0,
    totalMinimumRequiredAmount: 0,
    paymentAmount: 0, // Used in UI Logic
    totalPaymentAmount: 0, // Used in UI Logic
    underwritingDecision: false,
    approvalDate: undefined, // Used in UI Logic
};

const invalidFeature1: PolicyFeature = {
    timestamp: '1011',
    featureType: FeatureType.LAPSEPROTECTION, // Used in UI Logic
    endDate: dayjs().add(1, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    status: true,
    period: 5000, // Used in UI Logic
    effectiveDate: 'string',
    totalRequiredAmount: 0,
    totalMinimumRequiredAmount: 0,
    paymentAmount: 0, // Used in UI Logic
    totalPaymentAmount: 0, // Used in UI Logic
    underwritingDecision: false,
    approvalDate: undefined, // Used in UI Logic
};

const invalidFeature2: PolicyFeature = {
    timestamp: '1213',
    featureType: FeatureType.LAPSEPROTECTION, // Used in UI Logic
    startDate: dayjs().subtract(1, 'y').format(ZAHARA_API_DATE_FORMAT), // Used in UI Logic
    status: true,
    period: 900, // Used in UI Logic
    effectiveDate: 'string',
    totalRequiredAmount: 0,
    totalMinimumRequiredAmount: 0,
    paymentAmount: 0, // Used in UI Logic
    totalPaymentAmount: 0, // Used in UI Logic
    underwritingDecision: false,
    approvalDate: undefined, // Used in UI Logic
};

let ogRiders: Rider[] | undefined;
let ogFeatures: PolicyFeature[] | undefined;
let mockPolicyDetails: PolicyDetails;

describe('Policy Features Cards', () => {
    beforeAll(() => {
        ogFeatures = mockPolicy.policyFeatures;
        ogRiders = mockPolicy.riders;
        mockPolicy.riders = [];
        mockPolicy.policyFeatures = [
            availableFeature,
            activeFeature,
            terminatedFeature,
            invalidFeature1,
            invalidFeature2,
        ];
        mockPolicyDetails = new PolicyDetails(mockPolicy);
    });

    afterEach(cleanup);

    afterAll(() => {
        mockPolicy.policyFeatures = ogFeatures;
        mockPolicy.riders = ogRiders;
    });

    it('should only include features with both a start and end date', () => {
        mockPolicy;
        const { getByTestId } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        expect(
            getByTestId('features-cards').getElementsByTagName('article').length
        ).toBe(3);
    });

    it('should provide the correct label of "Feature"', () => {
        const { getAllByText } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        expect(getAllByText('Features.feature').length).toBe(3); // sentence-cased translation key for "Feature" is "Feature"
    });

    it('should provide the featureType for the header field', () => {
        const { getAllByText } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        expect(getAllByText('Features.lapseprotection').length).toBe(3); // Sentence-cased translation key for "Lapse protection is Lapseprotection, currently the only supported header"
    });

    it('should map the subheader based on the subheader description table', () => {
        const { getAllByText } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        expect(getAllByText('Features.nyearsprotectionguarantee').length).toBe(
            3
        ); // translation key for only supported feature
        expect(mockT.mock.calls).toContainEqual([
            'features.nYearsProtectionGuarantee',
            { n: 12345 },
        ]);
    });

    it('should correctly handle the status badge logic', () => {
        const { getAllByTestId } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        // badge logic:
        // approvalDate !== null: "Active"
        // endDate <= today's date: "Available"
        // endDate > today's date: "Terminated"
        const badges = getAllByTestId('badge-test-id');
        expect(badges[0]).toHaveTextContent('Features.available');
        expect(badges[1]).toHaveTextContent('Features.active');
        expect(badges[2]).toHaveTextContent('Features.terminated');
    });

    it('should correctly map paymentAmount, totalPaymentAmount, startDate, endDate to  cost, cumulative payment, effective date, and expiration date respectively', () => {
        const { getByTestId } = render(
            <div data-testid="features-cards">
                <PolicyExtrasCards
                    policyDetails={mockPolicyDetails}
                    filterValues={null}
                />
            </div>
        );
        const cost = getByTestId(`${FeaturesCardsTest.Cost}-123`);
        const cumulativePayment = getByTestId(
            `${FeaturesCardsTest.CumulativePayment}-123`
        );
        const effectiveDate = getByTestId(
            `${FeaturesCardsTest.EffectiveDate}-123`
        );
        const expirationDate = getByTestId(
            `${FeaturesCardsTest.ExpirationDate}-123`
        );

        expect(cost).toHaveTextContent('Features.cost');
        expect(cost).toHaveTextContent('$100.23');
        expect(cumulativePayment).toHaveTextContent(
            'Features.cumulativepayment'
        );
        expect(cumulativePayment).toHaveTextContent('$1,000.34');
        expect(effectiveDate).toHaveTextContent('Features.effectivedate');
        expect(effectiveDate).toHaveTextContent(
            dayjs().subtract(11, 'year').format(DEFAULT_DATE_FORMAT)
        );
        expect(expirationDate).toHaveTextContent('Features.expirationdate');
        expect(expirationDate).toHaveTextContent(
            dayjs().add(11, 'year').format(DEFAULT_DATE_FORMAT)
        );
    });
});
