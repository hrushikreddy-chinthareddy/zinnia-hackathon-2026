import dayjs from 'dayjs';

import { Action } from '@deps/constants/policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const getFormattedTaskTPD = (customData: any): any => {
    const { task } = customData;

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

    const { actionData, signatures, ...rest } = task.data;

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
        'formattedData in assignee change payload utils'
    );

    return formattedData;
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
