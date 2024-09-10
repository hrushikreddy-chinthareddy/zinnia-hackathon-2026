import { TFunction } from 'next-i18next';

import { AccountType, AddressType, EmailType, PhoneType, ProductType } from '@deps/models/policy/sor-policy';

export function mapProductTypeToTranslation(productType: ProductType | undefined, t: TFunction) {
    const translationString = 'policy.productType.';
    switch (productType) {
        default:
            return {
                label: '',
                acronym: '',
            };
        case ProductType.INDEXEDUNIVERSALLIFE:
            return {
                label: t(translationString + 'indexedUniversalLife'),
                acronym: t(translationString + 'indexedUniversalLifeAcronym'),
            };
        case 'TERMLIFE' as ProductType:
            return {
                label: t(translationString + 'termLife'),
                acronym: t(translationString + 'termLifeAcronym'),
            };
        case ProductType.UNIVERSALLIFE:
            return {
                label: t(translationString + 'universalLife'),
                acronym: t(translationString + 'universalLifeAcronym'),
            };
        case ProductType.VARIABLEUNIVERSALLIFE:
            return {
                label: t(translationString + 'variableUniversalLife'),
                acronym: t(translationString + 'variableUniversalLifeAcronym'),
            };
        case ProductType.WHOLELIFE:
            return {
                label: t(translationString + 'wholeLife'),
                acronym: t(translationString + 'wholeLifeAcronym'),
            };
    }
}

export function mapAccountTypeToTranslation(accountType: AccountType | undefined, t: TFunction) {
    const translationString = 'people.card.bank.accountOptions.';

    switch (accountType) {
        default:
        case AccountType.CHECKING:
            return t(translationString + 'checking');
        case AccountType.SAVINGS:
            return t(translationString + 'savings');
        case AccountType.BROKERAGEACCOUNT:
            return t(translationString + 'brokerageAccount');
        case AccountType.CERTIFICATEOFDEPOSIT:
            return t(translationString + 'certificateOfDeposit');
        case AccountType.CREDITCARD:
            return t(translationString + 'creditCard');
        case AccountType.DEBITCARD:
            return t(translationString + 'debitCard');
    }
}

export function mapEmailTypeToTranslation(emailType: EmailType | undefined, t: TFunction) {
    const translationString = 'people.card.email.emailOptions.';

    switch (emailType) {
        default:
        case EmailType.PERSONAL:
            return t(translationString + 'personal');
        case EmailType.BUSINESS:
            return t(translationString + 'business');
        case EmailType.OTHER:
            return t(translationString + 'other');
    }
}

interface MapAddressTypeToTranslation {
    addressType?: AddressType;
    lowercase?: boolean;
    t: TFunction;
}

export function mapAddressTypeToTranslation({ addressType, lowercase, t }: MapAddressTypeToTranslation) {
    const translationString = 'people.card.address.addressOptions.';

    switch (addressType) {
        default:
        case AddressType.RESIDENCE:
            return lowercase ? t(translationString + 'residence').toLocaleLowerCase() : t(translationString + 'residence');
        case AddressType.BUSINESS:
            return lowercase ? t(translationString + 'business').toLocaleLowerCase() : t(translationString + 'business');
        case AddressType.POBOX:
            return lowercase ? t(translationString + 'poBoxLower') : t(translationString + 'poBox');
    }
}

export function mapAddressTypeToPreferredTranslation(addressType: AddressType, t: TFunction) {
    const translationString = 'people.card.addressOptions.';

    switch (addressType) {
        default:
        case AddressType.RESIDENCE:
            return t(translationString + 'residencePreferred');
        case AddressType.BUSINESS:
            return t(translationString + 'businessPreferred');
        case AddressType.POBOX:
            return t(translationString + 'poBoxPreferred');
    }
}

export function mapPhoneTypeToTranslation(phoneType: PhoneType | undefined, t: TFunction) {
    const translationString = 'people.card.phone.phoneOptions.';

    switch (phoneType) {
        default:
        case PhoneType.MOBILE:
            return t(translationString + 'mobile');
        case PhoneType.HOME:
            return t(translationString + 'home');
        case PhoneType.BUSINESS:
            return t(translationString + 'business');
        case PhoneType.FAX:
            return t(translationString + 'fax');
        case PhoneType.OTHER:
            return t(translationString + 'other');
    }
}
