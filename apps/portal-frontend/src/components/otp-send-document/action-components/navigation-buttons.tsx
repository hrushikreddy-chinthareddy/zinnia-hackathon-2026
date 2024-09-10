import { Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { ButtonSize } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
type SendDocumentNavigationButtonsProps = {
    handleContinue: () => void;
    handleCancel: () => void;
};

const SendDocumentNavigationButtons = ({ handleContinue, handleCancel }: SendDocumentNavigationButtonsProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument.formActions' });

    return (
        <div className={clsx('flex flex-row justify-start gap-6')}>
            <Button aria-label={t('continue') as string} onClick={() => handleContinue()} size={ButtonSize.Small} type={'submit'}>
                {t('continue')}
            </Button>
            <NavElement
                onClick={handleCancel}
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
