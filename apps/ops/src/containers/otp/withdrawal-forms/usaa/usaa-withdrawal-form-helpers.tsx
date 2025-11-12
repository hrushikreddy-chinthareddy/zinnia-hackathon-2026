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
import { ProcessType } from '@deps/models/case/enums';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormProgram,
    FundWithdrawnMethod,
    ProgramType,
    WithdrawalType,
    ProgramSubType,
    AmountType,
    PaymentMethod,
    PaymentMailType,
    PartyRoles,
    AddressTypes,
    PhoneTypes,
    ProcessRequestType,
    RestrictionOption,
    Program,
    FormParts,
} from '@deps/models/case/withdrawal/case';
import {
    DisbursementParts,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { commonOftFormValidation } from '../../oft-forms/oft-form-helpers';
import { createDtccValidator, createValidator } from '../../utils/helper-utils';

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

export default function getUsaaConfig(
    t: TFunction,
    qualType: string = '',
    isLC: boolean = true
) {
    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): { selectedOption: string | null; amount: string | null } => {
        const programSubType = formProgram?.programSubType?.text || '';

        if (programSubType === ProgramSubType.TotalFreeWithdrawal) {
            return {
                selectedOption: ProgramType.PenaltyFreeAmount,
                amount: '',
            };
        }
        if (programSubType === ProgramSubType.Dollar) {
            return {
                selectedOption: ProgramType.PartialDollar,
                amount: formProgram?.partialAmount?.text || '',
            };
        }
        if (programSubType === ProgramSubType.FullSurrender) {
            return { selectedOption: ProgramType.FullSurrender, amount: '' };
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
                    component: SignatureFields.SignatureDate,
                    key: 'beneficiary-date',
                },
            ],
            signatureType:
                SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
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
                        text: Program.WITHDRAWAL,
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
                        text: Program.WITHDRAWAL,
                    },
                    programType: { text: ProgramType.WITHDRAWAL },
                    programSubType: { text: ProgramSubType.Dollar },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                    partialGrossAmount: {
                        text: val,
                        amountType: AmountType.Dollar,
                    },
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
                        text: Program.WITHDRAWAL,
                    },
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: {
                        text: ProgramSubType.TotalFreeWithdrawal,
                    },
                };
            },
        },
    ];

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
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountHolder'),
                    fieldType: 'text',
                    isBankingField: true,
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
                            bank: { text: bank?.bank ?? '' },
                            accountType: {
                                text: bank?.accountType?.text,
                            },
                            bankName: bank?.bankName ?? '',
                            routingNumber: bank?.bankRoutingNumber ?? '',
                        },
                    ],
                    voidCheck: bank?.isVoidCheckAttached ?? null,
                    doesCheckMeetSecRequiremnt:
                        bank?.doesCheckMeetSecurityRequirements ?? null,
                    bankVerification: null,
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
        {
            label: t('distributionMethod.dtcc'),
            value: FormDisbursementSelections.DTCC,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    classNames: 'col-start-1',
                    maxLength: 40,
                    fieldType: 'text',
                },
                {
                    fieldName: BankingFields.ParticipantId,
                    fieldLabel: t('distributionMethod.participantId'),
                    fieldType: 'select',
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.onlyContractNumber'),
                    maxLength: 30,
                    fieldType: 'text',
                    validator: createDtccValidator(t, ProcessType.WITHDRAWAL),
                },
            ],
            generatePayloadFromSelection: ({
                payeeName,
                participantId,
                contractNumber,
            }: DisbursementParts) => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.DTCC },
                    participantId: { text: participantId ?? null },
                    payee: {
                        name: { text: payeeName ?? null },
                        addresses: [],
                        contractNumber: { text: null },
                    },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: contractNumber ?? '',
                        },
                    ],
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
            label: t('amountDetails.processTimeframe.asOfThisDate'),
            value: ProcessRequestType.AsOfDate,
            subElement: <AsOfDateComponent />,
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

    return {
        disbursementOptions,
        formPartyConfigs,
        formValidation: (values: Partial<FormParts> = {}) =>
            commonOftFormValidation(t, values),
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        signaturesConfig,
        selectOneOptions,
        eSignatureFieldConfig,
        reasonOptions,
        surrenderingInstructionsOptions,
        irsSignatureConfig,
    };
}
