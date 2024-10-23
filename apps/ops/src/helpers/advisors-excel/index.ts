import { AE_BROKER_DEALER_NAME_PROD, AE_BROKER_DEALER_NAME_QA, AE_CARRIER_SBGC } from "@deps/constants/advisors-excel";
import { isProd } from "@deps/utils/environment.helper";

export const getAdvisorsExcelCaseParams = () => {
    return {
        brokerDealerName: isProd() ? AE_BROKER_DEALER_NAME_PROD : AE_BROKER_DEALER_NAME_QA,
        carrier: [AE_CARRIER_SBGC],
    };
}
