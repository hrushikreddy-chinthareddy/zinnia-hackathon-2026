import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helper';
import { frequencyToValue } from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationConfig } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import { stringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    PartyRoles,
    AddressTypes,
    FormParts,
    PaymentMethod,
    PaymentMailType,
    AccountType,
    FormDisbursement,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';
import { DEFAULT_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { createValidator } from '../utils/helper-utils';
import getGlcoConfig from '../withdrawal-forms/flic-withdrawal-form.helper';

export default function getGlcoRmdConfig(t: TFunction) {
    // importing base configuration from GLCO form helper.
    const { cslnCheckStates, irsSignatureConfig, formValidation } = getGlcoConfig(t);

    // CMW-13796 remove further credit info
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
                };
            },
            generatePayloadFromSelection: ({
                accountNumber,
                accountType,
                bankName,
                accountHolder,
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
                    component: SignatureFields.SignatureCityProvided,
                    key: 'owner-city-state',
                },
                {
                    component: SignatureFields.SignatureSsn,
                    key: 'owner-ssn',
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
            partyRole: PartyRoles.OWNER,
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

            addressFields: [
                {
                    addressType: AddressTypes.DEFAULT,
                    title: t('addressDetails.residentialAddressTitle'),
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
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
                },
                {
                    fieldName: PartyFields.TaxId,
                    fieldLabel: t('personalDetails.ssn'),
                },
            ],
        },
    ];

    const isBeneSpouseOption = [
        { label: t('beneficiaryInfo.isBeneficiarySpouse.yes'), value: stringifyTrueFalseNull(true) },
        { label: t('beneficiaryInfo.isBeneficiarySpouse.no'), value: stringifyTrueFalseNull(false) },
    ];
    const w4pSignaturesConfig = [
        {
            component: SignatureFields.SignaturePresent,
            key: 'w4p-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'w4p-signature-sign-date',
        },
        {
            component: SignatureFields.SignatureType,
            key: 'w4p-owner-type',
        },
    ];

    return {
        signaturesConfig,
        formPartyConfigs,
        formValidation: rmdformValidation,
        cslnCheckStates,
        irsSignatureConfig,
        w4pSignaturesConfig,
        disbursementOptions,
        isBeneSpouseOption,
    };
}
