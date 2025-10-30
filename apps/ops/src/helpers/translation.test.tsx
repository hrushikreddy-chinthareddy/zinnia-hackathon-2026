import {
    AccountType,
    AddressType,
    EmailType,
    PhoneType,
    ProductType,
} from '@zinnia/api-types/types/sor';

import {
    mapAccountTypeToTranslation,
    mapEmailTypeToTranslation,
    mapAddressTypeToTranslation,
    mapAddressTypeToPreferredTranslation,
    mapPhoneTypeToTranslation,
    mapProductTypeToTranslation,
} from './translation.helpers';

jest.mock('i18next', () => ({
    t: jest.fn((str) => str),
}));

//Mapper helper functions test
describe('Mapper helper functions', () => {
    const { t } = jest.requireMock('i18next');

    describe('mapProductType', () => {
        it('returns the correct translation string for the product type', () => {
            expect(
                mapProductTypeToTranslation('TERMLIFE' as ProductType, t)
                    .acronym
            ).toBe('policy.productType.termLifeAcronym');
            expect(
                mapProductTypeToTranslation(ProductType.UNIVERSALLIFE, t).label
            ).toBe('policy.productType.universalLife');
            expect(
                mapProductTypeToTranslation(
                    ProductType.VARIABLEUNIVERSALLIFE,
                    t
                ).acronym
            ).toBe('policy.productType.variableUniversalLifeAcronym');
            expect(
                mapProductTypeToTranslation(ProductType.WHOLELIFE, t).label
            ).toBe('policy.productType.wholeLife');
        });

        it('maps anticipated product types', () => {
            // Using string literals for anticipated types that are not in enum
            expect(
                mapProductTypeToTranslation('Fixed Deferred Annuity' as any, t)
                    .label
            ).toBe('policy.productType.fixedDeferredAnnuity');
            expect(
                mapProductTypeToTranslation('Universal Life' as any, t).label
            ).toBe('policy.productType.universalLife');
        });

        it('falls back to original value for unknown type', () => {
            const out = mapProductTypeToTranslation('UNKNOWN_TYPE' as any, t);
            expect(out.label).toBe('UNKNOWN_TYPE');
            expect(out.acronym).toBe('');
        });
    });

    describe('mapAccountTypeToTranslation', () => {
        it('returns the correct translation string for the account type', () => {
            expect(mapAccountTypeToTranslation(AccountType.CHECKING, t)).toBe(
                'people.card.bank.accountOptions.checking'
            );
            expect(mapAccountTypeToTranslation(AccountType.SAVINGS, t)).toBe(
                'people.card.bank.accountOptions.savings'
            );
            expect(
                mapAccountTypeToTranslation(AccountType.BROKERAGEACCOUNT, t)
            ).toBe('people.card.bank.accountOptions.brokerageAccount');
        });
        it('handles other account types', () => {
            expect(
                mapAccountTypeToTranslation(AccountType.CERTIFICATEOFDEPOSIT, t)
            ).toBe('people.card.bank.accountOptions.certificateOfDeposit');
            expect(mapAccountTypeToTranslation(AccountType.CREDITCARD, t)).toBe(
                'people.card.bank.accountOptions.creditCard'
            );
            expect(mapAccountTypeToTranslation(AccountType.DEBITCARD, t)).toBe(
                'people.card.bank.accountOptions.debitCard'
            );
        });
    });

    describe('mapEmailTypeToTranslation', () => {
        it('returns the correct translation string for the email type', () => {
            expect(mapEmailTypeToTranslation(EmailType.PERSONAL, t)).toBe(
                'people.card.email.emailOptions.personal'
            );
            expect(mapEmailTypeToTranslation(EmailType.BUSINESS, t)).toBe(
                'people.card.email.emailOptions.business'
            );
            expect(mapEmailTypeToTranslation(EmailType.OTHER, t)).toBe(
                'people.card.email.emailOptions.other'
            );
            // default branch when undefined -> PERSONAL as default case
            expect(mapEmailTypeToTranslation(undefined, t)).toBe(
                'people.card.email.emailOptions.personal'
            );
        });
    });

    describe('mapAddressTypeToTranslation', () => {
        it('returns the correct translation string for the address type', () => {
            expect(
                mapAddressTypeToTranslation({
                    addressType: AddressType.RESIDENCE,
                    t,
                })
            ).toBe('people.card.address.addressOptions.residence');
            expect(
                mapAddressTypeToTranslation({
                    addressType: AddressType.BUSINESS,
                    t,
                })
            ).toBe('people.card.address.addressOptions.business');
        });

        it('supports lowercase option and PO BOX variant', () => {
            expect(
                mapAddressTypeToTranslation({
                    addressType: AddressType.RESIDENCE,
                    lowercase: true,
                    t,
                })
            ).toBe('people.card.address.addressoptions.residence');
            expect(
                mapAddressTypeToTranslation({
                    addressType: AddressType.POBOX,
                    lowercase: true,
                    t,
                })
            ).toBe('people.card.address.addressOptions.poBoxLower');
            expect(
                mapAddressTypeToTranslation({
                    addressType: AddressType.MAILING,
                    lowercase: true,
                    t,
                })
            ).toBe('people.card.address.addressoptions.mailing');
        });

        it('returns default error for missing addressType', () => {
            expect(
                mapAddressTypeToTranslation({ addressType: undefined, t })
            ).toBe('--');
        });
    });

    describe('mapAddressTypeToPreferredTranslation', () => {
        it('maps preferred address label set', () => {
            expect(
                mapAddressTypeToPreferredTranslation(AddressType.RESIDENCE, t)
            ).toBe('people.card.addressOptions.residencePreferred');
            expect(
                mapAddressTypeToPreferredTranslation(AddressType.BUSINESS, t)
            ).toBe('people.card.addressOptions.businessPreferred');
            expect(
                mapAddressTypeToPreferredTranslation(AddressType.POBOX, t)
            ).toBe('people.card.addressOptions.poBoxPreferred');
        });
    });

    describe('mapPhoneTypeToTranslation', () => {
        it('returns the correct translation string for the phone type', () => {
            expect(mapPhoneTypeToTranslation(PhoneType.MOBILE, t)).toBe(
                'people.card.phone.phoneOptions.mobile'
            );
            expect(mapPhoneTypeToTranslation(PhoneType.HOME, t)).toBe(
                'people.card.phone.phoneOptions.home'
            );
            expect(mapPhoneTypeToTranslation(PhoneType.BUSINESS, t)).toBe(
                'people.card.phone.phoneOptions.business'
            );
            expect(mapPhoneTypeToTranslation(PhoneType.FAX, t)).toBe(
                'people.card.phone.phoneOptions.fax'
            );
            expect(mapPhoneTypeToTranslation(PhoneType.OTHER, t)).toBe(
                'people.card.phone.phoneOptions.other'
            );
            // default branch when undefined -> MOBILE
            expect(mapPhoneTypeToTranslation(undefined, t)).toBe(
                'people.card.phone.phoneOptions.mobile'
            );
        });
    });
});
