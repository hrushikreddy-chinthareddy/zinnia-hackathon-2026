'use client';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { getPolicyFunds } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs } from '@/types/policy';
import { useQuery } from '@tanstack/react-query';

export const ULFundsView = ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const { data: funds } = useQuery({
    queryKey: [QueryKeys.POLICY_FUNDS],
    queryFn: () => getPolicyFunds(planCode, policyNumber),
  });

  return (
    <div className="container">
      <NonHoldingFunds funds={funds || []} />
      <CallForAssistance
        callToAction="Questions about your allocation?"
        customInstruction="for more information."
      />
    </div>
  );
};
