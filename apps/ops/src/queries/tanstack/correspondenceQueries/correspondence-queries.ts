import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { Document as DocumentResponse } from '@zinnia/api-types/types/correspondence';

export const getCorrespondenceDocuments = async (
    planCode: string,
    carrierCode: string
) => {
    try {
        // The documentType parameter could in theory be changed, but we always need this value for these letter types
        // If we need different types from this endpoint in the future it can be adapted to a prop
        const url = `${baseAppUrl}/api/correspondence/v1/document/list?planCode=${planCode}&carrierCode=${carrierCode}&documentType=Adhoc%20Letter`;

        browserLogInfo(
            'SystematicProgram::Initiating Get Correspondence Documents',
            {
                payload: { planCode, carrierCode },
                url: url,
                function: 'getCorrespondenceDocuments',
            }
        );

        const response = await client.get<DocumentResponse, AxiosResponse>(url);

        if (response.status === StatusCode.Okay) {
            return response.data;
        }
    } catch (error: any) {
        browserLogError('Get Correspondence Documents failed', {
            ...parseErrorInformation(error),
            payload: { planCode, carrierCode },
            url: `${baseAppUrl}/api/correspondence/v1/document/list?planCode=${planCode}&carrierCode=${carrierCode}&documentType=Adhoc%20Letter`,
            function: 'getCorrespondenceDocuments',
        });

        return error?.data;
    }
};
