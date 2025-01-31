import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Policy } from '@deps/models/policy/sor-policy';
import { submitNewLoan, TransactionResponseStatus } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { buildNewLoanRequestBody } from '../new-loan.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'newLoan.confirm' });
    const { t: defaultT } = useTranslation();

    const router = useRouter();
    const { newLoan } = useNewLoan();
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const validationSucceeded = useMemo(
        () => newLoan.validationResponse?.status === TransactionResponseStatus.Success,
        [newLoan.validationResponse]
    );

    const submit = useCallback(async () => {
        const requestBody = buildNewLoanRequestBody(newLoan);
        const response = await submitNewLoan(policy.product?.planCode, policy.policyNumber, requestBody);

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        }

        setIsLoading(false);
    }, [policy.policyNumber, policy.product?.planCode, newLoan]);

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
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitNewLoan'),
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
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/activity/transactions`);
                                },
                                text: t('cta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            secondaryCta={
                                <NavElement
                                    aria-label={t('secondaryCta') as string}
                                    onClick={() => router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`)}
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
                                    <span className="font-bold">{numberFormatify(newLoan.amount)}</span>
                                    {t('subtitle.1')}
                                </>
                            }
                            title={t('title')}
                        />
                    ) : (
                        <CardInfo
                            cta={{
                                action: () => {
                                    router.push(`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/loans`);
                                },
                                text: t('secondaryCta'),
                            }}
                            icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                            subtitle={
                                <>
                                    {t('subtitle.0')}
                                    {numberFormatify(newLoan.amount)} {t('subtitle.NIGO')}
                                    {t('subtitle.NIGO1')}
                                    <span className="font-bold">{t('subtitle.NIGO2')}</span>
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
