'use client';

import { useQuery } from '@tanstack/react-query';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs } from '@/types/policy';

export const ULFundsView = ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const { data: funds, isLoading } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS, planCode, policyNumber],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
  });

  return (
    <div className="container">
      <NonHoldingFunds
        funds={funds || []}
        isLoading={isLoading}
        numberOfLoadingRows={1}
      />
      <CallForAssistance
        callToAction="Questions about your allocation?"
        customInstruction="for more information."
      />
    </div>
  );
};
