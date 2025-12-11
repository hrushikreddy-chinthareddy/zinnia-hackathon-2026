import { TFunction } from 'next-i18next';

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
import {
    SignatureBonusFields,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    getAnnuitantStateOfResidence,
    getOwnerStateOfResidence,
    spousalSignatureOnAnnuitantStateCodes,
    validQualTypesForSpousalSignature,
    validQualTypesForSpousalSignatureFAST,
} from '@deps/helpers/otp-withdrawal.helpers';
import { statesAndTerritories } from '@deps/helpers/states.helpers';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormProgram,
    FundWithdrawnMethod,
    ProgramType,
    WithdrawalType,
    ProgramSubType,
    FormParts,
    AmountType,
    PaymentMethod,
    PaymentMailType,
    PartyRoles,
    AddressTypes,
    PhoneTypes,
    ProcessRequestType,
    AccountCloseReason,
    AccountType,
    FormDisbursement,
    RestrictionOption,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../utils/helper-utils';
import { validateSignESign } from './utils/form-validator.helpers';

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

export default function getFlicConfig(
    t: TFunction,
    qualType: string = '',
    isLC: boolean = true
) {
    const formValidation = ({
        formSignature,
        formDisbursement,
        formESignatureData,
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

        if (
            formDisbursement?.bank[0].accountType?.text === '' &&
            [PaymentMethod.EFT, PaymentMethod.Wire].includes(
                formDisbursement?.paymentMethod?.text as PaymentMethod
            )
        ) {
            errors[BankingFields.AccountType] = t(
                'formValidation.accountTypeMustBeSelected'
            );
        }

        const signESignValidate = validateSignESign({
            formSignature,
            formESignatureData,
            t,
            validateDesignationPresent: true,
        });

        return { ...errors, ...signESignValidate };
    };
    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): { selectedOption: string | null; amount: string | null } => {
        if (formProgram?.programType?.text === ProgramType.TotalFreeAmt) {
            return {
                selectedOption: WithdrawalSelectionValues.TotalFreeWithdrawal,
                amount: '',
            };
        }
        if (formProgram?.program?.text === ProgramType.Withdrawal) {
            const amount = formProgram?.partialAmount?.text || '';
            return {
                selectedOption:
                    formProgram?.withdrawType?.text === WithdrawalType.Gross
                        ? WithdrawalSelectionValues.GrossWithdrawal
                        : WithdrawalSelectionValues.NetWithdrawal,
                amount,
            };
        }
        return { selectedOption: null, amount: '' };
    };

    function isValidQualTypeLC(qualType: string): boolean {
        return validQualTypesForSpousalSignature.includes(qualType);
    }

    function isValidQualType(qualType: string): boolean {
        return validQualTypesForSpousalSignatureFAST.includes(qualType);
    }

    const shouldCheckSpouseSignatureOnAnnuitantState = isLC
        ? isValidQualTypeLC(qualType)
        : isValidQualType(qualType);

    const isSpousalSignatureRequired = (
        ownerState: string | null,
        annuitantState: string | null
    ): boolean => {
        if (shouldCheckSpouseSignatureOnAnnuitantState) {
            return (
                !!annuitantState &&
                spousalSignatureOnAnnuitantStateCodes.includes(annuitantState)
            );
        }
        return (
            !!ownerState &&
            spousalSignatureStateCodes.includes(ownerState?.toUpperCase())
        );
    };

    const partialWithdrawalOptions: PartialWithdrawalOption[] = [
        {
            label: t(
                'amountDetails.partialWithdrawal.freeWithdrawalAmountOnly'
            ),
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
            label: t('amountDetails.partialWithdrawal.netWithdrawal'),
            value: WithdrawalSelectionValues.NetWithdrawal,
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
                    programSubType: { text: ProgramType.NetWithdrawal },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.grossWithdrawal'),
            value: WithdrawalSelectionValues.GrossWithdrawal,
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
                    programSubType: { text: ProgramType.GrossWithdrawal },
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
            value: FundWithdrawnMethod.Prorata,
        },
        {
            label: t('distributionInstruction.specifyFunds'),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
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
                    component: SignatureFields.SignaturePresent,
                    key: 'owner-sign-present',
                },
                {
                    component: SignatureFields.SignatureDesignation,
                    key: 'owner-designation',
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
                    component: SignatureFields.SignatureDesignation,
                    key: 'joint-designation',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'joint-date',
                },
            ],
            signatureType: SignatureValidationTypeWithdrawal.JointOwner,
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                return !!formParty?.parties?.find(
                    (party) => party.partyRoleType === PartyRoles.JOINT_OWNER
                );
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
            shouldDisplay: ({ formParty }: OtpWithdrawalFormState): boolean => {
                const ownerState = getOwnerStateOfResidence(formParty);
                const annuitantState = getAnnuitantStateOfResidence(formParty);
                return isSpousalSignatureRequired(ownerState, annuitantState);
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
    const w4pSignaturesConfig = [
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
                    fieldLabel: t(
                        'distributionMethod.doesCheckMeetSecurityRequirements'
                    ),
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
                    classNames: 'col-start-1',
                    isBankingField: true,
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
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditName,
                    fieldLabel: t('distributionMethod.bankFurtherCreditName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditAccount,
                    fieldLabel: t(
                        'distributionMethod.bankFurtherCreditAccount'
                    ),
                    component: DisbursementFields.BankTextField,
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
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType:
                        selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                    bankFurtherCreditName:
                        selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount:
                        selectedBank?.bankFurtherCreditAccount ?? '',
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
                    fieldName: BankingFields.IsVoidCheckAttached,
                    fieldLabel: t('distributionMethod.isVoidCheckAttached'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
                {
                    fieldName: BankingFields.DoesCheckMeetSecurityRequirements,
                    fieldLabel: t(
                        'distributionMethod.doesCheckMeetSecurityRequirements'
                    ),
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
                    fieldName: BankingFields.BankFurtherCreditName,
                    fieldLabel: t('distributionMethod.bankFurtherCreditName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditAccount,
                    fieldLabel: t(
                        'distributionMethod.bankFurtherCreditAccount'
                    ),
                    component: DisbursementFields.BankTextField,
                },
            ],
            getDefaultPayload({
                paymentMethod,
                doesCheckMeetSecRequiremnt,
                voidCheck,
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
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType:
                        selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                    bankFurtherCreditName:
                        selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount:
                        selectedBank?.bankFurtherCreditAccount ?? '',
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
                    doesCheckMeetSecRequiremnt:
                        doesCheckMeetSecurityRequirements ?? null,
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
            fields: null,
            getDefaultPayload() {
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: () => {
                const res = {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                };

                return res;
            },
        },
        {
            label: t('distributionMethod.brokerageAccount'),
            value: FormDisbursementSelections.Brokerage,
            fields: null,
            getDefaultPayload() {
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.Brokerage },
                    paymentToBrokerageAccount: true,
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
            label: t(
                'amountDetails.processTimeframe.whenTheContractIsNoLongerSubjectToWithdrawalCharges'
            ),
            value: ProcessRequestType.NoLongerSubject,
        },
        {
            label: t('amountDetails.processTimeframe.asOfThisDate'),
            value: ProcessRequestType.AsOfDate,
            subElement: <AsOfDateComponent />,
        },
    ];

    const fullWithdrawalOptions = [
        {
            label: t(
                'amountDetails.fullWithdrawal.withdrawTheEntireContractValue'
            ),
            value: AccountCloseReason.Surrender,
        },
    ];

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
    };

    const reasonOptions = [
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

    return {
        disbursementOptions,
        formPartyConfigs,
        formSubtypeOptions,
        formValidation,
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        irsSignatureConfig,
        partialWithdrawalOptions,
        signaturesConfig,
        w4pSignaturesConfig,
        selectOneOptions,
        fullWithdrawalOptions,
        eSignatureFieldConfig,
        reasonOptions,
    };
}
