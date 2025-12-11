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

export const combineDuplicateLabels = (
    data: { label: string; value: string }[]
): SelectFilterOption[] => {
    const groupByLabel = data.reduce<Record<string, string>>((acc, curr) => {
        acc[curr.label] = acc[curr.label]
            ? `${acc[curr.label]}, ${curr.value}`
            : curr.value;
        return acc;
    }, {});

    return Object.entries(groupByLabel).map(([label, value]) => ({
        label,
        value,
    }));
};
