import { AxiosResponse } from 'axios';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

interface DeleteCommunication {
    communicationType: string;
    partyId: string | undefined;
    planCode: string | undefined;
    policyNumber: string | undefined;
    recordId: string | undefined;
}

export const deleteCommunication = async ({
    communicationType,
    partyId,
    planCode,
    policyNumber,
    recordId,
}: DeleteCommunication): Promise<AxiosResponse> => {
    try {
        const response = await client.delete<AxiosResponse>(
            `${baseAppUrl}/api/policy/v1/policies/${planCode}/${policyNumber}/parties/${partyId}/${communicationType}/${recordId}`
        );

        return response;
    } catch (error: any) {
        console.error(
            `deleteCommunication::${communicationType} error: `,
            error
        );

        return error;
    }
};

export const getPartyMetadata = async (): Promise<AxiosResponse> => {
    try {
        const response = await client.get<void, AxiosResponse>(
            `${baseAppUrl}/api/party/v1/parties/reference`
        );

        return response;
    } catch (error: any) {
        console.error('getPartyMetadata::an error occurred', error);

        return error;
    }
};

export const getPartyMetadataById = async (
    partyId: string
): Promise<AxiosResponse> => {
    try {
        const response = await client.get<void, AxiosResponse>(
            `${baseAppUrl}/api/party/v1/parties/${partyId}/reference`
        );
        return response;
    } catch (error: any) {
        console.error('getPartyMetadata::an error occurred', error);

        return error;
    }
};
