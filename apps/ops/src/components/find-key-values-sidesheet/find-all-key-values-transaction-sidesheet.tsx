import { Transaction } from '@xd/api-types/dist/generated-types/sor';
import { SideSheet } from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { TransactionSidesheetContent } from './content/transaction-sidesheet-content';

/**
 * A Sidesheet component that displays all key-value pairs of a policy.
 *
 * When opened, it displays a date picker to select a date, and a search field to search
 * key-value pairs. The date picker is disabled for future dates, and the search field
 * filters down the key-value pairs based on the search value.
 *
 * @param {string} transaction - the plan code of the policy
 * @returns {JSX.Element} - the rendered component
 */
export const FindAllKeyValuesTransactionSidesheet = ({
    transaction,
    open,
    onOpenChange,
}: {
    transaction: Transaction;
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}) => {
    const { t } = useTranslation();
    console.log('is it open?', open);
    return (
        <SideSheet
            trigger={null}
            header={
                <span className="typography-desktop-headline-2-d">
                    {t('label.findKeyValuesTitle')}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <TransactionSidesheetContent transaction={transaction} />
        </SideSheet>
    );
};
