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

import { BankDetailsCards } from './bank-details-cards';
import { PaymentMethodType, PaymentStepProps } from './types';
import { useBankDetails } from './use-bank-details';
import WorkflowCard from '../workflow-card/workflow-card';

const PaymentStep = ({
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
        data: bankDetails = [],
        isLoading: bankDetailsLoading,
        isError: bankDetailsError,
    } = useBankDetails({
        state,
        policy,
    });

    if (bankDetails.length > 0) {
        const selectedBank =
            bankDetails?.find((bank) => bank.bankId === paymentBankId) ||
            bankDetails?.[0];

        if (selectedBank.bankId !== state.paymentBankId) {
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: selectedBank?.accountNumber,
                paymentBankId: selectedBank?.bankId,
                paymentBranchName: selectedBank?.branchName,
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
            }));
        } else {
            const selectedBank = bankDetails?.find(
                (bank) => bank.bankId === paymentBankId
            );

            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: selectedBank?.accountNumber,
                paymentBranchName: selectedBank?.branchName,
                paymentBankId: selectedBank?.bankId,
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
                            bankDetails={bankDetails}
                            bankDetailsError={bankDetailsError}
                            bankDetailsLoading={bankDetailsLoading}
                            paymentBankId={paymentBankId}
                            handleSelection={handleSelection}
                            t={t}
                            dataTestid="payment-methods"
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

export default PaymentStep;
