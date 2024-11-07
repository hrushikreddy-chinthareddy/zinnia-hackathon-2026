import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { sortAlphabetically } from '@deps/helpers/dashboard/dashboard-helpers';
import { StatGrouping, StatGroupingOptions, StatGroupingResponse } from '@deps/helpers/dashboard/types';

import DistributionPieChartSmall from '../distribution-charts/distribution-pie-chart-small';

interface Props {
    statGrouping: StatGroupingResponse;
    classNames?: string;
    width?: number;
    distinctAgingStatGroupingLabels: string[];
}

const ActiveAgingPies = ({ statGrouping, classNames, width, distinctAgingStatGroupingLabels }: Props) => {
    return (
        <div className="relative flex justify-end">
            <Typography className="-rotate-90 absolute text-center -left-[20px] top-[35px]" variant={TypographyVariant.BodyBold}>
                Stage
                <br />
                Breakdown
            </Typography>
            <div className={`${classNames} border-b-1 border-[#ddd]`} style={{ width: `${width}px` }}>
                <div className="grid grid-cols-6 gap-2 w-full justify-items-center">
                    {statGrouping.stats.map(currentStatGrouping => {
                        const additionalStats: StatGrouping[] = [];

                        distinctAgingStatGroupingLabels.forEach(currentLabel => {
                            if (!currentStatGrouping.children?.stats.find(stat => stat.label === currentLabel)) {
                                additionalStats.push({
                                    children: null,
                                    count: 0,
                                    label: currentLabel,
                                });
                            }
                        });

                        if (currentStatGrouping.children?.stats) {
                            currentStatGrouping.children.stats = [...currentStatGrouping.children.stats, ...additionalStats];
                            currentStatGrouping.children.stats.sort((a, b) => {
                                return sortAlphabetically(a, b, 'label');
                            });
                        }

                        return (
                            <div key={currentStatGrouping.label}>
                                <DistributionPieChartSmall
                                    width={200}
                                    height={120}
                                    showInLegend={false}
                                    sort={false}
                                    statGrouping={
                                        currentStatGrouping && currentStatGrouping.children
                                            ? (currentStatGrouping.children as StatGroupingResponse)
                                            : ({
                                                  stats: [],
                                                  count: 0,
                                                  groupBy: StatGroupingOptions.Default,
                                              } as StatGroupingResponse)
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
