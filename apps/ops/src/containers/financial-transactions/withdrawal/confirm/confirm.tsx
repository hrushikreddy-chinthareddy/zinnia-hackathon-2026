import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildWithdrawalsRequestBody } from '@deps/containers/financial-transactions/withdrawal/withdrawals.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    buildOneTimeFinancialTransactionSubmittedEvent,
    buildFullSurrenderSubmittedEvent,
} from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import {
    TransactionResponseStatus,
    submitFullSurrenderWithdrawal,
    submitPartialWithdrawalOneTime,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
    TransactionSuccessfulEvent,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FullSurrenderRequest,
    PartialWithdrawalOneTimeRequest,
} from '@zinnia/api-types/types/bpm';
import { Policy, SchemaEnum as TransactionTypeSchemaEnum } from '@zinnia/api-types/types/sor';

import { WithdrawalType } from '../amount/types';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'withdrawals.confirm',
    });
    const { t: defaultT } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { sessionId, partyId } = usePermissionsContext();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    const { withdrawal } = useWithdrawal();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [newCaseId, setNewCaseId] = useState<string | undefined>(
        withdrawal.caseId
    );

    const [isLoading, setIsLoading] = useState(true);

    const validationSucceeded = useMemo(
        () =>
            withdrawal.validationResponse?.status ===
            TransactionResponseStatus.Success,
        [withdrawal.validationResponse]
    );

    const submit = useCallback(async () => {
        const requestBody = buildWithdrawalsRequestBody(
            withdrawal,
            wireCheckPaymentsEnabled
        );

        const isSurrender = withdrawal.type === WithdrawalType.Surrender;
        const response = isSurrender
            ? await submitFullSurrenderWithdrawal(
                  policy.product?.planCode,
                  policy.policyNumber,
                  requestBody as FullSurrenderRequest
              )
            : await submitPartialWithdrawalOneTime(
                  policy.product?.planCode,
                  policy.policyNumber,
                  requestBody as PartialWithdrawalOneTimeRequest
              );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: isSurrender
                    ? TransactionTypeSchemaEnum.FULL_SURRENDER
                    : TransactionTypeSchemaEnum.PARTIAL_WITHDRAWAL_ONE_TIME,
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

            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                isSurrender
                    ? buildFullSurrenderSubmittedEvent({
                          query: requestBody as FullSurrenderRequest,
                          policy,
                          caseId: response?.data?.caseId,
                          sessionId,
                          userId: partyId,
                      })
                    : buildOneTimeFinancialTransactionSubmittedEvent({
                          query: requestBody as PartialWithdrawalOneTimeRequest,
                          policy,
                          caseId: response?.data?.caseId,
                          sessionId,
                          userId: partyId,
                          transactionSubmittedEventType:
                              TransactionSubmittedEventType.ONE_TIME_WITHDRAWAL,
                      })
            );
        }

        setIsLoading(false);
    }, [partyId, policy, sessionId, wireCheckPaymentsEnabled, withdrawal]);

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitWithdrawal'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <ConfirmCard
                caseId={newCaseId}
                isNigo={!validationSucceeded || submitNigo}
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                amount={withdrawal.amount}
                payorPayeeName={withdrawal.payeeFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
