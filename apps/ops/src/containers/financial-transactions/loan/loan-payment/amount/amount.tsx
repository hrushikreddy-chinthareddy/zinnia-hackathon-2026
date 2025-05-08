import { TransactionType } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useLoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { Policy } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { TransactionStep } from '@deps/types/segment-analytics';

interface AmountProps {
    policy: Policy;
}

export type AmountType = {
    effectiveDate: string;
    paymentAmount: string;
};

export type ReverseInitiatorType = {
    reverseInitiator: boolean;
};

type Errors = {
    effectiveDate?: string;
    paymentAmount?: string;
};

const Amount = ({ policy }: AmountProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'loanPayment.amount' });
    const { loanPayment, setLoanPayment } = useLoanPayment();
    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<Errors>({});

    const { policyNumber, product } = policy;

    const handleDateChange = ({ target: { value: dateValue } }: ChangeEvent<HTMLInputElement>) => {
        const { effectiveDate, ...remainingErrors } = errors;
        const isReverseInitiator = dayjs(dateValue, DATE_PICKER_FORMAT).isBefore(dayjs().format(ZAHARA_API_DATE_FORMAT));

        setLoanPayment(prevState => ({ ...prevState, effectiveDate: String(dateValue), reverseInitiator: isReverseInitiator }));
        setErrors(remainingErrors);
    };

    const handlePaymentAmountChange = ({ target: { value: paymentValue } }: ChangeEvent<HTMLInputElement>) => {
        const { paymentAmount, ...remainingErrors } = errors;

        setLoanPayment(prevState => ({ ...prevState, paymentAmount: paymentValue }));
        setErrors(remainingErrors);
    };

    const validateFields = (effectiveDate: string, paymentAmount: string) => {
        let errors: Errors = {};

        if (isNullEmptyOrUndefined(effectiveDate) || !dayjs(effectiveDate, NUMERIC_DATE_FORMAT).isValid()) {
            errors = { ...errors, effectiveDate: `${t('invalidDateError')}` };
        }

        if (isNullEmptyOrUndefined(paymentAmount) || Number(paymentAmount) < 1) {
            errors = { ...errors, paymentAmount: `${t('invalidPaymentAmountError')}` };
        }

        setErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleContinue = () => {
        if (!validateFields(loanPayment.effectiveDate, String(loanPayment.paymentAmount))) {
            return;
        }

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
                    parentPage={ParentPage.Loans}
                    // TODO MG: PAYMENT_LOAN_REPAYMENT_ONE_TIME or LOAN_REPAYMENT_ONE_TIME
                    trackEventProps={{ type: TransactionType.PAYMENT_LOAN_REPAYMENT_ONE_TIME, step: TransactionStep.Amount }}
                />
            }
        >
            <div className="flex flex-col gap-6">
                <FieldDateSelect
                    formatOptions={{ format: '##/##/####' }}
                    className="flex max-w-[155px]"
                    label={t('dateLabel') as string}
                    value={loanPayment.effectiveDate}
                    onChange={handleDateChange}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    isFutureDateDisabled={false}
                    variant={errors.effectiveDate ? FieldVariant.Error : FieldVariant.Default}
                    message={errors.effectiveDate || ''}
                />
                <Field
                    size={FieldSize.Small}
                    className="max-w-[155px]"
                    label={t('paymentLabel') as string}
                    leading="$"
                    type={FieldType.BaseActive}
                    value={loanPayment.paymentAmount}
                    onChange={handlePaymentAmountChange}
                    formatOptions={{
                        type: 'number',
                        format: '',
                        decimalPlaces: 2,
                    }}
                    variant={errors.paymentAmount ? FieldVariant.Error : FieldVariant.Default}
                    message={errors.paymentAmount || ''}
                />
            </div>
        </WorkflowCard>
    );
};

export default Amount;
