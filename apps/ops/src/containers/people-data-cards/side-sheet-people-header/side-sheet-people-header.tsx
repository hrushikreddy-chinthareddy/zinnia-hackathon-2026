import { useTranslation } from 'next-i18next';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';

export interface SideSheetPeopleHeaderProps {
    action: NonFinancialTransactionActions;
    transaction: NonFinancialTransactions;
    typeTranslation?: string;
}

const SideSheetPeopleHeader = ({ action, transaction, typeTranslation }: SideSheetPeopleHeaderProps) => {
    const { t } = useTranslation();

    const actionTranslation = t(`people.sideSheet.actions.${action}`);
    const transactionTranslation = t(`people.sideSheet.transactions.${transaction}`);

    let heading = actionTranslation + ' ';
    if (typeTranslation != null && typeTranslation !== '') heading += typeTranslation + ' ';
    heading += transactionTranslation;

    return <Typography variant={TypographyVariant.H2}>{heading}</Typography>;
};

export default SideSheetPeopleHeader;
