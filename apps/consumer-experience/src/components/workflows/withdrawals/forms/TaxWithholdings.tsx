'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxRateToUse } from '@xd/api-types/dist/generated-types/bpm';
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
  taxWithholdingAmountTypeEnum
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
// import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { WithdrawalSteps } from '../steps';
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
  // const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
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
        taxRateToUse: state.taxWithholdingsStep?.federal?.taxRateToUse,
        amountType: state.taxWithholdingsStep?.federal?.amountType ,
        dollar: state.taxWithholdingsStep?.federal?.dollar,
        percentage: state.taxWithholdingsStep?.federal?.percentage,
        exemptions: state.taxWithholdingsStep?.federal?.exemptions,
      },
      state: {
        taxRateToUse: state.taxWithholdingsStep?.state?.taxRateToUse,
        amountType: state.taxWithholdingsStep?.state?.amountType,
        dollar: state.taxWithholdingsStep?.state?.dollar,
        percentage: state.taxWithholdingsStep?.state?.percentage ,
        exemptions: state.taxWithholdingsStep?.state?.exemptions,
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
    'federal.amountType',
    'state.amountType',
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

  // setPrimaryButtonDisabled(
  //   !form.formState.isValid || form.formState.isSubmitting
  // );

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
            name="federal.amountType"
            render={({ field }) => (
              <Radio
                id="tax-withholdings-federal"
                defaultValue={form.formState.defaultValues?.federal?.amountType}
                onValueChange={v => {
                  switch (v) {
                    case taxWithholdingAmountTypeEnum.Enum.minimum:
                      form.setValue('federal.dollar', '0');
                      form.setValue('federal.percentage', '0');
                      form.setValue('federal.taxRateToUse', TaxRateToUse.USEDEFAULTTABLE);
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.none:
                      form.setValue('federal.dollar', '0');
                      form.setValue('federal.percentage', '0');
                      form.setValue('federal.taxRateToUse', TaxRateToUse.NOWITHHOLDINGELECTED);
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.dollar:
                      form.setValue('federal.taxRateToUse', TaxRateToUse.USEVALUESENTERED);
                      form.setValue('federal.percentage', '0');
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.percentage:
                      form.setValue('federal.taxRateToUse', TaxRateToUse.USEVALUESENTERED);
                      form.setValue('federal.dollar', '0');
                      break;
                    default:
                      break;
                  }
                  field.onChange(v);
                }}
                options={options}
              />
            )}
          />
          {!!fieldTypes.federal && (
            <div className={styles.field}>
              {federalWithholdingType === 'dollar' && (

              <FieldData
                {...form.register('federal.dollar')}
                fieldSize={FieldSize.Small}
                fieldType={FieldTypes.Value}
              />
              )}
              {federalWithholdingType === 'percentage' && (
                <FieldData
                  {...form.register('federal.percentage')}
                  fieldSize={FieldSize.Small}
                  fieldType={FieldTypes.Percent}
                />
              )}
              {!!form.formState.errors.federal?.dollar?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.federal.dollar.message}
                />
              )}
              {!!form.formState.errors.federal?.percentage?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.federal.percentage.message}
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
            name="state.amountType"
            render={({ field }) => (
              <Radio
                id="tax-withholdings-state"
                defaultValue={form.formState.defaultValues?.state?.amountType}
                onValueChange={v => {
                  switch (v) {
                    case taxWithholdingAmountTypeEnum.Enum.minimum:
                      form.setValue('state.dollar', '0');
                      form.setValue('state.percentage', '0');
                      form.setValue('state.taxRateToUse', TaxRateToUse.USEDEFAULTTABLE);
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.none:
                      form.setValue('state.dollar', '0');
                      form.setValue('state.percentage', '0');
                      form.setValue('state.taxRateToUse', TaxRateToUse.NOWITHHOLDINGELECTED);
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.dollar:
                      form.setValue('state.taxRateToUse', TaxRateToUse.USEVALUESENTERED);
                      form.setValue('state.percentage', '0');
                      break;
                    case taxWithholdingAmountTypeEnum.Enum.percentage:
                      form.setValue('state.taxRateToUse', TaxRateToUse.USEVALUESENTERED);
                      form.setValue('state.dollar', '0');
                      break;
                    default:
                      break;
                  }
                  field.onChange(v);
                }}
                options={options}
              />
            )}
          />
          {!!fieldTypes.state && (
            <div className={styles.field}>
              {stateWithholdingType === 'dollar' && (
                <FieldData
                  {...form.register('state.dollar')}
                  fieldSize={FieldSize.Small}
                  fieldType={FieldTypes.Value}
                />
              )}
              {stateWithholdingType === 'percentage' && (
                <FieldData
                  {...form.register('state.percentage')}
                  fieldSize={FieldSize.Small}
                  fieldType={FieldTypes.Percent}
                />
              )}
              {!!form.formState.errors.state?.dollar?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.state.dollar.message}
                />
              )}
              {!!form.formState.errors.state?.percentage?.message?.length && (
                <AssistiveText
                  variant={AssistiveTextVariant.Error}
                  text={form.formState.errors.state.percentage.message}
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
