import {
    AccountType,
    BankAccount,
    BankAccountBase,
} from '@zinnia/api-types/types/sor';
import { TFunction, useTranslation } from 'next-i18next';

import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    isAccountNumberValid,
    isRoutingNumberValid,
} from '@deps/helpers/bank-validation.helpers';
import { getBankAccountType } from '@deps/helpers/party-info-helpers';
import { formatAccountNumber } from '@deps/helpers/string.helpers';

interface BankDetails {
    bankAccount: BankAccountBase;
}

export interface Errors {
    accountNumber?: string;
    branchName?: string;
    caseId?: string;
    routingNumber?: string;
}

interface GetAccountTypeOptions {
    t: TFunction;
}

interface GetFormErrors {
    bankAccount: BankAccount;
    caseId?: string;
    t: TFunction;
}

export const getAccountTypeOptions = ({ t }: GetAccountTypeOptions) => [
    {
        label: t('people.card.bank.accountOptions.checking') as string,
        value: AccountType.CHECKING,
    },
    {
        label: t('people.card.bank.accountOptions.savings') as string,
        value: AccountType.SAVINGS,
    },
];

export const getFormErrors = ({ bankAccount, caseId, t }: GetFormErrors) => {
    let errors: Errors = {};

    if (caseId == null) {
        errors = {
            ...errors,
            caseId: t('errors.missingCaseDocument') as string,
        };
    }

    if (!bankAccount.accountNumber) {
        errors = {
            ...errors,
            accountNumber: t('errors.accountNumber') as string,
        };
    } else if (!isAccountNumberValid(bankAccount.accountNumber)) {
        errors = {
            ...errors,
            accountNumber: t('errors.accountIsInvalid') as string,
        };
    }

    if (!bankAccount.branchName) {
        errors = { ...errors, branchName: t('errors.bankName') as string };
    }

    if (!bankAccount.routingNumber) {
        errors = {
            ...errors,
            routingNumber: t('errors.routingNumber') as string,
        };
    } else if (!isRoutingNumberValid(bankAccount.routingNumber)) {
        errors = {
            ...errors,
            routingNumber: t('errors.routingIsInvalid') as string,
        };
    }

    return errors;
};

export const BankDetails = ({ bankAccount }: BankDetails) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <Label
                    label={t('people.card.bankOptions.accountType')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {getBankAccountType(bankAccount.accountType, t)}
                </Typography>
            </div>
            <div className="flex flex-col">
                <Label
                    label={t('people.card.bankOptions.routingNumber')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {bankAccount.routingNumber}
                </Typography>
            </div>
            <div className="flex flex-col">
                <Label
                    label={t('people.card.bankOptions.bankName')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {bankAccount.branchName}
                </Typography>
            </div>
            <div className="flex flex-col">
                <Label
                    label={t('people.card.bankOptions.accountNumber')}
                    variant={LabelVariant.FieldLabel}
                />
                <Typography variant={TypographyVariant.BodySm}>
                    {t('people.card.bankOptions.endingIn', {
                        accountNumber: formatAccountNumber(
                            bankAccount.accountNumber,
                            true
                        ),
                    })}
                </Typography>
            </div>
        </div>
    );
};
