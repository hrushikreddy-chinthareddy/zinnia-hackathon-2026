import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { CreateTaskBody, TaskSource } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, ActiveWithdrawalCaseData, Carrier, CaseStatus, PartyRoles } from '@deps/models/case/withdrawal/case';

import { OtpBuildFormProcess } from './build-form-process.helper';

const getFormDataPayload = (currentFormState: OtpWithdrawalFormState, document: DocumentData) => {
    const {
        initialForm,
        formData,
        formDisbursement,
        formFullSurrenderAck,
        formIrsData,
        formLoan,
        formParty,
        formRestriction,
        formSignature,
        formSource,
        formBeneInfo,
        formTaxWithholding,
        formTpaAuthorization,
        formPeriodicPension,
        formSurrenderingCompany,
        formProgram,
        formDistribution,
        formAdditionalWaivers,
        formOL4753Data,
        formSpecialInstruction,
        ownerAcknowledgement,
        formESignatureData,
        formNigos,
        formReindexingData,
        formComment,
    } = currentFormState;

    if (initialForm.carrier === Carrier.FLIC && initialForm.taskType.includes('SSW')) {
        const hasCoveredLifePerson = !!formParty?.parties?.find(
            item => item.partyRoleType === PartyRoles.GLWB_FIRST_COVERED_PERSON || item.partyRoleType === PartyRoles.GLWB_SEC_COVERED_PERSON
        );
        let filteredParty;
        if (hasCoveredLifePerson) {
            filteredParty = formParty.parties.filter(item => {
                if (
                    item.partyRoleType === PartyRoles.GLWB_FIRST_COVERED_PERSON ||
                    item.partyRoleType === PartyRoles.GLWB_SEC_COVERED_PERSON
                ) {
                    return item.firstName !== '' || item.lastName !== '' || item.middleName !== '';
                }
                return true;
            });
        }
        formParty.parties = filteredParty ?? formParty.parties;
    }

    return {
        ...initialForm.data,
        agentEmailAddress: document.agentEmailAddress,
        documentNumber: document.documentNumber,
        incomingFaxNumber: document.incomingFaxNumber,
        onbaseCaseId: document.caseId,
        sysMailFromAddress: document.sysMailFromAddress,
        formRequest: {
            ...initialForm.data.formRequest,
            formData,
            formDisbursement,
            formDistribution,
            formFullSurrenderAck,
            formIrsData,
            formOL4753Data,
            formLoan,
            formParty,
            formProgram,
            formRestriction,
            formSignature,
            formSource,
            formTaxWithholding,
            formTpaAuthorization,
            formSurrenderingCompany,
            formAdditionalWaivers,
            formSpecialInstruction,
            ownerAcknowledgement,
            formNigos,
            formReindexingData,
            formComment,
            formBeneInfo,
            periodicPensionForm: formPeriodicPension,
            formESignatureData,
        },
    };
};

export const buildForm = (status: CaseStatus, document: DocumentData, formState: OtpWithdrawalFormState): ActiveWithdrawalCase => {
    const currentFormState = OtpBuildFormProcess(status, formState);
    const { initialForm } = currentFormState;
    return {
        ...initialForm,
        status,
        data: getFormDataPayload(currentFormState, document),
    };
};

export const buildFormV2 = (
    status: TaskStatus,
    document: DocumentData,
    formState: OtpWithdrawalFormState
): CreateTaskBody<TaskStatus, ActiveWithdrawalCaseData> => {
    const currentFormState = OtpBuildFormProcess(status, formState);
    return {
        source: TaskSource.ZinniaTaskManagement,
        taskType: formState.initialForm.taskType,
        status,
        data: getFormDataPayload(currentFormState, document),
    };
};
