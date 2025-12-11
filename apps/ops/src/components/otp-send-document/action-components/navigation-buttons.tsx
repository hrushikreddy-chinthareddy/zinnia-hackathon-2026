import { Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    SegmentTrackedEventName,
    TransactionCancelClickedEvent,
    TransactionClickProps,
    TransactionContinueClickedEvent,
} from '@deps/types/segment-analytics';

type SendDocumentNavigationButtonsProps = TransactionClickProps & {
    handleContinue: () => void;
    handleCancel: () => void;
};

const SendDocumentNavigationButtons = ({
    handleContinue,
    handleCancel,
    trackEventProps,
}: SendDocumentNavigationButtonsProps) => {
    const { t } = useTranslation();
    const { sessionId, partyId } = usePermissionsContext();

    const onContinueClick = useCallback(() => {
        if (trackEventProps) {
            // TODO MG: prevent track from being called if ui validation error
            segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(
                SegmentTrackedEventName.TransactionContinueClicked,
                {
                    authSessionId: sessionId,
                    userId: partyId,
                    ...trackEventProps,
                }
            );
        }

        handleContinue();
    }, [handleContinue, partyId, sessionId, trackEventProps]);

    const onCancelClick = useCallback(() => {
        if (trackEventProps) {
            segmentAnalyticsTrackEvent<TransactionCancelClickedEvent>(
                SegmentTrackedEventName.TransactionCancelClicked,
                {
                    authSessionId: sessionId,
                    userId: partyId,
                    ...trackEventProps,
                }
            );
        }
        handleCancel();
    }, [handleCancel, partyId, sessionId, trackEventProps]);

    return (
        <div className={clsx('flex flex-row justify-start gap-6')}>
            <Button
                aria-label={t('allFields.continue') ?? ''}
                onClick={onContinueClick}
                size={ButtonSize.Small}
                type={'submit'}
            >
                {t('allFields.continue')}
            </Button>
            <NavElement
                onClick={onCancelClick}
                aria-label={t('allFields.cancel') ?? ''}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('allFields.cancel')}
            </NavElement>
        </div>
    );
};

export default SendDocumentNavigationButtons;
