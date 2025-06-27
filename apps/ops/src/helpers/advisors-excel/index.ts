import {
    AE_BROKER_DEALER_NAME,
    AE_CARRIER_GLCO,
    AE_CARRIER_SBGC,
} from '@deps/constants/advisors-excel';

export const getAdvisorsExcelCaseParams = (
    enableAdditionalCarriers: boolean
) => {
    // using carrier name to match the API. Carrier is an array it is just named as singular instead of plural in the spec
    const carrier: string[] = [AE_CARRIER_SBGC];

    if (enableAdditionalCarriers) {
        carrier.push(AE_CARRIER_GLCO);
    }

    return {
        brokerDealerName: AE_BROKER_DEALER_NAME,
        carrier,
    };
};
