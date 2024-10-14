import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import Radio, { RadioItem } from '@deps/components/radio/radio';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useUpdatePremiumAutopay } from '@deps/contexts/UpdatePremiumAutopayContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { Policy, Frequency, Reason } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface AmountProps {
    policy: Policy;
}

export type AmountType = {
    frequency: Frequency;
    initValues: boolean;
    effectiveDate: string;
    paymentAmount: string;
};

type Errors = {
    effectiveDate?: string;
    paymentAmount?: string;
};

const Amount = ({ policy }: AmountProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'autopay.amount' });
    const { autopay, setAutopay } = useUpdatePremiumAutopay();
    const [errors, setErrors] = useState<Errors>({});
    const { systematicPrograms, policyNumber, product } = policy;
    const systematicProgramData = systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);
    const { goToNext } = useWorkflow();

    useEffect(() => {
        if (autopay.initValues === false) {
            setAutopay(() => ({
                ...autopay,
                paymentAmount: systematicProgramData ? String(systematicProgramData.amount) : '',
                effectiveDate: String(dayjs(systematicProgramData?.nextProgramDate).format(NUMERIC_DATE_FORMAT)),
                initValues: true,
            }));
        }
    }, [autopay, setAutopay, systematicProgramData?.amount, systematicProgramData]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = event.target.value;
        const { effectiveDate, ...remainingErrors } = errors;

        const today = new Date();
        const isReverseInitiator = dayjs(dateValue, DATE_PICKER_FORMAT).isBefore(dayjs(today).format(ZAHARA_API_DATE_FORMAT));

        setAutopay({ ...autopay, effectiveDate: String(dateValue), reverseInitiator: isReverseInitiator });
        setErrors(remainingErrors);
    };

    const handlepaymentAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const amountValue = event.target.value;
        const { paymentAmount, ...remainingErrors } = errors;

        setAutopay({ ...autopay, paymentAmount: amountValue });

        setErrors(remainingErrors);
    };

    const validateFields = (effectiveDate: string, paymentAmount: string) => {
        let errors: Errors = {};

        if (isNullEmptyOrUndefined(effectiveDate)) {
            errors = { ...errors, effectiveDate: `${t('missingDateError')}` };
        } else if (!dayjs(effectiveDate, NUMERIC_DATE_FORMAT).isValid()) {
            errors = { ...errors, effectiveDate: `${t('invalidDateError')}` };
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
        if (validateFields(autopay.effectiveDate, String(autopay.paymentAmount))) {
            goToNext();
        } else return;
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
                    parentPage={ParentPage.Premiums}
                />
            }
        >
            <div className="mt-6 flex flex-col gap-10">
                <Field
                    data-testid={t('paymentAmount') as string}
                    size={FieldSize.Small}
                    className="max-w-[155px]"
                    label={t('paymentAmount') as string}
                    leading="$"
                    type={FieldType.BaseActive}
                    value={String(numberFormatify(autopay.paymentAmount))}
                    onChange={handlepaymentAmountChange}
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
                    required={false}
                    value={String(autopay.frequency)}
                    onChange={handleFrequencyChange}
                />

                <FieldDateSelect
                    data-testid={t('nextPaymentDate') as string}
                    className="flex max-w-[155px]"
                    label={t('nextPaymentDate') as string}
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
