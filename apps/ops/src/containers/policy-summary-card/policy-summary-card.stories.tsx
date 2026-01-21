import { Meta } from '@storybook/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import {
    AllocationOption,
    AmountType,
    ArrangementType,
    Currency,
    DistributionType,
    FeatureType,
    Frequency,
    HoldingForm,
    IssueType,
    PaymentForm,
    Policy,
    PolicyStatus,
    Product,
    ProductType,
    Reason,
    State,
    Status,
} from '@zinnia/api-types/types/sor';

import { PolicyQuickView } from './policy-summary-card';

export default {
    title: 'Containers/PolicySummaryCard',
    container: PolicyQuickView,
} as Meta<typeof PolicyQuickView>;

const mockPendingLapsePolicy: Policy = {
    product: {
        lineOfBusiness: Product.lineOfBusiness.LIFE,
        planName: 'SB UL Premium Match',
        productType: ProductType.UNIVERSALLIFE,
        marketingName: 'Everly Life',
        shortName: 'SB UL',
        distribution: DistributionType.THIRDPARTYDIRECTTOCONSUMER,
        planCode: 'SBFIXUL1',
        generalLedgerPlanCode: 'V2201',
        holdingForm: HoldingForm.INDIVIDUAL,
    },
    // FIXME: QualificationType not exported from API types
    qualificationType: 'QUALIFIED' as Policy['qualificationType'],
    policyYear: 1,
    monthOfYear: 1,
    policyNumber: 'AU29035902',
    policyStatus: PolicyStatus.PENDINGLAPSE,
    issueType: IssueType.FULLUNDERWRITING,
    issueState: State.NJ,
    currency: Currency.USD,
    coverage: {
        coverageLayers: [
            {
                originalCoverageAmount: 500000,
                coverageTerm: 1,
            },
        ],
    },
    policyFeatures: [
        {
            featureType: FeatureType.LAPSEASSESSMENT,
            startDate: '2024-03-07',
            endDate: '2024-05-07',
            status: 1,
            totalRequiredAmount: 2554.56,
            totalMinimumRequiredAmount: 2554.56,
        },
    ],
    systematicPrograms: [
        {
            arrangementType: ArrangementType.PAYMENT,
            arrangementId: 'Arr_1',
            externalArrangementId: 'ext_1',
            allocationOptionType: AllocationOption.DOLLAR,
            reason: Reason.PREMIUM,
            status: Status.ACTIVE,
            paymentForm: PaymentForm.ACH,
            frequency: Frequency.MONTHLY,
            requestedDate: '2024-03-07',
            startDate: '2024-04-07',
            endDate: '2044-02-07',
            previousProgramDate: '2024-03-07',
            nextProgramDate: '2024-04-07',
            amountType: AmountType.AMOUNT,
            amount: 50,
            party: [],
        },
    ],
};

export const Active = () => {
    return (
        <div className="max-w-[1130px] p-6">
            <PolicyQuickView
                policyDetails={new PolicyDetails(mockPolicy)}
                isLoading={false}
                caseData={undefined}
            />
        </div>
    );
};

export const Pending = () => {
    return (
        <div className="max-w-[1130px] p-6">
            <PolicyQuickView
                policyDetails={new PolicyDetails(mockPendingLapsePolicy)}
                isLoading={false}
                caseData={undefined}
            />
        </div>
    );
};
