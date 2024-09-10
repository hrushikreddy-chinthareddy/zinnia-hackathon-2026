import { Meta } from '@storybook/react';

import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { AllocationOption, ArrangementType, Policy, PolicyFeatureFeatureType, Reason } from '@deps/models/policy/sor-policy';

import { PolicyQuickView } from './policy-summary-card';

export default {
    title: 'Containers/PolicySummaryCard',
    container: PolicyQuickView,
} as Meta<typeof PolicyQuickView>;

const mockPendingLapsePolicy: Policy = {
    product: {
        lineOfBusiness: 'LIFE',
        planName: 'SB UL Premium Match',
        productType: 'UNIVERSALLIFE',
        marketingName: 'Everly Life',
        shortName: 'SB UL',
        distribution: 'THIRDPARTYDIRECTTOCONSUMER',
        planCode: 'SBFIXUL1',
        generalLedgerPlanCode: 'V2201',
        holdingForm: 'INDIVIDUAL',
    },
    qualificationType: 'NONQUALIFIED',
    policyYear: 1,
    monthOfYear: 1,
    policyNumber: 'AU29035902',
    policyStatus: 'PENDINGLAPSE',
    issueType: 'FULLUNDERWRITING',
    issueState: 'NJ',
    currency: 'USD',
    coverage: {
        coverageLayers: [
            {
                originalCoverageAmount: 500000,
            },
        ],
    },
    policyFeatures: [
        {
            featureType: 'LAPSEASSESSMENT' as PolicyFeatureFeatureType,
            startDate: '2024-03-07',
            endDate: '2024-05-07',
            status: true,
            totalRequiredAmount: 2554.56,
            totalMinimumRequiredAmount: 2554.56,
        },
    ],
    systematicPrograms: [
        {
            arrangementType: 'PAYMENT' as ArrangementType,
            arrangementId: 'Arr_1',
            allocationOptionType: 'DOLLAR' as AllocationOption,
            reason: Reason.PREMIUM,
            status: 'ACTIVE',
            paymentForm: 'ACH',
            frequency: 'MONTHLY',
            requestedDate: '2024-03-07',
            startDate: '2024-04-07',
            endDate: '2044-02-07',
            previousProgramDate: '2024-03-07',
            nextProgramDate: '2024-04-07',
            amountType: 'AMOUNT',
            amount: 50,
            party: [],
        },
    ],
};

export const Active = () => {
    return (
        <div className="max-w-[1130px] p-6">
            <PolicyQuickView policy={mockPolicy} />
        </div>
    );
};

export const Pending = () => {
    return (
        <div className="max-w-[1130px] p-6">
            <PolicyQuickView policy={mockPendingLapsePolicy} />
        </div>
    );
};
