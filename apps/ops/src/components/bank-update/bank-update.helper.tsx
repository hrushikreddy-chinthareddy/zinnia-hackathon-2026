import { TFunction } from 'next-i18next';

import { BankingFields, DisbursementFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper';
import { createValidator } from '@deps/containers/otp/utils/helper-utils';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { ChannelType, ContributionType } from '@deps/models/case/enums';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { TaskSource } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    AccountType,
    ActiveWithdrawalCase,
    CaseStatus,
    FormSignature,
    FormSource,
    LifeCadPartyRoles,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

import { SignatureFields } from '../otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';

export const channelOptions = (t: TFunction) => [
    {
        label: t('distributionMethod.channelOptions.emailFaxMail'),
        value: ChannelType.Email,
    },
    {
        label: t('distributionMethod.channelOptions.phone'),
        value: ChannelType.Phone,
    },
];

export const typeOptions = (t: TFunction) => [
    {
        label: t('distributionMethod.contributionType.contribution'),
        value: ContributionType.Contribution,
    },
    {
        label: t('distributionMethod.contributionType.loan'),
        value: ContributionType.Loan,
    },
    {
        label: t('distributionMethod.contributionType.disbursement'),
        value: ContributionType.Disbursement,
    },
];

export const accountTypeOptions = (t: TFunction) => [
    {
        label: t('distributionMethod.accountTypeO.savings'),
        value: AccountType.Savings,
    },
    {
        label: t('distributionMethod.accountTypeO.checking'),
        value: AccountType.Checking,
    },
];

export const BankUpdateFieldConfigs = (t: TFunction) => {
    // const { t } = useTranslation(undefined);
    return [
        {
            fields: [
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
        },
    ];
};

export const signaturesConfig = [
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

export const getBankUpdatePayload = (
    initialForm: ActiveWithdrawalCase,
    formSource: FormSource,
    bankUpdateDetails: DisbursementParts,
    formSignature: FormSignature
) => {
    const formUpdateData = {
        updateType: 'BankUpdate',
        contractNumber: initialForm.data.contractNum,
        bank: [
            {
                accountNumber: bankUpdateDetails.accountNumber,
                accountType: {
                    text: bankUpdateDetails.accountType,
                },
                bankName: bankUpdateDetails.bankName,
                nameOnBankAccount: bankUpdateDetails.accountHolder,
                routingNumber: bankUpdateDetails.bankRoutingNumber,
                bankType: bankUpdateDetails.bankType,
            },
        ],
        //validate below in payload
        doesCheckMeetSecRequiremnt: bankUpdateDetails.doesCheckMeetSecurityRequirements,
        voidCheck: bankUpdateDetails.isVoidCheckAttached,
        programs: null,
    };

    let signatureV;

    if (formSource.channel?.text === ChannelType.Email) {
        signatureV = formSignature;
    } else {
        signatureV = null;
    }

    if (Object.keys(formSource.channel).length === 0) {
        formSource.channel = { text: ChannelType.Phone };
    }

    const formData = {
        formExtName: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
        metaData: {
            formType: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };

    return {
        ...initialForm.data,
        formRequest: {
            formData: formData,
            formSource: formSource,
            formUpdateData: formUpdateData,
            formDisbursement: null,
            formDistribution: null,
            formFullSurrenderAck: null,
            formIrsData: null,
            formOL4753Data: null,
            formLoan: null,
            formParty: null,
            formProgram: null,
            formRestriction: null,
            formSignature: signatureV,
            formTaxWithholding: null,
            formTpaAuthorization: null,
            formSurrenderingCompany: null,
            formAdditionalWaivers: null,
            formSpecialInstruction: null,
            ownerAcknowledgement: null,
            formNigos: null,
        },
    };
};

export const bankUpdateForm = (
    status: TaskStatus | CaseStatus,
    initialForm: ActiveWithdrawalCase,
    formSource: FormSource,
    bankUpdateDetails: DisbursementParts,
    formSignature: FormSignature
) => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getBankUpdatePayload(initialForm, formSource, bankUpdateDetails, formSignature),
    };
};
