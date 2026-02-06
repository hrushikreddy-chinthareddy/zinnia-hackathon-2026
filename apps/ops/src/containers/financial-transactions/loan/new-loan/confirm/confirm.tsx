import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildOneTimeFinancialTransactionSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import {
    submitNewLoan,
    TransactionResponseStatus,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Policy, SchemaEnum as TransactionTypeSchemaEnum } from '@zinnia/api-types/types/sor';

import { buildNewLoanRequestBody } from '../new-loan.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newLoan.confirm',
    });
    const { t: defaultT } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { sessionId, partyId } = usePermissionsContext();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.NEW_LOAN_WIRE_CHECK_PAYMENTS];

    const { newLoan } = useNewLoan();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newCaseId, setNewCaseId] = useState<string | undefined>(
        newLoan.caseId
    );
    const validationSucceeded = useMemo(
        () =>
            newLoan.validationResponse?.status ===
            TransactionResponseStatus.Success,
        [newLoan.validationResponse]
    );

    const submit = useCallback(async () => {
        const requestBody = buildNewLoanRequestBody(
            newLoan,
            wireCheckPaymentsEnabled
        );
        const response = await submitNewLoan(
            policy.product?.planCode,
            policy.policyNumber,
            requestBody
        );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: TransactionTypeSchemaEnum.NEW_LOAN,
                correlationId: requestBody.correlationId,
            }
        );

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
            segmentAnalyticsTrackEvent(
                SegmentTrackedEventName.TransactionSubmitted,
                buildOneTimeFinancialTransactionSubmittedEvent({
                    query: requestBody,
                    policy,
                    caseId: response?.data?.caseId,
                    sessionId,
                    userId: partyId,
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.NEW_LOAN,
                })
            );
        }

        setIsLoading(false);
    }, [newLoan, wireCheckPaymentsEnabled, policy, sessionId, partyId]);

    const hasAutoSubmittedRef = useRef<unknown>(null);

    useEffect(() => {
        if (hasAutoSubmittedRef.current === submit) return;
        hasAutoSubmittedRef.current = submit;
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
                    text: defaultT('workflows.apiErrorCard.submitNewLoan'),
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
                amount={newLoan.amount}
                payorPayeeName={newLoan.payeeFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
