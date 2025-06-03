'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
  Radio,
} from '@zinnia/bloom/components';
import { useParams, useRouter } from 'next/navigation';
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

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';

export const WithdrawalMethod = () => {
  const { state, dispatch } = useWithdrawals();
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.METHOD,
    planCode,
    policyNumber,
  });

  const form = useForm<z.infer<typeof withdrawalMethodStepSchema>>({
    resolver: zodResolver(withdrawalMethodStepSchema),
    defaultValues: {
      withdrawalMethod:
        state.withdrawalMethodStep.withdrawalMethod || 'prorata',
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof withdrawalMethodStepSchema>
  > = data => {
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_METHOD_STEP,
      payload: data,
    });
    router.push(nextUrl);
  };

  setPrimaryButtonDisabled(
    !form.formState.isValid || form.formState.isSubmitting
  );

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
              defaultValue="prorata"
              onValueChange={field.onChange}
              options={[
                {
                  key: 'prorata',
                  label: 'Evenly distributed from funds (prorata)',
                  ariaLabel: 'Evenly distributed from funds (prorata)',
                  value: 'prorata',
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
