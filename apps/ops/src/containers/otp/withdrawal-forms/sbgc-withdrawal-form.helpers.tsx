import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
    updateBankingDetails,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { BankingDetails } from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { Description } from '@deps/components/otp-withdrawal-form/form-restriction/description';
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import {
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AddressTypes,
    EmergencyOption,
    FormDisbursement,
    FormParts,
    FormValidationErrors,
    FundWithdrawnMethod,
    HardshipOption,
    MoneyType,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    RestrictionOption,
    AccountType,
    ProgramType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../utils/helper-utils';

export default function getSbgcConfig(t: TFunction) {
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
                    component: SignatureFields.SignatureDesignation,
                    key: 'beneficiary-designation',
                },
                {
                    component: SignatureFields.SignatureDate,
                    key: 'beneficiary-date',
                },
            ],
            signatureType:
                SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
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
            // &&
            // bankDetails?.selectedBanking === SelectedBanking.New
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
        if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
            ] = t('formValidation.signaturePresentOptionMustBeSelected');
        }

        if (ownerSignature?.isDesignationPresent === null) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignatureDesignation}`
            ] = t('formValidation.signatureDesignationMustBeSelected');
        }

        if (
            formDisbursement?.bank[0].accountType?.text === '' &&
            [PaymentMethod.EFT, PaymentMethod.Wire].includes(
                formDisbursement?.paymentMethod?.text as PaymentMethod
            )
            // &&
            // bankDetails?.selectedBanking === SelectedBanking.New
        ) {
            errors[BankingFields.AccountType] = t(
                'formValidation.accountTypeMustBeSelected'
            );
        }
        return errors;
    };

    const disbursementOptions = (withdrawalType: string) => {
        const data = [
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
                        fieldName: BankingFields.ChooseBankingType,
                        fieldLabel: t('distributionMethod.chooseTheBank'),
                        fieldType: 'choose-the-banking-type',
                        classNames: 'col-start-1 col-span-2 mt-2',
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
                        fieldLabel: t(
                            'distributionMethod.reEnterAccountNumber'
                        ),
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
                ],
                getDefaultPayload({ paymentMethod, bank }: FormDisbursement) {
                    if (paymentMethod.text !== PaymentMethod.EFT) {
                        return DEFAULT_DISBURSEMENT_UPDATE;
                    }
                    const selectedBank = bank[0];
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountHolder: selectedBank.nameOnBankAccount ?? '',
                        accountNumber: selectedBank.accountNumber ?? '',
                        accountType:
                            selectedBank.accountType?.text ??
                            AccountType.Checking,
                        bankRoutingNumber: selectedBank.routingNumber ?? '',
                    };
                },
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
                                accountType: {
                                    text: bank?.accountType?.text,
                                },
                                bankName: bank?.bankName ?? '',
                                routingNumber: bank?.bankRoutingNumber ?? '',
                            },
                        ],
                        bankVerification:
                            defaultDisbursementInfo?.bankVerification ?? null,
                    };
                },
            },
            {
                label: t('distributionMethod.wire'),
                value: FormDisbursementSelections.Wire,
                fields: [
                    {
                        fieldLabel: t('distributionMethod.chooseTheBank'),
                        fieldName: BankingFields.Bank,
                        fieldType: 'choose-the-bank',
                    },
                    {
                        fieldName: BankingFields.ChooseBankingType,
                        fieldLabel: t('distributionMethod.chooseTheBank'),
                        fieldType: 'choose-the-banking-type',
                        classNames: 'col-start-1 col-span-2 mt-2',
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
                        fieldLabel: t(
                            'distributionMethod.reEnterAccountNumber'
                        ),
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
                ],
                getDefaultPayload({ paymentMethod, bank }: FormDisbursement) {
                    if (paymentMethod.text !== PaymentMethod.Wire) {
                        return DEFAULT_DISBURSEMENT_UPDATE;
                    }
                    const selectedBank = bank[0];
                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountHolder: selectedBank.nameOnBankAccount ?? '',
                        accountNumber: selectedBank.accountNumber ?? '',
                        accountType:
                            selectedBank.accountType?.text ??
                            AccountType.Checking,
                        bankRoutingNumber: selectedBank.routingNumber ?? '',
                        bankName: selectedBank.bankName ?? '',
                    };
                },
                generatePayloadFromSelection: (
                    defaultDisbursementInfo: any
                ) => {
                    const bank = defaultDisbursementInfo?.bank?.[0];

                    return {
                        ...getDefaultFormDisbursementValues(),
                        paymentMethod: { text: PaymentMethod.Wire || '' },
                        paymentMailType: { text: null },
                        bank: [
                            {
                                ...DEFAULT_BANK_DETAILS,
                                accountNumber: bank?.accountNumber ?? '',
                                accountType: {
                                    text: bank?.accountType,
                                },
                                bankName: bank?.bankName ?? '',
                                routingNumber: bank?.bankRoutingNumber,
                                reEnterAccountNumber:
                                    bank?.reEnterAccountNumber,
                                reEnterBankRoutingNumber:
                                    bank?.reEnterBankRoutingNumber,
                            },
                        ],
                        bankVerification:
                            defaultDisbursementInfo?.bankVerification ?? null,
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
                    return {
                        ...getDefaultFormDisbursementValues(),
                        paymentMethod: { text: PaymentMailType.Check },
                        paymentMailType: { text: PaymentMailType.ExpressCheck },
                    };
                },
            },
            {
                label: t('distributionMethod.brokerageAccount'),
                value: FormDisbursementSelections.Brokerage,
                fields: [
                    {
                        fieldName: BankingFields.AccountNumber,
                        fieldLabel: t('distributionMethod.accountNumber'),
                        fieldType: 'text',
                        classNames: 'col-start-1',
                    },
                    {
                        fieldName: BankingFields.CompanyName,
                        fieldLabel: t('distributionMethod.companyName'),
                        fieldType: 'text',
                        classNames: 'col-start-2',
                    },

                    {
                        fieldName: BankingFields.Address,
                        fieldLabel: '',
                        component: DisbursementFields.BankAddress,
                        fieldType: 'address',
                        classNames: 'col-start-1 col-span-2 w-full',
                    },
                    {
                        fieldName: BankingFields.AcordAttached,
                        fieldLabel: t('distributionMethod.acordFormReceived'),
                        component: DisbursementFields.BankCheckboxField,
                        classNames: 'col-start-1',
                        fieldType: 'checkbox',
                    },
                ],
                getDefaultPayload({
                    paymentMethod,
                    brokerage,
                }: FormDisbursement) {
                    if (paymentMethod.text !== PaymentMethod.Brokerage) {
                        return DEFAULT_DISBURSEMENT_UPDATE;
                    }

                    return {
                        ...DEFAULT_DISBURSEMENT_UPDATE,
                        accountNumber: brokerage?.accountNumber ?? '',
                        companyName: brokerage?.companyName ?? '',
                        acordAttached: brokerage?.acordAttached ?? null,
                        address: brokerage?.address ?? DEFAULT_ADDRESS,
                    };
                },
                generatePayloadFromSelection: ({
                    address,
                    accountNumber,
                    acordAttached,
                    companyName,
                }: DisbursementParts) => {
                    return {
                        ...getDefaultFormDisbursementValues(),
                        paymentMethod: { text: PaymentMethod.Brokerage },
                        paymentToBrokerageAccount: true,
                        brokerage: {
                            companyName: companyName ?? '',
                            accountNumber: accountNumber ?? '',
                            acordAttached: acordAttached ?? null,
                            address: address || DEFAULT_ADDRESS,
                        },
                    };
                },
            },
            withdrawalType && withdrawalType !== ProgramType.Full
                ? {
                      label: t('distributionMethod.alternatePayee'),
                      value: FormDisbursementSelections.AlternatePayeeAddress,
                      fields: [
                          {
                              fieldName: 'name',
                              fieldLabel: t('distributionMethod.payeeName'),
                              maxLength: 40,
                              fieldType: 'text',
                              classNames: 'col-start-1',
                          },
                          {
                              fieldName: BankingFields.FboDetails,
                              fieldLabel: t('distributionMethod.fboDetails'),
                              fieldType: 'text',
                              maxLength: 35,
                              classNames: 'col-start-2',
                          },
                          {
                              fieldName: BankingFields.Address,
                              fieldType: 'address',
                              classNames: 'col-start-1 col-span-2 w-full',
                          },
                      ],
                      getDefaultPayload({
                          paymentMethod,
                          payee,
                      }: FormDisbursement) {
                          if (
                              paymentMethod.text !==
                              PaymentMethod.AlternatePayeeAddress
                          ) {
                              return DEFAULT_DISBURSEMENT_UPDATE;
                          }

                          return {
                              ...DEFAULT_DISBURSEMENT_UPDATE,
                              payeeName: payee?.name?.text ?? '',
                              address: payee?.addresses[0] ?? DEFAULT_ADDRESS,
                              fboDetails: payee?.fboDetails?.text || '',
                          };
                      },
                      generatePayloadFromSelection: ({
                          payeeName,
                          address,
                          fboDetails,
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
                                  fboDetails: { text: fboDetails ?? null },
                              },
                          };
                      },
                  }
                : null,
        ];
        return data.filter((item) => item !== null);
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

    const fundWithdrawnMethodOptions = [
        {
            label: t(`distributionInstruction.default`),
            value: FundWithdrawnMethod.Default,
        },
        {
            label: t(`distributionInstruction.specifyFunds`),
            value: FundWithdrawnMethod.SpecifyFunds,
        },
    ];

    const moneyTypeOptions = [
        {
            label: t(`distributionInstruction.preTaxBalance`),
            value: MoneyType.PreTaxBalance,
        },
        {
            label: t(`distributionInstruction.afterTaxRothBalance`),
            value: MoneyType.AfterTaxRothBalance,
        },
        {
            label: t(`distributionInstruction.prorata`),
            value: MoneyType.ProRata,
        },
    ];

    const hardshipOptions = [
        {
            label: t('distributionReason.hardshipOptions.purchResidence'),
            value: HardshipOption.PurchaseResidence,
        },
        {
            label: t('distributionReason.hardshipOptions.eviction'),
            value: HardshipOption.Eviction,
        },
        {
            label: t('distributionReason.hardshipOptions.foreclosure'),
            value: HardshipOption.Foreclosure,
        },
        {
            label: t('distributionReason.hardshipOptions.medicalExpenses'),
            value: HardshipOption.MedicalExpenses,
        },
        {
            label: t('distributionReason.hardshipOptions.education'),
            value: HardshipOption.Education,
        },
        {
            label: t('distributionReason.hardshipOptions.funeral'),
            value: HardshipOption.Funeral,
        },
        {
            label: t('distributionReason.hardshipOptions.casualtyExpense'),
            value: HardshipOption.CasualtyExpense,
        },
        {
            label: t('distributionReason.hardshipOptions.federalDisaster'),
            value: HardshipOption.FederalDisaster,
        },
    ];

    const unforeseeableEmergencyOptions = [
        {
            label: t(
                'distributionReason.unforeseeableEmergencyOptions.unexpectedIll'
            ),
            value: EmergencyOption.UnexpectedIllness,
        },
        {
            label: t(
                'distributionReason.unforeseeableEmergencyOptions.lossOfProp'
            ),
            value: EmergencyOption.LossOfProperty,
        },
        {
            label: t(
                'distributionReason.unforeseeableEmergencyOptions.beyondControl'
            ),
            value: EmergencyOption.BeyondControl,
            subElement: <Description />,
        },
    ];

    const reasonOptions = [
        {
            label: t('distributionReason.reasonOptions.age595'),
            value: RestrictionOption.Age595,
        },
        {
            label: t('distributionReason.reasonOptions.overAge705'),
            value: RestrictionOption.OverAge705,
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
            label: t('distributionReason.reasonOptions.planTermination'),
            value: RestrictionOption.PlanTermination,
        },
        {
            label: t('distributionReason.reasonOptions.inSvcDistrib'),
            value: RestrictionOption.InServiceDistribution,
        },
        {
            label: t('distributionReason.reasonOptions.adoptionChildBirth'),
            value: RestrictionOption.AdoptionChildBirth,
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

    const programTypes = [
        {
            label: t(`amountDetails.programTypes.full`),
            value: ProgramType.Full,
        },
        {
            label: t(`amountDetails.programTypes.partial`),
            value: ProgramType.Partial,
        },
        {
            label: t(`amountDetails.programTypes.totalFreeAmt`),
            value: ProgramType.TotalFreeAmt,
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
        w4pSignaturesConfig,
        signaturesConfig,
        fundWithdrawnMethodOptions,
        moneyTypeOptions,
        unforeseeableEmergencyOptions,
        hardshipOptions,
        reasonOptions,
        disbursementOptions,
        programTypes,
        eSignatureFieldConfig,
    };
}
