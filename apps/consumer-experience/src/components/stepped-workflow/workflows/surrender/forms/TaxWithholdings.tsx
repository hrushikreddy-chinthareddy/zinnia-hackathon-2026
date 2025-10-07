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
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import {
  taxWithHoldingStepSchema,
  SurrenderAction,
  taxWithholdingAmountTypeEnum,
} from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { useSurrender } from '@/components/stepped-workflow/workflows/surrender/provider/useSurrender';

import { default as styles } from '../Surrender.module.css';

const options = [
  {
    key: 'minimum',
    label: 'Withhold minimum required',
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
    label: 'Do not withhold',
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
  const { state, dispatch } = useSurrender();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(taxWithHoldingStepSchema),
    defaultValues: {
      federal: {
        taxRateToUse: state.taxWithholdingsStep?.federal?.taxRateToUse,
        amountType: state.taxWithholdingsStep?.federal?.amountType,
        dollar: state.taxWithholdingsStep?.federal?.dollar,
        percentage: state.taxWithholdingsStep?.federal?.percentage,
      },
      state: {
        taxRateToUse: state.taxWithholdingsStep?.state?.taxRateToUse,
        amountType: state.taxWithholdingsStep?.state?.amountType,
        dollar: state.taxWithholdingsStep?.state?.dollar,
        percentage: state.taxWithholdingsStep?.state?.percentage,
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
    z.infer<typeof taxWithHoldingStepSchema>
  > = data => {
    dispatch({
      type: SurrenderAction.SET_SURRENDER_TAX_WITHHOLDING_STEP,
      payload: {
        taxWithholdingsStep: data,
      },
    });

    router.push(stepInfo.nextStepUrl);
  };

  const resetTaxWithholdings = (type: 'federal' | 'state', value: string) => {
    {
      switch (value) {
        case taxWithholdingAmountTypeEnum.Enum.minimum:
          form.setValue(`${type}.dollar`, '0');
          form.setValue(`${type}.percentage`, '0');
          form.setValue(`${type}.taxRateToUse`, TaxRateToUse.USEDEFAULTTABLE);
          break;
        case taxWithholdingAmountTypeEnum.Enum.none:
          form.setValue(`${type}.dollar`, '0');
          form.setValue(`${type}.percentage`, '0');
          form.setValue(
            `${type}.taxRateToUse`,
            TaxRateToUse.NOWITHHOLDINGELECTED
          );
          break;
        case taxWithholdingAmountTypeEnum.Enum.dollar:
          form.setValue(`${type}.taxRateToUse`, TaxRateToUse.USEVALUESENTERED);
          form.setValue(`${type}.percentage`, '0');
          break;
        case taxWithholdingAmountTypeEnum.Enum.percentage:
          form.setValue(`${type}.taxRateToUse`, TaxRateToUse.USEVALUESENTERED);
          form.setValue(`${type}.dollar`, '0');
          break;
        default:
          break;
      }
    }
  };

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
          <Label
            labelFor="tax-withholdings-federal"
            interactiveElements={[
              <LabelPopover
                key="federal-tax-withholding"
                title="How much federal would you like to withhold? "
              >
                <p>
                  Withdrawals may be subject to federal income tax. We can
                  “withhold” the tax amount now for you, meaning we can
                  calculate what you owe and pay them to the IRS for you,
                  according to your instructions.
                </p>
              </LabelPopover>,
            ]}
          >
            How much federal tax would you like to withhold?
          </Label>
          <Controller
            control={form.control}
            name="federal.amountType"
            render={({ field }) => (
              <Radio
                id="tax-withholdings-federal"
                defaultValue={form.formState.defaultValues?.federal?.amountType}
                onValueChange={value => {
                  resetTaxWithholdings('federal', value);
                  field.onChange(value);
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
            labelFor="  tax-withholdings-state"
            interactiveElements={[
              <LabelPopover
                key="state-tax-withholding"
                title="How much state would you like to withhold? "
              >
                <p>
                  Withdrawals may be subject to state income tax. We can
                  “withhold” the tax amount now for you, meaning we can
                  calculate what you owe and pay them for you, according to your
                  instructions and your state.
                </p>
              </LabelPopover>,
            ]}
          >
            How much state tax{' '}
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
                onValueChange={value => {
                  resetTaxWithholdings('state', value);
                  field.onChange(value);
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
      <div className="typography-content-body-sm">
        Please consult with your qualified tax advisor for information regarding
        your situation.
      </div>
    </form>
  );
};
