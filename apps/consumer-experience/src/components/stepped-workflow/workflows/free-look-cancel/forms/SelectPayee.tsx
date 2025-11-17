'use client';
import { PayeeOrBeneficiary } from '@zinnia/api-types/types/sor';
import { Label, Radio } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/button/Button';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { CancelDialogLink } from '@/components/stepped-workflow/common/CancelDialogLink';
import { default as commonStyles } from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { PolicyParty } from '@/types/policy';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import { FreeLookCancelAction } from '../provider/types';
import { useFreeLookCancel } from '../provider/useFreeLookCancel';
import { stepsInfo } from '../steps';

// TODO: besides the language, this is identical to the payee withdrawals step
export const SelectPayee = ({ payees }: { payees: PolicyParty[] }) => {
  const { dispatch, state } = useFreeLookCancel();
  const { nextStep } = useGetTransactionStepData({
    stepsInfo,
  });
  const router = useRouter();

  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      payeePartyId:
        state?.payeeStep?.partyId ||
        payees?.[0]?.partyId ||
        DEFAULT_ERROR_STRING,
    },
  });

  const onSubmit = (data: { payeePartyId: string }) => {
    const payee = payees.find(party => party.partyId === data.payeePartyId);
    dispatch({
      type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_PAYEE_STEP,
      payload: payee as PayeeOrBeneficiary,
    });

    router.push(nextStep?.url || '');
  };

  return (
    <div>
      <form
        className="mb-xl"
        id="submit-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div radioGroup="payee" className={commonStyles.radioGroup}>
          <Label labelFor="payee">
            Who should receive the surrender value?
          </Label>
          <Controller
            control={control}
            name="payeePartyId"
            render={({ field }) => (
              <Radio
                id="payee"
                defaultValue={formState.defaultValues?.payeePartyId ?? ''}
                onValueChange={field.onChange}
                options={payees.map(party => ({
                  key: party.partyId,
                  label: `${party.firstName} ${party.lastName}`,
                  ariaLabel: `${party.firstName} ${party.lastName}`,
                  value: party.partyId || DEFAULT_ERROR_STRING,
                }))}
              />
            )}
          />
        </div>
        <div
          className={commonStyles.stepActions}
          aria-label="save details and navigate to next step"
        >
          <Button type="submit">Continue</Button>
          <CancelDialogLink />
        </div>
      </form>
      <div>
        If you need the surrender to go to another person, give us a call at{' '}
        <CarrierPhoneNumber />
      </div>
    </div>
  );
};
