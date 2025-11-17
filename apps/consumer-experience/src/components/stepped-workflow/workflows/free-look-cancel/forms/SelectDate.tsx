'use client';
import { Label } from '@zinnia/bloom/components';
import { DEFAULT_DATE_FORMAT } from '@zinnia/utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/button/Button';
import { FieldDate } from '@/components/field/date/FieldDate';
import { FieldStatus } from '@/components/field/types';
import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { CancelDialogLink } from '@/components/stepped-workflow/common/CancelDialogLink';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { formatUSDollars } from '@/utils/currency';

import { FreeLookCancelAction } from '../provider/types';
import { useFreeLookCancel } from '../provider/useFreeLookCancel';
import { stepsInfo } from '../steps';

const NET_SURRENDER_VALUE = 'Net surrender value';
const dateInvalidMessage = 'Please enter a valid date';

export const SelectDate = ({
  netSurrenderValue,
}: {
  netSurrenderValue?: number | null;
}) => {
  const { dispatch, state } = useFreeLookCancel();
  const { nextStep } = useGetTransactionStepData({
    stepsInfo,
  });
  const router = useRouter();

  const { control, formState, handleSubmit } = useForm<{
    effectiveDate: string;
  }>({
    defaultValues: {
      effectiveDate: state?.dateStep?.cancellationDate,
    },
  });

  const onSubmit = (data: { effectiveDate: string }) => {
    dispatch({
      type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DATE_STEP,
      payload: {
        netSurrenderValue: netSurrenderValue,
        cancellationDate: data.effectiveDate,
      },
    });

    router.push(nextStep?.url || '');
  };

  return (
    <div>
      <FieldData
        className="mb-xl"
        Label={
          <Label
            interactiveElements={[
              <LabelPopover
                key={NET_SURRENDER_VALUE}
                title={NET_SURRENDER_VALUE}
              >
                <p>
                  Your net surrender value is the current account value minus
                  surrender charges, outstanding loans, and other fees. This
                  number tells you how much you can expect to receive if you
                  decide to surrender your policy and cancel your coverage.
                </p>
              </LabelPopover>,
            ]}
          >
            {NET_SURRENDER_VALUE}
          </Label>
        }
      >
        <p className="typography-content-value">
          {formatUSDollars(netSurrenderValue)}
        </p>
      </FieldData>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-xl field-container" style={{ width: '160px' }}>
          <Controller
            control={control}
            name="effectiveDate"
            rules={{
              required: dateInvalidMessage,
              validate: {
                dateIsValid: v => dayjs(v).isValid() || dateInvalidMessage,
              },
            }}
            render={({ field }) => (
              <FieldDate
                label={<Label>Cancellation date</Label>}
                name="cancellation-date"
                onDateSelect={date =>
                  field.onChange(dayjs(date).format(DEFAULT_DATE_FORMAT))
                }
                defaultDate={formState.defaultValues?.effectiveDate || ''}
                disableBeforeDate={new Date()}
                fieldStatus={
                  formState.errors.effectiveDate
                    ? FieldStatus.ERROR
                    : FieldStatus.DEFAULT
                }
                errorMessage={formState.errors.effectiveDate?.message}
              />
            )}
          />
        </div>
        <div className={commonStyles.stepActions}>
          <Button
            type="submit"
            aria-label="save details and navigate to next step"
          >
            Continue
          </Button>
          <CancelDialogLink />
        </div>
      </form>
    </div>
  );
};
