import { render, screen } from '@testing-library/react';
import {
    AccountType,
    BankAccountBase,
    BankAccountPurpose,
} from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { NonFinancialTransactionActions } from '@deps/queries/api/bpm-non-financial';

import {
    BankDetails,
    getFormErrors,
    getAccountTypeOptions,
    getPurposeOptions,
    GetAction,
} from './side-sheet-bank.helpers';

const mockT = (key: string, values?: Record<string, string>) => {
    if (values) {
        return `${key} ${Object.values(values).join(', ')}`;
    }
    return key;
};

const t = mockT as TFunction;

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t,
    }),
}));

describe('SideSheetBank helpers', () => {
    describe('getAccountTypeOptions', () => {
        it('should return correct account type options', () => {
            const t = (key: string) => key;
            const options = getAccountTypeOptions({ t: t as TFunction });
            expect(options).toEqual([
                {
                    label: 'people.card.bank.accountOptions.checking',
                    value: AccountType.CHECKING,
                },
                {
                    label: 'people.card.bank.accountOptions.savings',
                    value: AccountType.SAVINGS,
                },
            ]);
        });
    });

    describe('getPurposeOptions', () => {
        it('should return correct purpose options', () => {
            const t = (key: string) => key;
            const options = getPurposeOptions({ t: t as TFunction });
            expect(options).toEqual([
                {
                    label: 'people.card.bank.purpose.loanInterestBilling',
                    value: BankAccountPurpose.LOANINTERESTBILLING,
                },
                {
                    label: 'people.card.bank.purpose.disbursements',
                    value: BankAccountPurpose.DISBURSEMENTS,
                },
                {
                    label: 'people.card.bank.purpose.loanPrincipalBilling',
                    value: BankAccountPurpose.LOANPRINCIPALBILLING,
                },
                {
                    label: 'people.card.bank.purpose.premiumBilling',
                    value: BankAccountPurpose.PREMIUMBILLING,
                },
                {
                    label: 'people.card.bank.purpose.oneTimePremiumBilling',
                    value: BankAccountPurpose.ONETIMEPREMIUMBILLING,
                },
                {
                    label: 'people.card.bank.purpose.payout',
                    value: BankAccountPurpose.PAYOUT,
                },
                {
                    label: 'people.card.bank.purpose.oneTimeWire',
                    value: BankAccountPurpose.ONETIMEWIREEE,
                },
            ]);
        });
    });

    describe('GetAction', () => {
        it('should return Add action if isAdd is true', () => {
            const action = GetAction(true, false)();
            expect(action).toBe(NonFinancialTransactionActions.Add);
        });
        it('should return Delete action if isDelete is true', () => {
            const action = GetAction(false, true)();
            expect(action).toBe(NonFinancialTransactionActions.Delete);
        });
        it('should return Edit action if both are false', () => {
            const action = GetAction(false, false)();
            expect(action).toBe(NonFinancialTransactionActions.Edit);
        });
    });

    describe('getFormErrors', () => {
        it('should return an empty object when all fields are valid', () => {
            const bankAccount = {
                accountNumber: '12345678',
                branchName: 'Branch',
                routingNumber: '123456789',
            };
            const caseId = '123';

            const result = getFormErrors({
                bankAccount,
                caseId,
                t,
                isDelete: false,
            });

            expect(result).toEqual({});
        });

        it('should return an object with all errors when all fields are missing', () => {
            const bankAccount = {
                accountNumber: '',
                branchName: '',
                routingNumber: '',
            };

            const result = getFormErrors({ bankAccount, t, isDelete: false });

            expect(result).toEqual({
                accountNumber: 'errors.accountNumber',
                branchName: 'errors.bankName',
                caseId: 'errors.missingCaseDocument',
                routingNumber: 'errors.routingNumber',
            });
        });

        it('should return accountNumber error if invalid but present', () => {
            const bankAccount = {
                accountNumber: 'invalid',
                branchName: 'Branch',
                routingNumber: '123456789',
            };
            const caseId = '123';
            const result = getFormErrors({
                bankAccount,
                caseId,
                t,
                isDelete: false,
            });
            expect(result.accountNumber).toBe('errors.accountIsInvalid');
        });

        it('should return routingNumber error if invalid but present', () => {
            const bankAccount = {
                accountNumber: '12345678',
                branchName: 'Branch',
                routingNumber: 'invalid',
            };
            const caseId = '123';
            const result = getFormErrors({
                bankAccount,
                caseId,
                t,
                isDelete: false,
            });
            expect(result.routingNumber).toBe('errors.routingIsInvalid');
        });

        it('should not require accountNumber if isDelete is true', () => {
            const bankAccount = {
                accountNumber: '',
                branchName: 'Branch',
                routingNumber: '123456789',
            };
            const caseId = '123';
            const result = getFormErrors({
                bankAccount,
                caseId,
                t,
                isDelete: true,
            });
            expect(result.accountNumber).toBeUndefined();
        });
    });

    describe('BankDetails', () => {
        it('should render bank account type label and value correctly', () => {
            const bankAccount: BankAccountBase = {
                accountType: AccountType.CHECKING,
                routingNumber: '123456789',
                branchName: 'Bank of Example',
                accountNumber: '1234567890',
            };

            render(<BankDetails bankAccount={bankAccount} />);

            expect(
                screen.getByText('People.card.bank.bankoptions.accounttype')
            ).toBeInTheDocument();
            expect(
                screen.getByText('bankAccountType.checking')
            ).toBeInTheDocument();

            expect(
                screen.getByText('People.card.bank.bankoptions.routingnumber')
            ).toBeInTheDocument();
            expect(screen.getByText('123456789')).toBeInTheDocument();

            expect(
                screen.getByText('People.card.bank.bankoptions.bankname')
            ).toBeInTheDocument();
            expect(screen.getByText('Bank of Example')).toBeInTheDocument();

            expect(
                screen.getByText('People.card.bank.bankoptions.accountnumber')
            ).toBeInTheDocument();
            expect(
                screen.getByText('people.card.bank.bankOptions.endingIn 7890')
            ).toBeInTheDocument();
        });
    });
});
