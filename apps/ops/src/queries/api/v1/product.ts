import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { Product } from '@deps/types/product';

export const listProductsByCarrier = async (
    carrierProductId: string,
    carrierCode: string,
    productMasterId: string,
    limit?: number,
    offset?: number
): Promise<ApiResponse<Product[]>> => {
    try {
        const request = client.get<any, AxiosResponse<Product[]>>(
            `${baseAppUrl}/api/product/v1/products?carrierProductId=${carrierProductId}&carrier=${carrierCode}&productMasterId=${productMasterId}&limit=${limit}&offset=${offset}`
        );

        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
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
                              'an error occurred while retrieving products list'
                      )),
                status: 500,
            },
        };
    }
};
