<<<<<<< HEAD
=======
import { useQuery } from '@tanstack/react-query';
import {
    ArrangementType,
    Status,
    Policy,
    BankAccount,
} from '@zinnia/api-types/types/sor';
import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
>>>>>>> 4f1e0cdefd1072d923b2388cb46598b3bfd5e2d3
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState, useMemo } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
<<<<<<< HEAD
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
=======
import BankDataCard from '@deps/containers/small-data-card/bank-data/bank-data';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { QueryKeys } from '@deps/pages/cases/caseFilterQueryStore';
import { getPaymentMethods } from '@deps/queries/api/aggregation';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
>>>>>>> 4f1e0cdefd1072d923b2388cb46598b3bfd5e2d3

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

<<<<<<< HEAD
    const { policyNumber, product } = policy;

    const { paymentBankId } = state;

    const {
        data: bankDetails = [],
        isLoading: bankDetailsLoading,
        isError: bankDetailsError,
    } = useBankDetails({
        state,
        policy,
=======
    const { featureFlags } = useOptimizely();
    const showPaymentUSFeature = featureFlags[FEATURE_FLAGS.PAYMENTUS_FEATURE];

    const { parties, policyNumber, product, systematicPrograms } =
        policy as Policy;

    const {
        paymentBankId,
        paymentAccountNumber: currentPaymentAccountNumber,
        payeePartyId,
        payorPartyId,
        arrangementType = ArrangementType.PAYMENT,
    } = state;

    const payPartyId = payeePartyId || payorPartyId;

    const paymentProgram = systematicPrograms?.find(
        (program) =>
            program.arrangementType === arrangementType &&
            program.status === Status.ACTIVE
    );

    const party = parties?.find((party) => party.partyId === payPartyId);

    const programBankId = paymentProgram?.party?.find(
        (party) => party.partyId === payPartyId
    );

    const {
        data: paymentUSBankDetails = [],
        isLoading: paymentUSBankDetailsLoading,
        isError: paymentUSBankDetailsError,
    } = useQuery({
        queryKey: [
            QueryKeys.bankDetails,
            payPartyId,
            product?.planCode,
            policyNumber,
        ],
        queryFn: () =>
            getPaymentMethods({
                partyId: payPartyId || '',
                planCode: product?.planCode || '',
                policyNumber: policyNumber || '',
            }),
>>>>>>> 4f1e0cdefd1072d923b2388cb46598b3bfd5e2d3
    });

    const localBankDetails = useMemo(() => {
        const currentBankDetails = party?.bankDetails?.filter((bank: any) => {
            return !isEndDated(bank?.endDate);
        });
        return currentBankDetails?.sort((a, b) => {
            if (a.bankId === programBankId) return -1;
            if (b.bankId === programBankId) return 1;

            if (dayjs(b.startDate).isSame(a.startDate)) {
                return a.bankId?.localeCompare(b.bankId || '') || 1;
            }

            return dayjs(b.startDate).isBefore(a.startDate) ? 1 : -1;
        });
    }, [party?.bankDetails, programBankId]);

    const bankDetails = (
        showPaymentUSFeature ? paymentUSBankDetails : localBankDetails
    ) as BankAccount[];
    const bankDetailsLoading = showPaymentUSFeature
        ? paymentUSBankDetailsLoading
        : false;
    const bankDetailsError = showPaymentUSFeature
        ? paymentUSBankDetailsError
        : false;

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
