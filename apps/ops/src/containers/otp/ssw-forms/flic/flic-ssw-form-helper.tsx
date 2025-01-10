import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';
import { useCallback } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import {
    SignatureFieldNames,
    SignatureBonusFields,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helper';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
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
    SSWType,
    Frequency,
    AmountType,
    AddressTypes,
    FormDisbursement,
    AccountType,
    QualTypes,
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
import { spousalSignatureStateCodes } from '../../withdrawal-forms/flic-withdrawal-form.helper';

export default function useFlicSSWConfig(t: TFunction) {
    const formValidation = useCallback(
        ({ formSignature, formDisbursement }: Partial<FormParts> = {}): FormValidationErrors => {
            const errors = {} as FormValidationErrors;

            const ownerSignature = formSignature?.signatures?.find(
                sigInfo => sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner
            );

            if ([PaymentMethod.EFT].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
                if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].accountNumber !== formDisbursement?.bank[0].reEnterAccountNumber) {
                    errors[BankingFields.ReEnterAccountNumber] = t('formValidation.accountNumberDoesNotMatch');
                }
                if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].routingNumber !== formDisbursement?.bank[0].reEnterBankRoutingNumber) {
                    errors[BankingFields.ReEnterBankRoutingNumber] = t('formValidation.routingNumberDoesNotMatch');
                }
            }

            // No choice made for signature
            if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
                errors[`${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`] = t(
                    'formValidation.signaturePresentOptionMustBeSelected'
                );
            }

            if (formDisbursement?.bank[0].accountType?.text === '' && [PaymentMethod.EFT].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
                errors[BankingFields.AccountType] = t('formValidation.accountTypeMustBeSelected');
            }
            return errors;
        },
        [t]
    );

    const sswFormValidation = ({
        formParty,
        formSignature,
        formProgram,
        formDistribution,
        formDisbursement
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({ formParty, formSignature, formDisbursement });
        const sswProgramStartDate = formProgram?.programFrequency?.beginDate?.text || null;
        const sswType = formProgram?.programSubType?.text || '';
        const funds = formDistribution?.funds.filter(fund => !!fund.amount.text);

        if (sswProgramStartDate && [29, 30, 31].includes(dayjs(sswProgramStartDate, ZAHARA_API_DATE_FORMAT).get('D'))) {
            errors['systematicStartDate'] = t('sswProgram.warnings.systematicStartDate', { startDate: 1, endDate: 28 });
        }

        if (sswType === SSWType.PercentOfAmountValue && funds?.length === 0) {
            errors['specifyFundsRequired'] = t('sswProgram.warnings.specifyFundsRequired');
        }
        return errors;
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

    const generateSSWPayload = (val: SSWProgram, subType: SSWType) => ({
        ...getDefaultSSWFormProgramValues(),
        programSubType: {
            text: subType,
        },
        programFrequency: {
            frequency: val.frequency.text === Frequency.None ? { text: '' as Frequency } : val.frequency,
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
        ...(subType === SSWType.FixDollar && { programAmount: { text: val.amount?.text, amountType: AmountType.Dollar } }),
        ...(subType === SSWType.PercentOfAmountValue && { partialPercent: { text: val.percent?.text, amountType: AmountType.Percent } }),
    });

    const systematicWithdrawalOptions = [
        {
            label: t('sswProgram.sswOptions.fixedDollar'),
            value: SSWType.FixDollar,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.FixDollar),
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
            label: t('sswProgram.sswOptions.interestEarningDividendsGains'),
            value: SSWType.InterestEarningDividendsGains,
            generateSSWPayloadFromSelection: (val: SSWProgram) => generateSSWPayload(val, SSWType.InterestEarningDividendsGains),
        },
    ];

    const fundWithdrawnMethodOptions = (sswType: string) => [
        {
            label: t(`distributionInstruction.prorata`),
            value: FundWithdrawnMethod.Prorata,
            disabled: sswType === SSWType.PercentOfAmountValue,
        },
        { label: t(`distributionInstruction.specifyFunds`), value: FundWithdrawnMethod.SpecifyFunds },
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

    const checkQualType = (qualType: string) => {
        if (
            qualType === QualTypes.CustInhIRA ||
            qualType === QualTypes.CustInhRothIRA ||
            qualType === QualTypes.CustRolloverIRA ||
            qualType === QualTypes.CustSARSEPIRA ||
            qualType === QualTypes.CustSimpleIRA ||
            qualType === QualTypes.CustSpousalIRA ||
            qualType === QualTypes.CustodialIRA ||
            qualType === QualTypes.CustodialQLACIRA ||
            qualType === QualTypes.CustodialRothIRA
        )
            return true;

        return false;
    };

    const disbursementOptions = (frequency: Frequency, qualType: string): PaymentMethodOption[] => [
        {
            label: t('distributionMethod.eft'),
            value: FormDisbursementSelections.EFT,
            disabled: frequency === Frequency.Monthly && false,
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
                    isBankingField: true,
                    classNames: 'col-start-1',
                },
                {
                    fieldName: BankingFields.BankFurtherCreditName,
                    fieldLabel: t('distributionMethod.bankFurtherCreditName'),
                    component: DisbursementFields.BankTextField,
                },
                {
                    fieldName: BankingFields.BankFurtherCreditAccount,
                    fieldLabel: t('distributionMethod.bankFurtherCreditAccount'),
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
            disabled: frequency === Frequency.Monthly && !checkQualType(qualType) ? true : false,
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
            label: t('distributionMethod.brokerageAccount'),
            value: FormDisbursementSelections.Brokerage,
            disabled: frequency === Frequency.Monthly && !checkQualType(qualType) ? true : false,
            fields: [
                {
                    fieldName: BankingFields.AccountNumber,
                    component: DisbursementFields.BankTextField,
                    fieldLabel: t('distributionMethod.accountNumber'),
                },
                {
                    fieldName: BankingFields.CompanyName,
                    component: DisbursementFields.BankTextField,
                    fieldLabel: t('distributionMethod.companyName'),
                },
                {
                    fieldName: BankingFields.Address,
                    fieldLabel: '',
                    component: DisbursementFields.BankAddress,
                },
            ],
            getDefaultPayload({ paymentMethod, brokerage }: FormDisbursement) {
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
            generatePayloadFromSelection: ({ address, accountNumber, acordAttached, companyName }: DisbursementParts) => {
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

    const cslnCheckStates = ['AZ', 'CA', 'CO', 'LA', 'MT', 'NV', 'ND', 'NM', 'OH', 'RI', 'TX', 'WA'];

    return {
        formValidation: sswFormValidation,
        formPartyConfigs,
        systematicWithdrawalOptions,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        w4pSignaturesConfig,
        disbursementOptions,
        signaturesConfig,
        cslnCheckStates,
    };
}
