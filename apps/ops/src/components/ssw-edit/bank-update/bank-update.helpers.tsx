import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import {
    BankingFields,
    DisbursementFields,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { createValidator } from '@deps/containers/otp/utils/helper-utils';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { isIrrevocableBeneficiaryExistsLC } from '@deps/helpers/bank.helpers';
import { DocumentData } from '@deps/models/case/document';
import {
    BankUpdateType,
    ChannelType,
    ContributionType,
} from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    CreateTaskBody,
    TaskSource,
    TaskV2Payload,
} from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    AccountType,
    ActiveWithdrawalCase,
    Carrier,
    FormSignature,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { SignatureFields } from '../../otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDocumentSource } from '../ssw-edit-helpers';

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

const isVoidCheckFieldApplicable = (clientCode: string) => {
    switch (clientCode) {
        case Carrier.USAA:
            return false;
        case Carrier.GLCO:
            return false;
        case Carrier.ULPC:
            return false;
        default:
            return true;
    }
};

const isSecurityRequirementsFieldApplicable = (clientCode: string) => {
    switch (clientCode) {
        case Carrier.USAA:
            return false;
        case Carrier.GLCO:
            return false;
        case Carrier.ULPC:
            return false;
        default:
            return true;
    }
};

export const BankUpdateFieldConfigs = (t: TFunction, clientCode: string) => {
    const formFields = [
        {
            fields: [
                isVoidCheckFieldApplicable(clientCode)
                    ? {
                          fieldName: BankingFields.IsVoidCheckAttached,
                          fieldLabel: t(
                              'distributionMethod.isVoidCheckAttached'
                          ),
                          component: DisbursementFields.BankBooleanButtonGroup,
                          classNames: 'col-start-1',
                      }
                    : null,
                isSecurityRequirementsFieldApplicable(clientCode)
                    ? {
                          fieldName:
                              BankingFields.DoesCheckMeetSecurityRequirements,
                          fieldLabel: t(
                              'distributionMethod.doesCheckMeetSecurityRequirements'
                          ),
                          component: DisbursementFields.BankBooleanButtonGroup,
                      }
                    : null,
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
                    fieldLabel: t('distributionMethod.accountHolder'),
                    component: DisbursementFields.BankTextField,
                },
            ],
        },
    ];

    return formFields[0].fields.filter((item) => item);
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
                key: 'owner-designation',
            },
            {
                component: SignatureFields.SignatureDate,
                key: 'beneficiary-date',
            },
        ],
        signatureType: SignatureValidationTypeWithdrawal.IrrevocableBeneficiary,
        shouldDisplay: ({ parties }: OtpWithdrawalFormState): boolean => {
            // Checking the beneficiary in LC parties
            return isIrrevocableBeneficiaryExistsLC(parties as LifeCadParty[]);
        },
    },
];

export const getBankUpdatePayload = (
    initialForm: ActiveWithdrawalCase,
    bankUpdateDetails: DisbursementParts,
    formSignature: FormSignature,
    document: DocumentData,
    bankUpdateType: BankUpdateType
) => {
    const documentSource = getDocumentSource(document.documentNumber);

    const formUpdateData = {
        updateType: bankUpdateType,
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
                bankType:
                    bankUpdateDetails.bankType ?? ContributionType.Disbursement,
            },
        ],
        doesCheckMeetSecRequiremnt: isSecurityRequirementsFieldApplicable(
            initialForm.carrier
        )
            ? bankUpdateDetails.doesCheckMeetSecurityRequirements
            : null,
        voidCheck: isVoidCheckFieldApplicable(initialForm.carrier)
            ? bankUpdateDetails.isVoidCheckAttached
            : null,
        programs: null,
    };

    const source = {
        channel: {
            text: document.source,
        },
        businessKey: document.documentNumber,
        receivedDate: dayjs(
            document.dateReceived,
            'M/D/YYYY hh:mm:ss A'
        ).format(ZAHARA_API_DATE_FORMAT),
        receivedDateTime: dayjs(
            document.dateReceived,
            'M/D/YYYY hh:mm:ss A'
        ).format('YYYY-MM-DDTHH:mm:ss:Z'),
        sourceSysId: 'ONBASE',
    };

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
        onbaseCaseId: document?.caseId,
        formRequest: {
            formData: formData,
            formSource: source,
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
            formSignature:
                documentSource !== ChannelType.Phone ? formSignature : null,
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

export const bankUpdateFormData = (
    status: TaskStatus,
    initialForm: ActiveWithdrawalCase,
    bankUpdateDetails: DisbursementParts,
    formSignature: FormSignature,
    document: DocumentData,
    bankUpdateType: BankUpdateType
): CreateTaskBody<TaskStatus, TaskV2Payload> => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getBankUpdatePayload(
            initialForm,
            bankUpdateDetails,
            formSignature,
            document,
            bankUpdateType
        ) as any,
    };
};
