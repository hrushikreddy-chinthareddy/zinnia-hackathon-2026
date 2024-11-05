import { HighchartsReactRefObject } from 'highcharts-react-official';
import { useCallback, useEffect, useRef, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { getCaseGroupingStats, sortAlphabetically } from '@deps/helpers/dashboard/dashboard-helpers';
import { StatGrouping, StatGroupingOptions, StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { AgingTimeRanges, AgingTimeRangesKeys, AgingTimeRangesKeysExtended, Case } from '@deps/models/case/case';
import { ReactComponent as LighBulb } from '@deps/styles/elements/icons/icons_outlined/light-bulb.svg';

import ActiveAgingBars from './active-aging-bars';
import ActiveAgingPies from './active-aging-pies';

interface Props {
    cases: Case[];
    classNames?: string;
}

interface ActiveAgingStatGrouping {
    count: number;
    label: string;
}

const ActiveAging = ({ cases, classNames }: Props) => {
    const agingChartsRef = useRef<HighchartsReactRefObject>(null);
    const numColumns = 7;
    const [agingChartWidth, setAgingChartWidth] = useState(0);

    const [agingStagesStatGroupings, setAgingStagesStatGroupings] = useState<StatGroupingResponse>({
        count: 0,
        stats: [],
        groupBy: StatGroupingOptions.Default,
    });
    const [subProcessStatGroupings, setSubProcessStatGroupings] = useState<StatGroupingResponse>({
        count: 0,
        stats: [],
        groupBy: StatGroupingOptions.Default,
    });

    const [selectedStageStatGrouping, setSelectedStageStatGrouping] = useState<ActiveAgingStatGrouping[]>();
    const [selectedSubProcessStatGrouping, setSelectedSubProcessStatGrouping] = useState<ActiveAgingStatGrouping[]>([]);
    const [selectedAgingRange, setSelectedAgingRange] = useState<AgingTimeRangesKeysExtended>('All');
    const [subProcessToColorMap, setSubProcessToColorMap] = useState<{ [key: string]: string }>({});
    const [stageDreakdownToColorMap, setStageDreakdownToColorMap] = useState<{ [key: string]: string }>({});
    const [distinctAgingStatGroupingLabels, setDistinctAgingStatGroupingLabels] = useState<string[]>([]);
    const getAgingGroupingStats = useCallback(
        (groupings: StatGroupingResponse) => {
            const timeframeStats: { label: string; statGroupings: StatGrouping }[] = [];
            groupings.stats.forEach(statGrouping => {
                const child = statGrouping.children?.stats.find(statGrouping => statGrouping.label === selectedAgingRange);
                if (child) {
                    timeframeStats.push({
                        label: statGrouping.label,
                        statGroupings: child,
                    });
                }
            });

            return timeframeStats;
        },
        [selectedAgingRange]
    );

    const getSelectedSubProcessStatGrouping = useCallback(
        (groupings: StatGroupingResponse) => {
            if (selectedAgingRange === 'All') {
                return [...groupings.stats]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map(statGrouping => {
                        return {
                            count: statGrouping.count,
                            label: statGrouping.label,
                        };
                    });
            }

            return getAgingGroupingStats(groupings)
                .sort((a, b) => b.statGroupings.count - a.statGroupings.count)
                .slice(0, 5)
                .map(stat => {
                    return {
                        count: stat.statGroupings.count,
                        label: stat.label,
                    };
                });
        },
        [getAgingGroupingStats, selectedAgingRange]
    );

    const getSelectedStageBreakdown = useCallback(
        (agingStatGrouping: StatGroupingResponse) => {
            if (selectedAgingRange === 'All') {
                const g: StatGroupingResponse = {
                    count: 0,
                    stats: [],
                    groupBy: StatGroupingOptions.Default,
                };
                const stageCountsMap: { [key: string]: number } = {};

                agingStatGrouping.stats.forEach(statGrouping => {
                    if (statGrouping.children) {
                        statGrouping.children.stats.forEach(statGrouping => {
                            if (!stageCountsMap[statGrouping.label]) {
                                stageCountsMap[statGrouping.label] = 0;
                            }
                            stageCountsMap[statGrouping.label] += statGrouping.count;
                        });
                    }
                });

                Object.keys(stageCountsMap).forEach(key => {
                    g.stats.push({
                        label: key,
                        count: stageCountsMap[key],
                    });
                });

                return g.stats
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map(stat => {
                        return {
                            count: stat.count,
                            label: stat.label,
                        };
                    });
            }
            return agingStatGrouping.stats
                .find(statGrouping => statGrouping.label === selectedAgingRange)
                ?.children?.stats.sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(stat => {
                    return {
                        count: stat.count,
                        label: stat.label,
                    };
                });
        },
        [selectedAgingRange]
    );

    const createSubProcessToColorMap = (subProcessStatGroupings: StatGroupingResponse) => {
        const map: { [key: string]: string } = {};
        const barChartColors = caseChartHelpers.getAlternativeColors();

        subProcessStatGroupings.stats.forEach((statGrouping, index) => {
            map[statGrouping.label] = barChartColors[index];
        });

        return map;
    };

    const getAgingStagesStatGrouping = (cases: Case[]): StatGroupingResponse => {
        const stageStatGrouping = getCaseGroupingStats(cases, [StatGroupingOptions.AgingRange, StatGroupingOptions.OpenStages]);
        return stageStatGrouping;
    };

    const getDistinctAgingStatGroupingLabels = (agingStatGrouping: StatGroupingResponse) => {
        const distinctAgingStatGroupingLabelSet: Set<string> = new Set();

        agingStatGrouping.stats.forEach(statGrouping => {
            statGrouping.children?.stats.forEach(statGrouping => {
                distinctAgingStatGroupingLabelSet.add(statGrouping.label);
            });
        });
        return Array.from(distinctAgingStatGroupingLabelSet);
    };

    const createAgingStageBreakDownToColorMap = (agingStatGroupingLabels: string[]) => {
        const map: { [key: string]: string } = {};
        const pieColors = caseChartHelpers.getColors();

        agingStatGroupingLabels
            .sort((a, b) => {
                return sortAlphabetically(a, b);
            })
            .forEach((label, index) => {
                map[label] = pieColors[index % pieColors.length];
            });
        return map;
    };

    const getAgingSubProcessStatGrouping = (cases: Case[]): StatGroupingResponse => {
        const subProcessStatgrouping = getCaseGroupingStats(cases, [StatGroupingOptions.ProcessSubType, StatGroupingOptions.AgingRange]);

        return subProcessStatgrouping;
    };

    const onAgingTimelineChange = (value: AgingTimeRangesKeysExtended) => {
        if (value === selectedAgingRange) {
            setSelectedAgingRange('All');
        } else {
            setSelectedAgingRange(value);
        }
    };

    const getAgingSubtitle = () => {
        if (selectedAgingRange === 'All') {
            return `Showing All (Total ${wholeNumberFormatify(cases.length)} apps)`;
        }
        const count = selectedStageStatGrouping?.reduce((a, b) => a + b.count, 0);
        return `${AgingTimeRanges[selectedAgingRange]} Days (Total ${wholeNumberFormatify(count)} apps)`;
    };

    const renderDummyText = () => {
        return (
            <>
                <Typography className="flex gap-2 items-center mb-4" variant={TypographyVariant.BodyBold}>
                    <LighBulb height={24} width={24} />
                    <span>Insight</span>
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore a nobis consequatur magnam obcaecati beatae amet aut
                    fuga nisi earum, est rerum, explicabo architecto placeat voluptas quaerat porro debitis iusto!
                </Typography>
            </>
        );
    };

    const handleWindowResize = useCallback(() => {
        if (agingChartsRef.current) {
            const highchartsPlotBackground = agingChartsRef.current.container.current?.querySelector('.highcharts-plot-background');
            if (highchartsPlotBackground) {
                const { width } = highchartsPlotBackground.getBoundingClientRect();
                setAgingChartWidth(width);
            }
        }
    }, []);

    const onRenderChart = useCallback(() => {
        handleWindowResize();
    }, [handleWindowResize]);

    useEffect(() => {
        if (cases && cases.length > 0) {
            const agingStatGrouping = getAgingStagesStatGrouping(cases);
            const subProcessStatgrouping = getAgingSubProcessStatGrouping(cases);
            const distinctAgingStatGroupingLabels = getDistinctAgingStatGroupingLabels(agingStatGrouping);

            setDistinctAgingStatGroupingLabels(distinctAgingStatGroupingLabels);
            setAgingStagesStatGroupings(agingStatGrouping);
            setSubProcessStatGroupings(subProcessStatgrouping);

            setSelectedStageStatGrouping(getSelectedStageBreakdown(agingStatGrouping));
            setSubProcessToColorMap(createSubProcessToColorMap(subProcessStatgrouping));
            setStageDreakdownToColorMap(createAgingStageBreakDownToColorMap(distinctAgingStatGroupingLabels));
            setSelectedSubProcessStatGrouping(getSelectedSubProcessStatGrouping(subProcessStatgrouping));
        }
    }, [cases, getSelectedStageBreakdown, getSelectedSubProcessStatGrouping, selectedAgingRange]);

    return (
        <CardContainer fullWidth={false} containerClassNames={classNames}>
            <Typography className="mb-1" variant={TypographyVariant.H2}>
                Active Aging
            </Typography>
            <Typography className="capitalize mb-4" variant={TypographyVariant.H4} asTag="h3">
                {getAgingSubtitle()}
            </Typography>
            <div className="flex flex-col xl:flex-row justify-between gap-4">
                <div className="flex xl:flex-col xl:w-1/4 gap-4 mb-8 xl:mb-0">
                    <div className="flex-1 border-r-1 xl:border-r-0 border-[#EDEDED] pr-2 xl:pr-0">{renderDummyText()}</div>
                    <div className="flex-1 border-r-1 xl:border-r-0 xl:border-t-1 border-[#EDEDED]">
                        <Typography className="mb-4 xl:mt-1" variant={TypographyVariant.BodySmBold}>
                            Top volume by type
                        </Typography>
                        <ol className="flex flex-col gap-2 pr-4">
                            {selectedSubProcessStatGrouping.map(stat => (
                                <li key={stat.label}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3" style={{ backgroundColor: subProcessToColorMap[stat.label] }}></div>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            <Typography
                                                className="flex gap-1 truncate capitalize"
                                                variant={TypographyVariant.BodySm}
                                                data-testid="header-text"
                                            >
                                                {stat.label?.toLocaleLowerCase()}
                                            </Typography>
                                            <Typography
                                                className="flex gap-2"
                                                variant={TypographyVariant.BodySmBold}
                                                data-testid="header-text"
                                            >
                                                {wholeNumberFormatify(stat.count)}
                                            </Typography>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="flex-1 xl:border-t-1 border-[#EDEDED]">
                        <Typography className="mb-4 xl:mt-1" variant={TypographyVariant.BodySmBold}>
                            Top stage breakdown
                        </Typography>
                        <ol className="flex flex-col gap-2 pr-4">
                            {selectedStageStatGrouping?.map(stat => (
                                <li key={stat.label}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3" style={{ backgroundColor: stageDreakdownToColorMap[stat.label] }}></div>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            <Typography
                                                className="flex gap-1 truncate capitalize"
                                                variant={TypographyVariant.BodySm}
                                                data-testid="header-text"
                                            >
                                                {stat.label?.toLocaleLowerCase()}
                                            </Typography>
                                            <Typography
                                                className="flex gap-2"
                                                variant={TypographyVariant.BodySmBold}
                                                data-testid="header-text"
                                            >
                                                {wholeNumberFormatify(stat.count)}
                                            </Typography>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                <div className="relative xl:w-3/4">
                    {Array(numColumns)
                        .fill(null)
                        .map((_, i) => {
                            const rightDistancePerBlock = agingChartWidth / (numColumns - 1);
                            const rightPxPosition = Math.floor(i * rightDistancePerBlock);

                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        right: `${rightPxPosition}px`,
                                        width: '1px',
                                        height: '100%',
                                        backgroundColor: '#ddd',
                                        zIndex: 1,
                                    }}
                                />
                            );
                        })}
                    <div className={'flex items-stretch flex-wrap ml-[85px] ' + (classNames ?? '')}>
                        <div className="grid grid-cols-6 gap-2 w-full justify-items-center" aria-label="chips">
                            {agingStagesStatGroupings.stats.map(option => (
                                <button
                                    className="chip w-4/5"
                                    key={`people-chip-${option.label}`}
                                    value={option.label}
                                    aria-checked={selectedAgingRange === option.label}
                                    onClick={() => onAgingTimelineChange(option.label as AgingTimeRangesKeysExtended)}
                                >
                                    {AgingTimeRanges[option.label as AgingTimeRangesKeys]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ActiveAgingBars
                        classNames="-mb-10"
                        onRenderChart={onRenderChart}
                        ref={agingChartsRef}
                        statGrouping={subProcessStatGroupings}
                    />
                    <ActiveAgingPies
                        distinctAgingStatGroupingLabels={distinctAgingStatGroupingLabels}
                        width={agingChartWidth}
                        statGrouping={agingStagesStatGroupings}
                    />
                </div>
            </div>
        </CardContainer>
    );
};

export default ActiveAging;
