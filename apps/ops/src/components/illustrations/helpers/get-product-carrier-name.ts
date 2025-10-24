import { CarrierName } from '@zinnia/bloom/components';

import { Product } from '@deps/types/product';

const carriers = new Map([
    ['ZIN', CarrierName.ZINNIA],
    ['FNWL', CarrierName.FARMERS],
]);

const carrierMarketingNames = new Map([
    ['ZIN', 'Zinnia'],
    ['FNWL', 'Farmers'],
]);

export function getProductCarrierName(product?: Product) {
    const carrierCode = product?.carrier;

    if (!carrierCode) {
        return CarrierName.ZINNIA;
    }

    return carriers.get(carrierCode) ?? CarrierName.ZINNIA;
}

export function getCarrierMarketingName(carrierShortName: string | undefined) {
    const fallback = carrierMarketingNames.get('FNWL');

    if (!carrierShortName) {
        return fallback;
    }

    return (
        carrierMarketingNames.get(carrierShortName.toUpperCase()) ?? fallback
    );
}
