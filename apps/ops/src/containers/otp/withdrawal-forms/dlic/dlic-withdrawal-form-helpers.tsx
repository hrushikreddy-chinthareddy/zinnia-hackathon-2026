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
import AsOfDateComponent from '@deps/components/otp-withdrawal-form/form-program/as-of-date';
import { PartialWithdrawalOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import { SelectOneOption } from '@deps/components/otp-withdrawal-form/form-program/form-program-process-date';
import { getDefaultFormProgramValues } from '@deps/components/otp-withdrawal-form/form-program/form-program.helpers';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    AmountType,
    FormDisbursement,
    FormParts,
    FormProgram,
    FormValidationErrors,
    FundWithdrawnMethod,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    ProcessRequestType,
    ProgramSubType,
    ProgramType,
    RestrictionOption,
    TaxWithholdingPlace,
    WithdrawalType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    DisbursementToggleType,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';

export default function useDlicConfig(t: TFunction) {
    const formValidation = useCallback(
        ({
            formSignature,
            formDisbursement,
        }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;
            if (
                [PaymentMethod.Wire].includes(
                    formDisbursement?.paymentMethod?.text as PaymentMethod
                ) ||
                ([PaymentMethod.EFT].includes(
                    formDisbursement?.paymentMethod?.text as PaymentMethod
                ) &&
                    formDisbursement?.bank[0].isDirectDeposit?.text &&
                    !formDisbursement?.bank[0]?.maskedAccountNumber)
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

            // No choice made for signature
            if (
                ownerSignature?.isSigned !== false &&
                !ownerSignature?.isSigned
            ) {
                errors[
                    `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
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
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'owner-sign-guarantee-stamp',
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
                {
                    component: SignatureFields.SignGuaranteeStamp,
                    key: 'joint-sign-guarantee-stamp',
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

    const identifySelectedFormProgramOption = (
        formProgram: FormProgram
    ): { selectedOption: string | null; amount: string | null } => {
        const programTypeText = formProgram?.programType?.text || '';
        if (programTypeText === ProgramType.TotalFreeAmt) {
            return { selectedOption: ProgramType.TotalFreeAmt, amount: '' };
        }
        if (programTypeText === ProgramType.FullSurrender) {
            return { selectedOption: ProgramType.FullSurrender, amount: '' };
        }
        if (programTypeText === ProgramType.Withdrawal) {
            const amount = formProgram?.partialAmount?.text || '';
            return {
                selectedOption:
                    formProgram?.withdrawType?.text === WithdrawalType.Gross
                        ? ProgramType.GrossWithdrawal
                        : ProgramType.NetWithdrawal,
                amount,
            };
        }
        return { selectedOption: null, amount: '' };
    };

    const partialWithdrawalOptions: PartialWithdrawalOption[] = [
        {
            label: t('amountDetails.programTypes.annualFreeAmountBalance'),
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
            label: t('amountDetails.partialWithdrawal.specificAmountGross'),
            value: ProgramType.GrossWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.Withdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                };
            },
        },
        {
            label: t('amountDetails.partialWithdrawal.specificAmountNet'),
            value: ProgramType.NetWithdrawal,
            amountFieldType: AmountType.Dollar,
            generatePayloadFromSelection: (val = null) => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Net },
                    programType: { text: ProgramType.Withdrawal },
                    partialAmount: { text: val, amountType: AmountType.Dollar },
                };
            },
        },
        {
            label: t('amountDetails.programTypes.full'),
            value: ProgramType.FullSurrender,
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormProgramValues(),
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.FullSurrender },
                    programSubType: { text: ProgramSubType.FullSurrender },
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
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
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
            ],
            getDefaultPayload({ paymentMethod, bank }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];

                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    isDirectDepositValid:
                        selectedBank?.isDirectDepositValid?.text ?? true,
                    accountHolder: selectedBank?.nameOnBankAccount ?? '',
                    accountNumber: selectedBank?.accountNumber ?? '',
                    accountType:
                        selectedBank?.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank?.bankName ?? '',
                    bankRoutingNumber: selectedBank?.routingNumber ?? '',
                    bankFurtherCreditAccount:
                        selectedBank?.bankFurtherCreditAccount ?? '',
                    bankFurtherCreditName:
                        selectedBank?.bankFurtherCreditName ?? '',
                    isDirectDeposit:
                        selectedBank?.isDirectDeposit?.text ?? true,
                    maskedAccountNumber:
                        selectedBank?.maskedAccountNumber ?? '',
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
                isDirectDepositValid,
                maskedAccountNumber,
                isDirectDeposit,
                reEnterAccountNumber,
                reEnterBankRoutingNumber,
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
                              reEnterAccountNumber,
                              reEnterBankRoutingNumber,
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
                    bank: bank,
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
                    fieldName: BankingFields.AccountNumber,
                    fieldLabel: t('distributionMethod.accountNumber'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
                    maskOnBlur: true,
                    disableCopyPaste: true,
                    isBankingField: true,
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
                    isBankingField: true,
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
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountName'),
                    component: DisbursementFields.BankTextField,
                    classNames: 'col-start-1',
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
                    accountHolder: selectedBank?.nameOnBankAccount ?? '',
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
                    voidCheck: isVoidCheckAttached || null,
                    doesCheckMeetSecRequiremnt:
                        doesCheckMeetSecurityRequirements || null,
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
                    component: DisbursementFields.BankCheckboxField,
                    classNames: 'col-start-1 col-span-3',
                },
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    classNames: 'col-start-1 col-span-2 max-w-lg',
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    classNames: 'col-span-3',
                    component: DisbursementFields.BankAddress,
                },
            ],
            getDefaultPayload: ({
                paymentMethod,
                paymentMailType,
                isDifferentPayeeOrAddress,
                payee,
            }: FormDisbursement) => {
                if (
                    paymentMethod.text === PaymentMailType.Check &&
                    paymentMailType.text === null
                ) {
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        selectIfPayeeIsDifferent:
                            isDifferentPayeeOrAddress.text ?? '',
                        address: payee?.addresses?.[0] || DEFAULT_ADDRESS,
                        payeeName: payee?.name?.text ?? '',
                    };
                }
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
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
            label: t('distributionMethod.overnightCheck'),
            value: FormDisbursementSelections.ExpressCheck,
            fields: null,
            getDefaultPayload: () => {
                return DEFAULT_DISBURSEMENT_UPDATE;
            },
            generatePayloadFromSelection: () => {
                return {
                    ...getDefaultFormDisbursementValues(),
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
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
                    isReadonly: true,
                },
            ],
            isAddressChanged: {
                addressType: AddressTypes.DEFAULT,
                title: t('addressDetails.checkHereIfYourAddressHasChanged'),
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
            label: t(
                'amountDetails.processTimeframe.withdrawalUponContractMaturity'
            ),
            value: ProcessRequestType.NoLongerSubject,
        },
        {
            label: t('amountDetails.processTimeframe.asOfThisDate'),
            value: ProcessRequestType.AsOfDate,
            subElement: <AsOfDateComponent />,
        },
    ];

    const additionalWithholdingAmountConfig = {
        [TaxWithholdingPlace.Federal]: { amountType: AmountType.Percent },
    };

    const cslnCheckStates = ['CA', 'CO', 'TX'];
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

    const hasPreviousNigoPlanCodes = ['674', '722'];

    return {
        disbursementOptions,
        formPartyConfigs,
        formValidation,
        signaturesConfig,
        signaturesNotaryConfig,
        additionalWithholdingAmountConfig,
        fundWithdrawnMethodOptions,
        identifySelectedFormProgramOption,
        partialWithdrawalOptions,
        selectOneOptions,
        cslnCheckStates,
        w4pSignaturesConfig,
        eSignatureFieldConfig,
        reasonOptions,
        hasPreviousNigoPlanCodes,
    };
}
