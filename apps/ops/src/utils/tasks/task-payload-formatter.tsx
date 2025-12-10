import dayjs from 'dayjs';

import { Action } from '@deps/constants/policy';
import {
    MatchingCase,
    PotentialMatches,
} from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const getPurchaseDocumentPayload = (
    task: ManagementTask,
    initialTask: ManagementTask
) => {
    const correlationId = task.data.matchingResult;
    const duplicateCase = task.data.isDuplicate;
    let updateTask = { ...task };

    let matchingResult = correlationId;
    // reindexing case
    if (correlationId === MatchingCase.REINDEX) {
        matchingResult = MatchingCase.REINDEX;
    }

    // match found & duplicate case
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
    const updates = Array.isArray(task.data.actionData)
        ? task.data.actionData
        : [];

    const deleteItem = updates.find(
        (item: any) => item.action === Action.DELETE && item.party?.partyId
    );

    const addItem = updates.find((item: any) => item.action === Action.ADD);

    let requestType: Action.ADD | Action.DELETE | Action.UPDATE | null = null;
    let party: any = null;
    let partyId: string | undefined = undefined;
    let collateralAmount: number | null = null;

    const effectiveDate = dayjs().format(ZAHARA_API_DATE_FORMAT);

    const getRelationship = (item: any) =>
        item?.party?.relationshipToTheCurrentOwner || null;

    const getCollateralAmount = (item: any) => {
        collateralAmount = item?.collateralAmount ?? null;
        return collateralAmount;
    };

    if (addItem && deleteItem) {
        requestType = Action.UPDATE;
        partyId = deleteItem.party.partyId;
        collateralAmount = getCollateralAmount(addItem);

        party = {
            ...getDefaultPartyObject(),
            ...addItem.party,
            partyId: deleteItem.party.partyId,
            relationshipToTheCurrentOwner: getRelationship(addItem),
            identifications: mergeIdentifications(
                addItem.party.identifications
            ),
        };
    } else if (addItem && !deleteItem) {
        requestType = Action.ADD;

        partyId = undefined;
        collateralAmount = getCollateralAmount(addItem);

        party = {
            ...getDefaultPartyObject(),
            ...addItem.party,
            relationshipToTheCurrentOwner: getRelationship(addItem),
            partyId: undefined,
            identifications: mergeIdentifications(
                addItem.party.identifications
            ),
        };
    } else if (!addItem && deleteItem) {
        requestType = Action.DELETE;
        partyId = deleteItem.party.partyId;
        collateralAmount = getCollateralAmount(deleteItem);

        party = {
            ...deleteItem.party,
            relationshipToTheCurrentOwner: getRelationship(deleteItem),
            identifications: mergeIdentifications(
                deleteItem.party.identifications
            ),
        };
    }

    const {
        actionData,
        signatures,
        signatureData,
        contractInfo,
        issueResolved,
        validationUrl,
        process,
        taskName,
        details,
        processSubType,
        defaultPartyIdRoleChange,
        ...rest
    } = task.data;

    const formattedData: any = {
        ...rest,
        carrierId: task.carrier,
        planCode: task.data.planCode,
        policyNumber: task.data.policyNumber,
        requestType,
        effectiveDate,
        collateralAmount,
        partyId,
        party,
        signatures: signatures ?? [],
    };

    if (
        (requestType === Action.UPDATE || requestType === Action.DELETE) &&
        partyId
    ) {
        formattedData.partyId = partyId;
    }

    console.log(
        formattedData,
        'formattedData in assignee change payload util new12345'
    );

    return formattedData;
};

