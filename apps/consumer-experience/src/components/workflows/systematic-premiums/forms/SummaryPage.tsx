'use client';
import { toSentenceCase } from '@xd/utils/dist';
import { Button, Icon, IconType, Label } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { useForm } from 'react-hook-form';

import { FieldData } from '@/components/field-data/FieldData';
import styles from '@/components/one-time-premium-payment/OneTimePremiumPayment.module.css';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { BankName } from '@/components/pii/BankName';
import { Payee } from '@/components/pii/Payee';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { stepsInfo, SystematicPremiumSteps } from '../steps';

export const SummaryPage = () => {
  const router = useRouter();
  const { state } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const form = useForm();

  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };

  const handleEdit = (step: SystematicPremiumSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  // const {
  //   data: validationResponse,
  //   isLoading: validationLoading,
  //   isError: validationError,
  // } = useQuery({
  //   queryKey: ['getPartialSystematicPremiumOneTimeValidation', state],
  //   queryFn: () => {
  //     return getSystematicPremiumValidation({
  //       planCode,
  //       policyNumber,
  //       body: state,
  //     });
  //   },
  // });

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
          <FieldData Label={<Label>Effective date</Label>}>
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
      {/* {data?.status === TransactionFailureResponse.status.FAILURE && (
        <div>
          {data.validationResult?.map(
            (result, index) =>
              result.resolution?.length && (
                <AssistiveText
                  className="mb-md"
                  key={index}
                  variant={AssistiveTextVariant.Error}
                  text={result.resolution}
                />
              )
          )}
        </div>
      )} */}
    </>
  );
};
