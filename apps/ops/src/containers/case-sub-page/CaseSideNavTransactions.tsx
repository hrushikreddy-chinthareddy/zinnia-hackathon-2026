import { Label } from '@zinnia/bloom/components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { ReactNode, useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Title, { TitleVariant } from '@deps/components/title/title';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { AccessibleFormattedAmount } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { Case, CaseIdentifier, Processes } from '@deps/models/case/case';
import { getPolicyTransaction } from '@deps/queries/api/policies';
import loadingImage from '@deps/styles/images/loader.png';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

type TransactionDetails = {
    effectiveDate: string;
    transactionStatus: string;
    submittedAmount: ReactNode;
    appliedAmount: ReactNode;
    transactionId: string;
};

type UseTransactionDetails = {
    loading: boolean;
    shouldShowTransactionDetails: boolean;
    transactionDetails: TransactionDetails;
};

const FINANCIAL_TRANSACTION_CASE_TYPES = [
    Processes.Loan,
    Processes.LoanRepaymentOneTime,
    Processes.OneTimePremium,
    Processes.OutgoingFundTransfer,
    Processes.Redemption,
    Processes.RequiredMinimumDistribution,
    Processes.Withdrawal,
];

const useTransactionDetails = (caseDetails: Case): UseTransactionDetails => {
    const { policy, loadingPolicy } = useCaseActivityContext();
    const transactionId = caseDetails?.identifiers?.find(id => id.identifier === CaseIdentifier.TransactionId)?.value;
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetails>({
        effectiveDate: DEFAULT_ERROR_STRING,
        transactionStatus: DEFAULT_ERROR_STRING,
        submittedAmount: DEFAULT_ERROR_STRING,
        appliedAmount: DEFAULT_ERROR_STRING,
        transactionId: transactionId ?? '',
    });
    const [loadingTransaction, setLoadingTransaction] = useState(true);
    const shouldShowTransactionDetails = !!transactionId && FINANCIAL_TRANSACTION_CASE_TYPES.includes(caseDetails.process);
    useEffect(() => {
        if (loadingPolicy) {
            return;
        }
        // Only try to get a transaction if we have all the necessary ingredients
        if (!policy?.policyNumber || !policy?.planCode || !transactionId) {
            setLoadingTransaction(false);
            return;
        }

        const getTransaction = async () => {
            const transaction = await getPolicyTransaction(policy?.planCode as string, policy.policyNumber as string, transactionId);

            const { effectiveDate, status, transactionAmounts } = transaction ?? {};
            const { appliedAmount, requestedAmount } = transactionAmounts ?? {};

            setTransactionDetails({
                effectiveDate: convertKebabedDateString(effectiveDate),
                transactionStatus: (status as string) ?? DEFAULT_ERROR_STRING,
                appliedAmount: appliedAmount ? <AccessibleFormattedAmount amount={appliedAmount} /> : DEFAULT_ERROR_STRING,
                submittedAmount: requestedAmount ? <AccessibleFormattedAmount amount={requestedAmount} /> : DEFAULT_ERROR_STRING,
                transactionId,
            });
            setLoadingTransaction(false);
        };

        getTransaction();
    }, [policy, loadingPolicy, transactionId, loadingTransaction, setLoadingTransaction, setTransactionDetails]);

    if (!transactionId || !shouldShowTransactionDetails) {
        return { shouldShowTransactionDetails: false, transactionDetails: {} as TransactionDetails, loading: false };
    }
    return { shouldShowTransactionDetails, transactionDetails, loading: loadingPolicy || loadingTransaction };
};

export default function Transactions({ caseDetails }: { caseDetails: Case }) {
    const { t } = useTranslation();
    const { loading, shouldShowTransactionDetails, transactionDetails } = useTransactionDetails(caseDetails);

    if (!shouldShowTransactionDetails) {
        return null;
    }

    return (
        <div className="flex w-full flex-col border-t-2 border-gray-100 p-4">
            <Title className="mb-2" variant={TitleVariant.SubTitle}>
                {t('caseOverview.sidenav.transactionDetails')}
            </Title>
            {loading ? (
                <div className="mt-2 flex h-[104px] w-full items-center justify-center">
                    <div data-testid="test-loader" className="transform-origin-center duration-2000 animate-spin ease-linear">
                        <Image src={loadingImage} alt={t('site.loader')} height={33.33} width={33.33} />
                    </div>
                </div>
            ) : (
                <div className="mt-2 grid w-full grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 lg:grid-cols-2">
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${transactionDetails.transactionId}-submittedAmount`}>
                                {t('policy.history.sidesheet.submittedAmount')}
                            </Label>
                        </div>
                        <div
                            id={`${transactionDetails.transactionId}-submittedAmount`}
                            className="font-secondary text-md font-normal leading-[22px] tracking-normal no-underline"
                        >
                            {transactionDetails.submittedAmount}
                        </div>
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${transactionDetails.transactionId}-appliedAmount`}>
                                {t('policy.history.sidesheet.appliedAmount')}
                            </Label>
                        </div>
                        <div
                            id={`${transactionDetails.transactionId}-appliedAmount`}
                            className="font-secondary text-md font-normal leading-[22px] tracking-normal no-underline"
                        >
                            {transactionDetails.appliedAmount}
                        </div>
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${transactionDetails.transactionId}-transactionStatus`}>
                                {t('policy.history.sidesheet.transactionStatus')}
                            </Label>
                        </div>
                        <Content
                            id={`${transactionDetails.transactionId}-transactionStatus`}
                            details={transactionDetails.transactionStatus}
                            variant={ContentVariant.BodySm}
                            pii={false}
                        />
                    </div>
                    <div>
                        <div className="flex h-6 w-full items-center">
                            <Label labelFor={`${transactionDetails.transactionId}-effectiveDate`}>
                                {t('policy.history.sidesheet.effectiveDate')}
                            </Label>
                        </div>
                        <Content
                            id={`${transactionDetails.transactionId}-effectiveDate`}
                            details={transactionDetails.effectiveDate}
                            variant={ContentVariant.BodySm}
                            pii={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