export const getAssigneeChangePayload = (task: ManagementTask) => {
    const updates = Array.isArray(task.data.actionData)
        ? task.data.actionData
        : [];

    const deleteItem = updates.find(
        (item: any) => item.action === Action.DELETE && item.party?.partyId
    );

    const addItem = updates.find((item: any) => item.action === Action.ADD);

    let requestType: Action.ADD | Action.DELETE | Action.UPDATE | null = null;
    let party: any = null;
    let partyId: string | undefined = undefined;
    let collateralAmount: number | null = null;

    const effectiveDate = dayjs().format(ZAHARA_API_DATE_FORMAT);

    const getRelationship = (item: any) =>
        item?.party?.relationshipToTheCurrentOwner || null;

    const getCollateralAmount = (item: any) => {
        collateralAmount = item?.party?.collateralAmount ?? null;
        return collateralAmount;
    };

    if (addItem && deleteItem) {
        requestType = Action.UPDATE;
        partyId = deleteItem.party.partyId;
        collateralAmount = getCollateralAmount(addItem);

        party = {
            ...getDefaultPartyObject(),
            ...addItem.party,
            startDate: effectiveDate,
            partyId: deleteItem.party.partyId,
            relationshipToTheCurrentOwner: getRelationship(addItem),
            identifications: mergeIdentifications(
                addItem.party.identifications
            ),
        };
    } else if (addItem && !deleteItem) {
        requestType = Action.ADD;

        partyId = undefined;
        collateralAmount = getCollateralAmount(addItem);

        party = {
            ...getDefaultPartyObject(),
            ...addItem.party,
            startDate: effectiveDate,
            relationshipToTheCurrentOwner: getRelationship(addItem),
            partyId: undefined,
            identifications: mergeIdentifications(
                addItem.party.identifications
            ),
        };
    } else if (!addItem && deleteItem) {
        requestType = Action.DELETE;
        partyId = deleteItem.party.partyId;
        collateralAmount = getCollateralAmount(deleteItem);

        party = {
            ...deleteItem.party,
            endDate: effectiveDate,
            relationshipToTheCurrentOwner: getRelationship(deleteItem),
            identifications: mergeIdentifications(
                deleteItem.party.identifications
            ),
        };
    }

    const {
        actionData,
        signatureData,
        contractInfo,
        validationUrl,
        process,
        defaultPartyIdRoleChange,
        ...rest
    } = task.data;

    const formattedData: any = {
        ...rest,
        carrierId: task.carrier,
        planCode: task.data.planCode,
        policyNumber: task.data.policyNumber,
        requestType,
        effectiveDate,
        collateralAmount,
        partyId,
        party,
        signatures: signatureData.signatures ?? [],
        notarySignature: signatureData.notarySignature,
    };

    if (
        (requestType === Action.UPDATE || requestType === Action.DELETE) &&
        partyId
    ) {
        formattedData.partyId = partyId;
    }

    console.log(
        formattedData,
        'formattedData in assignee change payload util new12345'
    );

    return {
        ...task,
        data: {
            ...task.data, // preserve EVERYTHING, including taskId
            ...formattedData, // override data fields
        },
    };
};

function mergeIdentifications(uiIdentifications: any[]) {
    const defaultIdentification = {
        identificationValue: null,
        identificationType: 'SSN',
        startDate: null,
        endDate: null,
        issueCountry: null,
        permanentResident: null,
    };

    if (!uiIdentifications || uiIdentifications.length === 0) {
        return [defaultIdentification];
    }
    return [
        {
            ...defaultIdentification,
            ...uiIdentifications[0],
        },
    ];
}

function getDefaultPartyObject() {
    return {
        partyId: null,
        startDate: null,
        endDate: null,
        partyType: null,
        prefix: null,
        firstName: null,
        middleName: null,
        lastName: null,
        fullName: null,
        entityType: null,
        dateOfBirth: null,
        gender: null,
        trustType: null,
        trustDate: null,
        usCitizen: null,
        countryOfCitizenship: null,
        relationshipToTheCurrentOwner: null,
        identifications: [
            {
                identificationValue: null,
                identificationType: 'SSN',
                startDate: null,
                endDate: null,
                issueCountry: null,
                permanentResident: null,
            },
        ],
        preferredCommunicationType: null,
        addresses: [
            {
                addressType: 'RESIDENCE',
                addressLine1: null,
                addressLine2: null,
                addressLine3: null,
                city: null,
                state: null,
                zipCode: null,
                zipCodeExtension: '',
                country: 'US',
                isPreferred: true,
                startDate: null,
                endDate: null,
            },
        ],
        phones: [
            {
                phoneType: 'HOME',
                areaCode: null,
                dialNumber: null,
                countryCode: '1',
                extension: null,
                bestTime: null,
                isPreferred: false,
                startDate: null,
                endDate: null,
            },
        ],
        emails: [
            {
                emailType: 'PERSONAL',
                emailAddress: null,
                isPreferred: false,
                startDate: null,
                endDate: null,
            },
        ],
    };
}
