import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

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
import {
    OptimizelyVariableKey,
    useOptimizely,
} from '@deps/contexts/OptimizelyContext';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import {
    DEFAULT_EXTENDED_DATE_FORMAT,
    NUMERIC_DATE_FORMAT,
} from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';
import { isFeatureFlagVariableActive } from '@deps/utils/optimizely/utils';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import {
    FeatureType,
    Policy,
    TransactionTypeEnum,
} from '@zinnia/api-types/types/sor';

import {
    isDateAllowed,
    isPaymentAllowed,
    getImportantDates,
} from './amount.helpers';

interface AmountProps {
    policy: Policy;
    customFarmerCheck?: boolean;
}

type Errors = {
    effectiveDate?: string;
    paymentAmount?: string;
};

const Amount = ({ policy, customFarmerCheck = false }: AmountProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newPremium.amount',
    });
    const { premium, setPremium } = usePremium();
    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<Errors>({});

    const { policyNumber, product, policyFeatures = [] } = policy;

    const billingFeature = policyFeatures.find(
        (item) => item.featureType === FeatureType.BILLING
    );
    const { featureFlagVariables } = useOptimizely();

    const { paymentAmount: billingPaymentAmount = '' } = billingFeature || {};

    const { effectiveDate } = premium;
    const paymentAmount = customFarmerCheck
        ? String(billingPaymentAmount)
        : premium.paymentAmount;

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

    const isUseCurrentLifeCycleDate = isFeatureFlagVariableActive(
        featureFlagVariables,
        FEATURE_FLAG_VARIABLES.USE_CURRENT_LIFECYCLE_DATE,
        OptimizelyVariableKey.Clients,
        policy.carrierId?.toLocaleLowerCase() || ''
    );

    const handleDateAllowed = useCallback(
        (date: dayjs.Dayjs) => {
            const isAllowedByPolicyDateRules = handleIsDateAllowed(
                date,
                startDate,
                endDate
            );

            const minDate = dayjs(
                policy?.policyContractState?.currentLifecycleDate
            )
                .add(1, 'day')
                .format(NUMERIC_DATE_FORMAT);
            const min = dayjs(minDate, NUMERIC_DATE_FORMAT, true).startOf(
                'day'
            );

            const allowedByFarmers = isUseCurrentLifeCycleDate
                ? !min.isValid() || !date.isBefore(min, 'day')
                : true;

            return isAllowedByPolicyDateRules && allowedByFarmers;
        },
        [
            handleIsDateAllowed,
            startDate,
            endDate,
            isUseCurrentLifeCycleDate,
            policy,
        ]
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

    useEffect(() => {
        if (isUseCurrentLifeCycleDate) {
            setPremium((oldPremium) => ({
                ...oldPremium,
                effectiveDate: dayjs(
                    policy?.policyContractState?.currentLifecycleDate
                )
                    .add(1, 'day')
                    .format(NUMERIC_DATE_FORMAT),
            }));
        }
    }, [isUseCurrentLifeCycleDate, policy]);

    useEffect(() => {
        if (customFarmerCheck) {
            setPremium((oldPremium) => ({
                ...oldPremium,
                paymentAmount: String(billingPaymentAmount),
            }));
        }
    }, [customFarmerCheck]);

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
                        type: TransactionTypeEnum.PAYMENT_ONE_TIME_PREMIUM,
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
                    isDateAllowed={handleDateAllowed}
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
                        customFarmerCheck
                            ? FieldVariant.Inactive
                            : errors.paymentAmount
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                    message={errors.paymentAmount || ''}
                    disabled={customFarmerCheck}
                />
            </div>
        </WorkflowCard>
    );
};

export default Amount;
