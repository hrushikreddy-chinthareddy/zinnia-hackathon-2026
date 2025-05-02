import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import AsOfDateComponent from '@deps/components/otp-withdrawal-form/form-program/as-of-date';
import { PartialWithdrawalOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import { SelectOneOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-process-date';
import { getDefaultFormProgramValues } from '@deps/components/otp-withdrawal-form/form-program/form-program.helper';
import {
    SignatureBonusFields,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    PartyRoles,
    PhoneTypes,
    FormParts,
    AmountType,
    WithdrawalType,
    ProgramType,
    ProgramSubType,
    FormProgram,
    PaymentMethod,
    PaymentMailType,
    ProcessRequestType,
    Program,
    FormDisbursement,
    AccountType,
    AddressTypes,
    FundWithdrawnMethod,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';
import { spousalSignatureStateCodes } from '../../withdrawal-forms/flic-withdrawal-form.helper';
import { commonOftFormValidation, getQualTypeOptions } from '../oft-form-helper';

export default function getUsaaOftConfig(t: TFunction) {
    // importing base configuration from FLIC form helper.
    const formValidation = (values: Partial<FormParts> = {}) => commonOftFormValidation(t, values);

    const signaturesConfig: SignatureValidationConfig[] = [
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
                    component: SignatureFields.SignatureTitle,
                    key: 'joint-title',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'joint-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.JointOwner,
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(party => party.partyRoleType === PartyRoles.JOINT_OWNER);
            },
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
            bonusField: SignatureBonusFields.SpousalConsent,
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
            shouldDisplay: ({ ownerStateOfResidence }: OtpWithdrawalFormState): boolean => {
                return !!ownerStateOfResidence && spousalSignatureStateCodes.includes(ownerStateOfResidence?.toUpperCase());
            },
            signatureType: SignatureValidationTypeWithdrawal.Spouse,
        },
    ];

    const oftFormValidation = ({ formParty, formSignature, formDisbursement }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({ formParty, formSignature, formDisbursement });

        // fbo details required
        if (
            ![PaymentMethod.DTCC].includes(formDisbursement?.paymentMethod.text as PaymentMethod) &&
            formDisbursement?.paymentMethod.text &&
            !formDisbursement?.payee?.fboDetails?.text
        ) {
            errors['fboDetails'] = t('formValidation.fboDetails');
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
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
                {
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
                },
                {
                    fieldName: PartyFields.Email,
                    fieldLabel: t('personalDetails.email'),
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
                    title: t('addressDetails.residentialAddressTitle'),
                },
                {
                    addressType: AddressTypes.MAILING_ADDRESS,
                    title: t('addressDetails.mailingAddressTitle'),
                },
            ],
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
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
        },
    ];

    const surrenderingInstructionsOptions: PartialWithdrawalOption[] = [
        {
            label: t('amountDetails.programTypes.full'),
            value: ProgramType.FullSurrender,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    program: {
                        text: Program.OFT,
                    },
                    programType: { text: ProgramType.FullSurrender },
                    programSubType: { text: ProgramSubType.FullSurrender },
                };
            },
        },
        {
            label: `${t('amountDetails.programTypes.partial')} $`,
            value: ProgramType.PartialDollar,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    program: {
                        text: Program.OFT,
                    },
                    programType: { text: ProgramType.WITHDRAWAL },
                    programSubType: { text: ProgramSubType.Dollar },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialGrossAmount: { text: val, amountType: AmountType.Dollar },
                };
            },
        },
        {
            label: `${t('amountDetails.programTypes.partial')} %`,
            value: ProgramType.PartialPercent,
            amountFieldType: AmountType.Percent,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    program: {
                        text: Program.OFT,
                    },
                    programType: { text: ProgramType.WITHDRAWAL },
                    programSubType: { text: ProgramSubType.PercentageofAV },
                    partialPercent: { text: val, amountType: AmountType.Percent },
                };
            },
        },
        {
            label: t('amountDetails.programTypes.penaltyFreeAmount'),
            value: ProgramType.PenaltyFreeAmount,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    program: {
                        text: Program.OFT,
                    },
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
                };
            },
        },
    ];

    const identifySelectedFormProgramOption = (formProgram: FormProgram): { selectedOption: string | null; amount: string | null } => {
        const programSubType = formProgram?.programSubType?.text || '';
        if (programSubType === ProgramSubType.FullSurrender) {
            return { selectedOption: ProgramType.FullSurrender, amount: '' };
        }
        if (programSubType === ProgramSubType.TotalFreeWithdrawal) {
            return { selectedOption: ProgramType.PenaltyFreeAmount, amount: '' };
        }
        if (programSubType === ProgramSubType.PercentageofAV) {
            return { selectedOption: ProgramType.PartialPercent, amount: formProgram?.partialPercent?.text || '' };
        }

        if (programSubType === ProgramSubType.Dollar) {
            return { selectedOption: ProgramType.PartialDollar, amount: formProgram?.partialAmount?.text || '' };
        }
        return { selectedOption: null, amount: '' };
    };

    const disbursementOptions: PaymentMethodOption[] = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            fields: [
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    component: DisbursementFields.AccountTypes,
                    classNames: 'col-span-2 w-full',
                    maxLength: 40,
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maxLength: 40,
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    component: DisbursementFields.BankTextField,
                    maskOnBlur: true,
                    disableCopyPaste: true,
                    isBankingField: true,
                    classNames: 'col-start-1',
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
                    maskOnBlur: true,
                    disableCopyPaste: true,
                    classNames: 'col-start-1',
                    isBankingField: true,
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
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.FboDetails,
                    fieldLabel: t('distributionMethod.fboDetails'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.contractNumber'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                    tooltip: {
                        shouldDisplay: true,
                        title: t('distributionMethod.contractLabelPopoverTitle') as string,
                        body: t('distributionMethod.contractLabelPopoverMessage') as string,
                    },
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                    classNames: 'col-span-3',
                },
            ],
            getDefaultPayload({ paymentMethod, bank, payee }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType: selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                    payeeName: payee?.name?.text ?? '',
                    fboDetails: payee?.fboDetails?.text || '',
                    contractNumber: payee?.contractNumber.text ?? '',
                    address: payee?.addresses?.[0] ?? DEFAULT_ADDRESS,
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                accountHolder,
                bankRoutingNumber,
                payeeName,
                reEnterAccountNumber,
                reEnterBankRoutingNumber,
                fboDetails,
                contractNumber,
                address,
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
                    payee: {
                        name: { text: payeeName ?? null },
                        fboDetails: { text: fboDetails ?? null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: contractNumber ?? null },
                    },
                };
            },
        },
        {
            label: t('distributionMethod.wire'),
            value: FormDisbursementSelections.Wire,
            fields: [
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    component: DisbursementFields.AccountTypes,
                    classNames: 'col-span-2 w-full',
                },
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    classNames: 'col-start-1',
                    component: DisbursementFields.BankTextField,
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
                    classNames: 'col-start-1',
                    maskOnBlur: true,
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
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.BankFurtherCreditName,
                    fieldLabel: t('distributionMethod.bankFurtherCreditName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditAccount,
                    fieldLabel: t('distributionMethod.bankFurtherCreditAccount'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.FboDetails,
                    fieldLabel: t('distributionMethod.fboDetails'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.contractNumber'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                    tooltip: {
                        shouldDisplay: true,
                        title: t('distributionMethod.contractLabelPopoverTitle') as string,
                        body: t('distributionMethod.contractLabelPopoverMessage') as string,
                    },
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                    classNames: 'col-span-3',
                },
            ],
            getDefaultPayload({ paymentMethod, bank, payee }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.Wire) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType: selectedBank.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank.bankName ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                    bankFurtherCreditName: selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount: selectedBank?.bankFurtherCreditAccount ?? '',
                    payeeName: payee?.name?.text ?? '',
                    fboDetails: payee?.fboDetails?.text || '',
                    contractNumber: payee?.contractNumber.text ?? '',
                    address: payee?.addresses?.[0] ?? DEFAULT_ADDRESS,
                };
            },
            generatePayloadFromSelection: ({
                payeeName,
                accountNumber,
                accountType,
                bankName,
                bankRoutingNumber,
                bankFurtherCreditAccount,
                bankFurtherCreditName,
                accountHolder,
                reEnterAccountNumber,
                reEnterBankRoutingNumber,
                fboDetails,
                contractNumber,
                address,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.Wire },
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
                            bankFurtherCreditAccount,
                            bankFurtherCreditName,
                            reEnterAccountNumber,
                            reEnterBankRoutingNumber,
                        },
                    ],
                    payee: {
                        name: { text: payeeName ?? null },
                        fboDetails: { text: fboDetails ?? null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: contractNumber ?? null },
                    },
                };
            },
        },
        {
            label: t('distributionMethod.sendCheck'),
            value: FormDisbursementSelections.Check,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.FboDetails,
                    fieldLabel: t('distributionMethod.fboDetails'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.contractNumber'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                    tooltip: {
                        shouldDisplay: true,
                        title: t('distributionMethod.contractLabelPopoverTitle') as string,
                        body: t('distributionMethod.contractLabelPopoverMessage') as string,
                    },
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                },
            ],
            getDefaultPayload({ paymentMethod, paymentMailType, payee }: FormDisbursement) {
                if (paymentMethod.text === PaymentMailType.Check && paymentMailType.text === null) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        payeeName: payee?.name.text ?? '',
                        address: payee?.addresses?.[0] ?? DEFAULT_ADDRESS,
                        contractNumber: payee?.contractNumber.text ?? '',
                        fboDetails: payee?.fboDetails?.text || '',
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: ({ payeeName, address, contractNumber, fboDetails }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                    payee: {
                        name: { text: payeeName || null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: contractNumber || null },
                        fboDetails: { text: fboDetails ?? null },
                    },
                };
            },
        },
        {
            label: t('distributionMethod.overnightCheck'),
            value: FormDisbursementSelections.ExpressCheck,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.FboDetails,
                    fieldLabel: t('distributionMethod.fboDetails'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.contractNumber'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                    tooltip: {
                        shouldDisplay: true,
                        title: t('distributionMethod.contractLabelPopoverTitle') as string,
                        body: t('distributionMethod.contractLabelPopoverMessage') as string,
                    },
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.upsAccountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.AccountName,
                    fieldLabel: t('distributionMethod.upsAccountName'),
                    component: DisbursementFields.BankTextField,
                },
            ],
            getDefaultPayload({ paymentMethod, paymentMailType, payee, upsAccount }: FormDisbursement) {
                if (paymentMethod.text === FormDisbursementSelections.Check && paymentMailType.text === PaymentMailType.ExpressCheck) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        payeeName: payee?.name.text ?? '',
                        address: payee?.addresses?.[0] ?? DEFAULT_ADDRESS,
                        contractNumber: payee?.contractNumber.text ?? '',
                        fboDetails: payee?.fboDetails?.text || '',
                        accountNumber: upsAccount?.accountNumber?.text ?? '',
                        accountName: upsAccount?.accountName?.text ?? '',
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: ({
                payeeName,
                contractNumber,
                address,
                fboDetails,
                accountName,
                accountNumber,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                    payee: {
                        name: { text: payeeName ?? null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: contractNumber ?? null },
                        fboDetails: { text: fboDetails ?? null },
                    },
                    upsAccount: {
                        accountName: { text: accountName ?? '' },
                        accountNumber: { text: accountNumber ?? '' },
                        zip: { text: '' },
                    },
                };
            },
        },
    ];

    const selectOneOptions: SelectOneOption[] = [
        {
            label: t('amountDetails.processTimeframe.immediately'),
            value: ProcessRequestType.Immediately,
        },
        {
            label: t('amountDetails.processTimeframe.whenTheContractIsNoLongerSubjectToWithdrawalCharges'),
            value: ProcessRequestType.NoLongerSubject,
        },
        {
            label: t('amountDetails.processTimeframe.asOfThisDate'),
            value: ProcessRequestType.AsOfDate,
            subElement: <AsOfDateComponent />,
        },
    ];

    const fundWithdrawnMethodOptions = [
        {
            label: t('distributionInstruction.prorata'),
            value: FundWithdrawnMethod.Default,
        },
        {
            label: t('distributionInstruction.specifyFunds'),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const defaultValues = {
        disbursementOption: FormDisbursementSelections.DTCC,
    };

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
        accordForm: true,
    };

    return {
        formValidation: oftFormValidation,
        formPartyConfigs,
        surrenderingInstructionsOptions,
        signaturesConfig,
        selectOneOptions,
        fundWithdrawnMethodOptions,
        disbursementOptions,
        identifySelectedFormProgramOption,
        defaultValues,
        qualificationOptions: getQualTypeOptions(t),
        eSignatureFieldConfig,
    };
}
