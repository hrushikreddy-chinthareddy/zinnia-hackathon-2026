import { TransactionType } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import ButtonGroup from '@deps/components/button-group/button-group';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import FieldLabel from '@deps/components/fields/field-label';
import Label, { LabelVariant } from '@deps/components/label/label';
import Radio, { RadioItem, RadioVariant } from '@deps/components/radio/radio';
import { radioClasses } from '@deps/components/radio/radio.helpers';
import SelectSimple from '@deps/components/select/select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { Policy, Frequency, ArrangementType, AmountType as AutopayAmountType, Status } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { LabelValue } from '@deps/types/data';
import { TransactionStep } from '@deps/types/segment-analytics';

interface AmountProps {
    policy: Policy;
}

export type AmountType = {
    frequency: Frequency;
    initValues: boolean;
    effectiveDate: string;
    paymentAmount: string;
};

export type ReverseInitiatorType = {
    reverseInitiator: boolean;
};

type Errors = {
    effectiveDate?: string;
    frequency?: string;
    paymentAmount?: string;
    distributionType?: string;
};

const WithdrawalAmount = ({ policy }: AmountProps) => {
    const { autopay, setAutopay } = useAutopay();
    const { isSetUp, systematicProgramReason, parentPage, translationKeyPrefix, arrangementType } = autopay;

    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${translationKeyPrefix}.amount` });
    const [errors, setErrors] = useState<Errors>({});
    const { systematicPrograms, policyDates, policyNumber, product } = policy;

    const systematicProgramData = useMemo(
        () => systematicPrograms?.find(sp => sp.reason === systematicProgramReason && sp.status === Status.ACTIVE),
        [systematicProgramReason, systematicPrograms]
    );

    const { goToNext } = useWorkflow();
    const dateLabel = useMemo(() => (isSetUp ? t('paymentStartDate') : t('nextPaymentDate')), [isSetUp, t]);

    useEffect(() => {
        if (autopay.initValues) {
            return;
        }
        // TODO MG: nextMonthiversaryDate only for everly?
        // confirm nextProgramDate is right when updating autopayment
        const isEverly = policy.carrierId === 'SBUL' || policy.carrierId === 'ELIC';
        const effectiveDate = isSetUp ? (isEverly ? policyDates?.nextMonthiversaryDate : dayjs()) : systematicProgramData?.nextProgramDate;

        if (!isSetUp) {
            setAutopay(() => ({
                ...autopay,
                effectiveDate: String(dayjs(effectiveDate).format(NUMERIC_DATE_FORMAT)),
                frequency: systematicProgramData?.frequency as Frequency,
                initValues: true,
                paymentAmount: systematicProgramData?.amount ? String(systematicProgramData.amount) : '',
            }));
        }
    }, [autopay, setAutopay, systematicProgramData, policyDates?.nextMonthiversaryDate, isSetUp, policy.carrierId]);

    const transactionType = useMemo(() => {
        return parentPage === ParentPage.Premiums ? TransactionType.SUBSEQUENT_PREMIUM : TransactionType.SYSTEMATIC_LOAN_REPAYMENT;
    }, [parentPage]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        const { effectiveDate, ...remainingErrors } = errors;

        const isReverseInitiator = dayjs(dateValue, DATE_PICKER_FORMAT).isBefore(dayjs().format(ZAHARA_API_DATE_FORMAT));

        setAutopay({ ...autopay, effectiveDate: String(dateValue), reverseInitiator: isReverseInitiator });
        setErrors(remainingErrors);
    };

    const handlePaymentAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const amountValue = event.target.value;
        const { paymentAmount, ...remainingErrors } = errors;

        setAutopay({ ...autopay, paymentAmount: amountValue });

        setErrors(remainingErrors);
    };

    const validateFields = (effectiveDate: string, frequency: Frequency, paymentAmount: string, distributionType: string) => {
        let errors: Errors = {};

        if (isNullEmptyOrUndefined(effectiveDate)) {
            errors = { ...errors, effectiveDate: isSetUp ? `${t('missingStartDateError')}` : `${t('missingNextPaymentDateError')}` };
        } else if (!dayjs(effectiveDate, NUMERIC_DATE_FORMAT).isValid()) {
            errors = { ...errors, effectiveDate: isSetUp ? `${t('invalidStartDateError')}` : `${t('invalidNextPaymentDateError')}` };
        }

        if (!distributionType) {
            errors = { ...errors, distributionType: `${t('missingDistributionError')}` };
        }

        if (!frequency) {
            errors = { ...errors, frequency: `${t('missingFrequencyError')}` };
        }

        if (isNullEmptyOrUndefined(paymentAmount)) {
            errors = { ...errors, paymentAmount: `${t('missingAmountError')}` };
        } else if (Number(paymentAmount) < 1) {
            errors = { ...errors, paymentAmount: `${t('invalidAmountError')}` };
        }

        setErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleContinue = async () => {
        if (!validateFields(autopay.effectiveDate, autopay.frequency, String(autopay.paymentAmount), autopay.arrangementType as any)) {
            return;
        }
        goToNext();
    };

    const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFrequency = event.target.value as Frequency;
        setAutopay({ ...autopay, frequency: selectedFrequency });
    };

    const items: RadioItem[] = [
        { label: t('monthly'), value: Frequency.MONTHLY },
        { label: t('quarterly'), value: Frequency.QUARTERLY },
        { label: t('annually'), value: Frequency.ANNUAL },
    ];

    const amountOptions = [
        { label: t('dollar'), value: AutopayAmountType.AMOUNT },
        // {label:t('earnings'), value: AutopayAmountType.EARNINGSONLY}
    ];

    const toggleLabels = (t: TFunction): LabelValue<ArrangementType>[] => [
        {
            label: 'Withdrawal',
            value: ArrangementType.WITHDRAWAL,
            testId: ArrangementType.WITHDRAWAL,
        },
        {
            label: 'RMD',
            value: ArrangementType.REQUIREDMINIMUMDISTRIBUTION,
            testId: ArrangementType.REQUIREDMINIMUMDISTRIBUTION,
        },
    ];

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    parentPage={parentPage as ParentPage}
                    trackEventProps={{ type: transactionType, step: TransactionStep.Amount }}
                />
            }
        >
            <div className="flex flex-col gap-6">
                {isSetUp && (
                    <Typography variant={TypographyVariant.LabelLg} data-testid="withdrawal-amount-label">
                        {t('withdrawalTypeLabel')}
                    </Typography>
                )}
                <div className="flex flex-col max-w-[246px]" data-testid="withdrawal-amount-radio">
                    <Typography variant={TypographyVariant.LabelMd} data-testid="withdrawal-amount-label">
                        {t('distributionType')}
                    </Typography>
                    {isSetUp ? (
                        <>
                            <ButtonGroup
                                activeValue={arrangementType as any}
                                labels={toggleLabels(t)}
                                toggle={value => {
                                    const { distributionType, ...remainingErrors } = errors;
                                    setAutopay(prev => ({
                                        ...prev,
                                        arrangementType: value as ArrangementType,
                                    }));
                                    setErrors(remainingErrors);
                                }}
                            />
                            {errors.distributionType && (
                                <AssistiveText text={errors.distributionType} variant={AssistiveTextVariant.Error} />
                            )}
                        </>
                    ) : (
                        <>
                            <Label
                                className="mt-2"
                                label={arrangementType === ArrangementType.WITHDRAWAL ? 'Withdrawal' : 'RMD'}
                                variant={LabelVariant.LabelMd}
                                sentenceCase={false}
                            />
                        </>
                    )}
                </div>
                <SelectSimple
                    className="flex max-w-[246px] placeholder:text-gray-400 mt-2"
                    label={t('type') as string}
                    options={amountOptions}
                    onChange={value => setAutopay({ ...autopay, amountType: value as AutopayAmountType })}
                    size={FieldSize.Small}
                    placeholder={'--Select type--'}
                    value={AutopayAmountType.AMOUNT}
                    name="form-type"
                />
                {
                    <Field
                        data-testid={t('paymentAmount') as string}
                        size={FieldSize.Small}
                        className="max-w-[160px]"
                        label={t('paymentAmount') as string}
                        leading="$"
                        type={FieldType.BaseActive}
                        value={String(numberFormatify(autopay.paymentAmount))}
                        onChange={handlePaymentAmountChange}
                        formatOptions={{
                            type: 'number',
                            format: '',
                            decimalPlaces: 2,
                        }}
                        variant={errors.paymentAmount ? FieldVariant.Error : FieldVariant.Default}
                        message={errors.paymentAmount || ''}
                    />
                }
                <Radio
                    label={`${t('paymentFrequency')}`}
                    items={items}
                    value={String(autopay.frequency)}
                    onChange={handleFrequencyChange}
                />
                {errors.frequency && <AssistiveText text={errors.frequency} variant={AssistiveTextVariant.Error} />}

                <FieldDateSelect
                    data-testid={dateLabel}
                    className="flex max-w-[160px]"
                    label={dateLabel}
                    value={String(autopay.effectiveDate)}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    isFutureDateDisabled={false}
                    variant={errors.effectiveDate ? FieldVariant.Error : FieldVariant.Default}
                    message={errors.effectiveDate || ''}
                />

                <Typography variant={TypographyVariant.LabelLg}>{t('fundDisbursementTypeLabel')}</Typography>
                <FieldLabel
                    label={t('fundDisbursementType') as string}
                    labelTooltip={t('fundDisbursementType') as string}
                    labelTooltipBody={t('fundDisbursementTypeTooltip') as string}
                />
                <div className="flex">
                    <input checked className={radioClasses(RadioVariant.Default)} tabIndex={-1} type="radio" readOnly />
                    <Typography className="ml-2" variant={TypographyVariant.Body}>
                        {t('proRata')}
                    </Typography>
                </div>
                <div className="flex">
                    <input className={`cursor-not-allowed ${radioClasses(RadioVariant.Inactive)}`} tabIndex={-1} type="radio" readOnly />
                    <Typography className="ml-2 cursor-not-allowed text-gray-300" variant={TypographyVariant.Body}>
                        {t('customFunds')}
                    </Typography>
                </div>
            </div>
        </WorkflowCard>
    );
};

export default WithdrawalAmount;
