import { v4 as uuidv4 } from 'uuid';

import { RadioItem } from '@deps/components/radio/radio';
import { CaseIdentifier } from '@deps/models/case/case';
import { CaseIdentifierType, FormMetadata } from '@deps/models/case/task';
import {
    MatchingCase,
    TransactionData,
} from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { Phone } from './task-handlers/types';
import { getIdentifierValue } from '../case-sub-page/case-helpers';

export const updateTask = async (
    task: ManagementTask,
    correlationId: string,
    taskStatus?: TaskStatus
): Promise<boolean> => {
    const isPreviewMockTask =
        task.taskType === 'AI_PAPER_PREVIEW_TASK' ||
        task.id.startsWith('mock-task-');
    if (isPreviewMockTask) {
        return true;
    }

    browserLogInfo('updateTask::Updating task', {
        payload: {
            taskType: task.taskType,
            carrier: task.carrier,
            processType: task.process,
            taskId: task.id,
        },
    });
    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};

export const generatePotentialMatchesOptions = (
    potentialMatches: TransactionData[],
    allowedStatus: string[]
) => {
    const getCaseId = (item: TransactionData) =>
        item.identifiers?.find(
            (id: { identifier: string }) =>
                id.identifier === CaseIdentifierType.ZL_CASE_ID ||
                id.identifier === CaseIdentifier.CaseId
        )?.value;

    return (
        potentialMatches
            ?.filter((item) => {
                const zlCaseId = getCaseId(item);
                return (
                    zlCaseId &&
                    item.correlationId &&
                    item.correlationId !== '' &&
                    (!allowedStatus.length ||
                        allowedStatus.includes(item.entity?.status || ''))
                );
            })
            ?.map((item: TransactionData) => {
                const id = uuidv4();
                const zlCaseId = getCaseId(item);
                const subElement = {
                    label: '',
                    value: zlCaseId ?? '',
                    title: item?.entityType ?? '',
                    url: `/cases/${zlCaseId}`,
                    type: 'link',
                    disabled: false,
                };
                return {
                    label: item.entityType,
                    value: item.correlationId,
                    id,
                    subElement,
                };
            }) || []
    );
};

/**
 * Shared logic for document-matching handlers: compute potential matches,
 * update task.data, and merge potential matches into schema matchingResult customOptions.
 */
export function applyDocumentMatchingPotentialMatches(
    responsePotentialMatches: TransactionData[] | null | undefined,
    task: any,
    schema: FormMetadata
): void {
    const allowedStatuses = task?.data?.potentialMatchCriteria?.status || [];
    const potentialMatchesOptions =
        responsePotentialMatches && responsePotentialMatches.length > 0
            ? generatePotentialMatchesOptions(
                  responsePotentialMatches,
                  allowedStatuses
              )
            : [];

    const potentialMatches =
        responsePotentialMatches && responsePotentialMatches.length > 0
            ? responsePotentialMatches.map((item) => ({
                  zlCaseId: getIdentifierValue(
                      item.identifiers,
                      CaseIdentifier.ZlCaseId || CaseIdentifier.CaseId
                  ),
                  policyNumber: getIdentifierValue(
                      item.identifiers,
                      CaseIdentifier.PolicyNumber
                  ),
                  correlationId: item.correlationId,
                  entityType: item.entityType,
                  recordId: item.recordId,
              }))
            : [];

    Object.assign(task, {
        data: {
            ...task.data,
            potentialMatches,
        },
    });

    if (schema.uiSchema.matchingResult?.['ui:options']?.customOptions) {
        const existingOptions = schema.uiSchema.matchingResult[
            'ui:options'
        ].customOptions
            .filter((option: RadioItem) => {
                if (
                    option.value === MatchingCase.NO_MATCH &&
                    !task?.data?.isPrimaryDocumentPresent == true
                ) {
                    return false;
                }
                return true;
            })
            .map((option: RadioItem) => {
                if (option.value === undefined) {
                    return { ...option, value: null };
                }
                return option;
            });

        schema.uiSchema.matchingResult['ui:options'].customOptions = [
            ...potentialMatchesOptions,
            ...existingOptions,
        ];
    }
}

export const getFormattedPhoneNumber = (phone: Phone) => {
    if (!phone) return null;

    const rawDialNumber = phone?.dialNumber ?? '';

    const dialNumber =
        rawDialNumber.length >= 7
            ? rawDialNumber.slice(rawDialNumber.length - 7)
            : rawDialNumber;
    const areaCode =
        phone?.areaCode ??
        (rawDialNumber.length >= 10
            ? rawDialNumber.slice(
                  rawDialNumber.length - 10,
                  rawDialNumber.length - 7
              )
            : '');
    const countryCode =
        phone?.countryCode ??
        (rawDialNumber.length > 10
            ? rawDialNumber.slice(0, rawDialNumber.length - 10)
            : null);

    const formattedNumber = `${countryCode}${areaCode}${dialNumber}`;
    return formattedNumber.trim() || null;
};
