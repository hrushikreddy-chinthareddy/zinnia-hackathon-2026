import { CarrierName } from '@zinnia/bloom/components';

import { Product } from '@deps/types/product';

const carriers = new Map([
    ['ZIN', CarrierName.ZINNIA],
    ['FNWL', CarrierName.FARMERS],
]);

export function getProductCarrierName(product?: Product) {
    const carrierCode = product?.carrier;

    if (!carrierCode) {
        return CarrierName.ZINNIA;
    }

    return carriers.get(carrierCode) ?? CarrierName.ZINNIA;
}
