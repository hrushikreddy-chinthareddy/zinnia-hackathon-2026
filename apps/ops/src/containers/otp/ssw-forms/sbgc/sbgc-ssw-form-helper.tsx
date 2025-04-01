import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { ReasonDate } from '@deps/components/otp-withdrawal-form/form-restriction/reason-date';
import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helper';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import sbgcConfig from '@deps/containers/otp/withdrawal-forms/sbgc-withdrawal-form.helper';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    AmountType,
    FormDisbursement,
    FormParts,
    FormValidationErrors,
    Frequency,
    FundWithdrawnMethod,
    LifeCadPartyRoles,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    RestrictionOption,
    SSWType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';

export default function useSbgcConfig(t: TFunction) {
    const { formValidation } = sbgcConfig(t);

    const sswFormValidation = ({ formParty, formSignature, formDisbursement }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({ formParty, formSignature, formDisbursement });
        if ([PaymentMethod.EFT].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].accountNumber !== formDisbursement?.bank[0].reEnterAccountNumber
            ) {
                errors[BankingFields.ReEnterAccountNumber] = t('formValidation.accountNumberDoesNotMatch');
            }
            if (
                formDisbursement?.bank[0].bankName === '' &&
                formDisbursement?.bank[0].routingNumber !== formDisbursement?.bank[0].reEnterBankRoutingNumber
            ) {
                errors[BankingFields.ReEnterBankRoutingNumber] = t('formValidation.routingNumberDoesNotMatch');
            }
        }

        return errors;
    };

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
            label: t('distributionReason.reasonOptions.internalRevCode72'),
            value: RestrictionOption.InternalRevenueCode72,
        },
        {
            label: t('distributionReason.reasonOptions.inSvcDistrib'),
            value: RestrictionOption.InServiceDistribution,
        },
        {
            label: t('distributionReason.reasonOptions.unRestrictedAccount'),
            value: RestrictionOption.UnrestrictedAccount,
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
                    fieldLabel: t('distributionMethod.doesCheckMeetSecurityRequirements'),
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
                    validator: createValidator('accountNumber', t('formValidation.accountNumberDoesNotMatch')),
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
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('distributionMethod.accountHolder'),
                    component: DisbursementFields.BankTextField,
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
            label: t('distributionMethod.alternatePayee'),
            value: FormDisbursementSelections.AlternatePayeeAddress,
            fields: [
                {
                    fieldName: BankingFields.PayeeName,
                    fieldLabel: t('distributionMethod.payeeName'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 40,
                },
                {
                    fieldName: BankingFields.FboDetails,
                    fieldLabel: t('distributionMethod.fboDetails'),
                    component: DisbursementFields.BankTextField,
                    maxLength: 35,
                },
                {
                    fieldName: BankingFields.Address,
                    component: DisbursementFields.BankAddress,
                    fieldLabel: '',
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
                    fboDetails: payee?.fboDetails?.text || '',
                };
            },
            generatePayloadFromSelection: ({ payeeName, address, fboDetails }: DisbursementParts) => {
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
                        fboDetails: { text: fboDetails ?? null },
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

    const coveredPartyConfigs: PartyConfig[] = [
        {
            partyRoleType: PartyRoles.JOINTCOVEREDPERSON,
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
    ];

    const fundWithdrawnMethodOptions = [
        { label: t(`distributionInstruction.prorata`), value: FundWithdrawnMethod.Prorata },
        { label: t(`distributionInstruction.specifyFunds`), value: FundWithdrawnMethod.SpecifyFunds },
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
                // Checking the beneficiary in LC parties
                return !!parties?.find(party => party.Role === LifeCadPartyRoles.Beneficiary);
            },
        },
    ];

    const generateSSWPayload = (val: SSWProgram, subType: SSWType) => ({
        ...getDefaultSSWFormProgramValues(),
        programSubType: {
            text: subType,
        },
        programFrequency: {
            frequency: val.frequency.text === Frequency.None ? { text: '' as Frequency } : val.frequency,
            beginDate: val.startDate,
            fixedPeriodYear: [SSWType.FixPeriod].includes(subType) ? val.depleteFundYears : { text: null },
            duration: [SSWType.FixPeriod].includes(subType) ? { text: null } : val.duration,
        },
        ...(subType === SSWType.FixDollar && { programAmount: { text: val.amount?.text, amountType: AmountType.Dollar } }),
    });

    const systematicWithdrawalOptions = [
        {
            label: t('sswProgram.sswOptions.fixedDollar'),
            value: SSWType.FixDollar,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.FixDollar),
        },
        {
            label: t('sswProgram.sswOptions.fixedPeriodIncome'),
            value: SSWType.FixPeriod,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.FixPeriod),
        },
        {
            label: t('sswProgram.sswOptions.annualFreeWithdrawal'),
            value: SSWType.AnnualFree,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.AnnualFree),
        },
        {
            label: t('sswProgram.sswOptions.percentageOfAccountValue'),
            value: SSWType.PercentOfAmountValue,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.PercentOfAmountValue),
        },

        {
            label: t('sswProgram.sswOptions.singleLifetimeIncomeOption'),
            value: SSWType.SingleLifetimeIncomeOption,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.SingleLifetimeIncomeOption),
        },
        {
            label: t('sswProgram.sswOptions.jointLifetimeIncomeOption'),
            value: SSWType.JointLifetimeIncomeOption,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.JointLifetimeIncomeOption),
        },
        {
            label: t('sswProgram.sswOptions.interestEarningDividendsGains'),
            value: SSWType.InterestEarningDividendsGains,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.InterestEarningDividendsGains),
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

    return {
        disbursementOptions,
        formPartyConfigs,
        formValidation: sswFormValidation,
        signaturesConfig,
        fundWithdrawnMethodOptions,
        coveredPartyConfigs,
        reasonOptions,
        systematicWithdrawalOptions,
        w4pSignaturesConfig,
    };
}
