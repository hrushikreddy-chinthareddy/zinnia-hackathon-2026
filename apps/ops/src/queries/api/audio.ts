import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { browserLogInfo } from '@deps/utils/browser-logging';

export const getAudioLink = async ({
    sessionID,
}: {
    sessionID: string;
}): Promise<any | undefined> => {
    try {
        const url = `/api/get-audio-link?sessionID=${encodeURIComponent(
            sessionID
        )}`;
        const response = await client.get<null, AxiosResponse>(url);
        return response;
    } catch (error) {
        browserLogInfo('getAudioLink:Error while getting audio link', {
            error,
        });
        throw { error };
    }
};
