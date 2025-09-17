import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import { ESignature } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import { defaultDisbursmentConsent } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement-parts/consent-available';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import {
    ESignatureValidationTypeWithdrawal,
    SignatureValidationTypeWithdrawal,
} from '@deps/models/case/renewal/signature-validation';
import {
    FormParts,
    FormValidationErrors,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    SSWType,
    Frequency,
    AmountType,
    ProgramType,
    AddressTypes,
    AccountType,
    FormDisbursement,
    LifeCadPartyRoles,
    LifeCadPartyPersonType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    DisbursementToggleType,
    FormDisbursementSelections,
    PaymentMethodOption,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';

export default function useNassauConfig(t: TFunction) {
    const formValidation = useCallback(
        ({
            formSignature,
            formDisbursement,
            formESignatureData,
        }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;

            const ownerSignature = formSignature?.signatures?.find(
                (sigInfo) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            const ownerEsignature = formESignatureData?.eSignatures?.find(
                (sigInfo: ESignature) =>
                    sigInfo?.signType?.text ===
                    SignatureValidationTypeWithdrawal.Owner
            );

            if (
                ownerSignature?.isSigned !== false &&
                !ownerSignature?.isSigned
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }

            if (
                [PaymentMethod.EFT].includes(
                    formDisbursement?.paymentMethod?.text as PaymentMethod
                ) &&
                formDisbursement?.bank[0].isDirectDeposit?.text
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
                [PaymentMethod.EFT].includes(
                    formDisbursement?.paymentMethod?.text as PaymentMethod
                ) &&
                formDisbursement?.bank[0].isDirectDeposit?.text
            ) {
                errors[BankingFields.AccountType] = t(
                    'formValidation.accountTypeMustBeSelected'
                );
            }

            if (
                formESignatureData?.isFormESignaturePresent &&
                ownerEsignature?.isSigned === null
            ) {
                errors[
                    `${ESignatureValidationTypeWithdrawal.Owner}-signPresent`
                ] = t('formValidation.signaturePresentOptionMustBeSelected');
            }
            return errors;
        },
        [t]
    );

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
            ],
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
                SSWType.GMWB,
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
            label: t('sswProgram.sswOptions.interestEarningDividendsGains'),
            value: SSWType.InterestEarningDividendsGains,
            generateSSWPayloadFromSelection: (val: SSWProgram) =>
                generateSSWPayload(val, SSWType.InterestEarningDividendsGains),
        },
        {
            label: t('sswProgram.sswOptions.gmwb'),
            value: SSWType.GMWB,
            generateSSWPayloadFromSelection: (val: SSWProgram) =>
                generateSSWPayload(val, SSWType.GMWB),
        },
    ];

    const fundWithdrawnMethodOptions = [
        {
            label: t(`distributionInstruction.prorata`),
            value: FundWithdrawnMethod.Prorata,
        },
        {
            label: t(`distributionInstruction.specifyFunds`),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const defaultValues = {
        disbursementOption: FormDisbursementSelections.Check,
    };

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
                    maskOnBlur: true,
                    disableCopyPaste: true,
                    classNames: 'col-start-1',
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
                    fieldLabel: t('distributionMethod.accountName'),
                    component: DisbursementFields.BankTextField,
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditName,
                    fieldLabel: t('distributionMethod.bankFurtherCreditName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.BankFurtherCreditAccount,
                    fieldLabel: t(
                        'distributionMethod.bankFurtherCreditAccount'
                    ),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.ConsentAvailable,
                    fieldLabel: t('distributionMethod.consentAvailable'),
                    component: DisbursementFields.BankBooleanButtonGroup,
                    classNames: 'col-start-1',
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
                                  text: isDirectDepositValid ?? null,
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

    const handleShouldShowDOBInOl4573 = (
        parties: LifeCadParty[] | undefined
    ): boolean => {
        const partyDetails = parties?.find(
            (party: LifeCadParty) =>
                party.Role === LifeCadPartyRoles.PrimaryOwner
        );
        const personTypeIndividual =
            partyDetails?.PersonType === LifeCadPartyPersonType.Individual;
        return personTypeIndividual;
    };

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
        formPartyConfigs,
        formValidation,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        signaturesConfig,
        signaturesNotaryConfig,
        defaultValues,
        handleShouldShowDOBInOl4573,
        w4pSignaturesConfig,
        eSignatureFieldConfig,
    };
}
