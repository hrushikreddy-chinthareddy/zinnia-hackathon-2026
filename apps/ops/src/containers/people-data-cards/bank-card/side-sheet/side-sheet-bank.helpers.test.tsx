import { render, screen } from '@testing-library/react';
import { TFunction } from 'next-i18next';

import { AccountType, BankAccountBase } from '@deps/models/policy/sor-policy';

import { BankDetails, getFormErrors } from './side-sheet-bank.helpers';

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
    describe('getFormErrors', () => {
        it('should return an empty object when all fields are valid', () => {
            const bankAccount = {
                accountNumber: '12345678',
                branchName: 'Branch',
                routingNumber: '123456789',
            };
            const caseId = '123';

            const result = getFormErrors({ bankAccount, caseId, t });

            expect(result).toEqual({});
        });

        it('should return an object with all errors when all fields are missing', () => {
            const bankAccount = {
                accountNumber: '',
                branchName: '',
                routingNumber: '',
            };

            const result = getFormErrors({ bankAccount, t });

            expect(result).toEqual({
                accountNumber: 'errors.accountNumber',
                branchName: 'errors.bankName',
                caseId: 'errors.missingCaseDocument',
                routingNumber: 'errors.routingNumber',
            });
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

            expect(screen.getByText('People.card.bankoptions.accounttype')).toBeInTheDocument();
            expect(screen.getByText('bankAccountType.checking')).toBeInTheDocument();

            expect(screen.getByText('People.card.bankoptions.routingnumber')).toBeInTheDocument();
            expect(screen.getByText('123456789')).toBeInTheDocument();

            expect(screen.getByText('People.card.bankoptions.bankname')).toBeInTheDocument();
            expect(screen.getByText('Bank of Example')).toBeInTheDocument();

            expect(screen.getByText('People.card.bankoptions.accountnumber')).toBeInTheDocument();
            expect(screen.getByText('people.card.bankOptions.endingIn 7890')).toBeInTheDocument();
        });
    });
});
