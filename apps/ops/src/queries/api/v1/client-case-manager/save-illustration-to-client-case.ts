import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';

import { CLIENT_CASE_MANAGER_BASE_URL } from './constants';

export const saveIllustrationToClientCase = async (
    clientCaseId: string,
    illustrationId: string,
    title: string,
    productType: string,
    productId: string,
    inputs: string,
    carrierCode: string
) => {
    try {
        const request = client.post(
            `${CLIENT_CASE_MANAGER_BASE_URL}/client-case/${clientCaseId}/illustrations`,
            {
                id: illustrationId,
                title,
                productType,
                productId,
                inputs,
                carrierCode,
            }
        );
        const response = await request;
        if (response.status === StatusCode.Okay) {
            return {
                data: { ...response.data, id: illustrationId },
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
                              'an error occurred while saving illustration to client case'
                      )),
                status: 500,
            },
        };
    }
};
