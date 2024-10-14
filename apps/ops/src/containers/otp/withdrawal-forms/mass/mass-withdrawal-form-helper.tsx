import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

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
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import { WaiverItemConfig } from '@deps/components/otp-withdrawal-form/form-waivers/form-waivers';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { SignVerificationReasonItem } from '@deps/components/otp-withdrawal-form/signature-validation/signature-verification-reason';
import { USStates } from '@deps/constants/geography/us-states';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AmountType,
    FormParts,
    FormProgram,
    FormValidationErrors,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    PolicyWaiver,
    ProcessRequestType,
    ProgramSubType,
    ProgramType,
    RestrictionOption,
    SignVerificationReason,
    WithdrawalType,
    AddressTypes,
    FormDisbursement,
    AccountType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';
import { FormSubtype } from '../flic-withdrawal-form.helper';

const getStandardYesNoOptions = (t: TFunction) => [
    {
        label: t('additionalWaivers.yes'),
        value: 'true',
    },
    {
        label: t('additionalWaivers.no'),
        value: 'false',
    },
];

export default function useMassWithdrawalConfig(t: TFunction) {
    const formValidation = useCallback(
        ({ formSignature, formDisbursement }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;
            if ([PaymentMethod.EFT, PaymentMethod.Wire].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
                if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].accountNumber !== formDisbursement?.bank[0].reEnterAccountNumber) {
                    errors[BankingFields.ReEnterAccountNumber] = t('formValidation.accountNumberDoesNotMatch');
                }
                if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].routingNumber !== formDisbursement?.bank[0].reEnterBankRoutingNumber) {
                    errors[BankingFields.ReEnterBankRoutingNumber] = t('formValidation.routingNumberDoesNotMatch');
                }
            }
            const ownerSignature = formSignature?.signatures?.find(
                sigInfo => sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner
            );

            // No choice made for signature
            if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
                errors[`${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`] = t(
                    'formValidation.signaturePresentOptionMustBeSelected'
                );
            }
            if (formDisbursement?.bank[0].accountType?.text === '' && [PaymentMethod.EFT, PaymentMethod.Wire].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
                errors[BankingFields.AccountType] = t('formValidation.accountTypeMustBeSelected');
            }
            return errors;
        },
        [t]
    );

    const validateMaritalStatusAllowances = (issueState: USStates) => {
        return [USStates.GEORGIA, USStates.MINNESOTA, USStates['SOUTH CAROLINA']].includes(issueState);
    };

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

    const signaturesNotaryConfig = (isKeogh: boolean) => [
        {
            key: 'owner-notary-stamp',
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
            signatureType: SignatureValidationTypeWithdrawal.OwnerNotaryStamp,
        },
        {
            key: 'joint-owner-notary-stamp',
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
            signatureType: SignatureValidationTypeWithdrawal.JointOwnerNotaryStamp,

            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(party => party.partyRoleType === PartyRoles.JOINT_OWNER);
            },
        },
        {
            key: 'spouse-notary-stamp',
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
            signatureType: SignatureValidationTypeWithdrawal.SpouseNotaryStamp,

            shouldDisplay: ({ formSignature }: OtpWithdrawalFormState): boolean => {
                const isMarriedSelected = !!formSignature.signVerificationReason?.some(
                    reason => reason.text === SignVerificationReason.MarriedWithERISA
                );
                return isKeogh && isMarriedSelected;
            },
        },
    ];

    const identifySelectedFormProgramOption = (formProgram: FormProgram): { selectedOption: string | null; amount: string | null } => {
        const programTypeText = formProgram?.programType?.text || '';

        if (programTypeText === ProgramType.TotalFreeAmt) {
            return { selectedOption: ProgramType.TotalFreeAmt, amount: '' };
        }
        if (programTypeText === ProgramType.GrossWithdrawal) {
            const amount = formProgram?.partialAmount?.text || '';
            return { selectedOption: ProgramType.GrossWithdrawal, amount };
        }

        if (programTypeText === ProgramType.NetWithdrawal) {
            const amount = formProgram?.partialAmount?.text || '';
            return { selectedOption: ProgramType.NetWithdrawal, amount: amount };
        }

        if (programTypeText === ProgramType.WITHDRAWAL) {
            const amount = formProgram?.partialPercent?.text || '';
            return {
                selectedOption:
                    formProgram.programSubType.text === ProgramSubType.MaximumAmount ? ProgramType.WITHDRAWAL : ProgramType.PartialPercent,
                amount,
            };
        }
        return { selectedOption: null, amount: '' };
    };

    const partialWithdrawalOptions: PartialWithdrawalOption[] = [
        {
            label: t('amountDetails.partialWithdrawal.freeWithdrawalAmountOnly'),
            value: ProgramType.TotalFreeAmt,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.netWithdrawal'),
            value: ProgramType.NetWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Net },
                    programType: { text: ProgramType.NetWithdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialNetAmount: { text: val, amountType: AmountType.Dollar },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.grossWithdrawal'),
            value: ProgramType.GrossWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.GrossWithdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialGrossAmount: { text: val, amountType: AmountType.Dollar },
                };
            },
        },
        {
            label: `${t('amountDetails.partialWithdrawal.percetageOfAccountValue')}`,
            value: ProgramType.PartialPercent,
            amountFieldType: AmountType.Percent,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.WITHDRAWAL },
                    programSubType: { text: ProgramSubType.PercentageofAV },
                    partialPercent: { text: val, amountType: AmountType.Percent },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.maximum'),
            value: ProgramType.Withdrawal,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.WITHDRAWAL },
                    programSubType: { text: ProgramSubType.MaximumAmount },
                };
            },
        },
    ];

    const disbursementOptions: PaymentMethodOption[] = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            fields: [
                {
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    fieldName: BankingFields.Bank,
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
                    isBankingField: true,
                    classNames: 'col-start-1'
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
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType: selectedBank.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank.bankName ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                bankRoutingNumber,
                accountHolder,
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
                    voidCheck: isVoidCheckAttached ?? null,
                    doesCheckMeetSecRequiremnt: doesCheckMeetSecurityRequirements ?? null,
                };
            },
        },
        {
            label: t('distributionMethod.wire'),
            value: FormDisbursementSelections.Wire,
            fields: [
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
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
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
                    classNames: 'col-start-1'
                },
            ],
            getDefaultPayload({ paymentMethod, doesCheckMeetSecRequiremnt, voidCheck, bank }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.Wire) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    doesCheckMeetSecurityRequirements: doesCheckMeetSecRequiremnt,
                    isVoidCheckAttached: voidCheck,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType: selectedBank.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank.bankName ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                bankRoutingNumber,
                accountHolder,
                isVoidCheckAttached,
                doesCheckMeetSecurityRequirements,
                reEnterAccountNumber,
                reEnterBankRoutingNumber,
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
                            reEnterAccountNumber,
                            reEnterBankRoutingNumber,
                        },
                    ],
                    voidCheck: isVoidCheckAttached ?? null,
                    doesCheckMeetSecRequiremnt: doesCheckMeetSecurityRequirements ?? null,
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
                    classNames: 'col-start-1',
                },
            ],
            getDefaultPayload({ paymentMethod, paymentMailType, upsAccount, emailDeliveryNotification }: FormDisbursement) {
                if (paymentMethod.text === PaymentMailType.Check && paymentMailType.text === PaymentMailType.ExpressCheck) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountNumber: upsAccount?.accountNumber?.text ?? '',
                        accountName: upsAccount?.accountName?.text ?? '',
                        zip: upsAccount?.zip?.text ?? '',
                        emailNotification: emailDeliveryNotification?.text,
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
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                },
                {
                    fieldName: BankingFields.TaxId,
                    fieldLabel: t('distributionMethod.taxId'),
                    component: DisbursementFields.BankTextField,
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
                    title: t('addressDetails.title'),
                },
            ],
            agentRecommendation: {
                label: t('additionalInformation.isAgentOrBrokerRecommended'),
                shouldDisplay: (formSubtype: FormSubtype) => formSubtype === FormSubtype.FullWithdrawal,
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
                {
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
                },
                {
                    fieldName: PartyFields.Email,
                    fieldLabel: t('personalDetails.email'),
                },
            ],
        },
    ];

    const fundWithdrawnMethodOptions = [
        { label: t('distributionInstruction.prorata'), value: FundWithdrawnMethod.Prorata },
        { label: t(`distributionInstruction.specifyFunds`), value: FundWithdrawnMethod.SpecifyFunds },
    ];

    const selectOneOptions: SelectOneOption[] = [
        { label: t('amountDetails.processTimeframe.immediately'), value: ProcessRequestType.Immediately },
        { label: t('amountDetails.processTimeframe.asOfThisDate'), value: ProcessRequestType.AsOfDate, subElement: <AsOfDateComponent /> },
    ];

    const formSubtypeOptions = [
        {
            label: t('formSubtype.partialWithdrawal'),
            value: FormSubtype.PartialWithdrawal,
        },
        {
            label: t('formSubtype.fullWithdrawal'),
            value: FormSubtype.FullWithdrawal,
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

    const signVerificationReasonConfig: SignVerificationReasonItem[] = [
        {
            label: t('signatureValidation.validationReasons.single'),
            value: SignVerificationReason.Single,
        },
        {
            label: t('signatureValidation.validationReasons.marriedWithoutERISA'),
            value: SignVerificationReason.MarriedWithoutERISA,
        },
        {
            label: t('signatureValidation.validationReasons.marriedWithERISA'),
            value: SignVerificationReason.MarriedWithERISA,
        },
    ];

    const distributionReasonOptions = [
        { label: t('distributionReason.reasonOptions.age595'), value: RestrictionOption.Age595 },
        { label: t('distributionReason.reasonOptions.severance'), value: RestrictionOption.Severance, subElement: <ReasonDate /> },
        { label: t('distributionReason.reasonOptions.planTermination'), value: RestrictionOption.PlanTermination },
        { label: t('distributionReason.reasonOptions.disabled'), value: RestrictionOption.Disabled },
        {
            label: t('distributionReason.reasonOptions.otherEligibleDistributedPermittedPlan'),
            value: RestrictionOption.EligibleDistribution,
        },
        {
            label: t('distributionReason.reasonOptions.qualifiedReservist'),
            value: RestrictionOption.QualifiedReservist,
        },
        {
            label: t('distributionReason.reasonOptions.qualifiedBirthOrAdoption'),
            value: RestrictionOption.AdoptionChildBirth,
        },
    ];
    const waiverItemsConfig: WaiverItemConfig[] = [
        {
            id: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            title: t('additionalWaivers.nursingAndHospitalBenefits'),
            optionTitle: t('additionalWaivers.isNursingAndHospitalBenefitValid'),
            options: getStandardYesNoOptions(t),
        },
        {
            id: PolicyWaiver.TERMINAL_ILLNESS,
            title: t('additionalWaivers.terminalIllnessBenefits'),
            optionTitle: t('additionalWaivers.isTerminalIllnessBenefits'),
            options: getStandardYesNoOptions(t),
        },
    ];

    return {
        disbursementOptions,
        formPartyConfigs,
        formValidation,
        getSignaturesConfig,
        signaturesNotaryConfig,
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        partialWithdrawalOptions,
        selectOneOptions,
        formSubtypeOptions,
        irsSignatureConfig,
        signVerificationReasonConfig,
        validateMaritalStatusAllowances,
        distributionReasonOptions,
        waiverItemsConfig,
    };
}
