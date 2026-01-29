import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    getDefaultFormDisbursementValues,
    updateBankingDetails,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { BankingDetails } from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormParts,
    FormValidationErrors,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    AddressTypes,
    TaxWithholdingPlace,
    AmountType,
} from '@deps/models/case/withdrawal/case';
import {
    DisbursementParts,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';
import {
    validateQcdDetails,
    validateSignESign,
} from '../../withdrawal-forms/utils/form-validator.helpers';

export default function getDlicRmdWithdrawalConfig(t: TFunction) {
    const formValidation = ({
        formSignature,
        formESignatureData,
        formProgram,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = {} as FormValidationErrors;

        const signESignValidate = validateSignESign({
            formSignature,
            formESignatureData,
            t,
            validateDesignationPresent: false,
        });

        const qcd = formProgram?.qcd;

        if (qcd && qcd.length > 0) {
            const qcdErrors = validateQcdDetails(t, qcd);

            return { ...errors, ...signESignValidate, ...qcdErrors };
        }

        return { ...errors, ...signESignValidate };
    };

    const additionalWithholdingAmountConfig = {
        [TaxWithholdingPlace.Federal]: { amountType: AmountType.Percent },
    };

    const disbursementOptions = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            fields: [
                {
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    fieldName: BankingFields.Bank,
                    fieldType: 'choose-the-bank',
                },
                {
                    fieldName: BankingFields.ChooseBankingType,
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    fieldType: 'choose-the-banking-type',
                    classNames: 'col-start-1 col-span-2 mt-2',
                },
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    fieldType: 'account-type',
                    classNames: 'col-start-1 col-span-2 mt-2',
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    fieldType: 'text',
                    classNames: 'col-start-1',
                    isBankingField: true,
                    maskOnBlur: true,
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    fieldLabel: t('distributionMethod.reEnterAccountNumber'),
                    fieldType: 'text',
                    classNames: 'col-start-2',
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'accountNumber',
                        t('formValidation.accountNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: 'routingNumber',
                    fieldLabel: t('distributionMethod.bankRoutingNumber'),
                    fieldType: 'text',
                    isBankingField: true,
                    classNames: 'col-start-1',
                    maskOnBlur: true,
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    fieldLabel: t(
                        'distributionMethod.reEnterBankRoutingNumber'
                    ),
                    fieldType: 'text',
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'routingNumber' as any,
                        t('formValidation.routingNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    fieldType: 'text',
                    isBankingField: true,
                    classNames: 'col-start-1 w-full',
                },
            ],
            generatePayloadFromSelection: (
                defaultDisbursementInfo: any,
                bankingInFile?: BankingDetails[] | null | []
            ) => {
                let bank = [];
                if (bankingInFile && bankingInFile?.length > 0) {
                    bank = updateBankingDetails(
                        bankingInFile[0],
                        defaultDisbursementInfo
                    );
                } else {
                    bank = defaultDisbursementInfo?.bank?.[0];
                }

                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: bank?.accountNumber ?? '',
                            accountType: {
                                text: bank?.accountType?.text,
                            },
                            bankName: bank?.bankName ?? '',
                            routingNumber: bank?.bankRoutingNumber ?? '',
                            reEnterAccountNumber: bank?.reEnterAccountNumber,
                            reEnterBankRoutingNumber:
                                bank?.reEnterBankRoutingNumber,
                        },
                    ],
                    bankVerification: defaultDisbursementInfo?.bankVerification,
                };
            },
        },
        {
            label: t('distributionMethod.sendCheck'),
            value: FormDisbursementSelections.Check,
            fields: [
                {
                    fieldName: BankingFields.SelectIfPayeeIsDifferent,
                    fieldLabel: t('distributionMethod.selectIfDifferentPayee'),
                    classNames: 'col-start-1 col-span-3',
                    fieldType: 'checkbox',
                },
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    classNames: 'col-start-1 col-span-2 max-w-lg',
                    fieldType: 'text',
                },
                {
                    fieldName: BankingFields.Address,
                    classNames: 'col-span-3',
                    fieldType: 'address',
                    isAddressLine2Required: true,
                },
            ],
            generatePayloadFromSelection: ({
                payeeName,
                address,
                selectIfPayeeIsDifferent,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                    isDifferentPayeeOrAddress: {
                        text: selectIfPayeeIsDifferent || false,
                    },
                    payee: {
                        name: { text: payeeName || null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: null },
                    },
                };
            },
        },
    ];

    const formPartyConfigs: PartyConfig[] = [
        {
            partyRoleType: PartyRoles.OWNER,
            title: t('personalDetails.title'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('personalDetails.firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('personalDetails.middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('personalDetails.lastName'),
                },
                {
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
                },
                {
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
            phones: [
                {
                    phoneType: PhoneTypes.Owner_Phone_Day,
                    fields: [
                        {
                            fieldName: PhoneFields.phoneNumber,
                            fieldLabel: t('phoneDetails.daytimePhone'),
                        },
                    ],
                },
                {
                    phoneType: PhoneTypes.Owner_Phone_Home,
                    fields: [
                        {
                            fieldName: PhoneFields.phoneNumber,
                            fieldLabel: t('phoneDetails.homePhone'),
                        },
                    ],
                },
            ],
            addressFields: [
                {
                    addressType: AddressTypes.DEFAULT,
                    title: t('addressDetails.title'),
                    isReadonly: true,
                },
            ],
            isAddressChanged: {
                addressType: AddressTypes.DEFAULT,
                title: t('addressDetails.checkHereIfYourAddressHasChanged'),
            },
        },
        {
            partyRoleType: PartyRoles.JOINT_OWNER,
            title: t('jointOwner.title'),
            fields: [
                {
                    fieldName: PartyFields.FirstName,
                    fieldLabel: t('personalDetails.firstName'),
                },
                {
                    fieldName: PartyFields.MiddleName,
                    fieldLabel: t('personalDetails.middleName'),
                },
                {
                    fieldName: PartyFields.LastName,
                    fieldLabel: t('personalDetails.lastName'),
                },
                {
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
        },
    ];

    const fundWithdrawnMethodOptions = [
        {
            label: t('distributionInstruction.prorata'),
            value: FundWithdrawnMethod.Prorata,
        },
        {
            label: t(`distributionInstruction.specifyFunds`),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const irsSignatureConfig = [
        {
            component: SignatureFields.SignaturePresent,
            key: 'irs-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'irs-signature-sign-date',
        },
    ];
    const signaturesConfig = [
        {
            key: `sig-val-owner`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'owner-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'owner-sign-present',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'owner-date',
                },
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'owner-sign-guarantee-stamp',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Owner,
        },
        {
            key: `sig-val-joint`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'joint-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'joint-sign-present',
                },

                {
                    component: SignatureFields.SignatureDate,
                    key: 'joint-date',
                },
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'joint-sign-guarantee-stamp',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.JointOwner,
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(
                    (party) => party.partyRoleType === PartyRoles.JOINT_OWNER
                );
            },
        },
    ];

    const signaturesNotaryConfig = [
        {
            key: `sig-val-notary`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'notary-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'notary-present',
                },
                {
                    component: SignatureFields.NotaryStampValid,
                    key: 'notary-stamp-valid',
                },
                {
                    component: SignatureFields.CommissionExpireDate,
                    key: 'notary-commission-exp-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Notary,
        },
    ];

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
    };

    const w4pSignaturesConfig = [
        {
            component: SignatureFields.SignatureType,
            key: 'w4p-owner-type',
        },
        {
            component: SignatureFields.SignaturePresent,
            key: 'w4p-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'w4p-signature-sign-date',
        },
    ];

    return {
        disbursementOptions,
        formPartyConfigs,
        formValidation,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        signaturesConfig,
        additionalWithholdingAmountConfig,
        signaturesNotaryConfig,
        eSignatureFieldConfig,
        w4pSignaturesConfig,
    };
}
