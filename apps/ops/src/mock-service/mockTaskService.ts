import sbgcSuitabilitySchema from '@deps/mock-service/carrier/sbgc/suitability-review/suitability-review-schema.json';
import wellabeSuitabilitySchema from '@deps/mock-service/carrier/wellabe/suitability-review/suitability-review-schema.json';
import wellabeSuitabilityData from '@deps/mock-service/carrier/wellabe/suitability-review/suitability-review.json';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

export const getTaskFormMetadataSSRMock = async (clientId: string): Promise<FormMetadata | null> => {
    switch (clientId) {
        case 'SBGC':
            return sbgcSuitabilitySchema as FormMetadata;
        case 'DLIC':
            return wellabeSuitabilitySchema as FormMetadata;
    }
    return {} as FormMetadata;
};

export const getCaseTaskByIdSSRMock = async (): Promise<ManagementTask<TaskStatus> | null> => {
    return {
        id: 'TA000000013372',
        caseId: 'CA0000371122',
        // source: 'Zinnia.TaskManagement',
        // templateId: 'g9f78538-18b6-45f1-b365-59f75a1fc198',
        process: 'Withdrawal',
        carrier: 'SBGC',
        taskType: 'WithdrawalFormInputTask',
        taskName: 'Withdrawal form input',
        status: TaskStatus.Completed,
        data: {
            taskType: 'WithdrawalFormInputTask',
            formRequest: {
                formSource: [Object],
                formData: [Object],
                formProgram: [Object],
                formParty: [Object],
                formDistribution: [Object],
                formDisbursement: [Object],
                formSurrenderingCompany: [Object],
                formRestriction: [Object],
                formTaxWithholding: [Object],
                formTpaAuthorization: null,
                formFullSurrenderAck: [Object],
                formTaxIdCertificate: [Object],
                formSignature: [Object],
                formAdditionalWaivers: null,
                formLoan: [Object],
                formSpecialInstruction: [Object],
                formIrsData: [Object],
                formOL4753Data: [Object],
                formNigos: null,
            },
            data: wellabeSuitabilityData,
            documentNumber: '20241008-MAN-997616',
            clientCode: 'SBGC',
            incomingFaxNumber: null,
            contractNum: '7700002658',
            source: 'DigitalPortal',
            sysMailFromAddress: null,
            userId: 'Thakur, Rahul',
            agentEmailAddress: null,
            onbaseCaseId: '10203509',
        },
        queue: null,
        // escalated: false,
        // assigneeFirstName: 'Rahul',
        // assigneeLastName: 'Thakur',
        // assignee: 'Rahul.Thakur@zinnia.com',
        // assigneePartyId: '7f473929f9de4fbfaea69276265ff0ce',
        // assignedAt: '2024-10-14T12:34:53Z',
        // createdBy: 'Diksha.Dorugade@zinnia.com',
        // createdByPartyId: 'aada8f822b934ec78d1d53fdef310574',
        createdAt: '2024-10-14T10:21:35Z',
        // updatedBy: 'Rahul.Thakur@zinnia.com',
        // updatedByPartyId: '7f473929f9de4fbfaea69276265ff0ce',
        updatedAt: '2024-10-15T19:48:30Z',
    };
};
