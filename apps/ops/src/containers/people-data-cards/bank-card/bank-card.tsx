import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { BankAccounts } from '@deps/containers/people-data-cards/bank-card/bank-card.helpers';
import SideSheetBank from '@deps/containers/people-data-cards/bank-card/side-sheet/side-sheet-bank';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import SideSheetPeopleHeader from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { isEndDated } from '@deps/helpers/date.helper';
import { PolicyAllOfPartiesItem } from '@deps/models/policy/sor-policy';
import { NonFinancialTransactionActions, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { ReactComponent as LibraryIcon } from '@deps/styles/elements/icons/icons_outlined/library.svg';

export interface BankCardProps {
    editable?: boolean;
    party?: PolicyAllOfPartiesItem;
    planCode?: string;
    policyNumber?: string;
}

export const BankCard = ({ editable = false, party, planCode, policyNumber }: BankCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.bank' });

    const sideSheet = useSideSheetContext();

    const [currentBankAccounts, setCurrentBankAccounts] = useState(party?.bankDetails?.filter(bank => !isEndDated(bank.endDate)) ?? []);

    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <SideSheetPeopleHeader
                action={NonFinancialTransactionActions.Add}
                transaction={NonFinancialTransactions.BankAccount}
                typeTranslation={t('general.new') as string}
            />,
            <SideSheetBank
                party={party}
                planCode={planCode}
                policyNumber={policyNumber}
                onCancel={() => sideSheet.handleOpen(false)}
                setCurrentBankAccounts={setCurrentBankAccounts}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <CardContainer classNames="flex w-full flex-col text-gray-900 gap-4">
            <div className="flex items-center">
                <LibraryIcon role="presentation" className="mr-2 text-primary" height={24} width={24} />
                <Typography className="mr-5" variant={TypographyVariant.H2}>
                    {t('label')}
                </Typography>
                {editable && (
                    <NavElement
                        onClick={openSidesheet}
                        size={NavElementSize.Small}
                        startIcon={<AddIcon height={20} width={20} />}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('general.add')}
                    </NavElement>
                )}
            </div>

            {currentBankAccounts?.length ? (
                <div className="border-box flex w-full flex-col gap-2 lg:px-8">
                    <BankAccounts bankAccounts={currentBankAccounts} />
                </div>
            ) : (
                <EmptyCard text={t('general.empty') as string} />
            )}
        </CardContainer>
    );
};

export default BankCard;
