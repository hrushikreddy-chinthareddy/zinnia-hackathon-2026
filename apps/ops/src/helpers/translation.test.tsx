import { AccountType, AddressType, EmailType, PhoneType, ProductType } from '@zinnia/api-types/types/sor';

import {
    mapAccountTypeToTranslation,
    mapEmailTypeToTranslation,
    mapAddressTypeToTranslation,
    mapPhoneTypeToTranslation,
    mapProductTypeToTranslation,
} from './translation.helpers';

jest.mock('i18next', () => ({
    t: jest.fn(str => str),
}));

describe('Mapper helper functions', () => {
    const { t } = jest.requireMock('i18next');

    describe('mapProductType', () => {
        it('returns the correct translation string for the product type', () => {
            expect(mapProductTypeToTranslation('TERMLIFE' as ProductType, t).acronym).toBe('policy.productType.termLifeAcronym');
            expect(mapProductTypeToTranslation(ProductType.UNIVERSALLIFE, t).label).toBe('policy.productType.universalLife');
            expect(mapProductTypeToTranslation(ProductType.VARIABLEUNIVERSALLIFE, t).acronym).toBe(
                'policy.productType.variableUniversalLifeAcronym'
            );
            expect(mapProductTypeToTranslation(ProductType.WHOLELIFE, t).label).toBe('policy.productType.wholeLife');
        });
    });

    describe('mapAccountTypeToTranslation', () => {
        it('returns the correct translation string for the account type', () => {
            expect(mapAccountTypeToTranslation(AccountType.CHECKING, t)).toBe('people.card.bank.accountOptions.checking');
            expect(mapAccountTypeToTranslation(AccountType.SAVINGS, t)).toBe('people.card.bank.accountOptions.savings');
        });
    });

    describe('mapEmailTypeToTranslation', () => {
        it('returns the correct translation string for the email type', () => {
            expect(mapEmailTypeToTranslation(EmailType.PERSONAL, t)).toBe('people.card.email.emailOptions.personal');
            expect(mapEmailTypeToTranslation(EmailType.BUSINESS, t)).toBe('people.card.email.emailOptions.business');
        });
    });

    describe('mapAddressTypeToTranslation', () => {
        it('returns the correct translation string for the address type', () => {
            expect(mapAddressTypeToTranslation({ addressType: AddressType.RESIDENCE, t })).toBe(
                'people.card.address.addressOptions.residence'
            );
            expect(mapAddressTypeToTranslation({ addressType: AddressType.BUSINESS, t })).toBe(
                'people.card.address.addressOptions.business'
            );
        });
    });

    describe('mapPhoneTypeToTranslation', () => {
        it('returns the correct translation string for the phone type', () => {
            expect(mapPhoneTypeToTranslation(PhoneType.MOBILE, t)).toBe('people.card.phone.phoneOptions.mobile');
            expect(mapPhoneTypeToTranslation(PhoneType.HOME, t)).toBe('people.card.phone.phoneOptions.home');
        });
    });
});
