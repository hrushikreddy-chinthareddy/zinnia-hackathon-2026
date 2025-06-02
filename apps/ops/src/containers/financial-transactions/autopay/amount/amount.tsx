import { Policy, Frequency, Status, AmountType as AutopayAmountType, TransactionType } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';

interface AmountProps {
    policy: Policy;
}

export type AmountType = {
    frequency: Frequency;
    initValues: boolean;
    effectiveDate: string;
    paymentAmount: string;
    amountType?: AutopayAmountType;
};

export type ReverseInitiatorType = {
    reverseInitiator: boolean;
};

type Errors = {
    effectiveDate?: string;
    frequency?: string;
    paymentAmount?: string;
};

const Amount = ({ policy }: AmountProps) => {
    const { autopay, setAutopay } = useAutopay();
    const { isSetUp, systematicProgramReason, parentPage, translationKeyPrefix } = autopay;

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

        setAutopay(() => ({
            ...autopay,
            effectiveDate: String(dayjs(effectiveDate).format(NUMERIC_DATE_FORMAT)),
            frequency: systematicProgramData?.frequency as Frequency,
            initValues: true,
            paymentAmount: systematicProgramData?.amount ? String(systematicProgramData.amount) : '',
        }));
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

    const validateFields = (effectiveDate: string, frequency: Frequency, paymentAmount: string) => {
        let errors: Errors = {};

        if (isNullEmptyOrUndefined(effectiveDate)) {
            errors = { ...errors, effectiveDate: isSetUp ? `${t('missingStartDateError')}` : `${t('missingNextPaymentDateError')}` };
        } else if (!dayjs(effectiveDate, NUMERIC_DATE_FORMAT).isValid()) {
            errors = { ...errors, effectiveDate: isSetUp ? `${t('invalidStartDateError')}` : `${t('invalidNextPaymentDateError')}` };
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
        if (!validateFields(autopay.effectiveDate, autopay.frequency, String(autopay.paymentAmount))) {
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
        { label: t('biAnnually'), value: Frequency.EVERYTWOWEEKS },
        { label: t('annually'), value: Frequency.ANNUAL },
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
            </div>
        </WorkflowCard>
    );
};

export default Amount;
