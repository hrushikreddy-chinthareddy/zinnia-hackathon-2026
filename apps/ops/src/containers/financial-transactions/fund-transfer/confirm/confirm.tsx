import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useFundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { submitFundTransfer } from '@deps/queries/api/fund-transfer';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { Policy, SchemaEnum } from '@zinnia/api-types/types/sor';

import { buildfundTransferRequestBody } from '../fund-transfer.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'fundTransfer.confirm',
    });
    const { t: defaultT } = useTranslation();
    const { sessionId, partyId } = usePermissionsContext();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { fundTransfer } = useFundTransfer();

    const { caseId, validationResponse, transactionAmounts } = fundTransfer;

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const [newCaseId, setNewCaseId] = useState<string | undefined>(caseId);

    const submit = useCallback(async () => {
        const body = buildfundTransferRequestBody(fundTransfer);
        const response = await submitFundTransfer(
            policy.product?.planCode,
            policy.policyNumber,
            body
        );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: SchemaEnum.FUND_TRANSFER,
                correlationId: body.correlationId,
            }
        );

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.FUND_TRANSFER,
                    query: body,
                    policy,
                    caseId: response?.data?.caseId,
                    sessionId,
                    userId: partyId,
                })
            );
        }

        setIsLoading(false);
    }, [fundTransfer, policy, sessionId, partyId]);

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/funds`}
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
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/funds`}
                amount={Number(
                    fundTransfer.funds.transferFrom[0]?.requestedAmount
                )}
                payorPayeeName={fundTransfer.funds.transferFrom[0]?.fundName}
                type={t('type')}
                amountType={transactionAmounts.amountType}
            />
        </div>
    );
};

export default Confirm;
