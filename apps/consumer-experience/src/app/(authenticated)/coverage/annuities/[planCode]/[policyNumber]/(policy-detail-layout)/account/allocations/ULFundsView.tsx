'use client';

import { useQuery } from '@tanstack/react-query';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { sortNonHoldingFunds } from '@/components/funds-table/utils';
import {
  getPolicyFunds,
  getPolicyStatusDetails,
} from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs, PolicyStatusDetail } from '@/types/policy';
import { FeatureType } from '@zinnia/api-types/types/sor';

interface ULFundsViewProps extends PolicyRequestInputs {
  initialPolicyStatus?: Partial<PolicyStatusDetail> | null;
}

export const ULFundsView = ({
  planCode,
  policyNumber,
  initialPolicyStatus,
}: ULFundsViewProps) => {
  const { data: funds, isLoading } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS, planCode, policyNumber],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
    select: data =>
      sortNonHoldingFunds(data || []).filter(
        fund => fund?.allocationPercentage && fund?.totalFundValue
      ),
  });

  const { data: freelookData } = useQuery({
    queryKey: [QueryKeys.POLICY_STATUS, planCode, policyNumber],
    queryFn: () => getPolicyStatusDetails(planCode, policyNumber),
    initialData: initialPolicyStatus,
    select: data => {
      return {
        isFreelook: data?.policyStatus === FeatureType.FREELOOK,
        freelookDate: data?.endDate,
      };
    },
  });

  return (
    <div className="container">
      <NonHoldingFunds
        funds={funds || []}
        isLoading={isLoading}
        numberOfLoadingRows={1}
      />
      <CallForAssistance
        callToAction={
          freelookData?.isFreelook
            ? `You can't edit allocations until your free look period ends. Questions?`
            : 'Questions about your allocations? '
        }
        contactPrompt={freelookData?.isFreelook ? undefined : 'Call'}
        customInstruction="for more information."
      />
    </div>
  );
};
