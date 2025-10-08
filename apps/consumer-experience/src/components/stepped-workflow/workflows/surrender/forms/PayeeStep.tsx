'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartyRole } from '@xd/api-types/dist/generated-types/bpm';
import { Label, Radio } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import {
  payeeStepSchema,
  SurrenderAction,
} from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { useSurrender } from '@/components/stepped-workflow/workflows/surrender/provider/useSurrender';
import { PolicyParty } from '@/types/policy';

import { default as styles } from '../Surrender.module.css';

type PayeeStepProps = {
  payees?: PolicyParty[];
};

const createRadioOption = (party: PolicyParty) => {
  const fullName =
    party.firstName && party.lastName
      ? `${party.firstName} ${party.lastName}`
      : party.fullName;

  const isOwner = party.partyRoles?.includes(PartyRole.OWNER);

  // Display the owner role next to the name if the party is an owner.
  // Example: "John Doe (owner)"
  const label = fullName ? `${fullName} ${isOwner && '(owner)'}` : '';

  return {
    key: party.partyId,
    label,
    ariaLabel: label,
    value: party.partyId ?? '',
  };
};

export const PayeeStep = ({ payees = [] }: PayeeStepProps) => {
  const { stepInfo } = useSteppedWorkflowContext();
  const { dispatch } = useSurrender();
  const radioOptions = payees.map(createRadioOption);
  const router = useRouter();

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

  const onSubmit: SubmitHandler<z.infer<typeof payeeStepSchema>> = data => {
    const selectedParty = payees?.find(
      party => party.partyId === data.payeePartyId
    );
    const payeeName =
      `${selectedParty?.firstName} ${selectedParty?.lastName}`.trim();
    if (!selectedParty) return;
    dispatch({
      type: SurrenderAction.SET_SURRENDER_PAYEE_STEP,
      payload: {
        payeeStep: {
          payeePartyId: selectedParty.partyId ?? '',
          payeeName: payeeName,
        },
      },
    });
    router.push(stepInfo.nextStepUrl);
  };

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div radioGroup="payee" className={styles.radioGroup}>
        <Label labelFor="payee">Who should receive the surrender value?</Label>
        <Controller
          control={form.control}
          name="payeePartyId"
          render={({ field }) => (
            <Radio
              id="payee"
              defaultValue={defaultParty?.partyId ?? undefined}
              onValueChange={field.onChange}
              options={radioOptions}
            />
          )}
        />
      </div>

      <div className="typography-nav-links-sm-inline">
        If you need the surrender to go to another person, give us a call at{' '}
        <CarrierPhoneNumber />
      </div>
    </form>
  );
};
