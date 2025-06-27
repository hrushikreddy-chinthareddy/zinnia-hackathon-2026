import {
    PartyRole,
    PartyType,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    DisbursementToggleType,
    FormDisbursementSelections,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import { defaultDisbursmentConsent } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement-parts/consent-available';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import AsOfDateComponent from '@deps/components/otp-withdrawal-form/form-program/as-of-date';
import { PartialWithdrawalOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import { SelectOneOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-process-date';
import { getDefaultFormProgramValues } from '@deps/components/otp-withdrawal-form/form-program/form-program.helpers';
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountCloseReason,
    AccountType,
    AmountType,
    FormDisbursement,
    FormParts,
    FormProgram,
    FormValidationErrors,
    FundWithdrawnMethod,
    LifeCadPartyPersonType,
    LifeCadPartyRoles,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    ProcessRequestType,
    ProgramSubType,
    ProgramType,
    RestrictionOption,
    WithdrawalType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
} from '@deps/models/case/withdrawal/disbursement-types';

import { FormSubtype } from '../flic-withdrawal-form.helpers';

export default function useNasuConfig(t: TFunction) {
    const formValidation = useCallback(
        ({
            formSignature,
            formDisbursement,
        }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;

            const ownerSignature = formSignature?.signatures?.find(
                (sigInfo) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            const jointOwnerSignature = formSignature?.signatures?.find(
                (sigInfo) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.JointOwner
            );

            const annuitantSignature = formSignature?.signatures?.find(
                (sigInfo) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.Annuitant
            );

            // No choice made for signature
            if (
                ownerSignature &&
                ownerSignature?.isSigned !== false &&
                !ownerSignature?.isSigned
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }

            if (
                jointOwnerSignature &&
                jointOwnerSignature?.isSigned !== false &&
                !jointOwnerSignature?.isSigned
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.JointOwner}${SignatureFieldNames.SignaturePresent}`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }
            if (
                annuitantSignature &&
                annuitantSignature?.isSigned !== false &&
                !annuitantSignature?.isSigned
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Annuitant}${SignatureFieldNames.SignaturePresent}`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }

            if (
                formDisbursement?.bank[0].accountType?.text === '' &&
                [PaymentMethod.EFT, PaymentMethod.Wire].includes(
                    formDisbursement?.paymentMethod?.text as PaymentMethod
                ) &&
                formDisbursement?.bank[0].isDirectDeposit?.text
            ) {
                errors[BankingFields.AccountType] = t(
                    'formValidation.accountTypeMustBeSelected'
                );
            }

            return errors;
        },
        [t]
    );

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

    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): { selectedOption: string | null; amount: string | null } => {
        const programTypeText = formProgram?.programType?.text || '';
        const amount = formProgram?.partialAmount?.text || '';

        if (programTypeText === ProgramType.TotalFreeAmt) {
            return { selectedOption: ProgramType.TotalFreeAmt, amount: '' };
        }
        if (programTypeText === ProgramType.FullSurrender) {
            return { selectedOption: ProgramType.FullSurrender, amount: '' };
        }

        if (programTypeText === ProgramType.NetWithdrawal) {
            return { selectedOption: ProgramType.NetWithdrawal, amount };
        }

        if (programTypeText === ProgramType.GrossWithdrawal) {
            return { selectedOption: ProgramType.GrossWithdrawal, amount };
        }

        return { selectedOption: null, amount: '' };
    };

    const partialWithdrawalOptions: PartialWithdrawalOption[] = [
        {
            label: t(
                'amountDetails.partialWithdrawal.freeWithdrawalAmountOnly'
            ),
            value: ProgramType.TotalFreeAmt,
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
            label: t('amountDetails.partialWithdrawal.grossWithdrawal'),
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
    ];

    const disbursementOptions: PaymentMethodOption[] = [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            additionalOptions: {
                disbursementToggleType: DisbursementToggleType.MaskedInfoToggle,
            },
            fields: [
                {
                    fieldName: BankingFields.Bank,
                    fieldLabel: t('distributionMethod.chooseTheBank'),
                    component: DisbursementFields.SelectBank,
                },
                {
                    fieldName: BankingFields.IsDirectDepositValid,
                    fieldLabel: t(
                        'distributionMethod.isDirectDepositFormValid'
                    ),
                    classNames: 'col-start-1',
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
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountName'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    component: DisbursementFields.BankTextField,
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
                {
                    fieldName: BankingFields.BankRoutingNumber,
                    fieldLabel: t('distributionMethod.bankRoutingNumber'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.ConsentAvailable,
                    fieldLabel: t('distributionMethod.consentAvailable'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
            ],

            getDefaultPayload({
                paymentMethod,
                disbursmentConsent,
                bank,
            }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    isDirectDepositValid:
                        selectedBank?.isDirectDepositValid?.text ?? null,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType:
                        selectedBank.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank.bankName ?? '',
                    bankFurtherCreditName:
                        selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount:
                        selectedBank?.bankFurtherCreditAccount ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                    consentAvailable:
                        disbursmentConsent?.isConsent?.text ?? null,
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                isDirectDepositValid,
                accountHolder,
                bankRoutingNumber,
                consentAvailable,
                bankFurtherCreditAccount,
                bankFurtherCreditName,
                maskedAccountNumber,
                isDirectDeposit,
            }: DisbursementParts) => {
                const bank = isDirectDeposit
                    ? [
                          {
                              ...DEFAULT_BANK_DETAILS,
                              maskedAccountNumber: null,
                              accountNumber,
                              accountType: {
                                  text: accountType,
                              },
                              bankName,
                              nameOnBankAccount: accountHolder ?? '',
                              routingNumber: bankRoutingNumber,
                              bankFurtherCreditAccount,
                              bankFurtherCreditName,
                              isDirectDeposit: { text: true },
                              isDirectDepositValid: {
                                  text: isDirectDepositValid,
                              },
                          },
                      ]
                    : [
                          {
                              ...DEFAULT_BANK_DETAILS,
                              isDirectDeposit: { text: false },
                              maskedAccountNumber: maskedAccountNumber ?? null,
                          },
                      ];

                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank,
                    disbursmentConsent: {
                        ...defaultDisbursmentConsent,
                        isConsent: { text: consentAvailable },
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
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.BankName,
                    fieldLabel: t('distributionMethod.bankName'),
                    component: DisbursementFields.BankTextField,
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
                {
                    fieldName: BankingFields.BankRoutingNumber,
                    fieldLabel: t('distributionMethod.bankRoutingNumber'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.ConsentAvailable,
                    fieldLabel: t('distributionMethod.consentAvailable'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                },
            ],

            getDefaultPayload({
                paymentMethod,
                disbursmentConsent,
                bank,
            }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.Wire) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    isDirectDepositValid:
                        selectedBank?.isDirectDepositValid?.text ?? null,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType:
                        selectedBank.accountType?.text ?? AccountType.Checking,
                    bankFurtherCreditName:
                        selectedBank?.bankFurtherCreditName ?? '',
                    bankFurtherCreditAccount:
                        selectedBank?.bankFurtherCreditAccount ?? '',
                    bankName: selectedBank.bankName ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                    consentAvailable:
                        disbursmentConsent?.isConsent?.text ?? null,
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                isDirectDepositValid,
                accountHolder,
                bankRoutingNumber,
                consentAvailable,
                bankFurtherCreditAccount,
                bankFurtherCreditName,
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
                            isDirectDepositValid: {
                                text: isDirectDepositValid ?? null,
                            },
                        },
                    ],

                    disbursmentConsent: {
                        ...defaultDisbursmentConsent,
                        isConsent: { text: consentAvailable },
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
                    disbursmentConsent: defaultDisbursmentConsent,
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

    const formPartyConfigs: PartyConfig[] = [
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

    const reasonOptions = [
        {
            label: t('distributionReason.reasonOptions.age595'),
            value: RestrictionOption.Age595,
        },
        {
            label: t('distributionReason.reasonOptions.disabled'),
            value: RestrictionOption.Disabled,
        },
        {
            label: t('distributionReason.reasonOptions.severance'),
            value: RestrictionOption.Severance,
            subElement: <ReasonDate />,
        },
        {
            label: t('distributionReason.reasonOptions.hardship'),
            value: RestrictionOption.Hardship,
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

    const cslnCheckStates = ['CA'];

    const defaultValues = {
        disbursementOption: FormDisbursementSelections.Check,
    };

    const fullWithdrawalOptions = [
        {
            label: t(
                'amountDetails.fullWithdrawal.withdrawTheEntireContractValue'
            ),
            value: AccountCloseReason.Surrender,
        },
        {
            label: t('amountDetails.fullWithdrawal.contractIsAttached'),
            value: AccountCloseReason.ContractAttached,
        },
        {
            label: t(
                'amountDetails.fullWithdrawal.contractHasBeenLostOrDestroyed'
            ),
            value: AccountCloseReason.ContractLost,
        },
    ];

    const handleShouldShowDOBInOl4573LC = (
        parties: LifeCadParty[] | undefined
    ): boolean => {
        // CMW-21591 (Only applicable for NASU)
        const partyDetails = parties?.find(
            (party: LifeCadParty) =>
                party.Role === LifeCadPartyRoles.PrimaryOwner
        );

        const personTypeIndividual =
            partyDetails?.PersonType === LifeCadPartyPersonType.Individual;
        return personTypeIndividual;
    };

    const handleShouldShowDOBInOl4573 = (
        parties: any[] | undefined,
        partyRoles: PolicyPartyRoles[]
    ): boolean => {
        // CMW-21591 (Only applicable for NASU)
        const owner = partyRoles?.find(
            (pr) => pr.partyRole === PartyRole.OWNER
        );
        const partyDetails = parties?.find(
            (party) => party?.partyRoleId === owner?.partyRoleId
        );
        return partyDetails?.partyType === PartyType.INDIVIDUAL;
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
        disbursementOptions,
        formSubtypeOptions,
        formPartyConfigs,
        formValidation,
        signaturesConfig,
        signaturesNotaryConfig,
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        partialWithdrawalOptions,
        selectOneOptions,
        cslnCheckStates,
        fullWithdrawalOptions,
        reasonOptions,
        defaultValues,
        handleShouldShowDOBInOl4573,
        handleShouldShowDOBInOl4573LC,
        w4pSignaturesConfig,
        eSignatureFieldConfig,
    };
}
