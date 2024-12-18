import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { CaseDashboardStatsResponse, DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import DistributionPieChartSmall from '../distribution-charts/distribution-pie-chart-small';

interface Props {
    dashboardStatsResponse: CaseDashboardStatsResponse;
    classNames?: string;
    width?: number;
    distinctPieChartCategoryStatGroupingLabels: string[];
}

const ActiveAgingPies = ({ dashboardStatsResponse, classNames, width, distinctPieChartCategoryStatGroupingLabels }: Props) => {
    return (
        <div className="relative flex justify-end">
            <Typography className="-rotate-90 absolute text-center -left-[20px] top-[35px]" variant={TypographyVariant.BodyBold}>
                Product
                <br />
                Name
            </Typography>
            <div className={`${classNames} border-b-1 border-[#ddd]`} style={{ width: `${width}px` }}>
                <div className="grid grid-cols-6 gap-2 w-full justify-items-center">
                    {dashboardStatsResponse?.data?.map(currentStatGrouping => {
                        const additionalStats: DashboardStatsElementResponse[] = [];

                        distinctPieChartCategoryStatGroupingLabels.forEach(currentLabel => {
                            if (!currentStatGrouping.values?.find(stat => stat.name.toLowerCase() === currentLabel.toLowerCase())) {
                                additionalStats.push({
                                    count: 0,
                                    name: currentLabel,
                                    key: GroupByOptions.ExceptionCategory,
                                });
                            }
                        });

                        if (currentStatGrouping.values) {
                            currentStatGrouping.values = [...currentStatGrouping.values, ...additionalStats];
                            currentStatGrouping.values?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
                        }
                        return (
                            <div key={currentStatGrouping.name}>
                                <DistributionPieChartSmall
                                    width={200}
                                    height={120}
                                    showInLegend={false}
                                    sort={false}
                                    statGrouping={
                                        currentStatGrouping && currentStatGrouping.values
                                            ? currentStatGrouping
                                            : ({
                                                  count: 0,
                                                  name: '',
                                                  key: GroupByOptions.ExceptionCategory,
                                              } as DashboardStatsElementResponse)
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActiveAgingPies;
