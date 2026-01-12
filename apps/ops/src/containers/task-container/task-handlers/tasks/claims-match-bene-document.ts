import { getName } from '@deps/helpers/party-info-helpers';
import { FormMetadata } from '@deps/models/case/task';
import { BeneficiaryRecord } from '@deps/models/case/task/beneficiary-record';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { searchBeneficiaryByCaseId } from '@deps/queries/api/beneficiary';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { TaskHandler } from '../types';
const claimsMatchBeneDocumentHandler: TaskHandler<any, any> = {
    api: async (payload: any) => {
        const apiResult = await searchBeneficiaryByCaseId(payload);
        const beneficiaryMatches = Array.isArray(apiResult) ? apiResult : [];
        return beneficiaryMatches;
    },

    getPayload: (taskData: any) => {
        const potentialMatchCriteria =
            taskData?.data?.details?.documentEntityMatch
                ?.potentialMatchCriteria;
        let zlCaseId = '';
        let entityType = '';

        if (potentialMatchCriteria) {
            zlCaseId =
                potentialMatchCriteria.identifiers?.find(
                    (id: { identifier: string }) => id.identifier === 'zlCaseId'
                )?.value ?? '';
            entityType = Array.isArray(potentialMatchCriteria.entityType)
                ? potentialMatchCriteria.entityType[0] ?? ''
                : potentialMatchCriteria.entityType ?? '';
        }
        return {
            zlCaseId,
            entityType,
        };
    },

    transformResponse: (
        response,
        metadata: FormMetadata[],
        task?: ManagementTask
    ) => {
        const matchCriteria = ((metadata[0].uiSchema.details ??=
            {}).documentEntityMatch ??= {});

        const beneficiaryOptions = generateBeneficiaryOptions(response);

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.beneficiaryEnum = {
                enum: beneficiaryOptions.map((option: any) => option.value),
            };
        }

        if (task?.status === TaskStatus.Completed) {
            if (task?.data?.details?.documentEntityMatch?.matchRecord) {
                task.data.details.documentEntityMatch.matchRecords = [
                    task.data.details.documentEntityMatch.matchRecord,
                ];

                Object.assign(task, {
                    ...task,
                });
            }
        }

        matchCriteria.matchRecords['ui:options'].customOptions = [
            ...beneficiaryOptions,
        ];
    },
};

const generateBeneficiaryOptions = (
    beneficiaries: BeneficiaryRecord[]
): any[] => {
    return beneficiaries.map((item: BeneficiaryRecord) => {
        const idField = item.recordId || item.zlCaseId || '';
        const fullName = getName(item.entity?.party);
        const data = {
            entityType: item.entityType || DEFAULT_ERROR_STRING,
            recordId: idField,
            beneficiaryName: fullName,
        };
        return {
            value: data,
            label: '',
            metadata: {
                beneficiaryName: fullName,
                ssn: item.entity?.party?.ssn || DEFAULT_ERROR_STRING,
                recordId: idField,
                entityType: item.entityType || DEFAULT_ERROR_STRING,
            },
        };
    });
};

export default claimsMatchBeneDocumentHandler;
