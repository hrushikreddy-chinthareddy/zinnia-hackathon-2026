'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AllocationOption } from '@xd/api-types/dist/generated-types/bpm';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
  Radio,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  withdrawalMethodStepSchema,
  WithdrawalsAction,
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { default as styles } from '../Withdrawals.module.css';

export const WithdrawalMethod = () => {
  const { state, dispatch } = useWithdrawals();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const form = useForm<z.infer<typeof withdrawalMethodStepSchema>>({
    resolver: zodResolver(withdrawalMethodStepSchema),
    defaultValues: {
      withdrawalMethod: state.withdrawalMethodStep.withdrawalMethod,
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof withdrawalMethodStepSchema>
  > = data => {
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_METHOD_STEP,
      payload: {
        withdrawalMethodStep: data
      },
    });
    router.push(stepInfo.nextStepUrl);
  };

  // setPrimaryButtonDisabled(
  //   !form.formState.isValid || form.formState.isSubmitting
  // );

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Label
        interactiveElements={[
          <LabelPopover key="info" title="Withdrawal Method Info">
            this is some very important info
          </LabelPopover>,
        ]}
        labelFor="withdrawal-method"
      >
        How should we withdraw your funds?
      </Label>
      <Controller
        control={form.control}
        name="withdrawalMethod"
        render={({ field }) => (
          <>
            <Radio
              id="withdrawal-method"
              onValueChange={field.onChange}
              defaultValue={field.value}
              options={[
                {
                  key: AllocationOption.PRORATA,
                  label: 'Evenly distributed from funds (prorata)',
                  ariaLabel: 'Evenly distributed from funds (prorata)',
                  value: AllocationOption.PRORATA,
                },
              ]}
            />
            {!!form.formState.errors.withdrawalMethod?.message?.length && (
              <AssistiveText
                variant={AssistiveTextVariant.Error}
                text={form.formState.errors.withdrawalMethod?.message}
              />
            )}
          </>
        )}
      />

      <div className="typography-nav-links-sm-inline">
        If you’d like to request a different distribution option, please contact
        us at <CarrierPhoneNumber />
      </div>
    </form>
  );
};
