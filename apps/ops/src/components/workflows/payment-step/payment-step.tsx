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
import BankDataCard from '@deps/containers/small-data-card/bank-data/bank-data';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { QueryKeys } from '@deps/pages/cases/caseFilterQueryStore';
import { getPaymentMethods } from '@deps/queries/api/aggregation';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { PaymentMethodType, PaymentStepProps } from './types';
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
        if (currentPaymentAccountNumber === '') {
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

    const handleSelection = ({
        paymentAccountNumber,
        paymentBranchName,
        paymentBankId,
    }: PaymentMethodType) => {
        if (paymentBankId === state.paymentBankId) {
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber: '',
                paymentBranchName: '',
                paymentBankId: '',
            }));
        } else {
            setState((prevState) => ({
                ...prevState,
                paymentAccountNumber,
                paymentBranchName,
                paymentBankId,
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

    const stopLoading = currentPaymentAccountNumber === '' || formError;

    const showBankingDetails =
        !bankDetailsError && !bankDetailsLoading && bankDetails?.length > 0;
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

                        <div
                            className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3"
                            data-testid="payment-methods"
                        >
                            {showBankingDetails &&
                                bankDetails?.map((details) => (
                                    <BankDataCard
                                        bankDetails={details}
                                        onCardClick={() => {
                                            handleSelection({
                                                paymentAccountNumber:
                                                    details.accountNumber,
                                                paymentBankId: details.bankId,
                                                paymentBranchName:
                                                    details.branchName,
                                            });
                                        }}
                                        key={details.bankId}
                                        selectedId={currentPaymentAccountNumber}
                                        accessibilityClickText={t(
                                            'ariaLabel.select'
                                        )}
                                    />
                                ))}
                            <div
                                aria-hidden
                                className={clsx(
                                    'flex items-center justify-center gap-1 rounded-md  px-4 py-8 text-gray-300',
                                    !bankDetailsLoading &&
                                        !bankDetailsError &&
                                        'bg-gray-100 border-2 border-gray-200 cursor-not-allowed '
                                )}
                            >
                                <>
                                    {!bankDetailsError &&
                                        bankDetails?.length > 0 && (
                                            <AddIcon height={24} width={24} />
                                        )}
                                    <p className="font-primary text-base font-semibold">
                                        {bankDetailsLoading ? (
                                            <Loader />
                                        ) : bankDetailsError ? (
                                            <AssistiveText
                                                text={t(
                                                    'workflows.paymentStep.getBankError'
                                                )}
                                                variant={
                                                    AssistiveTextVariant.Error
                                                }
                                            />
                                        ) : bankDetails?.length > 0 ? (
                                            t('workflows.paymentStep.addBank')
                                        ) : (
                                            t('workflows.paymentStep.empty')
                                        )}
                                    </p>
                                </>
                            </div>
                        </div>
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
