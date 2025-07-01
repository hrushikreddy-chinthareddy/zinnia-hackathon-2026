import { Policy, TransactionType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';

import {
    isDateAllowed,
    isPaymentAllowed,
    getImportantDates,
} from './amount.helpers';

interface AmountProps {
    policy: Policy;
}

type Errors = {
    effectiveDate?: string;
    paymentAmount?: string;
};

const Amount = ({ policy }: AmountProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newPremium.amount',
    });
    const { premium, setPremium } = usePremium();
    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<Errors>({});

    const { policyNumber, product, policyFeatures } = policy;
    const { effectiveDate, paymentAmount } = premium;

    const { startDate, endDate, requiredPayment, hasLapse, hasReinstatement } =
        getImportantDates(policyFeatures);

    const handleIsDateAllowed = useCallback(
        (
            date: dayjs.Dayjs,
            startDate: dayjs.Dayjs | undefined,
            endDate: dayjs.Dayjs | undefined
        ) => {
            if (!hasLapse && !hasReinstatement) {
                return true;
            }

            return isDateAllowed(date, startDate, endDate);
        },
        [hasLapse, hasReinstatement]
    );

    const handleDateChange = ({
        target: { value: dateValue },
    }: ChangeEvent<HTMLInputElement>) => {
        const formattedDate = dayjs(dateValue, DATE_PICKER_FORMAT);

        if (!formattedDate.isValid()) return;

        validateFields({ effectiveDate: dateValue });

        const today = new Date();
        const isReverseInitiator = formattedDate.isBefore(dayjs(today));
        setPremium((oldPremium) => ({
            ...oldPremium,
            effectiveDate: dateValue,
            reverseInitiator: isReverseInitiator,
        }));
    };

    const handlePaymentAmountChange = ({
        target: { value: paymentValue },
    }: ChangeEvent<HTMLInputElement>) => {
        validateFields({ paymentAmount: paymentValue });
        setPremium((oldPremium) => ({
            ...oldPremium,
            paymentAmount: paymentValue,
        }));
    };

    const validateFields = ({
        effectiveDate,
        paymentAmount,
    }: {
        effectiveDate?: string;
        paymentAmount?: string;
    }) => {
        const newErrors = { ...errors };

        // date errors
        if (effectiveDate?.length) {
            if (isNullEmptyOrUndefined(effectiveDate)) {
                newErrors.effectiveDate = `${t('missingDateError')}`;
            } else {
                const formattedDate = dayjs(effectiveDate, DATE_PICKER_FORMAT);

                if (!formattedDate.isValid()) {
                    newErrors.effectiveDate = `${t('invalidDateError')}`;
                } else if (!isDateAllowed(formattedDate, startDate, endDate)) {
                    if (hasReinstatement) {
                        newErrors.effectiveDate = `${t(
                            'pendingLapseDateError',
                            {
                                gracePeriodStartDate: startDate?.format(
                                    DEFAULT_EXTENDED_DATE_FORMAT
                                ),
                                gracePeriodEndDate: endDate?.format(
                                    DEFAULT_EXTENDED_DATE_FORMAT
                                ),
                            }
                        )}`;
                    } else if (hasLapse) {
                        newErrors.effectiveDate = `${t('pendingLapseWarning', {
                            gracePeriodEndDate: startDate?.format(
                                DEFAULT_EXTENDED_DATE_FORMAT
                            ),
                            minLapsePendingAmt:
                                numberFormatify(requiredPayment),
                        })}`;
                    }
                } else {
                    delete newErrors.effectiveDate;
                }
            }
        }

        // payment errors
        if (paymentAmount !== undefined) {
            if (isNullEmptyOrUndefined(paymentAmount)) {
                newErrors.paymentAmount = `${t('missingPaymentError')}`;
            } else if (!isPaymentAllowed(paymentAmount, requiredPayment)) {
                newErrors.paymentAmount = `${t('pendingLapseAmountError', {
                    minLapsePendingAmt: numberFormatify(requiredPayment),
                })}`;
            } else {
                delete newErrors.paymentAmount;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (
            !validateFields({
                effectiveDate,
                paymentAmount,
            })
        )
            return;
        goToNext();
    };

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    handleContinue={handleContinue}
                    planCode={product?.planCode}
                    policyNumber={policyNumber}
                    parentPage={ParentPage.Premiums}
                    trackEventProps={{
                        type: TransactionType.PAYMENT_ONE_TIME_PREMIUM,
                        step: TransactionStep.Amount,
                    }}
                />
            }
        >
            <div className="flex flex-col gap-6">
                <FieldDateSelect
                    formatOptions={{ format: '##/##/####' }}
                    className="flex max-w-[160px]"
                    label={t('dateLabel') as string}
                    value={dayjs(effectiveDate, DATE_PICKER_FORMAT).format(
                        DATE_PICKER_FORMAT
                    )}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    isDateAllowed={(date) =>
                        handleIsDateAllowed(date, startDate, endDate)
                    }
                    isFutureDateDisabled={false}
                    variant={
                        errors.effectiveDate
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    message={errors.effectiveDate || ''}
                />
                <Field
                    size={FieldSize.Small}
                    className="max-w-[160px]"
                    label={t('paymentLabel') as string}
                    leading="$"
                    type={FieldType.BaseActive}
                    value={premium.paymentAmount}
                    onChange={handlePaymentAmountChange}
                    formatOptions={{
                        type: 'number',
                        format: '',
                        decimalPlaces: 2,
                    }}
                    variant={
                        errors.paymentAmount
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    message={errors.paymentAmount || ''}
                />
            </div>
        </WorkflowCard>
    );
};

export default Amount;
