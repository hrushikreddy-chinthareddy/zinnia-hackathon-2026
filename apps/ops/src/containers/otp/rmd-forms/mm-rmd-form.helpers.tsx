import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { JointLifeExpectancyConfig } from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    FormParts,
    PaymentMethod,
    PaymentMailType,
    PartyRoles,
    PhoneTypes,
    AddressTypes,
    AccountType,
    FormDisbursement,
    SignVerificationReason,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../utils/helper-utils';
import useMassWithdrawalConfig from '../withdrawal-forms/mass/mass-withdrawal-form-helpers';

export default function useMassMutualRmdConfig(t: TFunction) {
    const {
        irsSignatureConfig,
        formValidation,
        validateMaritalStatusAllowances,
        signVerificationReasonConfig,
        fundWithdrawnMethodOptions,
    } = useMassWithdrawalConfig(t);

    const disbursementOptions: PaymentMethodOption[] = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            fields: [
                {
                    fieldName: BankingFields.Bank,
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    component: DisbursementFields.SelectBank,
                },
                {
                    fieldName: BankingFields.IsVoidCheckAttached,
                    fieldLabel: t('distributionMethod.isVoidCheckAttached'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.DoesCheckMeetSecurityRequirements,
                    fieldLabel: t('distributionMethod.doesCheckMeetSecurityRequirements'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    component: DisbursementFields.AccountTypes,
                    classNames: 'col-span-2 w-full',
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    isBankingField: true,
                    maskOnBlur: true,
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    fieldLabel: t('distributionMethod.reEnterAccountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-2',
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator('accountNumber', t('formValidation.accountNumberDoesNotMatch')),
                },

                {
                    fieldName: BankingFields.BankRoutingNumber,
                    fieldLabel: t('distributionMethod.bankRoutingNumber'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    maskOnBlur: true,
                    classNames: 'col-start-1',
                    disableCopyPaste: true,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    fieldLabel: t('distributionMethod.reEnterBankRoutingNumber'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator('bankRoutingNumber', t('formValidation.routingNumberDoesNotMatch')),
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    classNames: 'col-start-1',
                },
            ],
            getDefaultPayload({ paymentMethod, doesCheckMeetSecRequiremnt, voidCheck, bank }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    doesCheckMeetSecurityRequirements: doesCheckMeetSecRequiremnt,
                    isVoidCheckAttached: voidCheck,
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType: selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                accountHolder,
                bankRoutingNumber,
                isVoidCheckAttached,
                doesCheckMeetSecurityRequirements,
                reEnterAccountNumber,
                reEnterBankRoutingNumber,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber,
                            accountType: {
                                text: accountType,
                            },
                            bankName,
                            nameOnBankAccount: accountHolder ?? '',
                            routingNumber: bankRoutingNumber,
                            reEnterAccountNumber,
                            reEnterBankRoutingNumber,
                        },
                    ],
                    voidCheck: isVoidCheckAttached || null,
                    doesCheckMeetSecRequiremnt: doesCheckMeetSecurityRequirements || null,
                };
            },
        },
        {
            label: t('distributionMethod.sendCheck'),
            value: FormDisbursementSelections.Check,
            fields: null,
            getDefaultPayload() {
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                };
            },
        },
        {
            label: t('distributionMethod.overnightCheck'),
            value: FormDisbursementSelections.ExpressCheck,
            fields: [
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.upsAccountNumber'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.AccountName,
                    fieldLabel: t('distributionMethod.upsAccountName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.Zip,
                    fieldLabel: t('distributionMethod.zip'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 5,
                },
                {
                    fieldName: BankingFields.EmailNotification,
                    fieldLabel: t('distributionMethod.emailNotification'),
                    component: DisbursementFields.BankCheckboxField,
                },
            ],
            getDefaultPayload({ paymentMethod, emailDeliveryNotification, upsAccount, paymentMailType }: FormDisbursement) {
                if (paymentMethod.text === PaymentMailType.Check && paymentMailType.text === PaymentMailType.ExpressCheck) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountNumber: upsAccount?.accountNumber?.text ?? '',
                        zip: upsAccount?.zip?.text ?? '',
                        accountName: upsAccount?.accountName?.text ?? '',
                        emailNotification: emailDeliveryNotification?.text ?? false,
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: ({ accountNumber, accountName, zip, emailNotification }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                    upsAccount: {
                        accountName: { text: accountName ?? '' },
                        accountNumber: { text: accountNumber ?? '' },
                        zip: { text: zip ?? '' },
                    },
                    emailDeliveryNotification: { text: emailNotification || false },
                };
            },
        },
        {
            label: t('distributionMethod.alternatePayeeAddress'),
            value: FormDisbursementSelections.AlternatePayeeAddress,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.TaxId,
                    fieldLabel: t('distributionMethod.taxId'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.Address,
                    component: DisbursementFields.BankAddress,
                    fieldLabel: '',
                },
            ],
            getDefaultPayload({ paymentMethod, payee }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.AlternatePayeeAddress) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }

                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    payeeName: payee?.name?.text ?? '',
                    address: payee?.addresses[0] ?? DEFAULT_ADDRESS,
                    taxId: payee?.taxId?.text ?? '',
                };
            },
            generatePayloadFromSelection: ({ payeeName, address, taxId }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.AlternatePayeeAddress },
                    payee: {
                        name: {
                            text: payeeName || null,
                        },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: {
                            text: null,
                        },
                        taxId: {
                            text: taxId || '',
                        },
                    },
                };
            },
        },
    ];

    const getSignaturesConfig = (isKeogh: boolean): SignatureValidationConfig[] => [
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
                    component: SignatureFields.SignatureTitle,
                    key: 'owner-title',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'owner-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Owner,
        },
        {
            key: `sig-val-beneficiary`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'beneficiary-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'beneficiary-present',
                },
                {
                    component: SignatureFields.SignatureTitle,
                    key: 'beneficiary-title',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'beneficiary-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
        },
        {
            key: `sig-val-spouse`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'spouse-type',
                },
                {
                    component: SignatureFields.SignaturePresent,
                    key: 'spouse-present',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'spouse-date',
                },
            ],
            shouldDisplay: ({ formSignature }: OtpWithdrawalFormState): boolean => {
                const isMarriedSelected = !!formSignature.signVerificationReason?.some(
                    reason => reason.text === SignVerificationReason.MarriedWithERISA
                );
                return isKeogh && isMarriedSelected;
            },
            signatureType: SignatureValidationTypeWithdrawal.Spouse,
        },
    ];

    const rmdformValidation = ({
        formParty,
        formSignature,
        formDisbursement,
        formProgram,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({ formParty, formSignature, formDisbursement });
        const rmds = formProgram?.rmd?.rmdPrograms;

        if ([PaymentMethod.EFT].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].accountNumber !== formDisbursement?.bank[0].reEnterAccountNumber
            ) {
                errors[BankingFields.ReEnterAccountNumber] = t('formValidation.accountNumberDoesNotMatch');
            }
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].routingNumber !== formDisbursement?.bank[0].reEnterBankRoutingNumber
            ) {
                errors[BankingFields.ReEnterBankRoutingNumber] = t('formValidation.routingNumberDoesNotMatch');
            }
        }

        if (rmds && rmds?.length === 0) {
            errors['rmdMinimumRequiredProgram'] = t('rmdMethod.rmdWarnings.minimumRequiredProgram');
        }

        return errors;
    };

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
                            fieldLabel: t('phoneDetails.telephoneNumber'),
                        },
                    ],
                },
            ],
            addressFields: [
                {
                    addressType: AddressTypes.DEFAULT,
                    title: t('addressDetails.title'),
                },
            ],
        },
        {
            partyRoleType: PartyRoles.ANNUITANT,
            title: t('Annuitant.title'),
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
        },
    ];

    const jointLifeExpectancyConfigs: JointLifeExpectancyConfig = {
        checkboxLabel: t('rmdMethod.jointLifeExpectancy.label.mm'),
        fields: [
            {
                fieldName: PartyFields.FirstName,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.firstName'),
            },
            {
                fieldName: PartyFields.MiddleName,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.middleName'),
            },
            {
                fieldName: PartyFields.LastName,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.lastName'),
            },
            {
                fieldName: PartyFields.Dob,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.dob.mm'),
            },
            {
                fieldName: PartyFields.TaxId,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.taxId'),
            },
        ],
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

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
    };
    return {
        getSignaturesConfig,
        formPartyConfigs,
        formValidation: rmdformValidation,
        irsSignatureConfig,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig,
        disbursementOptions,
        jointLifeExpectancyConfigs,
        signVerificationReasonConfig,
        validateMaritalStatusAllowances,
        eSignatureFieldConfig,
    };
}
