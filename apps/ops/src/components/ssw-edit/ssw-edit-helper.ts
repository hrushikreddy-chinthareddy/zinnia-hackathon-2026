import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { CreateTaskBody, TaskSource, TaskV2Payload } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, FormSignature, FormValidationErrors, Frequency, RMDProgramType } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { SignatureFieldNames } from '../otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';

export enum SswUpdateType {
    PROGRAM_TERMINATE = 'ProgramTerminate',
    PROGRAM_UPDATE = 'ProgramUpdate',
}
export type UpdatedProgram = {
    programType?: string;
    startDate?: string;
    nextDate?: string;
    amount?: string;
    frequency?: string;
    duration?: string;
    status?: RMDProgramType;
    allocationId?: number;
};

export const getDocumentSource = (documentId: string): ChannelType => {
    if (documentId) {
        if (documentId.includes('-O-') || documentId.includes('-MAN-')) {
            return ChannelType.Phone;
        } else {
            return ChannelType.Email;
        }
    } else {
        return ChannelType.Email;
    }
};

const getSswEditPayload = (
    initialForm: ActiveWithdrawalCase,
    formSign: FormSignature,
    existingProg: Program,
    updateProgram: Program | any,
    document: DocumentData,
    operationType: SswUpdateType
) => {
    const isTerminate = operationType === SswUpdateType.PROGRAM_TERMINATE;
    const documentSource = getDocumentSource(document.documentNumber);

    const formUpdateData = {
        updateType: operationType,
        contractNumber: initialForm.data.contractNum,
        bank: null,
        doesCheckMeetSecRequiremnt: null,
        voidCheck: null,
        programs: [
            {
                programType: existingProg.programType,
                allocationId: existingProg.allocationId,
                amount: isTerminate ? existingProg.amount : updateProgram.amount ?? existingProg.amount,
                duration: isTerminate ? existingProg.duration : updateProgram.duration ?? existingProg.duration,
                frequency: isTerminate ? existingProg.frequency : updateProgram.frequency ?? existingProg.frequency,
                nextDate: {
                    text: isTerminate ? existingProg.nextDate : updateProgram.nextDate ?? existingProg.nextDate,
                },
            },
        ],
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
            formSignature: documentSource !== ChannelType.Phone ? structuredClone(formSign) : null,
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

export const buildSSWFormData = (
    status: TaskStatus,
    initialForm: ActiveWithdrawalCase,
    formSignature: FormSignature,
    existingProg: Program,
    updateProgram: Program,
    document: DocumentData,
    operationType: SswUpdateType
): CreateTaskBody<TaskStatus, TaskV2Payload> => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getSswEditPayload(initialForm, formSignature, existingProg, updateProgram, document, operationType) as any,
    };
};

export const getFullFrequency = (mode: string) => {
    if (mode === 'A') return Frequency.Annually;
    if (mode === 'M') return Frequency.Monthly;
    if (mode === 'S') return Frequency.SemiAnnually;
    if (mode === 'Q') return Frequency.Quarterly;
    return '';
};

export const sswEditFormValidator = (formSignature: FormSignature, t: TFunction) => {
    const errors = {} as FormValidationErrors;
    const ownerSignature = formSignature?.signatures?.find(sigInfo => sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner);

    if (ownerSignature?.isSigned !== false && !ownerSignature?.isSigned) {
        errors[`${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`] = t(
            'formValidation.signaturePresentOptionMustBeSelected'
        );
    }
    return errors;
};
