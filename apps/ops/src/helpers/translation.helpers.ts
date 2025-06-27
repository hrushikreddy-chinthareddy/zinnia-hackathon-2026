import {
    AccountType,
    AddressType,
    EmailType,
    PhoneType,
    ProductType,
} from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

// ToDo - BPB: Once the SOR ProductTypes spec has been updated to include the below types, we can remove anticipatedProductTypes logic.
export type AnticipatedProductTypesType =
    (typeof AnticipatedProductTypes)[keyof typeof AnticipatedProductTypes];

const AnticipatedProductTypes = {
    TERMLIFE: 'TERMLIFE',
    DELAYEDIMMEDIATEFIXEDANDVARIABLEANNUITY:
        'Delayed Immediate Fixed and Variable Annuity',
    DELAYEDIMMEDIATEFIXEDANNUITY: 'Delayed Immediate Fixed Annuity',
    DELAYEDIMMEDIATEVARIABLEANNUITY: 'Delayed Immediate Variable Annuity',
    EQUITYINDEXANNUITY: 'Equity Index Annuity',
    FIXEDDEFERREDANNUITY: 'Fixed Deferred Annuity',
    FIXEDINDEXANNUITY: 'Fixed Index Annuity',
    FUNDINGAGREEMENT: 'Funding Agreement',
    IMMEDIATEFIXEDANDVARIABLEANNUITY: 'Immediate Fixed and Variable Annuity',
    IMMEDIATEFIXEDANNUITY: 'Immediate Fixed Annuity',
    IMMEDIATEVARIABLEANNUITY: 'Immediate Variable Annuity',
    MUTUALFUND: 'Mutual Fund',
    MYGA: 'MYGA (Multi-Year Guarantee Annuity)',
    REGINDEXLINKEDANNUITY: 'Reg Index Linked Annuity',
    STRUCTUREDSETTLEMENT: 'Structured Settlement',
    UNIVERSALLIFELC: 'Universal Life',
    VARIABLEDEFERREDANNUITY: 'Variable Deferred Annuity',
    VARIABLEUNIVERSALLIFEANNUITY: 'Variable Universal Life Annuity',
    ...ProductType,
};

export function mapProductTypeToTranslation(
    productType: ProductType | AnticipatedProductTypesType | undefined,
    t: TFunction
) {
    const translationString = 'policy.productType.';
    switch (productType) {
        case AnticipatedProductTypes.DELAYEDIMMEDIATEFIXEDANDVARIABLEANNUITY:
            return {
                label: t(
                    translationString +
                        'delayedImmediateFixedAndVariableAnnuity'
                ),
                acronym: t(
                    translationString +
                        'delayedImmediateFixedAndVariableAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.DELAYEDIMMEDIATEFIXEDANNUITY:
            return {
                label: t(translationString + 'delayedImmediateFixedAnnuity'),
                acronym: t(
                    translationString + 'delayedImmediateFixedAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.DELAYEDIMMEDIATEVARIABLEANNUITY:
            return {
                label: t(translationString + 'delayedImmediateVariableAnnuity'),
                acronym: t(
                    translationString + 'delayedImmediateVariableAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.EQUITYINDEXANNUITY:
            return {
                label: t(translationString + 'equityIndexAnnuity'),
                acronym: t(translationString + 'equityIndexAnnuityAcronym'),
            };
        case AnticipatedProductTypes.FIXEDANNUITY:
            return {
                label: t(translationString + 'fixedAnnuity'),
                acronym: t(translationString + 'fixedAnnuityAcronym'),
            };
        case AnticipatedProductTypes.FIXEDDEFERREDANNUITY:
            return {
                label: t(translationString + 'fixedDeferredAnnuity'),
                acronym: t(translationString + 'fixedDeferredAnnuityAcronym'),
            };
        case AnticipatedProductTypes.FIXEDINDEXANNUITY:
            return {
                label: t(translationString + 'fixedIndexAnnuity'),
                acronym: t(translationString + 'fixedIndexAnnuityAcronym'),
            };
        case AnticipatedProductTypes.FUNDINGAGREEMENT:
            return {
                label: t(translationString + 'fundingAgreement'),
                acronym: t(translationString + 'fundingAgreementAcronym'),
            };
        case AnticipatedProductTypes.IMMEDIATEFIXEDANDVARIABLEANNUITY:
            return {
                label: t(
                    translationString + 'immediateFixedAndVariableAnnuity'
                ),
                acronym: t(
                    translationString +
                        'immediateFixedAndVariableAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.IMMEDIATEFIXEDANNUITY:
            return {
                label: t(translationString + 'immediateFixedAnnuity'),
                acronym: t(translationString + 'immediateFixedAnnuityAcronym'),
            };
        case AnticipatedProductTypes.IMMEDIATEVARIABLEANNUITY:
            return {
                label: t(translationString + 'immediateVariableAnnuity'),
                acronym: t(
                    translationString + 'immediateVariableAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.MUTUALFUND:
            return {
                label: t(translationString + 'mutualFund'),
                acronym: t(translationString + 'mutualFundAcronym'),
            };
        case AnticipatedProductTypes.MYGA:
            return {
                label: t(translationString + 'multiYearGuaranteeAnnuity'),
                acronym: t(
                    translationString + 'multiYearGuaranteeAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.REGINDEXLINKEDANNUITY:
            return {
                label: t(translationString + 'regIndexLinkedAnnuity'),
                acronym: t(translationString + 'regIndexLinkedAnnuityAcronym'),
            };
        case AnticipatedProductTypes.STRUCTUREDSETTLEMENT:
            return {
                label: t(translationString + 'structuredSettlement'),
                acronym: t(translationString + 'structuredSettlementAcronym'),
            };
        case AnticipatedProductTypes.VARIABLEDEFERREDANNUITY:
            return {
                label: t(translationString + 'variableDeferredAnnuity'),
                acronym: t(
                    translationString + 'variableDeferredAnnuityAcronym'
                ),
            };
        case AnticipatedProductTypes.VARIABLEUNIVERSALLIFEANNUITY:
            return {
                label: t(translationString + 'variableUniversalLifeAnnuity'),
                acronym: t(
                    translationString + 'variableUniversalLifeAnnuityAcronym'
                ),
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
        case AnticipatedProductTypes.UNIVERSALLIFELC:
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
        default:
            return {
                label: productType,
                acronym: '',
            };
    }
}

export function mapAccountTypeToTranslation(
    accountType: AccountType | undefined,
    t: TFunction
) {
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

export function mapEmailTypeToTranslation(
    emailType: EmailType | undefined,
    t: TFunction
) {
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

export function mapAddressTypeToTranslation({
    addressType,
    lowercase,
    t,
}: MapAddressTypeToTranslation) {
    if (!addressType) {
        return DEFAULT_ERROR_STRING;
    }

    const translationString = 'people.card.address.addressOptions.';

    switch (addressType?.toUpperCase()) {
        default:
        case AddressType.RESIDENCE:
            return lowercase
                ? t(translationString + 'residence').toLocaleLowerCase()
                : t(translationString + 'residence');
        case AddressType.BUSINESS:
            return lowercase
                ? t(translationString + 'business').toLocaleLowerCase()
                : t(translationString + 'business');
        case AddressType.POBOX:
            return lowercase
                ? t(translationString + 'poBoxLower')
                : t(translationString + 'poBox');
    }
}

export function mapAddressTypeToPreferredTranslation(
    addressType: AddressType,
    t: TFunction
) {
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

export function mapPhoneTypeToTranslation(
    phoneType: PhoneType | undefined,
    t: TFunction
) {
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
