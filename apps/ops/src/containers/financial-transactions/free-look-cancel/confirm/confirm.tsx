import { Policy, TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { Statuses } from '@deps/models/case/case';
import { submitFreeLookCancel } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { buildFreeLookCancelRequestBody } from '../free-look-cancel.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'cancelFreeLook.confirm',
    });
    const { t: defaultT } = useTranslation();
    const { featureFlags } = useOptimizely();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    const { withdrawal } = useWithdrawal();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [newCaseId, setNewCaseId] = useState<string | undefined>(
        withdrawal.caseId
    );
    const [isLoading, setIsLoading] = useState(true);
    const { sessionId, partyId } = usePermissionsContext();

    const submit = useCallback(async () => {
        const requestBody = buildFreeLookCancelRequestBody(
            withdrawal,
            wireCheckPaymentsEnabled
        );
        const response = await submitFreeLookCancel(
            policy.product?.planCode,
            policy.policyNumber,
            requestBody
        );
        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                session_id: sessionId,
                userId: partyId,
                type: TransactionType.FREE_LOOK_CANCELLATION,
                correlationId: requestBody.correlationId,
            }
        );

        if (
            ![StatusCode.Accepted, StatusCode.Okay].includes(
                response.status as StatusCode
            )
        ) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }

        setIsLoading(false);
    }, [policy.policyNumber, policy.product?.planCode, withdrawal]);

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                submit={{
                    action: submit,
                    text: defaultT('cancelFreeLook.summary.submitCancellation'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <ConfirmCard
                caseId={newCaseId}
                isNigo={submitNigo}
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                amount={withdrawal.amount}
                payorPayeeName={withdrawal.payeeFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
