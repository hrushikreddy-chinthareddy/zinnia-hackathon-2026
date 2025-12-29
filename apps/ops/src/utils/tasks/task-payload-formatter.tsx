import dayjs from 'dayjs';

import { Action, PolicyRole } from '@deps/constants/policy';
import { getFullName } from '@deps/helpers/party-info-helpers';
import {
    MatchingCase,
    PotentialMatches,
} from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
import { PartyType } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    toFullName,
    detectRoleChangeRequestType,
    getDefaultRoleChangeParty,
    cleanAddresses,
    cleanEmails,
    cleanPhones,
    mergeIdentifications,
} from '@deps/utils/tasks/role-change-data-entry.utils';

const getRelationship = (item: any) =>
    item?.party?.relationshipToTheCurrentOwner || null;

export const getPurchaseDocumentPayload = (
    task: ManagementTask,
    initialTask: ManagementTask
) => {
    const correlationId = task.data.matchingResult;
    const duplicateCase = task.data.isDuplicate;
    let updateTask = { ...task };

    let matchingResult = correlationId;

    if (correlationId === MatchingCase.REINDEX) {
        matchingResult = MatchingCase.REINDEX;
    }

    if (![MatchingCase.REINDEX].includes(correlationId) && duplicateCase) {
        matchingResult = duplicateCase;

        const potentialMatch = initialTask.data.potentialMatches?.find(
            (item: PotentialMatches) => item.correlationid === correlationId
        );

        const matchData =
            potentialMatch ||
            task.data?.transactionOptions?.find(
                (item: any) => item.value === task.data?.transactions
            )?.subElement ||
            task.data;

        const entityType = matchData?.entityType;
        const recordId = matchData?.recordId;
        const zlCaseId = matchData?.zlCaseId ?? task?.data?.zlCaseId;
        const policyNumber =
            matchData?.policyNumber ?? task?.data?.policyNumber;

        const paymentRecordId = task?.data?.transactions ?? null;

        updateTask;
        updateTask = {
            ...task,
            data: {
                ...task.data,
                details: { ...task.data.details },
                matchingResult,
                matchedData: {
                    entityType,
                    recordId,
                    zlCaseId,
                    policyNumber,
                    linkedData: {
                        paymentRecordId: paymentRecordId,
                    },
                },
            },
        };
    }

    return {
        ...task,
        ...updateTask,
    };
};
export const getAssigneeChangePayload = (task: ManagementTask) => {
    const actionData = task?.data?.actionData || [];
    const signatureData = task?.data?.signatureData || [];
    const { requestType, addedItem, deletedItem } =
        detectRoleChangeRequestType(actionData);

    const src = addedItem?.party ?? deletedItem?.party ?? {};
    const base = getDefaultRoleChangeParty();

    const party = {
        ...base,
        ...src,
        collateralAmount: src?.collateralAmount || null,
        addresses: cleanAddresses(src.addresses),
        emails: cleanEmails(src.emails),
        phones: cleanPhones(src.phones),
        identifications: mergeIdentifications(src.identifications),
        relationshipToTheCurrentOwner: getRelationship(src),
        preferredCommunicationType:
            src.preferredCommunicationType === 'null'
                ? null
                : src.preferredCommunicationType,
        fullName: getFullName(src),
        startDate:
            requestType === Action.ADD || requestType === Action.UPDATE
                ? dayjs().format(ZAHARA_API_DATE_FORMAT)
                : null,
        endDate:
            requestType === Action.DELETE
                ? dayjs().format(ZAHARA_API_DATE_FORMAT)
                : null,
    };

    const partyId =
        requestType === Action.ADD ? null : deletedItem?.party?.partyId;

    return {
        ...task,
        data: {
            ...task.data,
            requestType,
            partyId,
            party,
            effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            transactionName: 'AssigneeChange',
            carrierId: task.carrier,
            caseId: task.caseId,
            planCode: task.data.planCode,
            policyNumber: task.data.policyNumber,
            signatures: signatureData?.signatures ?? [],
            notarySignatures: signatureData?.notarySignatures ?? [],
            partyRole: PolicyRole.ASSIGNEE,
            signatureData: signatureData,
        },
    };
};

export const getStandardDocumentPayload = (
    task: ManagementTask,
    initialTask: ManagementTask
) => {
    const correlationId = task.data.matchingResult;
    let matchedData = {};
    let matchingResult = task?.data?.matchingResult;
    let updateTask = { ...task };

    if (
        ![MatchingCase.NO_MATCH, MatchingCase.NOT_APPLICABLE].includes(
            correlationId
        )
    ) {
        const potentialMatch = initialTask.data.potentialMatches?.find(
            (item: PotentialMatches) => item.correlationid === correlationId
        );

        if (correlationId === MatchingCase.ENTERED) {
            matchedData = {
                zlCaseId: task.data?.caseId ?? '',
                policyNumber: task.data?.policyNumber ?? '',
            };
        } else {
            const {
                entityType,
                recordId,
                zlCaseId,
                policyNumber,
                taskId,
                firstName,
                lastName,
            } = potentialMatch;
            matchedData = {
                entityType,
                recordId,
                zlCaseId,
                policyNumber,
                taskId,
                firstName,
                lastName,
            };
        }

        matchingResult = MatchingCase.MATCH_FOUND;
    }

    const attachment = task.data?.attachments?.slice(-1) ?? [];
    let matchedDocumentData = task.data?.matchedDocumentData ?? {};
    if (matchedDocumentData && attachment.length > 0) {
        matchedDocumentData = {
            ...matchedDocumentData,
            existingDocumentId: attachment[0]?.documentId,
        };
    }
    const {
        attachments,
        caseOverview,
        matchCaseId,
        matchedCaseId,
        ...filteredData
    } = task.data ?? {};

    updateTask = {
        ...task,
        data: {
            ...filteredData,
            matchingResult,
            matchedDocumentData,
            matchedData,
        },
    };

    return updateTask;
};

export const getThirdPartyDetailPayload = (task: ManagementTask) => {
    const actionData = task?.data?.actionData || [];
    const signatureData = task?.data?.signatureData || [];

    const { requestType, addedItem, deletedItem } =
        detectRoleChangeRequestType(actionData);

    const src = addedItem?.party ?? deletedItem?.party ?? {};
    const base = getDefaultRoleChangeParty();

    const party = {
        ...base,
        ...src,
        addresses: cleanAddresses(src.addresses),
        emails: cleanEmails(src.emails),
        phones: cleanPhones(src.phones),
        firstName: src.firstName ?? null,
        middleName: src.middleName ?? null,
        lastName:
            src.lastName ??
            (src.partyType !== PartyType.INDIVIDUAL
                ? src.fullName ?? null
                : null) ??
            null,
        fullName: toFullName(src),
        identifications: mergeIdentifications(src.identifications),
        relationshipToTheCurrentOwner: getRelationship(src),
    };

    const partyId =
        requestType === Action.ADD ? undefined : deletedItem?.party?.partyId;
    return {
        ...task,
        data: {
            ...task.data,
            requestType,
            partyId,
            party,
            effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            transactionName: 'ThirdPartyDesignee',
            carrierId: task.carrier,
            caseId: task.caseId,
            planCode: task.data.planCode,
            policyNumber: task.data.policyNumber,
            signatures: signatureData?.signatures ?? [],
            partyRole: 'ThirdPartyDesignee',
            documents: src?.documents,
            supportingDocumentAttached: src?.supportingDocumentAttached,
        },
    };
};
