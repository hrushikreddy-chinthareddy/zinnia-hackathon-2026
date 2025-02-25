import { AllocationOption } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CardInfo from '@deps/components/card/card-info/card-info';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { ACH, useLoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitLoanPayment } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { buildLoanPaymentRequestBody } from '../loan-payment.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'loanPayment.confirm' });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { loanPayment } = useLoanPayment();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const {  paymentAmount, payorFullName, validationResponse } = loanPayment;

    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);

    const submit = useCallback(async () => {
        const paymentBody = buildLoanPaymentRequestBody(loanPayment);
        const response = await submitLoanPayment(policy.product?.planCode, policy.policyNumber, paymentBody);

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        }

        setIsLoading(false);
    }, [loanPayment, policy.product?.planCode, policy.policyNumber]);

    useEffect(() => {
        submit();
    }, [submit]);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitPayment'),
                }}
            />
        );
    }

    return (
        <>
            <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
                <>
                    {validationSucceeded ? (
                        <CardInfo
                            cta={{
                                action: () => {
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/activity/transactions`);
                                },
                                text: t('cta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            subtitle={
                                <>
                                    {t('subtitle.0')}
                                    <PiiWrapper className="font-bold">
                                        {numberFormatify(paymentAmount)}
                                    </PiiWrapper>
                                    {t('subtitle.1')}
                                    <PiiWrapper className="font-bold">{payorFullName}</PiiWrapper>
                                    {t('subtitle.2')}
                                </>
                            }
                            title={t('title')}
                        />
                    ) : (
                        <CardInfo
                            cta={{
                                action: () => {
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`);
                                },
                                text: t('secondaryCta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            subtitle={
                                <>
                                    <PiiWrapper className="font-bold">
                                        {payorFullName}'s {numberFormatify(paymentAmount)}
                                    </PiiWrapper>
                                    {t('subtitle.NIGO')}
                                    <span className="font-bold">{t('subtitle.NIGO1')}</span>
                                </>
                            }
                            title={t('title')}
                        />
                    )}
                </>
            </div>
        </>
    );
};

export default Confirm;
