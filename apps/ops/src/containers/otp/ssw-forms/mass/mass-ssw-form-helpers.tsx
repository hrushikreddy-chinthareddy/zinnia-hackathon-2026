import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import { WaiverItemConfig } from '@deps/components/otp-withdrawal-form/form-waivers/form-waivers';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { SignVerificationReasonItem } from '@deps/components/otp-withdrawal-form/signature-validation/signature-verification-reason';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import { USStates } from '@deps/constants/geography/us-states';
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
    PolicyWaiver,
    RestrictionOption,
    SSWType,
    SignVerificationReason,
    Frequency,
    AmountType,
    ProgramType,
    AddressTypes,
    AccountType,
    FormDisbursement,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    FormDisbursementSelections,
    PaymentMethodOption,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';

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

export default function useMassSSWConfig(t: TFunction) {
    const formValidation = useCallback(
        ({
            formSignature,
            formDisbursement,
            formESignatureData,
        }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;

            if (
                [PaymentMethod.EFT].includes(
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

            const ownerESignature = formESignatureData?.eSignatures?.find(
                (sigInfo) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            if (
                ownerSignature?.isSigned !== false &&
                !ownerSignature?.isSigned &&
                !formESignatureData?.isFormESignaturePresent
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }

            if (
                ownerSignature?.isDesignationPresent === null &&
                !formESignatureData?.isFormESignaturePresent
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignatureDesignation}`
                ] = t('formValidation.signatureDesignationMustBeSelected');
            }

            if (formESignatureData?.isFormESignaturePresent) {
                if (!ownerESignature?.isSigned) {
                    errors[
                        `${SignatureValidationTypeWithdrawal.Owner}-e-signature-present`
                    ] = t(
                        'formValidation.signaturePresentOptionMustBeSelected'
                    );
                }
            }

            return errors;
        },
        [t]
    );

    const sswFormValidation = ({
        formParty,
        formSignature,
        formDisbursement,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({
            formParty,
            formSignature,
            formDisbursement,
        });

        return errors;
    };

    const validateMaritalStatusAllowances = (issueState: USStates) => {
        return [
            USStates.GEORGIA,
            USStates.MINNESOTA,
            USStates['SOUTH CAROLINA'],
        ].includes(issueState);
    };

    const reasonOptions = [
        {
            label: t('distributionReason.reasonOptions.age595'),
            value: RestrictionOption.Age595,
        },
        {
            label: t('distributionReason.reasonOptions.severance'),
            value: RestrictionOption.Severance,
            subElement: <ReasonDate />,
        },
        {
            label: t('distributionReason.reasonOptions.planTermination'),
            value: RestrictionOption.PlanTermination,
        },
        {
            label: t('distributionReason.reasonOptions.disabled'),
            value: RestrictionOption.Disabled,
        },
        {
            label: t(
                'distributionReason.reasonOptions.otherEligibleDistributedPermittedPlan'
            ),
            value: RestrictionOption.EligibleDistribution,
        },
        {
            label: t('distributionReason.reasonOptions.qualifiedReservist'),
            value: RestrictionOption.QualifiedReservist,
        },
    ];

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
                    fieldLabel: t(
                        'distributionMethod.doesCheckMeetSecurityRequirements'
                    ),
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
                {
                    fieldName: BankingFields.AccountType,
                    fieldLabel: t('distributionMethod.accountType'),
                    component: DisbursementFields.AccountTypes,
                    classNames: 'col-start-1 col-span-2 w-full',
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
                    doesCheckMeetSecRequiremnt:
                        doesCheckMeetSecurityRequirements ?? null,
                };
            },
        },
        {
            label: t('distributionMethod.sendCheck'),
            value: FormDisbursementSelections.Check,
            fields: null,
            getDefaultPayload: () => {
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
            label: t('distributionMethod.alternatePayeeAddress'),
            value: FormDisbursementSelections.AlternatePayeeAddress,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
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
                    classNames: 'col-start-1',
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
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.ParticipantId,
                    fieldLabel: t('distributionMethod.participantId'),
                    component: DisbursementFields.SelectParticipantId,
                },
                {
                    fieldName: BankingFields.ContractNumber,
                    fieldLabel: t('distributionMethod.onlyContractNumber'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 30,
                },
            ],
            getDefaultPayload({
                paymentMethod,
                payee,
                participantId,
                bank,
            }: FormDisbursement) {
                if (paymentMethod.text !== FormDisbursementSelections.DTCC) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    payeeName: payee?.name.text ?? '',
                    address: payee?.addresses?.[0] ?? DEFAULT_ADDRESS,
                    contractNumber: bank?.[0]?.accountNumber ?? '',
                    participantId: participantId?.text ?? '',
                };
            },
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

    const fundWithdrawnMethodOptions = (sswType: string) => [
        {
            label: t(`distributionInstruction.prorata`),
            value: FundWithdrawnMethod.Prorata,
            disabled: sswType === SSWType.PercentOfAmountValue,
        },
        {
            label: t(`distributionInstruction.specifyFunds`),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const generateSSWPayload = (val: SSWProgram, subType: SSWType) => ({
        ...getDefaultSSWFormProgramValues(),
        programType: {
            text: ProgramType.SSW,
        },
        programSubType: {
            text: subType,
        },
        programFrequency: {
            frequency:
                val.frequency.text === Frequency.None
                    ? { text: '' as Frequency }
                    : val.frequency,
            beginDate: val.startDate,
            fixedPeriodYear: [
                SSWType.FixPeriod,
                SSWType.FixDollar,
                SSWType.AnnualFree,
                SSWType.PercentOfAmountValue,
                SSWType.InterestEarningDividendsGains,
            ].includes(subType)
                ? { text: null }
                : { text: val.duration.text },
            duration: val.duration,
        },
        ...(subType === SSWType.FixDollar && {
            programAmount: {
                text: val.amount?.text,
                amountType: AmountType.Dollar,
            },
        }),
        ...(subType === SSWType.PercentOfAmountValue && {
            partialPercent: {
                text: val.percent?.text,
                amountType: AmountType.Percent,
            },
        }),
    });

    const systematicWithdrawalOptions = [
        {
            label: t('sswProgram.sswOptions.fixedDollar'),
            value: SSWType.FixDollar,
            generateSSWPayloadFromSelection: (val: SSWProgram) =>
                generateSSWPayload(val, SSWType.FixDollar),
        },
        {
            label: t('sswProgram.sswOptions.annualFreeWithdrawal'),
            value: SSWType.AnnualFree,
            generateSSWPayloadFromSelection: (val: SSWProgram) =>
                generateSSWPayload(val, SSWType.AnnualFree),
        },
        {
            label: t('sswProgram.sswOptions.percentageOfAccountValue'),
            value: SSWType.PercentOfAmountValue,
            generateSSWPayloadFromSelection: (val: SSWProgram) =>
                generateSSWPayload(val, SSWType.PercentOfAmountValue),
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

    const getSignaturesConfig = (
        isKeogh: boolean
    ): SignatureValidationConfig[] => [
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
            shouldDisplay: ({
                formSignature,
            }: OtpWithdrawalFormState): boolean => {
                const isMarriedSelected =
                    !!formSignature.signVerificationReason?.some(
                        (reason) =>
                            reason.text ===
                            SignVerificationReason.MarriedWithERISA
                    );
                return isKeogh && isMarriedSelected;
            },
            signatureType: SignatureValidationTypeWithdrawal.Spouse,
        },
    ];

    const signVerificationReasonConfig: SignVerificationReasonItem[] = [
        {
            label: t('signatureValidation.validationReasons.single'),
            value: SignVerificationReason.Single,
        },
        {
            label: t(
                'signatureValidation.validationReasons.marriedWithoutERISA'
            ),
            value: SignVerificationReason.MarriedWithoutERISA,
        },
        {
            label: t('signatureValidation.validationReasons.marriedWithERISA'),
            value: SignVerificationReason.MarriedWithERISA,
        },
    ];

    const getFundWithdrawalDefaultSelection = (sswType: string) => {
        return sswType === SSWType.PercentOfAmountValue
            ? undefined
            : FundWithdrawnMethod.Prorata;
    };

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
        formValidation: sswFormValidation,
        getFundWithdrawalDefaultSelection,
        getSignaturesConfig,
        fundWithdrawnMethodOptions,
        validateMaritalStatusAllowances,
        reasonOptions,
        systematicWithdrawalOptions,
        waiverItemsConfig,
        irsSignatureConfig,
        signVerificationReasonConfig,
        eSignatureFieldConfig,
        w4pSignaturesConfig,
    };
}
