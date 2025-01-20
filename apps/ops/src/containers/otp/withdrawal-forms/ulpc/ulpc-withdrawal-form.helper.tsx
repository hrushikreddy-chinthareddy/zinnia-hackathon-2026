import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import AsOfDateComponent from '@deps/components/otp-withdrawal-form/form-program/as-of-date';
import { PartialWithdrawalOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import { SelectOneOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-process-date';
import { getDefaultFormProgramValues } from '@deps/components/otp-withdrawal-form/form-program/form-program.helper';
import { MaritalStatusAllowances } from '@deps/components/otp-withdrawal-form/maritial-status-allowance-withholdings';
import {
    SignatureBonusFields,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { USStates } from '@deps/constants/geography/us-states';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { statesAndTerritories } from '@deps/helpers/states.helper';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormProgram,
    FundWithdrawnMethod,
    ProgramType,
    WithdrawalType,
    FormParts,
    AmountType,
    PaymentMethod,
    PaymentMailType,
    PartyRoles,
    ProcessRequestType,
    AccountCloseReason,
    AccountType,
    FormDisbursement,
    ProgramSubType,
    LifeCadPartyRoles,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { commonOftFormValidation } from '../../oft-forms/oft-form-helper';
import { createValidator } from '../../utils/helper-utils';

export enum FormSubtype {
    FullWithdrawal = 'Full',
    PartialWithdrawal = 'Partial',
}

export enum WithdrawalSelectionValues {
    GrossWithdrawal = 'grossWithdrawal',
    NetWithdrawal = 'netWithdrawal',
    TotalFreeWithdrawal = 'totalFreeWithdrawal',
}

export const spousalSignatureStateCodes = [
    statesAndTerritories.ARIZONA,
    statesAndTerritories.CALIFORNIA,
    statesAndTerritories.IDAHO,
    statesAndTerritories.LOUISIANA,
    statesAndTerritories['NEW MEXICO'],
    statesAndTerritories.NEVADA,
    statesAndTerritories.TEXAS,
    statesAndTerritories.WASHINGTON,
    statesAndTerritories.WISCONSIN,
];

export default function getUlpcConfig(t: TFunction) {
    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): { selectedOption: string | null; amount: string | null; maturityGuaranteePeriod?: string | null } => {
        const programTypeText = formProgram?.programType?.text || '';
        const amount = formProgram?.partialAmount?.text || '';
        const programSubType = formProgram?.programSubType?.text || '';

        if (programTypeText === ProgramType.NetWithdrawal) {
            return { selectedOption: ProgramType.NetWithdrawal, amount };
        }
        if (programTypeText === ProgramType.GrossWithdrawal) {
            return { selectedOption: ProgramType.GrossWithdrawal, amount };
        }

        if (programSubType === ProgramSubType.PercentageofAV) {
            return { selectedOption: ProgramType.PartialPercent, amount: formProgram?.partialPercent?.text || '' };
        }

        if (programSubType === ProgramSubType.TotalFreeWithdrawal) {
            return { selectedOption: ProgramType.PenaltyFreeAmount, amount: '' };
        }
        return { selectedOption: null, amount: '' };
    };

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
                    partialNetAmount: { text: val, amountType: AmountType.Dollar },
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
                    partialGrossAmount: { text: val, amountType: AmountType.Dollar },
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
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
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
        { label: t('distributionInstruction.prorata'), value: FundWithdrawnMethod.Default },
        { label: t('distributionInstruction.specifyFunds'), value: FundWithdrawnMethod.SpecifyFunds },
    ];

    const signaturesConfig: SignatureValidationConfig[] = [
        {
            key: `sig-val-owner`,
            fields: [
                {
                    component: SignatureFields.SignatureType,
                    key: 'owner-type',
                },
                {
                    component: SignatureFields.SignatureCityProvided,
                    key: 'owner-city-state',
                },
                {
                    component: SignatureFields.SignatureSsn,
                    key: 'owner-ssn',
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
                    component: SignatureFields.SignatureCityProvided,
                    key: 'joint-city-state',
                },
                {
                    component: SignatureFields.SignatureSsn,
                    key: 'joint-ssn',
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
            partyRole: PartyRoles.JOINT_OWNER,
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
            shouldDisplay: ({ parties }: OtpWithdrawalFormState): boolean => {
                return !!parties?.find(party => party.Role === LifeCadPartyRoles.Beneficiary);
            },
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

    const cslnCheckStates = ['MA'];

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
            ],
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
                    classNames: 'col-start-1',
                    isBankingField: true,
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
                    isBankingField: true,
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
                    bankFurtherCreditName: selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount: selectedBank?.bankFurtherCreditAccount ?? '',
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                accountHolder,
                bankFurtherCreditAccount,
                bankFurtherCreditName,
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
                            bankFurtherCreditAccount,
                            bankFurtherCreditName,
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
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType: selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                    bankFurtherCreditName: selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount: selectedBank?.bankFurtherCreditAccount ?? '',
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                accountHolder,
                bankFurtherCreditAccount,
                bankFurtherCreditName,
                bankRoutingNumber,
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
                            bankFurtherCreditAccount,
                            bankFurtherCreditName,
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
            ],
            getDefaultPayload({ paymentMethod, paymentMailType, upsAccount }: FormDisbursement) {
                if (paymentMethod.text === FormDisbursementSelections.Check && paymentMailType.text === PaymentMailType.ExpressCheck) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountNumber: upsAccount?.accountNumber?.text ?? '',
                        accountName: upsAccount?.accountName?.text ?? '',
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: ({ payeeName, contractNumber, address, accountName, accountNumber }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                    upsAccount: {
                        accountName: { text: accountName ?? '' },
                        accountNumber: { text: accountNumber ?? '' },
                        zip: { text: '' },
                    },
                    payee: {
                        name: { text: payeeName ?? null },
                        addresses: [address || DEFAULT_ADDRESS],
                        contractNumber: { text: contractNumber ?? null },
                    },
                };
            },
        },
    ];

    const selectOneOptions: SelectOneOption[] = [
        { label: t('amountDetails.processTimeframe.immediately'), value: ProcessRequestType.Immediately },
        {
            label: t('amountDetails.processTimeframe.whenTheContractIsNoLongerSubjectToWithdrawalCharges'),
            value: ProcessRequestType.NoLongerSubject,
        },
        { label: t('amountDetails.processTimeframe.asOfThisDate'), value: ProcessRequestType.AsOfDate, subElement: <AsOfDateComponent /> },
    ];

    const fullWithdrawalOptions = [
        {
            label: t('amountDetails.fullWithdrawal.withdrawTheEntireContractValue'),
            value: AccountCloseReason.Surrender,
        },
        {
            label: t('amountDetails.fullWithdrawal.contractHasBeenLostOrDestroyed'),
            value: AccountCloseReason.ContractLost,
        },
    ];

    const maritalStatusAllowanceConfig = {
        label: 'maritalStatusAllowancesMN',
        maritalStatusAllowancesOptions: [
            { label: 'maritalStatusAllowanceItems.single', value: MaritalStatusAllowances.Single },
            { label: 'maritalStatusAllowanceItems.married', value: MaritalStatusAllowances.Married },
            { label: 'maritalStatusAllowanceItems.headOfHousehold', value: MaritalStatusAllowances.HeadOfHousehold },
        ],
    };

    const validateMaritalStatusAllowances = (issueState: USStates) => {
        return [USStates.MICHIGAN, USStates.MINNESOTA].includes(issueState);
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
        cslnCheckStates,
        disbursementOptions,
        formPartyConfigs,
        formSubtypeOptions,
        formValidation: (values: Partial<FormParts> = {}) => commonOftFormValidation(t, values),
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        irsSignatureConfig,
        partialWithdrawalOptions,
        signaturesConfig,
        selectOneOptions,
        fullWithdrawalOptions,
        maritalStatusAllowanceConfig,
        validateMaritalStatusAllowances,
        w4pSignaturesConfig
    };
}
