'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AssistiveText,
  AssistiveTextVariant,
  FieldData,
  FieldSize,
  FieldTypes,
  Label,
  Radio,
} from '@zinnia/bloom/components';
import { useParams, useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  taxWithholdingStepSchema,
  WithdrawalsAction,
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';

const options = [
  {
    key: 'minimum',
    label:
      'Withhold minimum required (determined by policy and withdrawal type)',
    ariaLabel: 'Mimimum Amount',
    value: 'minimum',
  },
  {
    key: 'dollar',
    label: 'Dollar amount',
    ariaLabel: 'Dollar Amount',
    value: 'dollar',
  },
  {
    key: 'percentage',
    label: 'Percentage',
    ariaLabel: 'Percentage',
    value: 'percentage',
  },
  {
    key: 'none',
    label: 'Do not Withhold',
    ariaLabel: 'None',
    value: 'none',
  },
];

type TaxWithholdingsProps = {
  taxWithholdingState: string;
};

export const TaxWithholdings = ({
  taxWithholdingState,
}: TaxWithholdingsProps) => {
  const { state, dispatch } = useWithdrawals();
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const router = useRouter();
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.WITHHOLDINGS,
    planCode,
    policyNumber,
  });

  const form = useForm({
    resolver: zodResolver(taxWithholdingStepSchema),
    defaultValues: {
      federal: {
        type: state.taxWithholdingsStep?.federal?.type || 'minimum',
        amount: state.taxWithholdingsStep?.federal?.amount || '0',
      },
      state: {
        type: state.taxWithholdingsStep?.state?.type || 'minimum',
        amount: state.taxWithholdingsStep?.state?.amount || '0',
      },
    },
  });
  const fieldTypesMap = {
    dollar: FieldTypes.Value,
    percentage: FieldTypes.Percent,
    minimum: null,
    none: null,
  };

  const [federalWithholdingType, stateWithholdingType] = form.watch([
    'federal.type',
    'state.type',
  ]);

  const fieldTypes = {
    federal: fieldTypesMap[federalWithholdingType],
    state: fieldTypesMap[stateWithholdingType],
  };

  const onSubmit: SubmitHandler<
    z.infer<typeof taxWithholdingStepSchema>
  > = data => {
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_TAX_WITHHOLDING_STEP,
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
      <div className={styles.withholdings}>
        <div
          className={styles.radioGroup}
          radioGroup="tax-withholdings-federal"
        >
          <Label labelFor="tax-withholdings-federal">
            How much Federal tax would you like to withhold?
          </Label>
          <Controller
            control={form.control}
            name="federal.type"
            render={({ field }) => (
              <Radio
                id="tax-withholdings-federal"
                defaultValue={form.formState.defaultValues?.federal?.type}
                onValueChange={v => {
                  const valueMap: Record<string, string> = {
                    none: '0',
                    minimum: '10',
                  };
                  if (valueMap[v] !== undefined) {
                    form.setValue('federal.amount', valueMap[v]);
                  }
                  field.onChange(v);
                }}
                options={options}
              />
            )}
          />
          {!!fieldTypes.federal && (
            <div className={styles.field}>
              <FieldData
                {...form.register('federal.amount')}
                fieldSize={FieldSize.Small}
                fieldType={fieldTypes.federal}
              />
              {!!form.formState.errors.federal?.amount?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.federal.amount.message}
                />
              )}
            </div>
          )}
        </div>
        <div className={styles.radioGroup} radioGroup="tax-withholdings-state">
          <Label
            interactiveElements={[
              <LabelPopover
                key="info"
                title='state-tax-withholding'
              >
                this is some very important info
              </LabelPopover>,
            ]}
            labelFor="tax-withholdings-state"
          >
            How much State tax{' '}
            {taxWithholdingState.length > 0 && `(${taxWithholdingState})`} would
            you like to withhold?
          </Label>
          <Controller
            control={form.control}
            name="state.type"
            render={({ field }) => (
              <Radio
                id="tax-withholdings-state"
                defaultValue={form.formState.defaultValues?.state?.type}
                onValueChange={v => {
                  const valueMap: Record<string, string> = {
                    none: '0',
                    minimum: '5',
                  };
                  if (valueMap[v] !== undefined) {
                    form.setValue('state.amount', valueMap[v]);
                  }
                  field.onChange(v);
                }}
                options={options}
              />
            )}
          />
          {!!fieldTypes.state && (
            <div className={styles.field}>
              <FieldData
                {...form.register('state.amount')}
                className={styles.field}
                fieldSize={FieldSize.Small}
                fieldType={fieldTypes.state}
              />
              {!!form.formState.errors.state?.amount?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.state.amount.message}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="typography-nav-links-sm-inline">
        Please consult with your qualified tax advisor for information regarding
        your situation.
      </div>
    </form>
  );
};
