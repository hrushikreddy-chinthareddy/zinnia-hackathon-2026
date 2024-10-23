import { AE_BROKER_DEALER_NAME_PROD, AE_BROKER_DEALER_NAME_QA, AE_CARRIER_SBGC } from "@deps/constants/advisors-excel";
import { isProd } from "@deps/utils/environment.helper";

const getAdvisorsExcelBrokerDealerName = () => {
    return isProd() ? AE_BROKER_DEALER_NAME_PROD : AE_BROKER_DEALER_NAME_QA;
}

export const getAdvisorsExcelCaseSearchParams = () => {
    return {
        brokerDealerName: getAdvisorsExcelBrokerDealerName(),
        carriers: [AE_CARRIER_SBGC],
    };
}

export const getAdvisorsExcelCaseStatsParams = () => {
    return {
        brokerDealerName: getAdvisorsExcelBrokerDealerName(),
        carrier: AE_CARRIER_SBGC,
    };
}
