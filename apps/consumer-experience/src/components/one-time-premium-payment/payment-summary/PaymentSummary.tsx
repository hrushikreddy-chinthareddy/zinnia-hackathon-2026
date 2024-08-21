'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ClientApi } from '@/services/client-http';

import { PaymentError } from './PaymentError';
import { PaymentInvalid } from './PaymentInvalid';
import { SummaryForm } from './SummaryForm';
import { useOttp } from '../../providers/one-time-premium-payment/OttpContext';
import { FormStepWrapper } from '../FormStepWrapper';
import { getStepInfo, paymentUrl, Steps } from '../steps';

export interface OTTPPaymentDetails {
  effectiveDate: string;
  paymentAmount: number;
  payorBank: string;
}

export const PaymentSummary = ({
  planCode,
  policyNumber,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
}) => {
  const router = useRouter();
  const { state } = useOttp();
  const [error, setError] = useState<number>();
  const currentStepInfo = getStepInfo({
    step: Steps.SUMMARY,
    planCode,
    policyNumber,
  });

  if (error) {
    if (error === 400) {
      return (
        <PaymentInvalid goToUrl={paymentUrl({ planCode, policyNumber })} />
      );
    }

    return <PaymentError goToUrl={paymentUrl({ planCode, policyNumber })} />;
  }

  const submitPayment = async () => {
    const ottpRequest = {
      paymentAmount: state.paymentAmount.plain,
      effectiveDate: state.effectiveDate,
      partyId: state.payorBank?.appliesToPartyId,
      bankId: state.payorBank?.bankId,
    };

    // TODO: should i move this queries?
    const response = await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/onetimepremium`,
      JSON.stringify(ottpRequest),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await response.json();

    // TODO: IF a user presses back (in browser) from here, they go back to step 2
    // not the end of the world but should probably have something else happen
    if (parsedResponse.error) {
      setError(parsedResponse.error.status || 500);
    } else {
      router.push(currentStepInfo?.nextStepUrl);
    }
  };

  return (
    <FormStepWrapper
      currentStep={Steps.SUMMARY}
      planCode={planCode}
      policyNumber={policyNumber}
      hideHeader
    >
      <form action={submitPayment}>
        <SummaryForm
          ottpPaymentData={state}
          planCode={planCode}
          policyNumber={policyNumber}
        />
      </form>
    </FormStepWrapper>
  );
};
