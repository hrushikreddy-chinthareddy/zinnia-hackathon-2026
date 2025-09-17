import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildClaimPaylod } from '@deps/containers/death-claim-container/death-claim.helpers';
import { useDeathClaim } from '@deps/contexts/DeathClaimContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { submitDeathClaim } from '@deps/queries/api/web-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';
import { browserLogInfo } from '@deps/utils/browser-logging';

interface ConfirmStepProps {
    policy: Policy;
}

const ConfirmStep = ({ policy }: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.confirmStep',
    });
    const router = useRouter();
    const { partyId, sessionId } = usePermissionsContext();
    const {
        submitFailed,
        setSubmitFailed,
        notifiers,
        owners,
        beneficiaries,
        setCaseId,
        caseId,
        onbaseCaseId,
        onbaseDocumentNumber,
    } = useDeathClaim();
    const [isLoading, setIsLoading] = useState(false);

    const submit = async () => {
        setIsLoading(true);
        const payload = buildClaimPaylod(
            policy,
            null,
            notifiers,
            owners,
            beneficiaries,
            onbaseCaseId,
            onbaseDocumentNumber
        );
        browserLogInfo('ConfirmStep::Submit claim payload', {
            payload,
            policy: policy?.policyNumber,
        });
        const successfulSubmit = await submitDeathClaim(payload);

        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.id);
            setSubmitFailed(false);
            segmentAnalyticsTrackEvent(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.DEATH_CLAIM,
                    query: payload,
                    policy,
                    caseId: successfulSubmit?.zlCaseId,
                    sessionId,
                    userId: partyId,
                })
            );
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }

        setIsLoading(false);
    };

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
                leaveRoute={'/create-case'}
                submit={{
                    action: submit,
                    text: t('submitClaim'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                icon={
                    <CircleCheckIcon
                        className="text-semantic-success"
                        height={50}
                        width={50}
                    />
                }
                subtitle={t('subTitle', { caseId: caseId })}
                title={t('title')}
                cta={{
                    action: () => {
                        router.push(`/cases/${caseId}/progress`);
                    },
                    text: t('cta'),
                }}
                secondaryCta={
                    <NavElement
                        aria-label={t('secondaryCta') as string}
                        onClick={() =>
                            router.push(
                                `/policies/${policy.product?.planCode}/${policy.policyNumber}`
                            )
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('secondaryCta')}
                    </NavElement>
                }
            />
        </div>
    );
};

export default ConfirmStep;
