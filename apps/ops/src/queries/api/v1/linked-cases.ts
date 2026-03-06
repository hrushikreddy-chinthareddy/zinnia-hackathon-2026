import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const getLinkedCases = async (caseId: string) => {
    const url = `${baseAppUrl}/api/case/v1/cases/links/${caseId}`;

    browserLogInfo('v1/liked-cases:getLinkedCases::Getting linked cases task', {
        file: 'queries/api/v1/linked-cases',
        function: 'getLinkedCases',
        url,
    });

    try {
        const data = await client.get(url);
        return data?.data;
    } catch (error: any) {
        browserLogError(
            'v1/linked-cases::getLinkedCases::Something went wrong while getting linked cases',
            {
                ...parseErrorInformation(error),
                file: 'queries/api/v1/linked-cases',
                function: 'getLinkedCases',
            }
        );
        return error;
    }
};
