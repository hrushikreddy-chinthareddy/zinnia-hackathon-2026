import dayjs from 'dayjs';

import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { isIrrevocableBeneficiaryExistsLC } from '@deps/helpers/bank.helpers';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { CreateTaskBody, TaskSource, TaskV2Payload } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, FormSignature, FormTaxWithholding, PartyRoles } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { SignatureFields } from '../../otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDocumentSource } from '../ssw-edit-helpers';
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
            return isIrrevocableBeneficiaryExistsLC(parties as LifeCadParty[]);
        },
    },
];

export const taxWithholdingUpdateFormData = (
    status: TaskStatus,
    initialForm: ActiveWithdrawalCase,
    formSignature: FormSignature,
    formTaxWithholding: FormTaxWithholding,
    document: DocumentData
): CreateTaskBody<TaskStatus, TaskV2Payload> => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getWithholdingUpdatePayload(initialForm, formSignature, formTaxWithholding, document) as any,
    };
};

export const getWithholdingUpdatePayload = (
    initialForm: ActiveWithdrawalCase,
    formSignature: FormSignature,
    formTaxWithholding: FormTaxWithholding,
    document: DocumentData
) => {
    const documentSource = getDocumentSource(initialForm?.data.documentNumber);

    const formUpdateData = {
        updateType: 'TaxWithholdingUpdate',
        contractNumber: initialForm.data.contractNum,
        bank: null,
        doesCheckMeetSecRequiremnt: null,
        voidCheck: null,
        programs: null,
    };

    const formData = {
        formExtName: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
        metaData: {
            formType: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };

    const source = {
        channel: {
            text: document.source,
        },
        businessKey: document.documentNumber,
        receivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format(ZAHARA_API_DATE_FORMAT),
        receivedDateTime: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
        sourceSysId: 'ONBASE',
    };

    return {
        ...initialForm.data,
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
            formSignature: documentSource !== ChannelType.Phone ? formSignature : null,
            formTaxWithholding: formTaxWithholding,
            formTpaAuthorization: null,
            formSurrenderingCompany: null,
            formAdditionalWaivers: null,
            formSpecialInstruction: null,
            ownerAcknowledgement: null,
            formNigos: null,
        },
    };
};
