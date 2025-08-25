import sortBy from 'lodash/sortBy';

import { getHierarchyBySellingCode } from '@deps/queries/api/server/v1/producers';
import { LoggingContext } from '@deps/utils/server-logging';

export const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';
const MAIN_AGENCY_ROLE = 'GeneralAgency';

export const getAgencyIdFromHierarchy = async (
    agentSellingCode: string,
    loggingContext: LoggingContext
) => {
    const agentHierarchy = await getHierarchyBySellingCode(
        agentSellingCode,
        loggingContext
    );

    if (!agentHierarchy) {
        return null;
    }

    const { role, upline, sellingCode } = agentHierarchy;

    if (role === MAIN_AGENCY_ROLE && sellingCode) {
        return sellingCode;
    }

    if (!upline) {
        return null;
    }

    const mainAgencies = upline.filter(
        (upline) => upline.role === MAIN_AGENCY_ROLE
    );

    if (!mainAgencies?.length) {
        return null;
    }

    const sortedAgencies = sortBy(mainAgencies, 'level');
    const mainAgency = sortedAgencies[0];

    return mainAgency.sellingCode;
};
