import { TFunction, useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldLabel from '@deps/components/fields/field-label';
import Radio, { RadioItem, RadioVariant } from '@deps/components/radio/radio';
import { radioClasses } from '@deps/components/radio/radio.helpers';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { Policy } from '@zinnia/api-types/types/sor';

const getRadioItems = (
    t: TFunction,
    policy: Policy,
    customAmount: string,
    setValue: (value: string) => void,
    onCustomChange: (value: string) => void
): RadioItem[] => {
    const { maximumWithdrawalAmount } = policy?.withdrawalValues || {};
    const maxAmountToWithdrawal = numberFormatify(maximumWithdrawalAmount);

    return [
        {
            label: t('surrenders.partial.custom'),
            subElement: (
                <Field
                    size={FieldSize.Small}
                    label={t('surrenders.partial.custom') as string}
                    leading="$"
                    type={FieldType.BaseActive}
                    value={customAmount}
                    onChange={(event) => onCustomChange(event.target.value)}
                    onClick={() => setValue('$0.00')}
                    maxLength={9}
                    formatOptions={{
                        type: 'number',
                        format: '',
                        decimalPlaces: 2,
                    }}
                    min={1}
                    onBlur={(event) => {
                        const { target } = event;
                        const value = target?.value;
                        if (!isNullEmptyOrUndefined(value)) {
                            const num = Number(value.replaceAll(',', ''));
                            const formattedValue = num.toFixed(2);
                            onCustomChange(formattedValue);
                        }
                    }}
                />
            ),
            value: '$0.00',
        },
        maxAmountToWithdrawal
            ? {
                  label: t('surrenders.partial.maximum'),
                  subElement: (
                      <div className="flex flex-col">
                          <FieldLabel
                              label={t('surrenders.partial.maximum') as string}
                              labelTooltip={
                                  t('surrenders.partial.maximum') as string
                              }
                              labelTooltipBody={
                                  t(
                                      'surrenders.partial.maximumTooltip'
                                  ) as string
                              }
                          />
                          <Content
                              contentClassName="flex"
                              details={maxAmountToWithdrawal}
                              variant={ContentVariant.BodySm}
                          />
                      </div>
                  ),
                  value: maxAmountToWithdrawal,
              }
            : null,
    ].filter(Boolean) as RadioItem[];
};

interface PartialViewContainerProps {
    policy: Policy;
    formError: string | null;
    exceedMaximumError: string;
    missingAmountError: string;
}

const PartialViewContainer = ({
    policy,
    formError,
    exceedMaximumError,
    missingAmountError,
}: PartialViewContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'withdrawals.amount',
    });
    const { withdrawal, setWithdrawal } = useWithdrawal();

    const setAmount = useCallback(
        (value: string) => {
            setWithdrawal({ ...withdrawal, withdrawalAmount: value });
        },
        [setWithdrawal, withdrawal]
    );

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            if (value !== '$0.00' && value !== '') {
                setWithdrawal({ ...withdrawal, withdrawalCustomAmount: '' });
            }
            setAmount(value);
        },
        [setAmount, setWithdrawal, withdrawal]
    );

    const handleChangeCustom = (value: any) => {
        setWithdrawal({ ...withdrawal, withdrawalCustomAmount: value });
    };

    const radioItems = getRadioItems(
        t,
        policy,
        withdrawal.withdrawalCustomAmount as string,
        setAmount,
        handleChangeCustom
    );

    return (
        <>
            <div className="my-6 flex flex-col" data-testid="withdrawal-amount">
                <Typography
                    className="mb-4"
                    variant={TypographyVariant.LabelLg}
                >
                    {t('surrenders.partial.title')}
                </Typography>
                <Radio
                    items={radioItems}
                    value={withdrawal.withdrawalAmount as string}
                    onChange={onChange}
                />
                {(formError === exceedMaximumError ||
                    formError === missingAmountError) && (
                    <AssistiveText
                        className="mt-2"
                        variant={AssistiveTextVariant.Error}
                        text={formError}
                    ></AssistiveText>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <Typography variant={TypographyVariant.LabelLg}>
                    {t('fundDisbursementTypeLabel')}
                </Typography>
                <FieldLabel
                    label={t('fundDisbursementType') as string}
                    labelTooltip={t('fundDisbursementType') as string}
                    labelTooltipBody={
                        t('fundDisbursementTypeTooltip') as string
                    }
                />
                <div className="flex">
                    {/* TODO MG: fix this warning/use bloom component */}
                    <input
                        checked
                        className={radioClasses(RadioVariant.Default)}
                        tabIndex={-1}
                        type="radio"
                        readOnly
                    />
                    <Typography
                        className="ml-2"
                        variant={TypographyVariant.Body}
                    >
                        {t('proRata')}
                    </Typography>
                </div>
                <div className="flex">
                    <input
                        className={`cursor-not-allowed ${radioClasses(
                            RadioVariant.Inactive
                        )}`}
                        tabIndex={-1}
                        type="radio"
                        readOnly
                    />
                    <Typography
                        className="ml-2 cursor-not-allowed text-gray-300"
                        variant={TypographyVariant.Body}
                    >
                        {t('customFunds')}
                    </Typography>
                </div>
            </div>
        </>
    );
};

export default PartialViewContainer;
