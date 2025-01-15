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
import { ACH, useUpdatePremiumAutopay } from '@deps/contexts/UpdatePremiumAutopayContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { getFrequency } from '@deps/helpers/systematic-program.helper';
import { AmountType, ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitSystematicProgramUpdate } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { DEFAULT_EXTENDED_DAY_DATE_FORMAT, NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation();
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { autopay } = useUpdatePremiumAutopay();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const {
        paymentAmount,
        caseId,
        frequency,
        effectiveDate,
        paymentBankId,
        payorPartyId,
        payorFullName,
        validationResponse,
        reverseInitiator,
    } = autopay;
    const { policyNumber, product } = policy;

    const effectiveDateFormatted = dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
    const systematicProgram = useMemo(
        () => policy.systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM),
        [policy.systematicPrograms]
    );
    const validationSucceeded = useMemo(() => validationResponse?.status === TransactionResponseStatus.Success, [validationResponse]);
    const submit = useCallback(async () => {
        setIsLoading(true);

        const arrangementId = systematicProgram?.arrangementId || '';
        const response = await submitSystematicProgramUpdate(product?.planCode, policyNumber, arrangementId, {
            caseId: caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(new Date()).format(ZAHARA_API_DATE_FORMAT),
            reverseInitiator: reverseInitiator,
            systematicProgram: {
                amount: Number(paymentAmount),
                arrangementType: ArrangementType.PAYMENT,
                paymentForm: ACH,
                amountType: AmountType.AMOUNT,
                frequency,
                startDate: effectiveDateFormatted,
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
        }

        setIsLoading(false);
    }, [
        systematicProgram?.arrangementId,
        systematicProgram?.endDate,
        systematicProgram?.previousProgramDate,
        product?.planCode,
        policyNumber,
        caseId,
        effectiveDateFormatted,
        reverseInitiator,
        paymentAmount,
        frequency,
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
                    text: defaultT('workflows.apiErrorCard.submitWithdrawal'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <>
                {validationSucceeded ? (
                    <CardInfo
                        cta={{
                            action: () => {
                                router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/activity/transactions`);
                            },
                            text: t('autopay.confirm.cta'),
                        }}
                        icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                        secondaryCta={
                            <NavElement
                                aria-label={t('autopay.confirm.secondaryCta') as string}
                                onClick={() => router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`)}
                                size={NavElementSize.Small}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Default}
                            >
                                {t('autopay.confirm.secondaryCta')}
                            </NavElement>
                        }
                        subtitle={
                            <>
                                {t('autopay.confirm.subtitle.0')} <PiiWrapper className="font-bold">{payorFullName}</PiiWrapper>
                                {t('autopay.confirm.subtitle.1')}
                                <span className="font-bold"> {getFrequency(frequency, t)}</span> {t('autopay.confirm.subtitle.2')}{' '}
                                <span className="font-bold">{numberFormatify(paymentAmount)} </span>
                                {t('autopay.confirm.subtitle.3')}{' '}
                                <span className="font-bold">
                                    {dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(DEFAULT_EXTENDED_DAY_DATE_FORMAT)}.
                                </span>
                            </>
                        }
                        title={t('autopay.confirm.title')}
                    />
                ) : (
                    <CardInfo
                        cta={{
                            action: () => {
                                router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/premiums`);
                            },
                            text: t('autopay.confirm.secondaryCta'),
                        }}
                        icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                        subtitle={
                            <>
                                <PiiWrapper className="font-bold">
                                    {payorFullName}'s {numberFormatify(paymentAmount)}
                                </PiiWrapper>
                                {t('autopay.confirm.subtitle.NIGO')}
                                <span className="font-bold">{t('autopay.confirm.subtitle.NIGO1')}</span>
                            </>
                        }
                        title={t('autopay.confirm.title')}
                    />
                )}
            </>
        </div>
    );
};

export default Confirm;
