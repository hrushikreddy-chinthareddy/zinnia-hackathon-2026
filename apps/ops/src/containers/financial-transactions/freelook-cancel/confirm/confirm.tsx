import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWithdrawal } from '@deps/contexts/WithdrawalContext';
import { Policy } from '@deps/models/policy/sor-policy';
import { submitFreeLookCancel } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { buildFreelookCancelRequestBody } from '../freelook-cancel.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'cancelFreelook.confirm' });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { withdrawal } = useWithdrawal();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const submit = useCallback(async () => {
        const requestBody = buildFreelookCancelRequestBody(withdrawal);
        const response = await submitFreeLookCancel(policy.product?.planCode, policy.policyNumber, requestBody);

        if (![StatusCode.Accepted, StatusCode.Okay].includes(response.status as StatusCode)) {
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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`}
                submit={{
                    action: submit,
                    text: defaultT('cancelFreelook.summary.submitPayment'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
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
                        onClick={() => router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/withdrawals`)}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('secondaryCta')}
                    </NavElement>
                }
                subtitle={<>{t('subtitle', { name: withdrawal.payeeFullName })}</>}
                title={t('title')}
            />
        </div>
    );
};

export default Confirm;
