import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';

export const editIllustrationToClientCase = async (
    clientCaseId: string,
    oldIllustrationId: string,
    newIllustrationId: string,
    title: string,
    productType: string,
    productId: string,
    inputs: string
) => {
    try {
        const request = client.patch(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}/illustrations/${oldIllustrationId}`,
            { id: newIllustrationId, title, productType, productId, inputs }
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return {
                data: { ...response.data, id: newIllustrationId },
                error: null,
            };
        } else {
            const error = new Error(response?.statusText);
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error
                    ? e
                    : new Error(
                          (e as Error)?.message ||
                              'an error occurred while editing illustration on client case'
                      )),
                status: 500,
            },
        };
    }
};
