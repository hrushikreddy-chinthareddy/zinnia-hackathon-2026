import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

interface ExceptionRef {
    category: string;
    reason: string;
    detailedReason: string;
    exceptionSubRefs: any[];
    nmId: string;
}

export const searchNigoExceptionRefs = async (): Promise<ExceptionRef[]> => {
    try {
        const response = await client.post<ExceptionRef[]>(`/api/case/v1/exceptionrefs/nigos/search`);
        return response.data;
    } catch (error) {
        browserLogError('searchNigoExceptionRefs::Error', {
            ...parseErrorInformation(error),
        });
        return [];
    }
};
