import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildWithdrawalsRequestBody } from '@deps/containers/financial-transactions/withdrawal/withdrawals.helpers';
import { WithdrawalType, useWithdrawal } from '@deps/contexts/WithdrawalContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { TransactionResponseStatus, submitFullSurrenderWithdrawal, submitPartialWithdrawalOneTime } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'withdrawals.confirm' });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { withdrawal } = useWithdrawal();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const validationSucceeded = useMemo(
        () => withdrawal.validationResponse?.status === TransactionResponseStatus.Success,
        [withdrawal.validationResponse]
    );

    const submit = useCallback(async () => {
        const requestBody = buildWithdrawalsRequestBody(withdrawal);
        const response =
            withdrawal.type === WithdrawalType.Surrender
                ? await submitFullSurrenderWithdrawal(policy.product?.planCode, policy.policyNumber, requestBody)
                : await submitPartialWithdrawalOneTime(policy.product?.planCode, policy.policyNumber, requestBody);

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/transactions/withdrawals`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitWithdrawal'),
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
                                        router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/transactions/withdrawals`)
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
                                    <span className="font-bold">{numberFormatify(withdrawal.amount)}</span>
                                    {t('subtitle.1')}
                                    <span className="font-bold">
                                        {numberFormatify(
                                            withdrawal.validationResponse?.quoteResponse?.payeeOrBeneficiary?.[0].disbursementAmount
                                        )}
                                    </span>
                                    {t('subtitle.2')}
                                    <PiiWrapper className="font-bold">{withdrawal.payeeFullName}</PiiWrapper>
                                    {t('subtitle.3')}
                                </>
                            }
                            title={t('title')}
                        />
                    ) : (
                        <CardInfo
                            cta={{
                                action: () => {
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/transactions/withdrawals`);
                                },
                                text: t('secondaryCta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            subtitle={
                                <>
                                    <PiiWrapper className="font-bold">
                                        {withdrawal.payeeFullName}'s {numberFormatify(withdrawal.amount)}
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
