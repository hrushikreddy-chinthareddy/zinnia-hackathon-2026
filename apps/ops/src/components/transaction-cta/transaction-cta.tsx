import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import { ButtonSize } from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import SpinnerButton from '@deps/components/spinner-button/spinner-button';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { ReactComponent as ClockIcon } from '@deps/styles/elements/icons/icons_outlined/clock.svg';
import {
    SegmentTrackedEventName,
    TransactionCancelClickedEvent,
    TransactionClickProps,
    TransactionContinueClickedEvent,
} from '@deps/types/segment-analytics';

import NewSpinnerButton from '../spinner-button/new-spinner-button';

export interface TransactionCtaProps extends TransactionClickProps {
    className?: string;
    mainCta: {
        text: string;
        onClick: () => void;
    };
    secondaryCta?: {
        text: string;
        href?: string;
        onClick?: () => void;
    };
    stopLoading?: boolean;
    newSpinner?: boolean;
}

const TransactionCta = ({
    className,
    mainCta,
    secondaryCta,
    stopLoading,
    trackEventProps,
    newSpinner = false,
}: TransactionCtaProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'transactions.transactionCta',
    });
    const { sessionId, partyId } = usePermissionsContext();

    const [assistiveTextMessageIndex, setAssistiveTextMessageIndex] =
        useState(-1);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

    const assistiveTextMessages = [
        t('checkingRules'),
        t('creatingSummary'),
        t('upTo15'),
        t('stillWorking'),
    ];
    const hasSecondaryCta = secondaryCta != null;

    const startInterval = useCallback(() => {
        const id = setInterval(() => {
            setAssistiveTextMessageIndex((prevIndex) => {
                if (prevIndex === assistiveTextMessages.length - 1) {
                    clearInterval(id);

                    return prevIndex;
                }

                return prevIndex + 1;
            });
        }, 3000);

        setIntervalId(id);
    }, [assistiveTextMessages]);

    const trackCancelClick = useCallback(() => {
        if (!trackEventProps) {
            return;
        }

        segmentAnalyticsTrackEvent<TransactionCancelClickedEvent>(
            SegmentTrackedEventName.TransactionCancelClicked,
            {
                session_id: sessionId,
                userId: partyId,
                ...trackEventProps,
            }
        );
    }, [trackEventProps, sessionId, partyId]);

    const onContinueClick = useCallback(() => {
        startInterval();

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
        mainCta.onClick();
    }, [trackEventProps, startInterval, mainCta.onClick]);

    const onCancelClick = useCallback(() => {
        startInterval();
        trackCancelClick();
        secondaryCta?.onClick?.();
    }, [startInterval, secondaryCta?.onClick, trackCancelClick]);

    if (stopLoading) clearInterval(intervalId);

    return (
        <div className={clsx('flex flex-col gap-4', className)}>
            <div className="flex items-center gap-8">
                {!newSpinner ? (
                    <SpinnerButton
                        stopLoading={stopLoading}
                        size={ButtonSize.Small}
                        text={mainCta.text}
                        onClick={onContinueClick}
                    />
                ) : (
                    <NewSpinnerButton
                        loading={!stopLoading}
                        size={ButtonSize.Small}
                        text={mainCta.text}
                        onClick={onContinueClick}
                    />
                )}

                {hasSecondaryCta &&
                    (secondaryCta?.onClick ? (
                        <NavElement
                            aria-label={secondaryCta.text}
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            variant={NavElementVariant.Default}
                            onClick={onCancelClick}
                        >
                            {secondaryCta.text}
                        </NavElement>
                    ) : (
                        <a
                            className="default-focus font-primary text-links-sm font-semibold text-secondary hover:text-secondary-dark hover:underline hover:decoration-2 hover:underline-offset-[6px] focus-visible:rounded"
                            href={secondaryCta.href}
                            data-testid="leave-transaction"
                            onClick={trackCancelClick}
                        >
                            {secondaryCta.text}
                        </a>
                    ))}
            </div>

            {!!assistiveTextMessages[assistiveTextMessageIndex] && (
                <AssistiveText
                    iconOverride={<ClockIcon height={16} width={16} />}
                    text={assistiveTextMessages[assistiveTextMessageIndex]}
                />
            )}
        </div>
    );
};

export default TransactionCta;
