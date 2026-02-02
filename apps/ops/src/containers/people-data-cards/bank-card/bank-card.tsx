import { useTranslation } from 'next-i18next';
import { useState, useContext } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { BankAccounts } from '@deps/containers/people-data-cards/bank-card/bank-card.helpers';
import SideSheetBank from '@deps/containers/people-data-cards/bank-card/side-sheet/side-sheet-bank';
import EmptyCard from '@deps/containers/people-data-cards/empty-card/empty-card';
import SideSheetPeopleHeader, {
    SideSheetPeopleHeaderProps,
} from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { BankAccount, Parties } from '@zinnia/api-types/types/sor';

import { filterPastEndDate } from '../people-data-cards.utils';

export interface BankCardProps {
    editable?: boolean;
    party?: Parties;
    planCode?: string;
    policyNumber?: string;
    isUserPermissionedToEditCards?: boolean;
    isEligible?: boolean;
}

interface OpenSideSheet {
    bankAccount?: BankAccount;
    header: SideSheetPeopleHeaderProps;
}

export const BankCard = ({
    editable = false,
    isUserPermissionedToEditCards = false,
    party,
    planCode,
    policyNumber,
    isEligible,
}: BankCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.bank',
    });
    const { t: tAllFields } = useTranslation();

    const sideSheet = useSideSheetContext();
    const { policyDetails } = useContext(PolicyData);

    const [currentBankAccounts, setCurrentBankAccounts] = useState(
        filterPastEndDate(party?.bankDetails)
    );
    const { featureFlags } = useOptimizely();
    const shouldShowAddBankChange =
        featureFlags[FEATURE_FLAGS.BANK_CHANGE_TRANSACTION];

    const openSidesheet = ({
        bankAccount,
        header: { action, transaction, typeTranslation },
    }: OpenSideSheet) => {
        sideSheet.changeSideSheetContent(
            <SideSheetPeopleHeader
                action={action}
                transaction={transaction}
                typeTranslation={typeTranslation}
            />,
            <SideSheetBank
                party={party}
                planCode={planCode}
                policyNumber={policyNumber}
                policy={policyDetails.policy}
                onCancel={() => sideSheet.handleOpen(false)}
                setCurrentBankAccounts={setCurrentBankAccounts}
                updatedBank={bankAccount as BankAccount}
            />
        );
        sideSheet.handleOpen(true);
    };
    const isUserPermissionedToEditBankingDetails =
        isUserPermissionedToEditCards ?? false;

    return (
        <CardContainer classNames="flex w-full flex-col text-gray-900 gap-4">
            <div className="flex items-center">
                <Typography className="mr-5" variant={TypographyVariant.H2}>
                    {t('label')}
                </Typography>
                {shouldShowAddBankChange && (
                    <>
                        {editable &&
                        isUserPermissionedToEditBankingDetails &&
                        isEligible ? (
                            <NavElement
                                onClick={() =>
                                    openSidesheet({
                                        header: {
                                            action: NonFinancialTransactionActions.Add,
                                            transaction:
                                                NonFinancialTransactions.BankAccount,
                                            typeTranslation: t(
                                                'general.new'
                                            ) as string,
                                        },
                                    })
                                }
                                size={NavElementSize.Small}
                                startIcon={<AddIcon height={20} width={20} />}
                                type={NavElementType.Button}
                                variant={NavElementVariant.Default}
                                disabled={!isEligible}
                                aria-label={`${tAllFields(
                                    'allFields.add'
                                )} ${tAllFields('allFields.bankingDetails')}`}
                            >
                                {t('general.add')}
                            </NavElement>
                        ) : editable ? (
                            <TempNavInactive
                                hideIcon
                                tooltipBody={t(
                                    'general.permissionDeniedTooltip'
                                )}
                            >
                                <NavElement
                                    size={NavElementSize.Small}
                                    startIcon={
                                        <AddIcon height={20} width={20} />
                                    }
                                    type={NavElementType.Button}
                                    variant={NavElementVariant.Default}
                                    disabled={!isEligible}
                                >
                                    {t('general.add')}
                                </NavElement>
                            </TempNavInactive>
                        ) : null}
                    </>
                )}
            </div>

            {currentBankAccounts?.length ? (
                <div className="border-box flex w-full flex-col gap-2">
                    <BankAccounts
                        bankAccounts={currentBankAccounts}
                        onEditClick={openSidesheet}
                        isEligible={isEligible}
                    />
                </div>
            ) : (
                <EmptyCard text={t('general.empty') as string} />
            )}
        </CardContainer>
    );
};

export default BankCard;
