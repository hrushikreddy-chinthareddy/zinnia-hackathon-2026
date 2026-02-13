import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildOneTimeFinancialTransactionSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { Statuses } from '@deps/models/case/case';
import {
    TransactionResponseStatus,
    submitOneTimePremium,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import {
    TransactionContinueClickedEvent,
    SegmentTrackedEventName,
    TransactionSuccessfulEvent,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
} from '@zinnia/api-types/types/sor';

import { buildNewPremiumRequestBody } from '../new-premium.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newPremium.confirm',
    });
    const { t: defaultT } = useTranslation();

    const { premium } = usePremium();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { sessionId, partyId } = usePermissionsContext();
    const {
        paymentBankId,
        caseId,
        effectiveDate,
        paymentAmount,
        payorFullName,
        payorPartyId,
        validationResponse,
        reverseInitiator,
    } = premium;
    const [newCaseId, setNewCaseId] = useState<string | undefined>(caseId);

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const submit = useCallback(async () => {
        const query = buildNewPremiumRequestBody(premium);

        const response = await submitOneTimePremium(
            policy.product?.planCode,
            policy.policyNumber,
            query
        );

        segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
            SegmentTrackedEventName.TransactionContinueClicked,
            {
                authSessionId: sessionId,
                userId: partyId,
                type: TransactionTypeSchemaEnum.ONE_TIME_PREMIUM,
                correlationId: query.correlationId,
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
                buildOneTimeFinancialTransactionSubmittedEvent({
                    query,
                    policy,
                    caseId: response?.data?.caseId,
                    sessionId,
                    userId: partyId,
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.ONE_TIME_PREMIUM,
                })
            );
        }

        setIsLoading(false);
    }, [
        policy,
        caseId,
        effectiveDate,
        reverseInitiator,
        paymentAmount,
        paymentBankId,
        payorPartyId,
        sessionId,
        partyId,
    ]); //TODO: What happens when unecessary dependencies are removed? Will it break?

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`}
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
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`}
                amount={Number(paymentAmount)}
                payorPayeeName={payorFullName}
                type={t('type')}
            />
        </div>
    );
};

export default Confirm;
