import { AE_BROKER_DEALER_NAME_PROD, AE_BROKER_DEALER_NAME_QA, AE_CARRIER_GLCO, AE_CARRIER_SBGC } from '@deps/constants/advisors-excel';
import { isProd } from '@deps/utils/environment.helper';

const getAdvisorsExcelBrokerDealerName = () => {
    return isProd() ? AE_BROKER_DEALER_NAME_PROD : AE_BROKER_DEALER_NAME_QA;
};

export const getAdvisorsExcelCaseParams = (enableAdditionalCarriers: boolean) => {
    // using carrier name to match the API. Carrier is an array it is just named as singular instead of plural in the spec
    const carrier: string[] = [AE_CARRIER_SBGC];

    if (enableAdditionalCarriers) {
        carrier.push(AE_CARRIER_GLCO);
    }

    return {
        brokerDealerName: getAdvisorsExcelBrokerDealerName(),
        carrier,
    };
};
