import { faker } from '@faker-js/faker';
import { AccountStatus, AccountType, BankAccount } from '@zinnia/api-types/types/sor';

export const generateBankDetails = (partyId: string, fullName: string): BankAccount => {
    return {
        accountNumber: faker.finance.accountNumber(16),

        accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
        accountType: faker.helpers.arrayElement(Object.values(AccountType)),
        appliesToPartyId: partyId,
        branchName: faker.company.name(),
        endDate: '',
        bankId: faker.string.uuid(),
        internationalBankAccountNumber: faker.datatype.boolean() ? undefined : faker.finance.iban(),
        nameOnAccount: fullName,
        routingNumber: faker.finance.routingNumber(),
        startDate: '2023-11-17',
    };
};
