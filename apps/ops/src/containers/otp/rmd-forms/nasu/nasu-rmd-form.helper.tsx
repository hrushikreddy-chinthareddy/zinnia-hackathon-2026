import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { BeneficiaryConfig } from '@deps/components/otp-withdrawal-form/beneficiary-information/beneficiary-info';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { frequencyToValue } from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import {
    SignatureFields
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { stringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    PartyRoles,
    AddressTypes, FormParts, PaymentMethod,
    PaymentMailType,
    AccountType,
    FormDisbursement, PhoneTypes, LifeCadPartyPersonType,
    LifeCadPartyRoles
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
    DisbursementToggleType,
} from '@deps/models/case/withdrawal/disbursement-types';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import getFlicConfig from '../../withdrawal-forms/flic-withdrawal-form.helper';
import { defaultDisbursmentConsent } from '../../withdrawal-forms/rsln/rsln-withdrawal-form.helper';

export default function getNasuRmdConfig(t: TFunction) {
    // importing base configuration from FLIC form helper.
    const { formValidation } = getFlicConfig(t);

    const cslnCheckStates = ['CA'];

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
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
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
        }
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
                    fieldLabel: t('distributionMethod.isDirectDepositFormValid'),
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
            getDefaultPayload({ paymentMethod, disbursmentConsent, bank }: FormDisbursement) {
                if (paymentMethod.text !== PaymentMethod.EFT) {
                    return DEFAULT_DISBURSEMENT_UPDATE;
                }
                const selectedBank = bank[0];
                return {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    isDirectDepositValid: selectedBank?.isDirectDepositValid?.text ?? null,
                    accountHolder: selectedBank.nameOnBankAccount ?? '',
                    accountNumber: selectedBank.accountNumber ?? '',
                    accountType: selectedBank.accountType?.text ?? AccountType.Checking,
                    bankName: selectedBank.bankName ?? '',
                    bankRoutingNumber: selectedBank.routingNumber ?? '',
                    consentAvailable: disbursmentConsent?.isConsent?.text ?? null,
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
                            isDirectDeposit: { text: true },
                            isDirectDepositValid: { text: isDirectDepositValid },
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
                    disbursmentConsent: { ...defaultDisbursmentConsent, isConsent: { text: consentAvailable } },
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

    const rmdformValidation = ({
        formParty,
        formDisbursement,
        formSignature,
        formProgram,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = formValidation({ formParty, formSignature, formDisbursement });
        const rmds = formProgram?.rmd?.rmdPrograms;
        if ([PaymentMethod.EFT, PaymentMethod.Wire].includes(formDisbursement?.paymentMethod?.text as PaymentMethod)) {
            if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].accountNumber !== formDisbursement?.bank[0].reEnterAccountNumber) {
                errors[BankingFields.ReEnterAccountNumber] = t('formValidation.accountNumberDoesNotMatch');
            }
            if (formDisbursement?.bank[0].bankName === '' && formDisbursement?.bank[0].routingNumber !== formDisbursement?.bank[0].reEnterBankRoutingNumber) {
                errors[BankingFields.ReEnterBankRoutingNumber] = t('formValidation.routingNumberDoesNotMatch');
            }
        }

        if (rmds && rmds?.length === 0) {
            errors['rmdMinimumRequiredProgram'] = t('rmdMethod.rmdWarnings.minimumRequiredProgram');
        }

        if (rmds && rmds?.length > 0) {
            const sortedPrograms = rmds.sort((a, b) => a.startDate.text.localeCompare(b.startDate.text));

            sortedPrograms.map((program, index) => {
                const frequency = (program?.frequency?.text && frequencyToValue[program?.frequency?.text]) || frequencyToValue.Annually;
                const calculatedEndDate = dayjs(program?.startDate?.text, ZAHARA_API_DATE_FORMAT)
                    .add((Number(program?.duration?.text) - 1) * frequency, 'month')
                    .add(1, 'day')
                    .format(ZAHARA_API_DATE_FORMAT)
                    .toString();

                if (index < sortedPrograms.length - 1) {
                    if (calculatedEndDate > sortedPrograms[index + 1].startDate.text) {
                        errors['rmdDateOverlap'] = t('rmdMethod.rmdWarnings.dateOverlap');
                    }

                    if (Number(program?.duration?.text) === 0 && sortedPrograms[index + 1].startDate.text !== '') {
                        errors['rmdDetectedDurationZero'] = t('rmdMethod.rmdWarnings.detectedDurationZero', {
                            startDate: dayjs(program?.startDate?.text, ZAHARA_API_DATE_FORMAT).format(DEFAULT_DATE_FORMAT),
                        });
                    }
                }
            });
        }

        return errors;
    };

    const handleShouldShowDOBInOl4573 = (parties: LifeCadParty[] | undefined): boolean => {
        const partyDetails = parties?.find((party: LifeCadParty) => party.Role === LifeCadPartyRoles.PrimaryOwner);
        const personTypeIndividual = partyDetails?.PersonType === LifeCadPartyPersonType.Individual;
        return personTypeIndividual;
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

    const isBeneSpouseOption = [
        { label: t('beneficiaryInfo.isBeneficiarySpouse.yes'), value: stringifyTrueFalseNull(true) },
        { label: t('beneficiaryInfo.isBeneficiarySpouse.no'), value: stringifyTrueFalseNull(false) },
    ];

    const beneficiaryConfig: BeneficiaryConfig = {
        fields: [
            {
                fieldName: PartyFields.FirstName,
                fieldLabel: t('beneficiaryInfo.firstName'),
            },
            {
                fieldName: PartyFields.MiddleName,
                fieldLabel: t('beneficiaryInfo.middleName'),
            },
            {
                fieldName: PartyFields.LastName,
                fieldLabel: t('beneficiaryInfo.lastName'),
            },
            {
                fieldName: PartyFields.Dob,
                fieldLabel: t('beneficiaryInfo.dob'),
            },
            {
                fieldName: PartyFields.TaxId,
                fieldLabel: t('beneficiaryInfo.taxId'),
            },
        ],
    };

    return {
        formPartyConfigs,
        signaturesConfig,
        signaturesNotaryConfig,
        formValidation: rmdformValidation,
        cslnCheckStates,
        handleShouldShowDOBInOl4573,
        w4pSignaturesConfig,
        disbursementOptions,
        isBeneSpouseOption,
        beneficiaryConfig
    };
}

