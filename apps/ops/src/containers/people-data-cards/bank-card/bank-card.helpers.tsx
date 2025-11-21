import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Label, { LabelVariant } from '@deps/components/label/label';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { BankAccountWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import {
    formatCardExpirationDate,
    formatAccountNumber,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { AccountType, BankAccount } from '@zinnia/api-types/types/sor';

import { SideSheetPeopleHeaderProps } from '../side-sheet-people-header/side-sheet-people-header';

interface BankAccountsProps {
    bankAccounts: BankAccount[];
    onEditClick: (params: {
        bankAccount: BankAccount | BankAccountWithPending;
        header: SideSheetPeopleHeaderProps;
    }) => void;
    isEligible?: boolean;
}

const editIconColor = '#00628B';

export const BankAccounts = ({
    bankAccounts,
    onEditClick,
    isEligible,
}: BankAccountsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.card.bank.general',
    });
    const { t: defaultT } = useTranslation();
    const { policyDetails } = useContext(PolicyData);
    const { featureFlags } = useOptimizely();
    const shouldShowBankEdit =
        featureFlags[FEATURE_FLAGS.BANK_CHANGE_TRANSACTION];

    if (!bankAccounts?.length) return null;

    const editClickHandler = (
        onEditClick: (params: {
            bankAccount: BankAccount | BankAccountWithPending;
            header: SideSheetPeopleHeaderProps;
        }) => void,
        bankAccount: BankAccount
    ) => {
        return () => {
            onEditClick({
                bankAccount,
                header: {
                    action: NonFinancialTransactionActions.Edit,
                    transaction: NonFinancialTransactions.BankAccount,
                },
            });
        };
    };

    return (
        <>
            {bankAccounts.map((bankAccount) => {
                const {
                    accountType,
                    accountNumber,
                    bankId,
                    branchName,
                    internationalBankAccountNumber,
                    isPending,
                    nameOnAccount,
                    routingNumber,
                } = bankAccount as BankAccountWithPending;

                const isBankAccount =
                    accountType !== AccountType.CREDITCARD &&
                    accountType !== AccountType.DEBITCARD;

                return (
                    <div
                        className="flex w-full flex-col gap-4 whitespace-nowrap rounded border-2 border-gray-100 p-4 lg:p-6"
                        key={bankId}
                    >
                        <div className="flex items-center gap-1">
                            <PiiWrapper>
                                <div className="flex items-center gap-1">
                                    <Label
                                        label={
                                            branchName?.toLocaleUpperCase() ??
                                            DEFAULT_ERROR_STRING
                                        }
                                        sentenceCase={false}
                                        variant={
                                            isBankAccount
                                                ? LabelVariant.LabelLg
                                                : LabelVariant.LabelSm
                                        }
                                    />
                                    {shouldShowBankEdit && (
                                        <>
                                            {isEligible ? (
                                                <EditIcon
                                                    height={16}
                                                    width={16}
                                                    onClick={editClickHandler(
                                                        onEditClick,
                                                        bankAccount
                                                    )}
                                                    data-testid="edit-bank-account-icon"
                                                    color={editIconColor}
                                                    className={`ml-1 ${
                                                        !isEligible
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer'
                                                    }`}
                                                />
                                            ) : (
                                                <TempNavInactive
                                                    hideIcon
                                                    tooltipBody={t(
                                                        'permissionDeniedTooltip'
                                                    )}
                                                >
                                                    <EditIcon
                                                        height={16}
                                                        width={16}
                                                        data-testid="edit-bank-account-icon-disabled"
                                                    />
                                                </TempNavInactive>
                                            )}
                                        </>
                                    )}
                                </div>
                            </PiiWrapper>
                            {isPending && <PendingTag />}
                        </div>
                        <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-8 md:flex">
                            <div className="flex flex-col">
                                <Label
                                    label={t(
                                        isBankAccount
                                            ? 'accountNumber'
                                            : 'cardNumber'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Typography
                                    variant={
                                        isBankAccount
                                            ? TypographyVariant.BodySm
                                            : TypographyVariant.Value
                                    }
                                >
                                    <PiiWrapper>
                                        {isBankAccount
                                            ? t('endingIn', {
                                                  accountNumber:
                                                      formatAccountNumber(
                                                          internationalBankAccountNumber ??
                                                              accountNumber,
                                                          true
                                                      ) ?? DEFAULT_ERROR_STRING,
                                              })
                                            : formatAccountNumber(
                                                  accountNumber
                                              ) ?? DEFAULT_ERROR_STRING}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label
                                    label={t(
                                        isBankAccount
                                            ? 'routingNumber'
                                            : 'expirationdate'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>
                                        {isBankAccount
                                            ? routingNumber ??
                                              DEFAULT_ERROR_STRING
                                            : formatCardExpirationDate(
                                                  bankAccount.endDate
                                              ) ?? DEFAULT_ERROR_STRING}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label
                                    label={t(
                                        isBankAccount
                                            ? 'accountType'
                                            : 'cardType'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>
                                        {getBankAccountType(
                                            accountType,
                                            defaultT
                                        )}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label
                                    label={t(
                                        isBankAccount
                                            ? 'nameOnAccount'
                                            : 'nameOnCard'
                                    )}
                                    variant={LabelVariant.FieldLabel}
                                />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>
                                        {toTitleCase(nameOnAccount)}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};
