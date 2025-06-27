import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import AsOfDateComponent from '@deps/components/otp-withdrawal-form/form-program/as-of-date';
import { PartialWithdrawalOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import { SelectOneOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-process-date';
import { getDefaultFormProgramValues } from '@deps/components/otp-withdrawal-form/form-program/form-program.helpers';
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import { WaiverItemConfig } from '@deps/components/otp-withdrawal-form/form-waivers/form-waivers';
import { MaritalStatusAllowances } from '@deps/components/otp-withdrawal-form/maritial-status-allowance-withholdings';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AddressTypes,
    FormDisbursement,
    FormParts,
    FormValidationErrors,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    RestrictionOption,
    AccountType,
    PolicyWaiver,
    WithdrawalType,
    ProgramType,
    ProgramSubType,
    AmountType,
    ProcessRequestType,
    FormProgram,
    DisbursmentConsentInfo,
    DateFieldType,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { createValidator } from '../../utils/helper-utils';

export const defaultDisbursmentConsent: DisbursmentConsentInfo = {
    isConsent: { text: null },
    name: { text: '' },
    isSigned: { text: null },
    signTitle: { text: '' },
    signDate: { text: '' },
};

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

export enum FormSubtype {
    FullWithdrawal = 'Full',
    PartialWithdrawal = 'Partial',
}

export enum WithdrawalSelectionValues {
    GrossWithdrawal = 'grossWithdrawal',
    NetWithdrawal = 'netWithdrawal',
    TotalFreeWithdrawal = 'totalFreeWithdrawal',
    MaturingGuranteePeriod = 'maturingGuranteePeriod',
}

export default function getRslnConfig(t: TFunction) {
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
        },
    ];

    const partialWithdrawalOptions: PartialWithdrawalOption[] = [
        {
            label: t('amountDetails.partialWithdrawal.netDoller'),
            value: ProgramType.NetWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Net },
                    programType: { text: ProgramType.NetWithdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialNetAmount: {
                        text: val,
                        amountType: AmountType.Dollar,
                    },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.grossDoller'),
            value: ProgramType.GrossWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.GrossWithdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialGrossAmount: {
                        text: val,
                        amountType: AmountType.Dollar,
                    },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.freeAmount'),
            value: WithdrawalSelectionValues.TotalFreeWithdrawal,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: {
                        text: ProgramSubType.TotalFreeWithdrawal,
                    },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.maturingGuranteePeriod'),
            value: WithdrawalSelectionValues.MaturingGuranteePeriod,
            dateFieldType: DateFieldType.MaturityDate,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.Withdrawal },
                    programSubType: {
                        text: ProgramSubType.MaturingGuranteePeriod,
                    },
                    maturityGuaranteePeriod: { text: val },
                };
            },
        },
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

    const reasonOptions = [
        {
            label: t('distributionReason.reasonOptions.overAge595'),
            value: RestrictionOption.Age595,
        },
        {
            label: t('distributionReason.reasonOptions.separatedFromService'),
            value: RestrictionOption.Severance,
            subElement: <ReasonDate />,
        },

        {
            label: t('distributionReason.reasonOptions.disability'),
            value: RestrictionOption.Disabled,
        },
        {
            label: t('distributionReason.reasonOptions.hardship'),
            value: RestrictionOption.Hardship,
        },
        {
            label: t('distributionReason.reasonOptions.qualifiedReservist'),
            value: RestrictionOption.QualifiedReservist,
        },
        {
            label: t('distributionReason.reasonOptions.deathinheritedira'),
            value: RestrictionOption.DeathInheritedIRA,
        },
        {
            label: t(
                'distributionReason.reasonOptions.deathdeferredsettlement'
            ),
            value: RestrictionOption.DeathDeferredSettlement,
        },
    ];

    const selectOneOptions: SelectOneOption[] = [
        {
            label: t('amountDetails.processTimeframe.immediately'),
            value: ProcessRequestType.Immediately,
        },
        {
            label: t('amountDetails.processTimeframe.asOfThisDate'),
            value: ProcessRequestType.AsOfDate,
            subElement: <AsOfDateComponent />,
        },
    ];

    const formValidation = ({
        formSignature,
        formDisbursement,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = {} as FormValidationErrors;
        if (
            [PaymentMethod.EFT, PaymentMethod.Wire].includes(
                formDisbursement?.paymentMethod?.text as PaymentMethod
            )
        ) {
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].accountNumber !==
                    formDisbursement?.bank[0].reEnterAccountNumber
            ) {
                errors[BankingFields.ReEnterAccountNumber] = t(
                    'formValidation.accountNumberDoesNotMatch'
                );
            }
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].routingNumber !==
                    formDisbursement?.bank[0].reEnterBankRoutingNumber
            ) {
                errors[BankingFields.ReEnterBankRoutingNumber] = t(
                    'formValidation.routingNumberDoesNotMatch'
                );
            }
        }

        const ownerSignature = formSignature?.signatures?.find(
            (sigInfo) =>
                sigInfo?.signType?.text ===
                SignatureValidationTypeWithdrawal.Owner
        );

        if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
            ] = t('formValidation.signaturePresentOptionMustBeSelected');
        }

        return errors;
    };

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
                    fieldLabel: t('distributionMethod.isVoidCheckAttached'),
                    fieldName: BankingFields.IsVoidCheckAttached,
                    component: DisbursementFields.BankBooleanButtonGroup,
                    classNames: 'col-start-1',
                },
                {
                    fieldLabel: t(
                        'distributionMethod.doesCheckMeetSecurityRequirements'
                    ),
                    fieldName: BankingFields.DoesCheckMeetSecurityRequirements,
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
                    validator: createValidator(
                        'accountNumber',
                        t('formValidation.accountNumberDoesNotMatch')
                    ),
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
                    fieldLabel: t(
                        'distributionMethod.reEnterBankRoutingNumber'
                    ),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'bankRoutingNumber',
                        t('formValidation.routingNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountHolder'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-2',
                },
            ],
            getDefaultPayload({
                paymentMethod,
                doesCheckMeetSecRequiremnt,
                voidCheck,
                bank,
            }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    doesCheckMeetSecurityRequirements:
                        doesCheckMeetSecRequiremnt,
                    isVoidCheckAttached: voidCheck,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType:
                        selectedBank.accountType?.text ?? AccountType.Checking,
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
                    paymentMethod: { text: PaymentMethod.EFT || '' },
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
                    doesCheckMeetSecRequiremnt:
                        doesCheckMeetSecurityRequirements ?? null,
                };
            },
        },
        {
            label: t('distributionMethod.wire'),
            value: FormDisbursementSelections.Wire,
            fields: [
                {
                    fieldLabel: t('distributionMethod.isVoidCheckAttached'),
                    fieldName: BankingFields.IsVoidCheckAttached,
                    component: DisbursementFields.BankBooleanButtonGroup,
                    classNames: 'col-start-1',
                },
                {
                    fieldLabel: t(
                        'distributionMethod.doesCheckMeetSecurityRequirements'
                    ),
                    fieldName: BankingFields.DoesCheckMeetSecurityRequirements,
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
                {
                    fieldLabel: t('distributionMethod.isWireApprovalPresent'),
                    fieldName: BankingFields.IsWireApprovalPresent,
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
                    validator: createValidator(
                        'accountNumber',
                        t('formValidation.accountNumberDoesNotMatch')
                    ),
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
                    fieldLabel: t(
                        'distributionMethod.reEnterBankRoutingNumber'
                    ),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                    disableCopyPaste: true,
                    validator: createValidator(
                        'bankRoutingNumber',
                        t('formValidation.routingNumberDoesNotMatch')
                    ),
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountHolder'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-2',
                },
            ],
            getDefaultPayload({
                paymentMethod,
                doesCheckMeetSecRequiremnt,
                voidCheck,
                isWireApprovalPresent,
                bank,
            }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.Wire) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    doesCheckMeetSecurityRequirements:
                        doesCheckMeetSecRequiremnt,
                    isVoidCheckAttached: voidCheck,
                    isWireApprovalPresent: isWireApprovalPresent?.text ?? null,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType:
                        selectedBank.accountType?.text ?? AccountType.Checking,
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
                isWireApprovalPresent,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.Wire || '' },
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
                    doesCheckMeetSecRequiremnt:
                        doesCheckMeetSecurityRequirements ?? null,
                    isWireApprovalPresent: {
                        text: isWireApprovalPresent ?? null,
                    },
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
                    fieldName: BankingFields.FirstTimeExpressCheck,
                    fieldLabel: t('distributionMethod.firstTimeExpressCheck'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                    classNames: 'col-start-1',
                },
            ],
            getDefaultPayload({
                paymentMethod,
                paymentMailType,
                firstTimeExpressCheck,
            }: FormDisbursement) {
                if (
                    paymentMethod.text === FormDisbursementSelections.Check &&
                    paymentMailType.text === PaymentMailType.ExpressCheck
                ) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        firstTimeExpressCheck:
                            firstTimeExpressCheck?.text ?? null,
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: ({
                firstTimeExpressCheck,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    firstTimeExpressCheck: {
                        text: firstTimeExpressCheck || null,
                    },
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
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
                if (
                    paymentMethod.text !== PaymentMethod.AlternatePayeeAddress
                ) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }

                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    payeeName: payee?.name?.text ?? '',
                    address: payee?.addresses?.[0] || DEFAULT_ADDRESS,
                    taxId: payee?.taxId?.text ?? '',
                    consentAvailable: false,
                };
            },
            generatePayloadFromSelection: ({
                payeeName,
                address,
                taxId,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: {
                        text: PaymentMethod.AlternatePayeeAddress,
                    },
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
                    disbursmentConsent: defaultDisbursmentConsent,
                };
            },
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

    const waiverItemsConfig: WaiverItemConfig[] = [
        {
            id: PolicyWaiver.NURSING_HOME_AND_HOSPITAL,
            title: t('additionalWaivers.nursingAndHospitalBenefits'),
            optionTitle: t(
                'additionalWaivers.isNursingAndHospitalBenefitValid'
            ),
            options: getStandardYesNoOptions(t),
        },
        {
            id: PolicyWaiver.TERMINAL_ILLNESS,
            title: t('additionalWaivers.terminalIllnessBenefits'),
            optionTitle: t('additionalWaivers.isTerminalIllnessBenefits'),
            options: getStandardYesNoOptions(t),
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
                    component: SignatureFields.SignatureTitle,
                    key: 'owner-title',
                },
                {
                    component: SignatureFields.SignatureSsn,
                    key: 'owner-ssn',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'owner-date',
                },
                {
                    component: SignatureFields.SignatureValid,
                    key: 'owner-sign-valid',
                    displayLogic: (val: SignatureWithdrawal) => val.isSigned,
                },
                {
                    component: SignatureFields.SignatureComment,
                    key: 'owner-comment',
                    label: 'signatureCommentLabel',
                    displayLogic: (val: SignatureWithdrawal) => val.isSigned,
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.Owner,
            partyRole: PartyRoles.OWNER,
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
                    component: SignatureFields.SignatureSsn,
                    key: 'joint-ssn',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'joint-date',
                },
                {
                    component: SignatureFields.SignatureValid,
                    key: 'joint-sign-valid',
                    displayLogic: (val: SignatureWithdrawal) => val.isSigned,
                },
                {
                    component: SignatureFields.SignatureComment,
                    key: 'joint-sign-comment',
                    label: 'signatureCommentLabel',
                    displayLogic: (val: SignatureWithdrawal) => val.isSigned,
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.JointOwner,
            partyRole: PartyRoles.JOINT_OWNER,
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(
                    (party) => party.partyRoleType === PartyRoles.JOINT_OWNER
                );
            },
        },
    ];

    const fullWithdrawalOptions = [
        {
            label: t('amountDetails.fullWithdrawal.freeAmount'),
            value: ProgramSubType.TotalFreeWithdrawal,
        },
    ];

    const meritalStatusAllowanceConfig = {
        label: 'maritalStatusAllowancesLabel',
        maritalStatusAllowancesOptions: [
            {
                label: 'maritalStatusAllowanceItems.single',
                value: MaritalStatusAllowances.Single,
            },
            {
                label: 'maritalStatusAllowanceItems.married',
                value: MaritalStatusAllowances.Married,
            },
        ],
    };

    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): {
        selectedOption: string | null;
        amount: string | null;
        maturityGuaranteePeriod?: string | null;
    } => {
        const programTypeText = formProgram?.programType?.text || '';
        const programSubTypeText = formProgram?.programSubType?.text || '';
        const amount = formProgram?.partialAmount?.text || '';

        if (programTypeText === ProgramType.TotalFreeAmt) {
            return {
                selectedOption: WithdrawalSelectionValues.TotalFreeWithdrawal,
                amount: '',
            };
        }
        if (programTypeText === ProgramType.NetWithdrawal) {
            return { selectedOption: ProgramType.NetWithdrawal, amount };
        }

        if (programTypeText === ProgramType.GrossWithdrawal) {
            return { selectedOption: ProgramType.GrossWithdrawal, amount };
        }

        if (
            programTypeText === ProgramType.Withdrawal &&
            programSubTypeText === ProgramSubType.MaturingGuranteePeriod
        ) {
            const maturityGuaranteePeriod =
                formProgram?.maturityGuaranteePeriod?.text || '';
            return {
                selectedOption:
                    WithdrawalSelectionValues.MaturingGuranteePeriod,
                amount: '',
                maturityGuaranteePeriod: dayjs(
                    maturityGuaranteePeriod,
                    ZAHARA_API_DATE_FORMAT
                ).isValid()
                    ? dayjs(
                          maturityGuaranteePeriod,
                          ZAHARA_API_DATE_FORMAT
                      ).format(DATE_PICKER_FORMAT)
                    : '',
            };
        }
        return { selectedOption: null, amount: '' };
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
        formPartyConfigs,
        formValidation,
        signaturesConfig,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig,
        waiverItemsConfig,
        reasonOptions,
        disbursementOptions,
        formSubtypeOptions,
        partialWithdrawalOptions,
        selectOneOptions,
        fullWithdrawalOptions,
        identifySelectedFormProgramOption,
        irsSignatureConfig,
        meritalStatusAllowanceConfig,
        eSignatureFieldConfig,
    };
}
