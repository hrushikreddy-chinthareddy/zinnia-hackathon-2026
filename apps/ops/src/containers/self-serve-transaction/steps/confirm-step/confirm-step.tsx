import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

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
import { useConfirmSelfServe } from '@deps/hooks/useConfirmSelfServe';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import styles from './confirm-step.module.css';
import {
    SelfServeTransaction,
    SelfServeTransactionSubmitResult,
} from '../../types';

type ConfirmStepProps = {
    customData: any;
    transactionType: SelfServeTransaction;
    submitResponseHandler: (
        payload: any
    ) => Promise<SelfServeTransactionSubmitResult>;
    subTitle: string;
};
const ConfirmStep = ({
    customData,
    transactionType,
    submitResponseHandler,
    subTitle = '',
}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction.confirm',
    });
    const router = useRouter();
    const { loading, success, newCaseId, submit, submitNigo } =
        useConfirmSelfServe(
            transactionType,
            customData,
            submitResponseHandler,
            true
        );

    if (loading) {
        return (
            <div className={clsx(styles.loader, 'responsive-padding')}>
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (!success) {
        return (
            <ApiErrorCard
                leaveRoute="/"
                submit={{
                    action: submit,
                    text: t('tryAgain'),
                }}
            />
        );
    }
    return (
        <div className={clsx(styles.confirmContainer, 'responsive-padding')}>
            <CardInfo
                icon={
                    <CircleCheckIcon
                        className={clsx(styles.success)}
                        height={50}
                        width={50}
                    />
                }
                cta={{
                    action: () => {
                        router.push(`/cases/${newCaseId}/progress`);
                    },
                    text: t('goToCase'),
                }}
                secondaryCta={
                    <NavElement
                        aria-label={t('backToHome') as string}
                        onClick={() => router.push('/')}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('backToHome')}
                    </NavElement>
                }
                subtitle={
                    !submitNigo ? (
                        <span>{subTitle}</span>
                    ) : (
                        <>
                            <span>{subTitle}</span>
                            <span> {t('for')}</span>
                            <span className="font-bold">{t('nigo')}</span>
                        </>
                    )
                }
                title={!submitNigo ? t('gotIt') : t('submit')}
            />
        </div>
    );
};

export default ConfirmStep;
