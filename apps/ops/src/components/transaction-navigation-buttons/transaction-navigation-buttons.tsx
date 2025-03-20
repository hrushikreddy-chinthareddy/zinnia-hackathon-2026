import clsx from 'clsx';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';

export enum ParentPage {
    CreateCase = 'create-case',
    Loans = 'loans',
    Premiums = 'premiums',
    Withdrawals = 'withdrawals',
}

interface TransactionNavigationButtonsProps {
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
}

const TransactionNavigationButtons = ({
    className,
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
}: TransactionNavigationButtonsProps) => {
    const { t } = useTranslation();
    const submitLbl = isSubmit ? (submitLabel?.length ? submitLabel : t('general.submitPayment')) : t('general.continue');
    const cancelLbl = cancelLabel?.length ? cancelLabel : t('general.leaveTransaction');
    const draftLbl = draftLabel?.length ? draftLabel : t('general.draft');
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
            {isDraft && handleSaveAsDraft != null && (
                <Button
                    data-testid={draftLbl}
                    variant={disableContinue ? ButtonVariant.Inactive : ButtonVariant.Default}
                    disabled={disableContinue}
                    aria-label={draftLbl}
                    onClick={() => handleSaveAsDraft()}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                    className={disableContinue ? 'hover:cursor-not-allowed' : ''}
                >
                    {draftLbl}
                </Button>
            )}
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
