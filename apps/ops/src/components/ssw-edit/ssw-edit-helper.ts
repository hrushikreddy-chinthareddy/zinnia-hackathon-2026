import dayjs from 'dayjs';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { DocumentData } from '@deps/models/case/document';
import { ChannelType } from '@deps/models/case/enums';
import { TaskSource } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, CaseStatus, FormSignature, FormSource } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export enum SswUpdateType {
    PROGRAM_TERMINATE = 'ProgramTerminate',
    PROGRAM_UPDATE = 'ProgramUpdate',
}

const getSswEditPayload = (
    initialForm: ActiveWithdrawalCase,
    formSource: FormSource,
    formSignature: FormSignature,
    existingProg: Program,
    updateProgram: Program[] | any,
    document: DocumentData,
    operationType: SswUpdateType
) => {
    const isTerminate = operationType === SswUpdateType.PROGRAM_TERMINATE;
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
        ...formSource,
        channel: {
            text: formSource.channel.text ?? ChannelType.Phone,
        },
        businessKey: document.documentNumber,
        receivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format(ZAHARA_API_DATE_FORMAT),
        receivedDateTime: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
        sourceSysId: 'ONBASE',
    };

    let signatureV;

    if (formSource.channel?.text === ChannelType.Email) {
        signatureV = formSignature;
    } else {
        signatureV = null;
    }

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

export const buildSSWFormData = (
    status: TaskStatus | CaseStatus,
    initialForm: ActiveWithdrawalCase,
    formSource: FormSource,
    formSignature: FormSignature,
    existingProg: Program,
    updateProgram: Program[],
    document: DocumentData,
    operationType: SswUpdateType
) => {
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: initialForm.taskType,
        status,
        data: getSswEditPayload(initialForm, formSource, formSignature, existingProg, updateProgram, document, operationType),
    };
};
