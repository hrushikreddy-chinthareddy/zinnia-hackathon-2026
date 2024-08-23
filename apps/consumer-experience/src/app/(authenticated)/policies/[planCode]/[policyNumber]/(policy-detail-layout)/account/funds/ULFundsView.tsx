'use client';

import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';
import { PolicyRequestInputs } from '@/types/policy';

export const ULFundsView = ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  return (
    <div className="container">
      <>
        <NonHoldingFunds policyNumber={policyNumber} planCode={planCode} />
        <CallForAssistance
          callToAction="Questions about your allocation?"
          customInstruction="for more information."
        />
      </>
    </div>
  );
};
