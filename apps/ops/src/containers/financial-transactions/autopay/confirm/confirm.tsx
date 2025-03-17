import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { ACH, useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { Statuses } from '@deps/models/case/case';
import { AmountType, Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitSystematicProgramUpdate } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { autopay } = useAutopay();
    const {
        arrangementType, systematicProgramReason, parentPage, translationKeyPrefix,
        paymentAmount,
        caseId,
        frequency,
        effectiveDate,
        paymentBankId,
        payorPartyId,
        validationResponse,
        reverseInitiator,
    } = autopay;

    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${translationKeyPrefix}.confirm` });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber, product } = policy;
    const [newCaseId, setNewCaseId] = useState<string | undefined>(caseId);

    const systematicProgram = useMemo(
        () => policy.systematicPrograms?.find(sp => sp.reason === systematicProgramReason),
        [policy.systematicPrograms, systematicProgramReason]
    );
    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);

    const submit = useCallback(async () => {
        setIsLoading(true);

        const effectiveDateFormatted = dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
        const arrangementId = systematicProgram?.arrangementId || '';
        const response = await submitSystematicProgramUpdate(product?.planCode, policyNumber, arrangementId, {
            caseId: caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            reverseInitiator: reverseInitiator,
            systematicProgram: {
                amount: Number(paymentAmount),
                arrangementType: arrangementType,
                paymentForm: ACH,
                amountType: AmountType.AMOUNT,
                frequency,
                startDate: systematicProgram?.startDate,
                endDate: systematicProgram?.endDate,
                previousProgramDate: systematicProgram?.previousProgramDate,
                nextProgramDate: effectiveDateFormatted,
                party: {
                    bankId: paymentBankId,
                    partyId: payorPartyId,
                },
            },
        });

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }

        setIsLoading(false);
    }, [effectiveDate, systematicProgram?.arrangementId, systematicProgram?.startDate, systematicProgram?.endDate, systematicProgram?.previousProgramDate, product?.planCode, policyNumber, caseId, reverseInitiator, paymentAmount, arrangementType, frequency, paymentBankId, payorPartyId]);

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/${parentPage}`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitPayment'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <>
                {validationSucceeded && !submitNigo ? (
                    <CardInfo
                        cta={newCaseId ? {
                            action: () => {
                                router.push(`/cases/${newCaseId}/progress`);
                            },
                            text: t('cta'),
                        } : undefined}
                        secondaryCta={
                            <NavElement
                                aria-label={t('secondaryCta') as string}
                                onClick={() => router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/${parentPage}`)}
                                size={NavElementSize.Small}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Default}
                            >
                                {t('secondaryCta')}
                            </NavElement>
                        }
                        subtitle={
                            <>
                                {t('subtitle.0')}
                                <span className="font-bold">{t('subtitle.1')}</span>
                                {t('subtitle.2')}
                                {t('subtitle.3')}
                                {t('subtitle.4')}
                            </>
                        }
                        title={t('title')}
                    />
                ) : (
                    <CardInfo
                        cta={newCaseId ? {
                            action: () => {
                                router.push(`/cases/${newCaseId}/progress`);
                            },
                            text: t('cta'),
                        } : undefined}
                        secondaryCta={
                            <NavElement
                                aria-label={t('secondaryCta') as string}
                                onClick={() => router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/${parentPage}`)}
                                size={NavElementSize.Small}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Default}
                            >
                                {t('secondaryCta')}
                            </NavElement>
                        }
                        subtitle={
                            <>
                                {t('subtitle.0')}
                                <span className="font-bold">{t('subtitle.1')}</span>
                                {t('subtitle.2NIGO')}
                                {t('subtitle.4')}
                            </>
                        }
                        title={t('title')}
                    />
                )}
            </>
        </div>
    );
};

export default Confirm;
