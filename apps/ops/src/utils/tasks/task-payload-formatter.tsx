import dayjs from 'dayjs';

import { Action, PolicyRole } from '@deps/constants/policy';
import { getFullName } from '@deps/helpers/party-info-helpers';
import {
    MatchingCase,
    TransactionData,
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
            (item: TransactionData) => item.correlationId === correlationId
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
        entityType:
            src.partyType === PartyType.ORGANIZATION && !src.entityType
                ? 'UNKNOWN'
                : src.entityType,
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
            (item: TransactionData) => item.correlationId === correlationId
        );

        if (correlationId === MatchingCase.ENTERED) {
            matchedData = {
                zlCaseId: task.data?.caseId ?? '',
                policyNumber: task.data?.policyNumber ?? '',
            };
        } else {
            matchedData = { ...potentialMatch };
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
                : null),
        fullName: toFullName(src),
        identifications: mergeIdentifications(src.identifications),
        relationshipToTheCurrentOwner: getRelationship(src),
        entityType:
            src.partyType === PartyType.ORGANIZATION && !src.entityType
                ? 'UNKNOWN'
                : src.entityType,
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

export const getBeneficiaryChangePayload = (task: ManagementTask) => {
    const actionData = task?.data?.actionData || [];
    const formattedActionData = [...actionData];

    formattedActionData.map((data, index: number) => {
        formattedActionData[index] = {
            ...data,
            party: {
                ...data.party,
                firstName: data.party.firstName ?? null,
                middleName: data.party.middleName ?? null,
                lastName:
                    data.party.lastName ??
                    (data.party.partyType !== PartyType.INDIVIDUAL
                        ? data.party.fullName ?? null
                        : null),
                fullName: toFullName(data.party),
                addresses: cleanAddresses(data.party.addresses),
                emails: cleanEmails(data.party.emails),
                phones: cleanPhones(data.party.phones),
                identifications: mergeIdentifications(
                    data.party.identifications
                ),
            },
        };
    });

    let issueResolved = task.data?.issueResolved;
    if (Array.isArray(issueResolved)) {
        if (issueResolved.includes('yes')) {
            issueResolved = true;
        } else if (
            issueResolved.includes('no_missing') ||
            issueResolved.includes('no_mismatched')
        ) {
            issueResolved = false;
        } else {
            issueResolved = undefined;
        }
    }

    return {
        ...task,
        data: {
            ...task.data,
            actionData: formattedActionData,
            issueResolved,
        },
    };
};

export const getBeneAddressVerificationPayload = (task: ManagementTask) => {
    if (
        task.data?.details?.beneAddress?.beneficiaryChangeDetail
            ?.notificationPreferences
    ) {
        return task;
    }

    const beneAddress = task.data.details.beneAddress;
    const hasNotificationPrefs =
        beneAddress.beneficiaryChangeDetail?.notificationPreferences;
    const notificationPreferences =
        hasNotificationPrefs ??
        beneAddress?.beneficiary?.notificationPreferences;

    return {
        ...task,
        data: {
            ...task.data,
            details: {
                ...task.data.details,
                beneAddress: {
                    ...beneAddress,
                    beneficiaryChangeDetail: {
                        ...beneAddress.beneficiaryChangeDetail,
                        ...(notificationPreferences !== undefined && {
                            notificationPreferences,
                        }),
                    },
                },
            },
        },
    };
};

export const getAnnuitantChangePayload = (task: ManagementTask) => {
    const partyUpdates = (task?.data?.actionData || []).map((update: any) => {
        if (update.party) {
            const { endDate, ...partyWithoutEndDate } = update.party;
            return {
                ...update,
                party: {
                    ...partyWithoutEndDate,
                    fullName: getFullName(partyWithoutEndDate),
                    usCitizen: partyWithoutEndDate.usCitizen ?? 'Yes',
                    countryOfCitizenship:
                        partyWithoutEndDate.countryOfCitizenship ?? 'US',
                    preferredCommunicationType:
                        partyWithoutEndDate.preferredCommunicationType ===
                        'null'
                            ? null
                            : partyWithoutEndDate.preferredCommunicationType,
                },
            };
        }
        return update;
    });
    const signatureData = task?.data?.signatureData || [];

    const { addedItem, deletedItem } =
        detectRoleChangeRequestType(partyUpdates);

    const src = addedItem?.party ?? deletedItem?.party ?? {};

    return {
        ...task,
        data: {
            ...task.data,
            partyUpdates,
            effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            transactionName: 'AnnuitantChange',
            carrierId: task.carrier,
            caseId: task.caseId,
            planCode: task.data.planCode,
            policyNumber: task.data.policyNumber,
            signatures: signatureData?.signatures ?? [],
            partyRole: 'Annuitant',
            documents: src?.documents,
            supportingDocumentAttached: task.data.supportingDocumentAttached,
        },
    };
};
