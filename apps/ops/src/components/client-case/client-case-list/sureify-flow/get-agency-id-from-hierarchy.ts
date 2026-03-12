import sortBy from 'lodash/sortBy';

import { getHierarchyBySellingCode } from '@deps/queries/api/server/v1/producers';
import { LoggingContext } from '@deps/utils/server-logging';

const MAIN_AGENCY_ROLE = 'GeneralAgency';

/**
 * Resolve the primary agency (General Agency) for a given selling code.
 *
 * Business Context:
 *  - The selling hierarchy determines which agency an agent belongs to.
 *  - Illustrations must associate each Client Case with the correct agency
 *    for routing, permissions, and reporting.
 *
 * Hierarchy Rules:
 *  1) If the agent themselves has the GeneralAgency role → use their own selling code
 *  2) Otherwise, inspect the agent's upline (parent orgs)
 *  3) Find upline entries with GeneralAgency role
 *  4) If multiple are present, choose the one with the lowest "level"
 *     (closest in the hierarchy tree → highest priority)
 *
 * Why this logic exists:
 *  - Distribution partners may send multiple upline agency nodes
 *  - System must deterministically choose the correct reporting entity
 *  - Avoids mis-attribution of cases to the wrong agency
 *
 * Error Handling Strategy:
 *  - Returns null (instead of throwing) when agency cannot be determined
 *  - Upstream logic handles fallback (blocking case creation)
 *
 * Notes:
 *  - Hierarchy API returns a single snapshot of agent structure
 *  - No caching here — expect caller to handle caching if needed
 *  - We assume "level" reflects proximity to agent (lower = closer)
 */

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
        // Agent is themselves a General Agency — use their own selling code
        return sellingCode;
    }

    if (!upline) {
        // No upline available — cannot determine agency
        return null;
    }

    const mainAgencies = upline.filter(
        (upline) => upline.role === MAIN_AGENCY_ROLE
    );

    if (!mainAgencies?.length) {
        return null;
    }

    // Choose closest General Agency in the hierarchy tree (lowest level value)
    const sortedAgencies = sortBy(mainAgencies, 'level');
    const mainAgency = sortedAgencies[0];

    return mainAgency.sellingCode;
};
