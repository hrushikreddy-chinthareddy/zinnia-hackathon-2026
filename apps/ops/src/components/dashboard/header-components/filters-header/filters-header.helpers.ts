import { SelectFilterOption } from '@zinnia/bloom/components';

import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { toTitleCase } from '@deps/utils/strings';

export const getBrokerDealerOptions = (
    brokerDealers: DashboardResponseData[]
): SelectFilterOption[] => {
    return brokerDealers.map((agent) => {
        const formattedName = toTitleCase(agent.name);
        return {
            label: formattedName,
            value: agent.name,
        };
    });
};
