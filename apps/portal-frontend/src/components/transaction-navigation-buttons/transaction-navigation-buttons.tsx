import clsx from 'clsx';
import router from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

export enum ParentPage {
    Premiums = 'premiums',
    Withdrawals = 'withdrawals',
    CreateCase = 'create-case'
}

interface TransactionNavigationButtonsProps {
    className?: string;
    handleContinue: () => void;
    isSubmit?: boolean;
    disableContinue?: boolean;
    parentPage: ParentPage;
    planCode?: string;
    policyNumber?: string;
    submitLabel?: string;
    leaveTransactionLink?: string;
}

const TransactionNavigationButtons = ({
    className,
    handleContinue,
    isSubmit,
    disableContinue,
    parentPage,
    planCode,
    policyNumber,
    submitLabel,
    leaveTransactionLink
}: TransactionNavigationButtonsProps) => {
    const { t } = useTranslation();
    const label = isSubmit ? (submitLabel?.length ? submitLabel : t('general.submitPayment')) : t('general.continue');
    const link = leaveTransactionLink  ? leaveTransactionLink : `/policies/${planCode}/${policyNumber}/transactions/${parentPage}`;

    return (
        <div className={clsx('flex flex-row justify-start gap-6', className)}>
            <Button
                data-testid={label}
                variant={disableContinue ? ButtonVariant.Inactive : ButtonVariant.Default}
                disabled={disableContinue}
                aria-label={label}
                onClick={() => handleContinue()}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                className={disableContinue ? 'hover:cursor-not-allowed' : ''}
            >
                {label}
            </Button>
            <NavElement
                data-testid={t('general.cancel') as string}
                aria-label={t('general.cancel') as string}
                onClick={() => router.push(link)}
                size={NavElementSize.Small}
                type={NavElementType.Button}
                variant={NavElementVariant.Default}
            >
                {t('general.leaveTransaction')}
            </NavElement>
        </div>
    );
};

export default TransactionNavigationButtons;
