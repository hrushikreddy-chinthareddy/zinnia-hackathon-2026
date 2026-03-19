import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import {
    BankingFields,
    DisbursementFields,
    getDefaultFormDisbursementValues,
    updateBankingDetails,
} from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import {
    BankingDetails,
    IFormDisbursement,
} from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement.types';
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
    Carrier,
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

export const BankUpdateFieldConfigsV2 = (t: TFunction) => ({
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
    formDisbursement: FormDisbursement | IFormDisbursement,
    formSignature: FormSignature,
    document: DocumentData,
    bankUpdateType: BankUpdateType,
    formComment: FormComment
) => {
    const documentSource = getDocumentSource(document.documentNumber);

    const bankAtZero: any = Array.isArray(formDisbursement?.bank)
        ? formDisbursement!.bank[0]
        : (formDisbursement?.bank as any);

    // Determine bank data source based on carrier
    const isSBGC = initialForm.carrier === Carrier.SBGC;
    const bankData = isSBGC
        ? {
              accountNumber: bankAtZero?.accountNumber,
              accountType: {
                  text: bankAtZero?.accountType?.text,
              },
              bankName: bankAtZero?.bankName,
              nameOnBankAccount: bankAtZero?.nameOnBankAccount,
              routingNumber: bankAtZero?.routingNumber,
              bankType:
                  bankUpdateDetails.bankType ?? ContributionType.Disbursement,
          }
        : {
              accountNumber: bankUpdateDetails.accountNumber,
              accountType: {
                  text: bankUpdateDetails.accountType,
              },
              bankName: bankUpdateDetails.bankName,
              nameOnBankAccount: bankUpdateDetails.accountHolder,
              routingNumber: bankUpdateDetails.bankRoutingNumber,
              bankType:
                  bankUpdateDetails.bankType ?? ContributionType.Disbursement,
          };

    // Build form update data with common and carrier-specific fields
    const formUpdateData: any = {
        updateType: bankUpdateType,
        contractNumber: initialForm.data.contractNum,
        bank: [bankData],
        programs: null,
        // SBGC-specific fields
        ...(isSBGC && {
            bankVerification: formDisbursement?.bankVerification,
        }),
        // Non-SBGC fields
        ...(!isSBGC && {
            doesCheckMeetSecRequiremnt: isSecurityRequirementsFieldApplicable(
                initialForm.carrier
            )
                ? bankUpdateDetails.doesCheckMeetSecurityRequirements
                : null,
            voidCheck: isVoidCheckFieldApplicable(initialForm.carrier)
                ? bankUpdateDetails.isVoidCheckAttached
                : null,
        }),
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
    formDisbursement: FormDisbursement | IFormDisbursement,
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
                    shouldDisplay: ({
                        isFormStateReadOnly,
                    }: OtpWithdrawalFormState) => !isFormStateReadOnly,
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
                    shouldDisplay: ({
                        isFormStateReadOnly,
                    }: OtpWithdrawalFormState) => !isFormStateReadOnly,
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
