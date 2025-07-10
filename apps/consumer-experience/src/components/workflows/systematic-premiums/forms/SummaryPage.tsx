'use client';
import { useQuery } from '@tanstack/react-query';
import { TransactionFailureResponse } from '@xd/api-types/dist/generated-types/bpm';
import { toSentenceCase } from '@xd/utils/dist';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Icon,
  IconType,
  Label,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';

import { FieldData } from '@/components/field-data/FieldData';
import styles from '@/components/one-time-premium-payment/OneTimePremiumPayment.module.css';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { BankName } from '@/components/pii/BankName';
import { Payee } from '@/components/pii/Payee';
import { SystematicPremiumSteps } from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { QueryKeys } from '@/queries/query-keys';
import { getSystematicPremiumValidation } from '@/queries/transaction-queries';

import { stepsInfo } from '../steps';

export const SummaryPage = () => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const form = useForm();

  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };

  const handleEdit = (step: SystematicPremiumSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

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

  if (!validationResponse || isLoading) return <PaymentLoading />;

  const { data, error } = validationResponse;

  if (validationError || error) {
    router.push('error');
  }

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
        className={styles.paymentSummaryContainer}
      >
        <div className={styles.paymentSummaryDetails}>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Button
                    onClick={() => handleEdit(SystematicPremiumSteps.AMOUNT)}
                    mode="link"
                    key="systematic-premium-type"
                    size="small"
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                Effective date
              </Label>
            }
          >
            {state.systematicPremiumAmountStep.effectiveDate}
          </FieldData>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Button
                    onClick={() => handleEdit(SystematicPremiumSteps.AMOUNT)}
                    mode="link"
                    key="systematic-premium-type"
                    size="small"
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                Payment frequency
              </Label>
            }
          >
            {toSentenceCase(state.systematicPremiumAmountStep.paymentFrequency)}
          </FieldData>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Button
                    onClick={() => handleEdit(SystematicPremiumSteps.BANK)}
                    mode="link"
                    key="systematic-premium-type"
                    size="small"
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                Payee Name
              </Label>
            }
          >
            <Payee payee={state.selectBankStep.payor?.payorName} />
          </FieldData>
          <FieldData
            caption={'Bank details'}
            Label={
              <Label
                interactiveElements={[
                  <Button
                    size="small"
                    mode="link"
                    key="distribution-method"
                    onClick={() => handleEdit(SystematicPremiumSteps.BANK)}
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                Payment method
              </Label>
            }
          >
            <div className="typography-content-body-sm">
              <div>
                <BankName bankName={state.selectBankStep.bank?.branchName} />
              </div>
              <div>
                <span className="typography-content-body-sm">ending in</span>{' '}
                <AccountNumber
                  accountNumber={state.selectBankStep.bank?.accountNumber}
                />
              </div>
            </div>
          </FieldData>
        </div>
      </form>
      {data?.status === TransactionFailureResponse.status.FAILURE && (
        <div>
          {data.validationResult?.map(
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
