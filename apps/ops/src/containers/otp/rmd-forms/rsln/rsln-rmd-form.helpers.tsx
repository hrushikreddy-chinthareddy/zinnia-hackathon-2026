import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { PartyConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { PhoneFields } from '@deps/components/otp-withdrawal-form/form-party/party-phone';
import { JointLifeExpectancyConfig } from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import {
    SignatureBonusFields,
    SignatureFieldNames,
    SignatureFields,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { isIrrevocableBeneficiaryExistsLC } from '@deps/helpers/bank.helpers';
import { statesAndTerritories } from '@deps/helpers/states.helpers';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    PartyRoles,
    AddressTypes,
    PhoneTypes,
    PaymentMailType,
    PaymentMethod,
    FormDisbursement,
    AccountType,
    FundWithdrawnMethod,
    FormParts,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    PaymentMethodOption,
    DEFAULT_BANK_DETAILS,
    FormDisbursementSelections,
} from '@deps/models/case/withdrawal/disbursement-types';

import { createValidator } from '../../utils/helper-utils';

const spousalSignatureStateCodes = [
    statesAndTerritories.ARIZONA,
    statesAndTerritories.CALIFORNIA,
    statesAndTerritories.IDAHO,
    statesAndTerritories.LOUISIANA,
    statesAndTerritories['NEW MEXICO'],
    statesAndTerritories.NEVADA,
    statesAndTerritories.TEXAS,
    statesAndTerritories.WASHINGTON,
    statesAndTerritories.WISCONSIN,
    statesAndTerritories.MINNESOTA,
];

export default function getRslnRmdConfig(t: TFunction) {
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
            signatureType:
                SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
            shouldDisplay: ({ parties }: OtpWithdrawalFormState): boolean => {
                return isIrrevocableBeneficiaryExistsLC(
                    parties as LifeCadParty[]
                );
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
            shouldDisplay: ({
                ownerStateOfResidence,
            }: OtpWithdrawalFormState): boolean => {
                return (
                    !!ownerStateOfResidence &&
                    spousalSignatureStateCodes.includes(
                        ownerStateOfResidence?.toUpperCase()
                    )
                );
            },
            signatureType: SignatureValidationTypeWithdrawal.Spouse,
        },
    ];

    const rmdFormValidation = ({
        formSignature,
        formDisbursement,
        formProgram,
    }: Partial<FormParts> = {}): FormValidationErrors => {
        const errors = {} as FormValidationErrors;

        if (
            [PaymentMethod.EFT, PaymentMethod.Wire].includes(
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

        const rmds = formProgram?.rmd?.rmdPrograms;

        if (rmds && rmds?.length === 0) {
            errors['rmdMinimumRequiredProgram'] = t(
                'rmdMethod.rmdWarnings.minimumRequiredProgram'
            );
        }

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
                {
                    fieldName: PartyFields.Dob,
                    fieldLabel: t('personalDetails.dob'),
                },
            ],
        },
    ];

    const jointLifeExpectancyConfigs: JointLifeExpectancyConfig = {
        checkboxLabel: t('rmdMethod.jointLifeExpectancy.label.flic'),
        fields: [
            {
                fieldName: PartyFields.Dob,
                fieldLabel: t('rmdMethod.jointLifeExpectancy.dob.flic'),
            },
        ],
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
                    classNames: 'col-start-1',
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
                    classNames: 'col-start-1',
                    isBankingField: true,
                },
                {
                    fieldName: BankingFields.AccountHolder,
                    fieldLabel: t('rmdMethod.banking.accountHolder'),
                    component: DisbursementFields.BankTextField,
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

    const eSignatureFieldConfig = {
        type: true,
        signPresent: true,
        date: true,
        auditTrial: true,
    };

    return {
        formPartyConfigs,
        jointLifeExpectancyConfigs,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        w4pSignaturesConfig,
        disbursementOptions,
        signaturesConfig,
        formValidation: rmdFormValidation,
        eSignatureFieldConfig,
    };
}
