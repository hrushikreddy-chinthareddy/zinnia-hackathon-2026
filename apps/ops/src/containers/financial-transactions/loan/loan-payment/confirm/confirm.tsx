import { Policy, TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useLoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { Statuses } from '@deps/models/case/case';
import {
    TransactionResponseStatus,
    submitLoanPayment,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';

import { buildLoanPaymentRequestBody } from '../loan-payment.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'loanPayment.confirm',
    });
    const { t: defaultT } = useTranslation();

    const { loanPayment } = useLoanPayment();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { sessionId, partyId } = usePermissionsContext();
    const { caseId, paymentAmount, payorFullName, validationResponse } =
        loanPayment;

    const [newCaseId, setNewCaseId] = useState<string | undefined>(caseId);
    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const submit = useCallback(async () => {
        const paymentBody = buildLoanPaymentRequestBody(loanPayment);
        const response = await submitLoanPayment(
            policy.product?.planCode,
            policy.policyNumber,
            paymentBody
        );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                session_id: sessionId,
                userId: partyId,
                type: TransactionType.LOAN_REPAYMENT_ONE_TIME,
                correlationId: paymentBody.correlationId,
            }
        );

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }

        setIsLoading(false);
    }, [
        loanPayment,
        policy.product?.planCode,
        policy.policyNumber,
        sessionId,
        partyId,
    ]);

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
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <ConfirmCard
                caseId={newCaseId}
                isNigo={!validationSucceeded || submitNigo}
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`}
                amount={Number(paymentAmount)}
                payorPayeeName={payorFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
