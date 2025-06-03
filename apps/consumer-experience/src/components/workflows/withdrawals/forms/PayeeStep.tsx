'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Label,
  Radio,
} from '@zinnia/bloom/components';
import { useParams, useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  payeeStepSchema,
  withdrawalAmountStepSchema,
  withdrawalMethodStepSchema,
  WithdrawalsAction,
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { PolicyParty } from '@/types/policy';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';

type PayeeStepProps = {
  payees?: PolicyParty[];
};
export const PayeeStep = ({ payees = [] }: PayeeStepProps) => {
  const { dispatch } = useWithdrawals();
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.PAYEE,
    planCode,
    policyNumber,
  });

  const defaultParty = payees?.[0];
  const defaultPayeePartyId = `${defaultParty?.partyId}`;
  const defaultPayeeName =
    `${defaultParty?.firstName} ${defaultParty?.lastName}`.trim();

  const form = useForm<z.infer<typeof payeeStepSchema>>({
    resolver: zodResolver(payeeStepSchema),
    defaultValues: {
      payeePartyId: defaultPayeePartyId,
      payeeName: defaultPayeeName,
    },
  });
  const { state } = useWithdrawals();

  if([
    withdrawalMethodStepSchema.safeParse(state.withdrawalMethodStep),
    withdrawalAmountStepSchema.safeParse(state.withdrawalAmountStep)
  ].some(result => !result.success)) {
    router.push('information');
   }

  const radioOptions =
    payees.map(party => {
      const fullName =
        party.firstName && party.lastName
          ? `${party.firstName} ${party.lastName}`
          : party.fullName;
      return {
        key: party.partyId,
        label: fullName ?? '',
        ariaLabel: party.fullName ?? '',
        value: party.partyId ?? '',
      };
    }) ?? [];

  const onSubmit: SubmitHandler<z.infer<typeof payeeStepSchema>> = data => {
    const selectedParty = payees?.find(
      party => party.partyId === data.payeePartyId
    );
    const payeeName =
      `${selectedParty?.firstName} ${selectedParty?.lastName}`.trim();
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_PAYEE_STEP,
      payload: {
        payeePartyId: data.payeePartyId,
        payeeName: payeeName,
      },
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
      <div radioGroup="payee" className={styles.radioGroup}>
        <Label
          interactiveElements={[
            <LabelPopover key="info" title="Who should receive the withdrawal?">
              this is some very Who info
            </LabelPopover>,
          ]}
          labelFor="payee"
        >
          Who should receive the withdrawal?
        </Label>
        <Controller
          control={form.control}
          name="payeePartyId"
          render={({ field }) => (
            <Radio
              id="payee"
              defaultValue={payees?.[0]?.partyId ?? ''}
              onValueChange={field.onChange}
              options={radioOptions}
            />
          )}
        />
      </div>

      <div className="typography-nav-links-sm-inline">
        If you need the withdrawal to go to another person, give us a call at{' '}
        <CarrierPhoneNumber />
      </div>
    </form>
  );
};
