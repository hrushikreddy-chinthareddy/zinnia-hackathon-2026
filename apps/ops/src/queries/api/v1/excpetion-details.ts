import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const getExcpetionDetails = async (
    caseId: string,
    exceptionId: string
): Promise<any> => {
    try {
        const response = await client.get<any>(
            `/api/case/v1/exceptions/${exceptionId}/cases/${caseId}`
        );
        return response.data;
    } catch (error) {
        browserLogError('searchNigoExceptionRefs::Error', {
            ...parseErrorInformation(error),
        });
        return [];
    }
};
