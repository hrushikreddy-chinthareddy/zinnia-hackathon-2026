import clsx from 'clsx';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

export enum ParentPage {
    Premiums = 'premiums',
    Withdrawals = 'withdrawals',
    CreateCase = 'create-case',
    NewLoan = 'new-loan',
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
    cancelLabel?: string;
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
    cancelLabel,
    leaveTransactionLink,
}: TransactionNavigationButtonsProps) => {
    const { t } = useTranslation();
    const submitLbl = isSubmit ? (submitLabel?.length ? submitLabel : t('general.submitPayment')) : t('general.continue');
    const cancelLbl = cancelLabel?.length ? cancelLabel : t('general.leaveTransaction');
    const link = leaveTransactionLink ? leaveTransactionLink : `/policies/${planCode}/${policyNumber}/policy/${parentPage}`;

    return (
        <div className={clsx('flex flex-row justify-start gap-6', className)}>
            <Button
                data-testid={submitLbl}
                variant={disableContinue ? ButtonVariant.Inactive : ButtonVariant.Default}
                disabled={disableContinue}
                aria-label={submitLbl}
                onClick={() => handleContinue()}
                size={ButtonSize.Small}
                type={ButtonType.Primary}
                className={disableContinue ? 'hover:cursor-not-allowed' : ''}
            >
                {submitLbl}
            </Button>
            <NavElement
                data-testid={cancelLbl}
                aria-label={cancelLbl}
                onClick={() => router.push(link)}
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
