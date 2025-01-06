import { AE_BROKER_DEALER_NAME_PROD, AE_BROKER_DEALER_NAME_QA, AE_CARRIER_GLCO, AE_CARRIER_SBGC } from '@deps/constants/advisors-excel';
import { CaseStatsQuery } from '@deps/queries/cases';
import { isProd } from '@deps/utils/environment.helper';

const getAdvisorsExcelBrokerDealerName = () => {
    return isProd() ? AE_BROKER_DEALER_NAME_PROD : AE_BROKER_DEALER_NAME_QA;
};

export const getAdvisorsExcelCaseSearchParams = () => {
    return {
        brokerDealerName: getAdvisorsExcelBrokerDealerName(),
        carriers: [AE_CARRIER_SBGC, AE_CARRIER_GLCO],
    };
};

export const getAdvisorsExcelCaseStatsParams = (): Partial<CaseStatsQuery> => {
    return {
        brokerDealerName: getAdvisorsExcelBrokerDealerName(),
        carrier: [AE_CARRIER_SBGC, AE_CARRIER_GLCO],
    };
};
