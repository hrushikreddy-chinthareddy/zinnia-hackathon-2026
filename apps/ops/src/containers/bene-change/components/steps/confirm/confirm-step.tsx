import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { SorSystem } from '@deps/models/policy/enums';
import { fetchDocument } from '@deps/operations/documents/documentOperations';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    addTransaction,
    addBeneChangeTransaction,
} from '@deps/queries/api/web-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import {
    TransactionSuccessfulEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';

import { buildReRegRequestBody } from './confirm-step.helpers';
import { useBeneChange } from '../../../bene-change-provider';

interface ConfirmStepProps {
    policy: Policy;
    document?: DocumentData;
    planCode: string;
    clientId: string;
    parentPage: ParentPage;
    leaveTransactionLink: string;
    isBeneChange?: boolean;
}

const ConfirmStep = ({
    policy,
    document,
    planCode,
    clientId,
    leaveTransactionLink,
    parentPage,
    isBeneChange = false,
}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.confirm',
    });
    const router = useRouter();
    const {
        formData,
        formErrors,
        signatureData,
        beneData,
        ownerInfo,
        peopleSelection,
        SOR,
        validationResponse,
    } = useBeneChange();
    const { sessionId, partyId: userId } = usePermissionsContext();

    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const validationSucceeded = useMemo(
        () => Object.keys(formErrors).length === 0,
        [formErrors]
    );
    const [newCaseId, setNewCaseId] = useState<string | undefined>(
        formData.caseId
    );

    const validationSucceed = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    const submit = useCallback(async () => {
        let documentResult;
        setIsLoading(true);
        if (
            !document &&
            formData.businessKey &&
            formData.caseId !== '' &&
            clientId
        ) {
            documentResult = await fetchDocument(
                formData.businessKey,
                DocumentType.ReReg,
                clientId.toUpperCase()
            );
            if (!documentResult.success) {
                console.error(
                    'Beneficiary Change:: No documentNumber from getDocument for',
                    {
                        documentNumber: formData.businessKey,
                        documentType: DocumentType.ReReg,
                        clientId,
                    }
                );
            }
        }

        const parties = peopleSelection?.cardActionData?.filteredData || [];
        const requestBody = buildReRegRequestBody({
            formData,
            beneData,
            ownerInfo,
            signatureData,
            document,
            policy,
            selectedDocument: documentResult?.success
                ? documentResult.value
                : null,
            parties,
            sorSystem: SOR || SorSystem.LifeCad,
        });

        const response = isBeneChange
            ? await addBeneChangeTransaction({ ...requestBody, planCode })
            : await addTransaction(requestBody);
        if (response.status !== 'ACCEPTED') {
            setSubmitFailed(true);
        } else {
            setNewCaseId(response?.caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.UPDATE_BENEFICIARIES,
                    query: requestBody,
                    caseId: response?.caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
        }

        setIsLoading(false);
    }, [
        document,
        formData,
        clientId,
        signatureData,
        planCode,
        policy,
        sessionId,
        userId,
    ]);

    const hasAutoSubmittedRef = useRef(false);

    useEffect(() => {
        if (!hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            submit();
        }
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
                leaveRoute={leaveTransactionLink}
                submit={{
                    action: submit,
                    text: t('submitAddress'),
                }}
            />
        );
    }

    const isSuccess = validationSucceed;

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            {validationSucceeded ? (
                <CardInfo
                    icon={
                        isSuccess ? (
                            <CircleCheckIcon
                                className="text-semantic-success"
                                height={50}
                                width={50}
                            />
                        ) : null
                    }
                    cta={
                        newCaseId
                            ? {
                                  action: () => {
                                      router.push(
                                          `/cases/${newCaseId}/progress`
                                      );
                                  },
                                  text: t('goToCase'),
                              }
                            : undefined
                    }
                    secondaryCta={
                        <NavElement
                            aria-label={t('close') as string}
                            onClick={() => router.push(leaveTransactionLink)}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            className="font-semibold text-secondary"
                        >
                            {t('close')}
                        </NavElement>
                    }
                    subtitle={
                        isSuccess ? (
                            <span>{t('successMessage')}</span>
                        ) : (
                            <span>{t('nigo')}</span>
                        )
                    }
                    title={isSuccess ? t('title') : t('submit')}
                />
            ) : null}
        </div>
    );
};

export default ConfirmStep;
