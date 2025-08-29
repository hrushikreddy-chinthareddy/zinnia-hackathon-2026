'use client';
import { useQuery } from '@tanstack/react-query';
import {
  TransactionFailureResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import {
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';

import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { useSystematicProgramsFor } from '@/hooks/use-systematic-programs';
import { QueryKeys } from '@/queries/query-keys';
import { getSystematicPremiumValidation } from '@/queries/transaction-queries';
import { PaymentMethod } from '@/types/payment';
import { PolicyParty } from '@/types/policy';

import { SummaryTable } from './SummaryTable';
import { useTableValues } from './UseTableValues';

export const SummaryForm = ({
  paymentMethods,
  payors,
}: {
  paymentMethods: PaymentMethod[];
  payors: PolicyParty[];
}) => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const form = useForm();

  const { data: systematicPremium } = useSystematicProgramsFor(
    state.activeArrangementId
  );

  const tableValues = useTableValues({
    payees: payors,
    paymentMethods,
    systematicPremium,
  });

  const {
    data: validationResponse,
    isError: validationError,
    isLoading,
  } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS_VALIDATION, state],
    queryFn: () => {
      return getSystematicPremiumValidation({
        planCode,
        policyNumber,
        body: state,
      });
    },
  });

  if (!validationResponse) {
    return <PaymentLoading />;
  }

  const { data, error } = validationResponse;

  if (validationError || error) {
    router.push('error');
  }

  if (isLoading || !data) {
    return <PaymentLoading />;
  }


  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };

  return (
    <>
      <form
        id="submit-form"
        style={
          {
            '--field-container-gap': 'var(--measure-dimension-gap-sm)',
          } as CSSProperties
        }
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SummaryTable tableValues={tableValues} />
      </form>
      {validationResponse?.data?.status ===
        TransactionFailureResponse.status.FAILURE && (
          <div>
            {validationResponse.data.validationResult?.map(
              (result, index) =>
                result.resolution?.length && (
                  <AssistiveText
                    className="mb-md"
                    key={index}
                    variant={AssistiveTextVariant.Error}
                    text={result.error + ' ' + result.resolution}
                  />
                )
            )}
          </div>
        )}
    </>
  );
};





