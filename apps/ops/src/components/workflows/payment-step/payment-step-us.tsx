import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { convertAggregationAccountTypeToPaymentForm } from '@deps/helpers/transactions/payment.helpers';

import { BankDetailsCards } from './bank-details-cards';
import { PaymentMethodType, PaymentStepProps } from './types';
import { usePaymentMethods } from './use-bank-details';
import WorkflowCard from '../workflow-card/workflow-card';

const PaymentStepUS = ({
    parentPage,
    policy,
    setState,
    state,
    subtitle,
    validateTransaction,
    trackEventProps,
}: PaymentStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();
    const router = useRouter();
    const [formError, setFormError] = useState(false);

    const { policyNumber, product } = policy;

    const { paymentBankId } = state;

    const {
        data: paymentMethods = [],
        isLoading: paymentMethodsLoading,
        isError: paymentMethodsError,
        error: paymentMethodsErrorData,
    } = usePaymentMethods({
        state,
        policy,
    });

    if (paymentMethods.length > 0) {
        const selectedPaymentMethod =
            paymentMethods?.find(
                (paymentMethod) => paymentMethod.bankId === paymentBankId
            ) || paymentMethods?.[0];

        if (selectedPaymentMethod.bankId !== state.paymentBankId) {
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: selectedPaymentMethod?.accountNumber,
                paymentBankId: selectedPaymentMethod?.bankId,
                paymentBranchName: selectedPaymentMethod?.branchName,
                paymentForm: convertAggregationAccountTypeToPaymentForm(
                    selectedPaymentMethod?.accountType
                ),
            }));
        }
    }

    const handleContinue = async () => {
        if (paymentBankId === '') {
            setFormError(true);
            return;
        }

        if (!validateTransaction) {
            goToNext();

            return;
        }

        const response = await validateTransaction();

        setState((prevState) => ({
            ...prevState,
            validationResponse: response,
        }));

        goToNext();
    };

    const handleSelection = ({ paymentBankId }: PaymentMethodType) => {
        if (paymentBankId === state.paymentBankId) {
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: '',
                paymentBranchName: '',
                paymentBankId: '',
                paymentForm: undefined,
            }));
        } else {
            const selectedPaymentMethod = paymentMethods?.find(
                (paymentMethod) => paymentMethod.bankId === paymentBankId
            );

            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: selectedPaymentMethod?.accountNumber,
                paymentBranchName: selectedPaymentMethod?.branchName,
                paymentBankId: selectedPaymentMethod?.bankId,
                selectedPaymentAccount: selectedPaymentMethod,
                paymentForm: convertAggregationAccountTypeToPaymentForm(
                    selectedPaymentMethod?.accountType
                ),
            }));
            setFormError(false);
        }
    };

    const mainCta = {
        text: t('general.continue'),
        onClick: handleContinue,
    };

    const secondaryCta = {
        text: t('general.leaveTransaction'),
        onClick: () => {
            router.push(
                `/policies/${product?.planCode}/${policyNumber}/policy/${parentPage}`
            );
        },
    };

    const stopLoading = paymentBankId === '' || formError;

    return (
        <WorkflowCard
            title={t('workflows.paymentStep.heading')}
            footerContent={
                <TransactionCta
                    mainCta={mainCta}
                    secondaryCta={secondaryCta}
                    stopLoading={stopLoading}
                    trackEventProps={trackEventProps}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {subtitle}
                    </Typography>

                    <div className="flex flex-col gap-4">
                        <Typography variant={TypographyVariant.LabelLg}>
                            {t('workflows.paymentStep.label')}
                        </Typography>

                        <BankDetailsCards
                            bankDetails={paymentMethods}
                            bankDetailsError={paymentMethodsError}
                            bankDetailsLoading={paymentMethodsLoading}
                            paymentBankId={paymentBankId}
                            handleSelection={handleSelection}
                            t={t}
                            dataTestid="payment-methods"
                            bankDetailsErrorDetails={paymentMethodsErrorData}
                        />
                    </div>
                </div>
                {formError && (
                    <AssistiveText
                        className="col-span-full"
                        text={t('workflows.paymentStep.bankError')}
                        variant={AssistiveTextVariant.Error}
                    />
                )}
            </div>
        </WorkflowCard>
    );
};

export default PaymentStepUS;
