import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import BankDataCard from '@deps/containers/small-data-card/bank-data/bank-data';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEndDated } from '@deps/helpers/date.helper';
import { ArrangementType, Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-medium.svg';
import { TransactionClickProps } from '@deps/types/segment-analytics';

import WorkflowCard from '../workflow-card/workflow-card';

export type PaymentMethodType = {
    paymentAccountNumber?: string;
    paymentBankId?: string;
    paymentBranchName?: string;
    validationResponse?: TransactionResponse;
};

export interface PaymentState extends PaymentMethodType {
    effectiveDate: string;
    payeePartyId?: string;
    paymentAmount: number | string;
    payorPartyId?: string;
}

export type PaymentStepSetState = Dispatch<SetStateAction<PaymentState>>;

interface PaymentStepProps extends TransactionClickProps {
    parentPage: ParentPage;
    policy: Policy;
    setState: PaymentStepSetState;
    state: PaymentState;
    subtitle?: string;
    validateTransaction?: () => Promise<TransactionResponse>;
}

const PaymentStep = ({ parentPage, policy, setState, state, subtitle, validateTransaction, trackEventProps }: PaymentStepProps) => {
    const { t } = useTranslation();
    const { goToNext } = useWorkflow();
    const router = useRouter();

    const { policyNumber, product, systematicPrograms } = policy;
    const { paymentBankId, paymentAccountNumber: currentPaymentAccountNumber, payeePartyId, payorPartyId } = state;
    const [formError, setFormError] = useState(false);

    const payPartyId = payeePartyId || payorPartyId;
    const party = policy?.parties?.find(party => party.partyId === payPartyId);
    const paymentProgram = systematicPrograms?.find(program => program.arrangementType === ArrangementType.PAYMENT);
    const programBankId = paymentProgram?.party?.find(party => party.partyId === payPartyId);
    const bankDetails = useMemo(() => {
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

    useEffect(() => {
        if (!bankDetails?.length) {
            return;
        }

        const selectedBank = bankDetails.find(bank => bank.bankId === paymentBankId) || bankDetails[0];

        setState(prevState => ({
            ...prevState,
            paymentAccountNumber: selectedBank?.accountNumber,
            paymentBankId: selectedBank?.bankId,
            paymentBranchName: selectedBank?.branchName,
        }));
        // We only want to run this on mount. Removing the dependency array will result in an infinate loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

        setState(prevState => ({ ...prevState, validationResponse: response }));

        goToNext();
    };

    const handleSelection = ({ paymentAccountNumber, paymentBranchName, paymentBankId }: PaymentMethodType) => {
        if (paymentAccountNumber === currentPaymentAccountNumber) {
            setState(prevState => ({ ...prevState, paymentAccountNumber: '', paymentBranchName: '', paymentBankId: '' }));
        } else {
            setState(prevState => ({ ...prevState, paymentAccountNumber, paymentBranchName, paymentBankId }));
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
            router.push(`/policies/${product?.planCode}/${policyNumber}/policy/${parentPage}`);
        },
    };

    const stopLoading = currentPaymentAccountNumber === '' || formError;

    return (
        <WorkflowCard
            title={t('workflows.paymentStep.heading')}
            footerContent={<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} stopLoading={stopLoading} trackEventProps={trackEventProps} />}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {subtitle}
                    </Typography>

                    <div className="flex flex-col gap-4">
                        <Typography variant={TypographyVariant.LabelLg}>{t('workflows.paymentStep.label')}</Typography>

                        <div className="grid auto-rows-fr grid-cols-1 gap-4 lg:grid-cols-3" data-testid="payment-methods">
                            {bankDetails?.map(details => (
                                <BankDataCard
                                    bankDetails={details}
                                    onCardClick={() => {
                                        handleSelection({
                                            paymentAccountNumber: details.accountNumber,
                                            paymentBankId: details.bankId,
                                            paymentBranchName: details.branchName,
                                        });
                                    }}
                                    key={details.accountNumber}
                                    selectedId={currentPaymentAccountNumber}
                                    accessibilityClickText={t('ariaLabel.select')}
                                />
                            ))}
                            <div
                                aria-hidden
                                className="flex cursor-not-allowed items-center justify-center gap-1 rounded-md border-2 border-gray-200 bg-gray-100 px-4 py-8 text-gray-300"
                            >
                                <AddIcon height={24} width={24} />
                                <p className="font-primary text-base font-semibold">{t('workflows.paymentStep.add')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {formError && (
                    <AssistiveText
                        className="col-span-full"
                        text={t('workflows.paymentStep.error')}
                        variant={AssistiveTextVariant.Error}
                    />
                )}
            </div>
        </WorkflowCard>
    );
};

export default PaymentStep;
