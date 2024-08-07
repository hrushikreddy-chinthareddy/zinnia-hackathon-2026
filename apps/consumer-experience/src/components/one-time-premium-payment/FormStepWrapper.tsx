import { Loader } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FormHeader } from './FormHeader';
import { defaultStep, getStepInfo, Steps } from './steps';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';

export const FormStepWrapper = ({
  children,
  currentStep,
  planCode,
  policyNumber,
  hideHeader,
}: {
  children: React.ReactNode;
  currentStep: Steps;
  planCode: string;
  policyNumber: string;
  hideHeader?: boolean;
}) => {
  const currentStepInfo = getStepInfo({
    step: currentStep,
    planCode,
    policyNumber,
  });
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const { state } = useOttp();

  useEffect(() => {
    if (!currentStepInfo?.requiredData) {
      setIsValidating(false);
      return;
    }

    const stepOneUrl = getStepInfo({
      step: defaultStep,
      planCode,
      policyNumber,
    })?.stepUrl;
    const validation = currentStepInfo?.requiredData.safeParse(state);

    if (!validation.success) {
      router.push(stepOneUrl);
    } else {
      setIsValidating(false);
    }
  }, [currentStepInfo, planCode, policyNumber, router, state]);

  if (isValidating) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '550px',
          justifyContent: 'center',
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      {!hideHeader && (
        <FormHeader
          currentStep={currentStep}
          planCode={planCode}
          policyNumber={policyNumber}
        />
      )}
      {children}
    </>
  );
};
