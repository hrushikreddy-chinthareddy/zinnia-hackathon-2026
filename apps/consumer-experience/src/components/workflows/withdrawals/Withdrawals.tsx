'use client';

import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { SteppedWorkflow } from '@/components/stepped-workflow/SteppedWorkflow';
import { LineOfBusinessPath } from '@/types';
import { lineOfBusinessUrlPath } from '@/utils/data';

import { stepsInfo } from './steps';
import { WithdrawalSteps } from './types';

interface WithdrawalsProps {
  currentStepOverride: number;
  planCode: string;
  policyNumber: string;
  children?: React.ReactNode;
}

const WithdrawalStages = stepsInfo;

export const Withdrawals = ({
  currentStepOverride,
  children,
  planCode,
  policyNumber,
}: WithdrawalsProps) => {
  const router = useRouter();

  WithdrawalStages[WithdrawalSteps.SUMMARY].actions = {
    primary: {
      text: 'Back to contract overview',
      onClick: () => {
        router.push(`/coverage/policies/${planCode}/${policyNumber}`);
      },
    },
    secondary: null,
  };

  const pathName = usePathname();

  const lineOfBusiness = useMemo(() => {
    if (pathName.includes(LineOfBusinessPath.ANNUITIES)) {
      return LineOfBusiness.ANNUITY;
    }

    return LineOfBusiness.LIFE;
  }, [pathName]);

  const cancelUrl = `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/withdrawal`;

  return (
      <SteppedWorkflow
        cancelTitleText="Leave this withdrawal?"
        cancelBodyText="Are you sure you want to cancel this withdrawal?"
        cancelUrl={cancelUrl}
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={lineOfBusiness}
        currentStepOverride={currentStepOverride}
        workflowSteps={Object.values(WithdrawalStages)}
      >
        {children}
      </SteppedWorkflow>
  );
};
