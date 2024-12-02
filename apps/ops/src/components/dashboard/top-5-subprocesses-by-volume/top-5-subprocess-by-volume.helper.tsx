import dayjs from 'dayjs';

// import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardResponseData } from '@deps/queries/api/dashboard';

export type Top5SubprocessByVolumeProps = {
    startDate: string;
    timeframe?: string;
    processSubType?: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
};

export const getTop5Products = (data: DashboardResponseData[]) => {
    const totals = data.reduce((prevValue: Record<string, number>, value: DashboardResponseData) => {
        if (!value) return prevValue;
        if (value.name === 'NULL_VALUE') return prevValue;
        const productName = value.name;
        return {
            ...prevValue,
            [productName]: (prevValue[productName] || 0) + value.count,
        };
    }, {} as Record<string, number>);
    const top5Products = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, value]) => ({ name: key, count: value }));
    return top5Products;
};

export const sortCountsByMonth = (data: DashboardResponseData[]) => {
    const counts = data.reduce((prevValue: Record<string, number>, value: DashboardResponseData) => {
        if (!value) return prevValue;
        if (value.name === 'NULL_VALUE') return prevValue;
        const month = dayjs(value.name).format('MM YYYY');
        return {
            ...prevValue,
            [month]: (prevValue[month] || 0) + value.count,
        };
    }, {} as Record<string, number>);
    return counts;
};
