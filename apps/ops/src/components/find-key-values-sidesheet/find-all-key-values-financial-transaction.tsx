import { SideSheet } from '@zinnia/bloom/components';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { Collapse, TreeStateProvider } from '@deps/hooks/useTreeState';

import { FinancialTransactionSidesheetContent } from './content/financial-transaction-sidesheet-content';

export const FindAllKeyValuesFinancialTransactionSidesheet = ({
    open,
    onOpenChange,
    financialTransaction,
}: {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    financialTransaction: any;
}) => {
    const { t } = useTranslation();

    return (
        <SideSheet
            trigger={
                <NavElement
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                >
                    {t('label.viewAllDetails')}
                </NavElement>
            }
            header={
                <span className="typography-desktop-headline-2-d">
                    {t('label.transactionDetails')}
                </span>
            }
            open={open}
            onOpenChange={onOpenChange}
            preventCloseOnOutsideClick={false}
        >
            <TreeStateProvider initialTreeState={Collapse}>
                <FinancialTransactionSidesheetContent
                    financialTransaction={financialTransaction}
                />
            </TreeStateProvider>
        </SideSheet>
    );
};
