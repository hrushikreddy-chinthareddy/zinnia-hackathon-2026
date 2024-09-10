import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { cancelTransaction } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ReactComponent as AlertExclamationIcon } from '@deps/styles/elements/icons/alert/alert-exclamation.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

import { HELP_DESK_LINK } from '../non-financial-transactions/states/api-error-state';
import LoadingState from '../non-financial-transactions/states/loading-state';
import { ViewState } from '../non-financial-transactions/states/states.helpers';

type SidesheetCancelPendingProps = {
    amount: string;
    cancel: () => void; // Words are hard.  This is to cancel the flow, not to cancel the transaction
    closeSidesheet: () => void;
    planCode: string | undefined;
    policyNumber: string | undefined;
    reason?: string;
    transactionId: string;
    transactionType: string;
};
export default function SidesheetCancelPending({
    amount,
    cancel,
    closeSidesheet,
    planCode,
    policyNumber,
    transactionId,
    transactionType,
}: SidesheetCancelPendingProps) {
    const { t } = useTranslation();
    const [viewState, setViewState] = useState(ViewState.Warn);
    const cancelPayment = async () => {
        setViewState(ViewState.Loading);
        const result = await cancelTransaction(planCode, policyNumber, transactionId);
        if (result.status !== StatusCode.Accepted) {
            setViewState(ViewState.ApiError);
        } else {
            setViewState(ViewState.Success);
        }
    };

    const amountString = <span className="font-bold">{numberFormatify(amount)}</span>;

    switch (viewState) {
        case ViewState.ApiError:
            return (
                <CardInfo
                    className="mt-8"
                    cta={{ action: cancelPayment, text: t('policy.history.cancelSidesheet.apiError.secondaryCta') }}
                    icon={<HexExclamationIcon className="text-semantic-error" height={50} width={50} />}
                    subtitle={
                        <>
                            {t('policy.history.cancelSidesheet.apiError.subtitle')}
                            <NavElement
                                href={HELP_DESK_LINK}
                                target="_blank"
                                type={NavElementType.Link}
                                variant={NavElementVariant.Secondary}
                            >
                                {t('policy.history.cancelSidesheet.apiError.submitHelpDeskTicket')}
                            </NavElement>
                        </>
                    }
                    title={t('policy.history.cancelSidesheet.apiError.title')}
                />
            );
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.Warn:
            return (
                <CardInfo
                    className="mt-8"
                    cta={{
                        action: cancelPayment,
                        text: t('policy.history.cancelSidesheet.cancelPayment') as string,
                    }}
                    icon={<AlertExclamationIcon className="text-semantic-warning" height={50} width={50} />}
                    secondaryCta={
                        <NavElement
                            className="font-semibold text-secondary"
                            onClick={() => cancel()}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                        >
                            {t('policy.history.cancelSidesheet.nevermind')}
                        </NavElement>
                    }
                    subtitle={
                        <>
                            {t('policy.history.cancelSidesheet.confirmationSubtitle')} {amountString}{' '}
                            {t('policy.history.cancelSidesheet.confirmationSubtitle2', { transactionType: transactionType.toLowerCase() })}
                        </>
                    }
                    title={t('policy.history.cancelSidesheet.confirmationTitle')}
                />
            );
        case ViewState.Success:
            return (
                <CardInfo
                    className="mt-8"
                    cta={{ action: closeSidesheet, text: t('general.close') }}
                    icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                    subtitle={
                        <>
                            {t('policy.history.cancelSidesheet.successSubtitle', { transactionType: transactionType })} {amountString}{' '}
                            {t('policy.history.cancelSidesheet.successSubtitle2')}
                        </>
                    }
                    title={t('policy.history.cancelSidesheet.successTitle')}
                />
            );
        default:
            return null;
    }
}
