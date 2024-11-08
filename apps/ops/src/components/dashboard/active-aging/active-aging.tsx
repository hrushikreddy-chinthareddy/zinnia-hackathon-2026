import { HighchartsReactRefObject } from 'highcharts-react-official';
import { useCallback, useEffect, useRef, useState } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import {
    AgingTimeRanges,
    AgingTimeRangesKeys,
    AgingTimeRangesKeysExtended,
    CaseDashboardStatsResponse,
    DashboardStatsElementResponse,
    Processes,
} from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as LighBulb } from '@deps/styles/elements/icons/icons_outlined/light-bulb.svg';

import ActiveAgingBars from './active-aging-bars';
import ActiveAgingPies from './active-aging-pies';

interface Props {
    classNames?: string;
    createdBySubProcess: CaseDashboardStatsResponse;
    openStagesByCreated: CaseDashboardStatsResponse;
    loading?: boolean;
    selectedProcess: Processes;
    carriers: string[];
}

const ActiveAging = ({ classNames, createdBySubProcess, openStagesByCreated, loading = true, selectedProcess, carriers }: Props) => {
    const agingChartsRef = useRef<HighchartsReactRefObject>(null);
    const numColumns = 7;
    const [agingChartWidth, setAgingChartWidth] = useState(0);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const [agingRangesBySubProcess, setAgingRangesBySubProcess] = useState<CaseDashboardStatsResponse>();
    const [openStagesByAgingRanges, setOpenStagesByAgingRanges] = useState<CaseDashboardStatsResponse>();
    const [distinctOpenStages, setDistinctOpenStages] = useState<string[]>([]);

    const [selectedAgingRange, setSelectedAgingRange] = useState<AgingTimeRangesKeysExtended>('All');
    const [agingGroupingMap, setAgingGroupingMap] = useState<{ [key in AgingTimeRangesKeysExtended]: DashboardStatsElementResponse[] }>({
        EightToFourteen: [],
        FifteenToThirty: [],
        FortySixToFiftyNine: [],
        SixtyPlus: [],
        ThirtyOneToFortyFive: [],
        ZeroToSeven: [],
        All: [],
    });
    const [agingStageGroupingMap, setAgingStageGroupingMap] = useState<{
        [key in AgingTimeRangesKeysExtended]: DashboardStatsElementResponse[];
    }>({
        EightToFourteen: [],
        FifteenToThirty: [],
        FortySixToFiftyNine: [],
        SixtyPlus: [],
        ThirtyOneToFortyFive: [],
        ZeroToSeven: [],
        All: [],
    });
    const [subProcessToColorMap, setSubProcessToColorMap] = useState<{ [key: string]: string }>({});
    const [stageDreakdownToColorMap, setStageDreakdownToColorMap] = useState<{ [key: string]: string }>({});
    const [startAndEndDates, setStartAndEndDates] = useState<{
        createdDateStart: string;
        createdDateEnd: string;
    }>(getStartAndEndDates('All'));
    const shouldShowCaseInsights = useCaseInsightsPermission();

    const getAgingTimeRangeFromDate = useCallback((createdDate: Date) => {
        const now = Date.now();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const fourtyFiveDaysAgo = new Date(now - 45 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

        let timeRange = '';
        if (createdDate < sixtyDaysAgo) {
            timeRange = 'SixtyPlus';
        } else if (createdDate < fourtyFiveDaysAgo) {
            timeRange = 'FortySixToFiftyNine';
        } else if (createdDate < thirtyDaysAgo) {
            timeRange = 'ThirtyOneToFortyFive';
        } else if (createdDate < fourteenDaysAgo) {
            timeRange = 'FifteenToThirty';
        } else if (createdDate < sevenDaysAgo) {
            timeRange = 'EightToFourteen';
        } else {
            timeRange = 'ZeroToSeven';
        }
        return timeRange;
    }, []);

    const onAgingTimelineChange = (value: AgingTimeRangesKeysExtended) => {
        if (value === selectedAgingRange) {
            setSelectedAgingRange('All');
        } else {
            setSelectedAgingRange(value);
        }
    };

    const getAgingSubtitle = () => {
        // Note: we use the subProcess by againg instead of openStage because openStage does multiple counting as cases are in multiple stages
        // at the same time.
        let totalCaseCount = 0;
        if (selectedAgingRange === 'All') {
            totalCaseCount = createdBySubProcess.data.reduce((a, b) => a + b.count, 0);
            return `Showing All (Total ${wholeNumberFormatify(totalCaseCount)} apps)`;
        }

        agingRangesBySubProcess?.data.forEach(subProcessGrouping => {
            subProcessGrouping.values?.forEach(agingRangeUnderSubProcessGrouping => {
                if (agingRangeUnderSubProcessGrouping.name === selectedAgingRange) {
                    totalCaseCount += agingRangeUnderSubProcessGrouping.count;
                }
            });
        });

        return `${AgingTimeRanges[selectedAgingRange]} Days (Total ${wholeNumberFormatify(totalCaseCount ?? -1000)} apps)`;
    };

    const getOpenAiSummary = async (caseStats: DashboardStatsElementResponse[]) => {
        try {
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things case data. Your job is to summarize the data for business and executive users.
                          They want simple and insightful information about the data provided to you. The cases provided to you here are open cases delineated by insurance carrier. Avoid using phrases such as "the data".
                          Your responses should be insightful and will be displayed on a UI as a summary for a module related to a pie chart. Use percentages and real data where it makes sense. Keep it conscise and to the point. Format number values to U.S.`,
            });
            return summary;
        } catch (error) {
            return '';
        }
    };

    const renderDummyText = () => {
        if (!shouldShowCaseInsights) {
            return null;
        }
        return (
            <>
                <div className="flex-1 border-r-1 xl:border-r-0 border-[#EDEDED] pr-2 xl:pr-0">
                    <Typography className="flex gap-2 items-center mb-4" variant={TypographyVariant.BodyBold}>
                        <LighBulb height={24} width={24} />
                        <span>Insight</span>
                    </Typography>
                    <Typography variant={TypographyVariant.BodySm}>{aiSummary ?? 'Generating AI Summary...'}</Typography>
                </div>
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

    const createSubProcessToColorMap = (subProcessStatGroupings: CaseDashboardStatsResponse) => {
        const map: { [key: string]: string } = {};
        const barChartColors = caseChartHelpers.getAlternativeColors();

        subProcessStatGroupings.data.forEach((statGrouping, index) => {
            map[statGrouping.name] = barChartColors[index];
        });

        return map;
    };

    const createAgingStageBreakDownToColorMap = (agingStatGroupingLabels: string[]) => {
        const map: { [key: string]: string } = {};
        const pieColors = caseChartHelpers.getColors();

        agingStatGroupingLabels
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .forEach((label, index) => {
                map[label.toLowerCase()] = pieColors[index % pieColors.length];
            });
        return map;
    };

    /**
     * @param countsByDate A list of DashboardStatsElementResponse objects,
     *   each of which contains a name (a date) and a count.
     * @returns A list of DashboardStatsElementResponse objects, each of which
     *   contains a name (an aging time range) and a count.
     *   The count is the sum of the counts from the input elements whose dates
     *   fall within the corresponding aging time range. NOTE: This is required
     *   as the Case Management API does not support grouping by date range.
     */
    const groupIntoAgingRanges = useCallback(
        (countsByDate: DashboardStatsElementResponse[]) => {
            const groupedAgingRange: DashboardStatsElementResponse[] = [];
            Object.keys(AgingTimeRanges).forEach(key => {
                groupedAgingRange.push({
                    key: GroupByOptions.AgingTimeRanges,
                    name: key,
                    count: 0,
                });
            });

            countsByDate.forEach(countByDate => {
                let groupedAgingItem: DashboardStatsElementResponse | undefined = { key: GroupByOptions.Default, name: '', count: 0 };
                const timeRange = getAgingTimeRangeFromDate(new Date(countByDate.name));

                groupedAgingItem = groupedAgingRange.find(agingRange => agingRange.name === timeRange);
                if (groupedAgingItem && groupedAgingItem.key !== GroupByOptions.Default) {
                    groupedAgingItem.count += countByDate.count;
                }
            });

            return groupedAgingRange;
        },
        [getAgingTimeRangeFromDate]
    );

    useEffect(() => {
        const groupedAgingRangeBySubProcess: CaseDashboardStatsResponse = { data: [], totalElements: 0 };
        createdBySubProcess.data.forEach(subProcess => {
            groupedAgingRangeBySubProcess.data.push({
                key: GroupByOptions.ProcessSubType,
                name: subProcess.name,
                count: subProcess.count,
                values: groupIntoAgingRanges(subProcess.values ?? []),
            });
        });
        setAgingRangesBySubProcess(groupedAgingRangeBySubProcess as CaseDashboardStatsResponse);
        setSubProcessToColorMap(createSubProcessToColorMap(groupedAgingRangeBySubProcess));
        const agingGroupingMap: { [key in AgingTimeRangesKeysExtended]: DashboardStatsElementResponse[] } = {
            EightToFourteen: [],
            FifteenToThirty: [],
            FortySixToFiftyNine: [],
            SixtyPlus: [],
            ThirtyOneToFortyFive: [],
            ZeroToSeven: [],
            All: JSON.parse(JSON.stringify(groupedAgingRangeBySubProcess.data)),
        };

        groupedAgingRangeBySubProcess.data.forEach(element => {
            element.values?.forEach(agingRange => {
                agingGroupingMap[agingRange.name as AgingTimeRangesKeys].push({
                    key: GroupByOptions.AgingRange,
                    name: element.name,
                    count: agingRange.count,
                    values: agingRange.values ?? [],
                });
            });
        });
        Object.keys(agingGroupingMap).forEach(key => {
            agingGroupingMap[key as AgingTimeRangesKeysExtended].sort((a, b) => {
                return b.count - a.count;
            });
        });
        setAgingGroupingMap(agingGroupingMap);
    }, [createdBySubProcess, groupIntoAgingRanges]);

    useEffect(() => {
        const groupedOpenStagesByAgingRanges: CaseDashboardStatsResponse = { data: [], totalElements: 0 };
        const openStagesByAgingRangeMap: { [key: string]: DashboardStatsElementResponse[] } = {};
        const distinctAgingStatGroupingLabels: Record<string, boolean> = {};

        // first we are going to create the aging ranges in the grouping and our mapping to house the child values
        Object.keys(AgingTimeRanges).forEach(key => {
            groupedOpenStagesByAgingRanges.data.push({
                key: GroupByOptions.AgingRange,
                name: key,
                count: 0,
                values: [],
            });
            openStagesByAgingRangeMap[key] = [];
        });

        // second we need to create a map of all the open stages by aging range (this gives us a lot of entries)
        openStagesByCreated.data.forEach(createdGroupingOfOpenStages => {
            const timeRange = getAgingTimeRangeFromDate(new Date(createdGroupingOfOpenStages.name));
            openStagesByAgingRangeMap[timeRange] = openStagesByAgingRangeMap[timeRange].concat(createdGroupingOfOpenStages.values ?? []);
        });

        // third we need to finally reduce the open stages in each range leaving us with the final grouping
        Object.keys(AgingTimeRanges).forEach(agingTimeFrameKey => {
            const matchingGroupItem = groupedOpenStagesByAgingRanges.data.find(item => item.name === agingTimeFrameKey);
            if (!matchingGroupItem) {
                return;
            }
            const stageCounts: { [key: string]: number } = {};
            openStagesByAgingRangeMap[agingTimeFrameKey].forEach(openStage => {
                const stageName = openStage.name.toLocaleLowerCase();
                if (!stageCounts[stageName]) {
                    stageCounts[stageName] = openStage.count;
                } else {
                    stageCounts[stageName] += openStage.count;
                }
                matchingGroupItem.count += openStage.count;

                // check to see if the label is already in the list, if not, add it
                const labelAddedToList = !!distinctAgingStatGroupingLabels[openStage.name];
                if (!labelAddedToList) {
                    distinctAgingStatGroupingLabels[openStage.name] = true;
                }
            });
            Object.keys(stageCounts).forEach(stageKey => {
                matchingGroupItem?.values?.push({
                    key: GroupByOptions.AgingRange,
                    name: stageKey,
                    count: stageCounts[stageKey],
                });
            });
            // make sure we sort the values alphabetically. This is important later because we will use the ordering to
            // determin the color of the elements.
            matchingGroupItem?.values?.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        });
        // let's set the distinct list of open stages for color and pie use later
        const distinctOpenStagesLabels: string[] = Object.keys(distinctAgingStatGroupingLabels);
        setDistinctOpenStages(distinctOpenStagesLabels);
        // set the grouping into state so we can use it later
        const agingStageGroupingMap: { [key in AgingTimeRangesKeysExtended]: DashboardStatsElementResponse[] } = {
            EightToFourteen: [],
            FifteenToThirty: [],
            FortySixToFiftyNine: [],
            SixtyPlus: [],
            ThirtyOneToFortyFive: [],
            ZeroToSeven: [],
            All: [],
        };
        groupedOpenStagesByAgingRanges.data.forEach(element => {
            if (element?.values) {
                element.values.forEach(statGrouping => {
                    const agingStage = agingStageGroupingMap[element.name as AgingTimeRangesKeysExtended].find(
                        item => item.name === statGrouping.name
                    );
                    const allAgingStages = agingStageGroupingMap.All.find(item => item.name === statGrouping.name);

                    if (agingStage) {
                        agingStage.count += statGrouping.count;
                    } else {
                        agingStageGroupingMap[element.name as AgingTimeRangesKeysExtended].push(statGrouping);
                    }

                    if (allAgingStages) {
                        allAgingStages.count += statGrouping.count;
                    } else {
                        agingStageGroupingMap.All.push(statGrouping);
                    }
                });
            }
        });

        Object.keys(agingStageGroupingMap).forEach(key => {
            agingStageGroupingMap[key as AgingTimeRangesKeysExtended].sort((a, b) => {
                return b.count - a.count;
            });
        });
        setStageDreakdownToColorMap(createAgingStageBreakDownToColorMap(distinctOpenStagesLabels));
        setAgingStageGroupingMap(agingStageGroupingMap);
        setOpenStagesByAgingRanges(groupedOpenStagesByAgingRanges);
    }, [getAgingTimeRangeFromDate, openStagesByCreated]);

    useEffect(() => {
        setStartAndEndDates(getStartAndEndDates(selectedAgingRange));
    }, [selectedAgingRange]);

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (!loading && agingRangesBySubProcess && agingRangesBySubProcess.data && agingRangesBySubProcess.data.length > 0) {
            getOpenAiSummary(agingGroupingMap[selectedAgingRange]).then(summary => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        }
    }, [agingGroupingMap, agingRangesBySubProcess, loading, selectedAgingRange, shouldShowCaseInsights]);

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
                    {renderDummyText()}
                    <div className="flex-1 border-r-1 xl:border-r-0 xl:border-t-1 border-[#EDEDED]">
                        <Typography className="mb-4 xl:mt-1" variant={TypographyVariant.BodySmBold}>
                            Top volume by type
                        </Typography>
                        <ol className="flex flex-col gap-2 pr-4">
                            {agingGroupingMap[selectedAgingRange as AgingTimeRangesKeys].slice(0, 5).map((stat, index) => (
                                <li key={`stat-${index}-${stat.name}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3" style={{ backgroundColor: subProcessToColorMap[stat.name] }}></div>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            <NavElement
                                                href={`/cases${convertToQueryString({
                                                    requestSubType: stat.name,
                                                    process: selectedProcess,
                                                    createdDateStart: startAndEndDates.createdDateStart,
                                                    createdDateEnd: startAndEndDates.createdDateEnd,
                                                    carrier: carriers?.length ? carriers : '',
                                                })}`}
                                                size={NavElementSize.Small}
                                                type={NavElementType.Link}
                                                className="capitalize"
                                                target="_blank"
                                            >
                                                {stat.name.toLocaleLowerCase()}
                                            </NavElement>
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
                            {agingStageGroupingMap[selectedAgingRange as AgingTimeRangesKeys].slice(0, 5).map(stat => (
                                <li key={stat.name}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3" style={{ backgroundColor: stageDreakdownToColorMap[stat.name] }}></div>
                                        <div className="flex items-center gap-1 w-full justify-between">
                                            <Typography
                                                className="flex gap-1 truncate capitalize"
                                                variant={TypographyVariant.BodySm}
                                                data-testid="header-text"
                                            >
                                                {stat.name}
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
                    {Object.keys(AgingTimeRanges)
                        .reverse()
                        .map((option, i) => {
                            const rightDistancePerBlock = agingChartWidth / (numColumns - 1);
                            const rightPxPosition = Math.floor(i * rightDistancePerBlock);

                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        right: `${rightPxPosition}px`,
                                        width: rightDistancePerBlock,
                                        height: 'calc(100% - 42px)',
                                        maxHeight: '511px',
                                        top: '42px',
                                        borderTop: option === selectedAgingRange ? '3px solid #333' : 'none',
                                        borderRight: '1px solid #ddd',
                                        borderLeft: i === Object.keys(AgingTimeRanges).length - 1 ? '1px solid #ddd' : 'none',
                                    }}
                                >
                                    <div
                                        className="h-3 w-3"
                                        style={{
                                            backgroundColor: option === selectedAgingRange ? '#ddd' : 'transparent',
                                            opacity: option === selectedAgingRange ? 0.2 : 0,
                                            height: '100%',
                                            width: '100%',
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                    <div className={'flex items-stretch flex-wrap ml-[85px] ' + (classNames ?? '')}>
                        <div className="grid grid-cols-6 gap-2 w-full justify-items-center" aria-label="chips">
                            {Object.keys(AgingTimeRanges).map(option => (
                                <button
                                    className="chip w-4/5"
                                    key={`people-chip-${option}`}
                                    value={option}
                                    aria-checked={selectedAgingRange === option}
                                    onClick={() => onAgingTimelineChange(option as AgingTimeRangesKeysExtended)}
                                >
                                    {AgingTimeRanges[option as AgingTimeRangesKeys]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ActiveAgingBars
                        classNames="-mb-10"
                        onRenderChart={onRenderChart}
                        ref={agingChartsRef}
                        agingRangesByProcess={agingRangesBySubProcess ?? { data: [], totalElements: 0 }}
                    />
                    <ActiveAgingPies
                        distinctAgingStatGroupingLabels={distinctOpenStages}
                        width={agingChartWidth}
                        dashboardStatsResponse={openStagesByAgingRanges ?? { data: [], totalElements: 0 }}
                    />
                </div>
            </div>
        </CardContainer>
    );
};

export default ActiveAging;
