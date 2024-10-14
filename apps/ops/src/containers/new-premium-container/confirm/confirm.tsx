import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { ACH, usePremium } from '@deps/contexts/NewPremiumContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitOneTimePremium } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'newPremium.confirm' });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { premium } = usePremium();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { paymentBankId, caseId, effectiveDate, paymentAmount, payorFullName, payorPartyId, validationResponse, reverseInitiator } =
        premium;

    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);

    const submit = useCallback(async () => {
        const response = await submitOneTimePremium(policy.product?.planCode, policy.policyNumber, {
            caseId: caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT),
            reverseInitiator: reverseInitiator,
            transactionAmounts: {
                requestedAmount: Number(paymentAmount),
            },
            payor: {
                bankId: paymentBankId,
                partyId: payorPartyId,
                paymentForm: ACH,
            },
        });

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        }

        setIsLoading(false);
    }, [
        policy.product?.planCode,
        policy.policyNumber,
        caseId,
        effectiveDate,
        reverseInitiator,
        paymentAmount,
        paymentBankId,
        payorPartyId,
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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`}
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
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/history`);
                                },
                                text: t('cta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            secondaryCta={
                                <NavElement
                                    aria-label={t('secondaryCta') as string}
                                    onClick={() =>
                                        router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`)
                                    }
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
                                    <span className="font-bold">{numberFormatify(paymentAmount)}</span>
                                    <PiiWrapper>{t('subtitle.1', { name: payorFullName })}</PiiWrapper>
                                </>
                            }
                            title={t('title')}
                        />
                    ) : (
                        <CardInfo
                            cta={{
                                action: () => {
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`);
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
