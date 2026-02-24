import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getClientCaseById } from '@deps/queries/api/v1/client-case-manager';
import { listProductsByCarrier } from '@deps/queries/api/v1/product';
import { ApiResponse } from '@deps/types/api-response';
import { Product } from '@deps/types/product';

export const getProductsByCarrier = async (
    carrierProductId: string,
    carrierCode: string,
    productMasterId: string,
    limit: number = 10,
    offset: number = 0
) => {
    return await listProductsByCarrier(
        carrierProductId,
        carrierCode,
        productMasterId,
        limit,
        offset
    );
};

export const getClientCase = async (clientCaseId: string) => {
    return await getClientCaseById(clientCaseId);
};

export const useQueryProductsByCarrier = ({
    carrierProductId,
    carrierCode,
    productMasterId,
    limit,
    offset,
}: {
    carrierProductId?: string;
    carrierCode: string;
    productMasterId?: string;
    limit?: number;
    offset?: number;
}) =>
    useQuery({
        queryKey: [
            'productList',
            carrierCode,
            { carrierProductId, productMasterId, limit, offset },
        ],
        queryFn: () =>
            getProductsByCarrier(
                carrierProductId ?? '',
                carrierCode || '',
                productMasterId ?? '',
                limit,
                offset
            ),
        select: useCallback(
            (data: ApiResponse<Product[]>) => data.data ?? [],
            []
        ),
        enabled: !!carrierCode,
    });
