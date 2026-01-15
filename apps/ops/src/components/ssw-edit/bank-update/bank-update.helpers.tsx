import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import {
    BankingFields,
    getDefaultFormDisbursementValues,
    updateBankingDetails,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { BankingDetails } from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
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
    FormSignature,
    PartyRoles,
    PaymentMethod,
    FormDisbursement,
    FormComment,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_BANK_DETAILS,
    DisbursementParts,
} from '@deps/models/case/withdrawal/disbursement-types';
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

export const BankUpdateFieldConfigs = (t: TFunction) => ({
    fields: [
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
            fieldLabel: t('distributionMethod.reEnterAccountNumber'),
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
            fieldLabel: t('distributionMethod.reEnterBankRoutingNumber'),
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
    label: 'EFT',
    value: 'EFT',
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
                    reEnterAccountNumber: bank?.reEnterAccountNumber,
                    reEnterBankRoutingNumber: bank?.reEnterBankRoutingNumber,
                },
            ],
            bankVerification: defaultDisbursementInfo?.bankVerification,
        };
    },
});

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
    formDisbursement: FormDisbursement,
    formSignature: FormSignature,
    document: DocumentData,
    bankUpdateType: BankUpdateType,
    formComment: FormComment
) => {
    const documentSource = getDocumentSource(document.documentNumber);

    const bankAtZero: any = Array.isArray(formDisbursement?.bank)
        ? formDisbursement!.bank[0]
        : (formDisbursement?.bank as any);

    const formUpdateData = {
        updateType: bankUpdateType,
        contractNumber: initialForm.data.contractNum,
        bank: [
            {
                accountNumber: bankAtZero?.accountNumber,
                accountType: {
                    text: bankAtZero?.accountType?.text,
                },
                bankName: bankAtZero?.bankName,
                nameOnBankAccount: bankAtZero?.nameOnBankAccount,
                routingNumber: bankAtZero?.routingNumber,
                bankType:
                    bankUpdateDetails.bankType ?? ContributionType.Disbursement,
            },
        ],
        bankVerification: formDisbursement?.bankVerification,
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
            formComment: formComment,
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
    formDisbursement: FormDisbursement,
    formSignature: FormSignature,
    document: DocumentData,
    bankUpdateType: BankUpdateType,
    formComment: FormComment
): CreateTaskBody<TaskStatus, TaskV2Payload> => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getBankUpdatePayload(
            initialForm,
            bankUpdateDetails,
            formDisbursement,
            formSignature,
            document,
            bankUpdateType,
            formComment
        ) as any,
    };
};

export const defaultBankUpdateValues = {
    paymentMethod: {
        text: 'EFT',
    },
    paymentMailType: {
        text: null,
    },
    bank: [
        {
            accountNumber: '',
            accountType: {
                text: 'Checking',
            },
            bankContactPerson: '',
            bankFurtherCreditAccount: '',
            bankFurtherCreditName: '',
            bankInfoCompleteInd: '',
            bankLocation: '',
            bankName: '',
            bankPhone: '',
            nameOnBankAccount: '',
            routingNumber: '',
            maskedAccountNumber: null,
            isDirectDeposit: {
                text: true,
            },
            isDirectDepositValid: {
                text: null,
            },
        },
    ],
    bankVerification: null,
    paymentToBrokerageAccount: false,
    brokerage: null,
    payeeType: '',
    voidCheck: null,
    doesCheckMeetSecRequiremnt: null,
    participantId: {
        text: null,
    },
    payee: null,
    upsAccount: null,
    emailDeliveryNotification: {
        text: false,
    },
    isDifferentPayeeOrAddress: {
        text: false,
    },
    firstTimeExpressCheck: {
        text: false,
    },
};
