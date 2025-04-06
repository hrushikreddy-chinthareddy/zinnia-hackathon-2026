import { Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useCallback } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { SegmentTrackedEventName, TransactionCancelClickedEvent, TransactionClickProps, TransactionContinueClickedEvent } from '@deps/types/segment-analytics';

type SendDocumentNavigationButtonsProps = TransactionClickProps & {
    handleContinue: () => void;
    handleCancel: () => void;
};

const SendDocumentNavigationButtons = ({ handleContinue, handleCancel, trackEventProps }: SendDocumentNavigationButtonsProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument.formActions' });
    const perms = usePermissionsContext();

    const onContinueClick = useCallback(() => {
        if (trackEventProps) {
            // TODO MG: prevent track from being called if ui validation error
            segmentAnalyticsTrackEvent<TransactionContinueClickedEvent>(SegmentTrackedEventName.TransactionContinueClicked, {
                session_id: perms.getSessionId(),
                userId: perms.getUserPartyId(),
                ...trackEventProps
            });
        }

        handleContinue();
    }, [handleContinue, perms, trackEventProps]);

    const onCancelClick = useCallback(() => {
        if (trackEventProps) {
            segmentAnalyticsTrackEvent<TransactionCancelClickedEvent>(SegmentTrackedEventName.TransactionCancelClicked, {
                session_id: perms.getSessionId(),
                userId: perms.getUserPartyId(),
                ...trackEventProps
            });
        }
        handleCancel();
    }, [handleCancel, perms, trackEventProps]);

    return (
        <div className={clsx('flex flex-row justify-start gap-6')}>
            <Button aria-label={t('continue') as string} onClick={onContinueClick} size={ButtonSize.Small} type={'submit'}>
                {t('continue')}
            </Button>
            <NavElement
                onClick={onCancelClick}
                aria-label={t('cancel') as string}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('cancel')}
            </NavElement>
        </div>
    );
};

export default SendDocumentNavigationButtons;
