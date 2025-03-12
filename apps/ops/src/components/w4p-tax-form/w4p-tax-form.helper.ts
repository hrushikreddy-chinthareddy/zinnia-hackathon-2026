import { TFunction } from 'next-i18next';

import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { AddressTypes, AmountType, PeriodicPensionFormType } from '@deps/models/case/withdrawal/case';

import { MaritalStatusAllowances } from '../otp-withdrawal-form/maritial-status-allowance-withholdings';

export const maritalStatusOptions = (t: TFunction) => [
    { label: t('maritalStatusAllowanceItems.single'), value: MaritalStatusAllowances.Single },
    { label: t('maritalStatusAllowanceItems.married'), value: MaritalStatusAllowances.Married },
    { label: t('maritalStatusAllowanceItems.headOfHousehold'), value: MaritalStatusAllowances.HeadOfHousehold },
];

export const w4pPeriodicPaymentDefault: PeriodicPensionFormType = {
    maritalStatus: {
        text: '',
    },
    otherIncomeAndPensions: {
        text: '',
        amountType: AmountType.Dollar,
    },
    claimsAndCredits: {
        text: '',
        amountType: AmountType.Dollar,
    },
    nonJobIncome: {
        text: '',
        amountType: AmountType.Dollar,
    },
    otherDeductions: {
        text: '',
        amountType: AmountType.Dollar,
    },
    address: {
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        addressLine4: null,
        addressType: AddressTypes.DEFAULT,
        city: '',
        country: null,
        state: '',
        zip: '',
        zipPlusFour: '',
        isAddressChanged: false,
    },
    signature: {
        isSigned: null,
        signDate: {
            text: '',
        },
        signExtension: null,
        signName: null,
        signOtherTitle: null,
        signTitle: {
            text: '',
        },
        signTitles: [
            {
                text: null,
            },
        ],
        signType: {
            text: SignatureValidationTypeWithdrawal.Owner,
        },
        spousalConsent: {
            text: null,
        },
    },
    ssn: '',
};
