import { useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import PendingTag from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/pending-tag';
import { BankAccountWithPending } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getBankAccountType } from '@deps/helpers/party-info-helper';
import { formatCardExpirationDate, formatAccountNumber, toTitleCase } from '@deps/helpers/string.helper';
import { AccountType, BankAccount } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface BankAccountsProps {
    bankAccounts: BankAccount[];
}

export const BankAccounts = ({ bankAccounts }: BankAccountsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.bank.general' });
    const { t: defaultT } = useTranslation();

    if (!bankAccounts?.length) return null;

    return (
        <>
            {bankAccounts.map(bankAccount => {
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

                const isBankAccount = accountType !== AccountType.CREDITCARD && accountType !== AccountType.DEBITCARD;

                return (
                    <div className="flex w-full flex-col gap-4 whitespace-nowrap rounded border-2 border-gray-100 p-4 lg:p-6" key={bankId}>
                        <div className="flex items-center gap-1">
                            <PiiWrapper>
                                <Label
                                    label={branchName?.toLocaleUpperCase() ?? DEFAULT_ERROR_STRING}
                                    sentenceCase={false}
                                    variant={isBankAccount ? LabelVariant.LabelLg : LabelVariant.LabelSm}
                                />
                            </PiiWrapper>
                            {isPending && <PendingTag />}
                        </div>
                        <div className="grid grid-cols-[repeat(2,minmax(min-content,max-content))] gap-x-8 gap-y-8 md:flex">
                            <div className="flex flex-col">
                                <Label label={t(isBankAccount ? 'accountNumber' : 'cardNumber')} variant={LabelVariant.FieldLabel} />
                                <Typography variant={isBankAccount ? TypographyVariant.BodySm : TypographyVariant.Value}>
                                    <PiiWrapper>
                                        {isBankAccount
                                            ? t('endingIn', {
                                                  accountNumber:
                                                      formatAccountNumber(internationalBankAccountNumber ?? accountNumber, true) ??
                                                      DEFAULT_ERROR_STRING,
                                              })
                                            : formatAccountNumber(accountNumber) ?? DEFAULT_ERROR_STRING}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label label={t(isBankAccount ? 'routingNumber' : 'expirationdate')} variant={LabelVariant.FieldLabel} />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>
                                        {isBankAccount
                                            ? routingNumber ?? DEFAULT_ERROR_STRING
                                            : formatCardExpirationDate(bankAccount.endDate) ?? DEFAULT_ERROR_STRING}
                                    </PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label label={t(isBankAccount ? 'accountType' : 'cardType')} variant={LabelVariant.FieldLabel} />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>{getBankAccountType(accountType, defaultT)}</PiiWrapper>
                                </Typography>
                            </div>
                            <div className="flex flex-col">
                                <Label label={t(isBankAccount ? 'nameOnAccount' : 'nameOnCard')} variant={LabelVariant.FieldLabel} />
                                <Typography variant={TypographyVariant.BodySm}>
                                    <PiiWrapper>{toTitleCase(nameOnAccount)}</PiiWrapper>
                                </Typography>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};
