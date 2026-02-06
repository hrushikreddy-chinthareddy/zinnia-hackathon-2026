import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Content, { ContentVariant } from '@deps/components/content/content';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import FieldLabel from '@deps/components/fields/field-label';
import Radio, { RadioItem, RadioVariant } from '@deps/components/radio/radio';
import { radioClasses } from '@deps/components/radio/radio.helpers';
import SelectSimple from '@deps/components/select/select';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import {
    DisbursementType,
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
} from '@zinnia/api-types/types/sor';

interface AmountProps {
    policy: Policy;
}

const getRadioItems = (
    t: TFunction,
    policy: Policy,
    customAmount: string,
    setValue: (value: string) => void,
    onCustomChange: (value: string) => void
): RadioItem[] => {
    const { loanValues: { maximumLoanAmount } = {} } = policy;
    const maxLoanAmount = numberFormatify(maximumLoanAmount);

    return [
        {
            label: t('value.custom'),
            subElement: (
                <Field
                    size={FieldSize.Small}
                    label={t('value.custom') as string}
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
        maxLoanAmount
            ? {
                  label: t('value.maximum'),
                  subElement: (
                      <div className="flex flex-col">
                          <FieldLabel
                              label={t('value.maximum') as string}
                              labelTooltip={t('value.maximum') as string}
                              labelTooltipBody={
                                  t('value.maximumTooltip') as string
                              }
                          />
                          <Content
                              contentClassName="flex"
                              details={maxLoanAmount}
                              variant={ContentVariant.BodySm}
                          />
                      </div>
                  ),
                  value: maxLoanAmount,
              }
            : null,
    ].filter(Boolean) as RadioItem[];
};

const Amount = ({ policy }: AmountProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newLoan.amount',
    });
    const { goToNext } = useWorkflow();
    const { newLoan, setNewLoan } = useNewLoan();
    const { disbursementType, effectiveDate } = newLoan;
    const [formError, setFormError] = useState<null | string>(null);

    const amountMissingError = t('value.amountMissingError');
    const missingAmountError = t('value.customError');
    const exceedMaximumError = t('value.exceedMaximum', {
        maxLoanAmount: numberFormatify(policy.loanValues?.maximumLoanAmount),
    });
    const invalidDate = t('effectiveDate.error');

    const disbursementTypes = [
        {
            label: t('disbursementType.gross'),
            value: DisbursementType.GROSS as string,
        },
        {
            label: t('disbursementType.net'),
            value: DisbursementType.NET as string,
        },
    ];

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        setNewLoan({ ...newLoan, effectiveDate: dateValue });
    };

    const isDateValid = (date: string): boolean => {
        return dayjs(date, NUMERIC_DATE_FORMAT).isValid() && date !== '';
    };

    const setAmount = useCallback(
        (value: string) => {
            setNewLoan({ ...newLoan, loanAmount: value });
        },
        [setNewLoan, newLoan]
    );

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            if (value !== '$0.00' && value !== '') {
                setNewLoan({ ...newLoan, loanCustomAmount: '' });
            }
            setAmount(value);
        },
        [setAmount, setNewLoan, newLoan]
    );

    const handleChangeCustom = (value: any) => {
        setNewLoan({ ...newLoan, loanCustomAmount: value });
    };

    const handleContinue = useCallback(() => {
        if (!newLoan.loanCustomAmount && !newLoan.loanAmount) {
            return setFormError(amountMissingError);
        }

        // Cleaning formatted string dollar to parseable number string
        const isCustom =
            Number((newLoan.loanAmount as string).replace(/[^0-9.-]+/g, '')) ===
            0;
        const newLoanAmount = isCustom
            ? newLoan.loanCustomAmount
            : newLoan.loanAmount;
        const roundedMaxAmt =
            Math.round(Number(policy.loanValues?.maximumLoanAmount) * 100) /
            100;

        if (!newLoanAmount) {
            return setFormError(missingAmountError);
        }

        if (
            roundedMaxAmt <
            parseFloat((newLoanAmount as string).replace(/[^0-9.-]+/g, ''))
        ) {
            return setFormError(exceedMaximumError);
        }

        if (isDateValid(effectiveDate) === false) {
            return setFormError(invalidDate);
        }

        goToNext();
    }, [
        newLoan.loanAmount,
        newLoan.loanCustomAmount,
        policy.loanValues?.maximumLoanAmount,
        effectiveDate,
        goToNext,
        amountMissingError,
        missingAmountError,
        exceedMaximumError,
        invalidDate,
    ]);

    useEffect(() => {
        if (!newLoan.loanCustomAmount && !newLoan.loanAmount) {
            return;
        }
        const isCustom =
            Number((newLoan.loanAmount as string).replace(/[^0-9.-]+/g, '')) ===
            0;
        const amount = isCustom ? newLoan.loanCustomAmount : newLoan.loanAmount;
        const amountNum = Number(amount?.replace(/[^0-9.-]+/g, '')) || 0;

        setNewLoan((prevState) => ({ ...prevState, amount: amountNum }));
    }, [setNewLoan, newLoan.loanAmount, newLoan.loanCustomAmount]);

    const radioItems = getRadioItems(
        t,
        policy,
        newLoan.loanCustomAmount as string,
        setAmount,
        handleChangeCustom
    );

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    parentPage={ParentPage.Loans}
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.NEW_LOAN,
                        step: TransactionStep.Amount,
                    }}
                />
            }
        >
            <div className="flex flex-col gap-10">
                <FieldDateSelect
                    isFutureDateDisabled={false}
                    formatOptions={{ format: '##/##/####' }}
                    className="flex max-w-[160px]"
                    labelTooltip={t('effectiveDate.label') as string}
                    labelTooltipBody={t('effectiveDate.tooltip') as string}
                    label={t('effectiveDate.label') as string}
                    value={effectiveDate}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    variant={
                        isDateValid(effectiveDate)
                            ? FieldVariant.Default
                            : FieldVariant.Error
                    }
                    message={
                        isDateValid(effectiveDate) ? undefined : invalidDate
                    }
                />
                <div className="flex flex-col gap-4" data-testid="loan-amount">
                    <Typography
                        variant={TypographyVariant.LabelLg}
                        data-testid="loan-amount-label"
                    >
                        {t('value.title')}
                    </Typography>
                    <Radio
                        items={radioItems}
                        value={newLoan.loanAmount as string}
                        onChange={onChange}
                    />

                    {(formError === amountMissingError ||
                        formError === exceedMaximumError ||
                        formError === missingAmountError) && (
                        <AssistiveText
                            className="mt-2"
                            variant={AssistiveTextVariant.Error}
                            text={formError}
                        ></AssistiveText>
                    )}
                </div>
                <SelectSimple
                    className="flex max-w-[160px]"
                    labelTooltip={t('disbursementType.label') as string}
                    labelTooltipBody={t('disbursementType.tooltip') as string}
                    label={t('disbursementType.label') as string}
                    aria-label={t('disbursementType.label') as string}
                    options={disbursementTypes}
                    value={disbursementType}
                    onChange={(value) => {
                        setNewLoan({
                            ...newLoan,
                            disbursementType: value as DisbursementType,
                        });
                    }}
                    size={FieldSize.Small}
                />
                <div className="flex flex-col gap-4">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('fundDisbursementType.title')}
                    </Typography>
                    <FieldLabel
                        label={t('fundDisbursementType.label') as string}
                        labelTooltip={t('fundDisbursementType.label') as string}
                        labelTooltipBody={
                            t('fundDisbursementType.tooltip') as string
                        }
                    />
                    <div className="flex">
                        <input
                            checked
                            className={radioClasses(RadioVariant.Default)}
                            tabIndex={-1}
                            type="radio"
                            readOnly
                        />
                        <Typography
                            className="ml-2"
                            variant={TypographyVariant.BodySm}
                        >
                            {t('fundDisbursementType.proRata')}
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
                            variant={TypographyVariant.BodySm}
                        >
                            {t('fundDisbursementType.customFunds')}
                        </Typography>
                    </div>
                </div>
            </div>
        </WorkflowCard>
    );
};

export default Amount;
