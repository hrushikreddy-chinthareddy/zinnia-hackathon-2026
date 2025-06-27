import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { TabOptions } from '@deps/pages/create-case';
import {
    SegmentTrackedEventName,
    TransactionCancelClickedEvent,
    TransactionClickProps,
    TransactionContinueClickedEvent,
} from '@deps/types/segment-analytics';

export enum ParentPage {
    CreateCase = 'create-case',
    Loans = 'loans',
    Premiums = 'premiums',
    Withdrawals = 'withdrawals',
    Funds = 'funds',
    None = '',
}

interface TransactionNavigationButtonsProps extends TransactionClickProps {
    className?: string;
    handleContinue: () => void;
    handleSaveAsDraft?: () => void;
    isSubmit?: boolean;
    disableContinue?: boolean;
    parentPage: ParentPage;
    planCode?: string;
    policyNumber?: string;
    submitLabel?: string;
    cancelLabel?: string;
    leaveTransactionLink?: string;
    isDraft?: boolean;
    draftLabel?: string;
    readonly?: boolean;
}

const TransactionNavigationButtons = ({
    className,
    readonly,
    handleContinue,
    handleSaveAsDraft,
    isSubmit,
    disableContinue,
    parentPage,
    planCode,
    policyNumber,
    submitLabel,
    cancelLabel,
    leaveTransactionLink,
    isDraft,
    draftLabel,
    trackEventProps,
}: TransactionNavigationButtonsProps) => {
    const { t } = useTranslation();
    const { sessionId, partyId } = usePermissionsContext();
    const router = useRouter();

    const submitLbl = readonly
        ? t('general.next')
        : isSubmit
        ? submitLabel?.length
            ? submitLabel
            : t('general.submitPayment')
        : t('general.continue');
    const cancelLbl = cancelLabel?.length
        ? cancelLabel
        : t('general.leaveTransaction');
    const draftLbl = draftLabel?.length ? draftLabel : t('general.draft');
    const link = leaveTransactionLink
        ? leaveTransactionLink
        : `/policies/${planCode}/${policyNumber}/policy/${parentPage}`;

    const onContinueClick = useCallback(() => {
        if (trackEventProps) {
            segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
                SegmentTrackedEventName.TransactionContinueClicked,
                {
                    session_id: sessionId,
                    userId: partyId,
                    ...trackEventProps,
                }
            );
        }
        handleContinue();
    }, [trackEventProps, sessionId, partyId, handleContinue]);

    const onCancelClick = useCallback(() => {
        if (trackEventProps) {
            segmentAnalyticsTrackEvent<TransactionCancelClickedEvent>(
                SegmentTrackedEventName.TransactionCancelClicked,
                {
                    session_id: sessionId,
                    userId: partyId,
                    ...trackEventProps,
                }
            );
        }

        router.push({
            pathname: link,
            query: { tab: TabOptions.myTasks },
        });
    }, [trackEventProps, sessionId, partyId, link, router]);

    return (
        <div className={clsx('flex flex-row justify-start gap-6', className)}>
            <Button
                data-testid={submitLbl}
                variant={
                    disableContinue
                        ? ButtonVariant.Inactive
                        : ButtonVariant.Default
                }
                disabled={disableContinue}
                aria-label={submitLbl}
                onClick={onContinueClick}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                className={disableContinue ? 'hover:cursor-not-allowed' : ''}
            >
                {submitLbl}
            </Button>
            {isDraft && handleSaveAsDraft != null && (
                <Button
                    data-testid={draftLbl}
                    variant={
                        disableContinue
                            ? ButtonVariant.Inactive
                            : ButtonVariant.Default
                    }
                    disabled={disableContinue}
                    aria-label={draftLbl}
                    onClick={() => handleSaveAsDraft()}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                    className={
                        disableContinue ? 'hover:cursor-not-allowed' : ''
                    }
                >
                    {draftLbl}
                </Button>
            )}
            <NavElement
                data-testid={cancelLbl}
                aria-label={cancelLbl}
                onClick={onCancelClick}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {cancelLbl}
            </NavElement>
        </div>
    );
};

export default TransactionNavigationButtons;
