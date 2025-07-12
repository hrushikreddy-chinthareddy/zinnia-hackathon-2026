import { getClientCaseById } from '@deps/queries/api/v1/client-case';
import { listProductsByCarrier } from '@deps/queries/api/v1/product';

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
