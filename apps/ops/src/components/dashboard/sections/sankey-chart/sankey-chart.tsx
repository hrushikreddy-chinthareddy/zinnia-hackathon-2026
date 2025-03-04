import { useQuery } from '@tanstack/react-query';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { FieldSize, FieldType } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import SelectSimple from '@deps/components/select/select';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { dashboardChartTitleFormat, getLabelSubString } from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getStatsFromSelectionQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';

import { SankeyCellText } from './sankey-cell-text';

interface Props {
    height?: number;
    width?: number;
    chartOptions?: SankeyChartOptions;
    baseDashboardQueryFilter?: DashboardSearchFilter;
}

interface SankeyChartOptions {
    blockWidths?: number;
    blockheights?: number;
    blockSpacing?: number;
    pathSpacing?: number;
    svgleftAndRightPadding?: number;
    pathStrokeOpacity?: number;
    minPathStrokeWidth?: number;
    maxPathStrokeWidth?: number;
    maxItems?: number;
}

const defaultChartOptions = {
    blockWidths: 250,
    blockheights: 50,
    blockSpacing: 10,
    pathSpacing: 2,
    svgleftAndRightPadding: 10,
    pathStrokeOpacity: 0.7,
    minPathStrokeWidth: 5,
    maxPathStrokeWidth: 30,
    maxItems: 10,
};

const DEFAULT_GROUPBY_FILTER_OPTIONS = {
    L1SelectValue: GroupByOptions.BrokerDealerName,
    L2SelectValue: GroupByOptions.ProcessSubType,
    L3SelectValue: GroupByOptions.CaseStatus,
};

const SankeyChart = ({ height = 570, width = 1536, chartOptions = defaultChartOptions, baseDashboardQueryFilter }: Props) => {
    const { t } = useTranslation();
    const mergedChartOptions = { ...defaultChartOptions, ...chartOptions };
    const {
        blockWidths,
        blockheights,
        blockSpacing,
        pathSpacing,
        svgleftAndRightPadding,
        pathStrokeOpacity,
        minPathStrokeWidth,
        maxPathStrokeWidth,
        maxItems,
    } = mergedChartOptions;
    const [totalCases, setTotalCases] = useState<number>(0);

    const [level1ObjectGrouping, setLevel1ObjectGrouping] = useState<DashboardStatsElementResponse[]>([]);
    const [level2ObjectGrouping, setLevel2ObjectGrouping] = useState<DashboardStatsElementResponse[]>([]);
    const [level3ObjectGrouping, setLevel3ObjectGrouping] = useState<DashboardStatsElementResponse[]>([]);
    const [l1SelectedIndex, setL1SelectedIndex] = useState<number>(-100);

    const [l1SelectValue, setL1SelectValue] = useState(DEFAULT_GROUPBY_FILTER_OPTIONS.L1SelectValue);
    const [l2SelectValue, setL2SelectValue] = useState(DEFAULT_GROUPBY_FILTER_OPTIONS.L2SelectValue);
    const [l3SelectValue, setL3SelectValue] = useState(DEFAULT_GROUPBY_FILTER_OPTIONS.L3SelectValue);

    const [parentSize, setParentSize] = useState({ width, height });
    const svgParentRef = useRef<HTMLDivElement>(null);

    const {
        data: caseGroupingState,
        isLoading: caseGroupingDataLoading,
        isFetching,
    } = useQuery({
        queryKey: ['caseGrouping', baseDashboardQueryFilter, l1SelectValue, l2SelectValue, l3SelectValue],
        queryFn: () => {
            setL1SelectedIndex(-100);
            return getStatsFromSelectionQuery(baseDashboardQueryFilter, l1SelectValue, l2SelectValue, l3SelectValue);
        },
        placeholderData: previousData => previousData,
        enabled: Object.keys(baseDashboardQueryFilter || {}).length > 0,
    });

    const getGroupingsFromL1 = (l1ObjectGrouping: DashboardStatsElementResponse[]) => {
        const l2Grouping: DashboardStatsElementResponse[] = [];
        const l3Grouping: DashboardStatsElementResponse[] = [];
        const tempL2Grouping: DashboardStatsElementResponse[] = [];
        const tempL3Grouping: DashboardStatsElementResponse[] = [];

        const l2CountByKeyMap: { [key: string]: number } = {};
        const l3CountByKeyMap: { [key: string]: number } = {};

        // Loop through and build the temp arrays to later squash and add counts up
        l1ObjectGrouping.forEach(l1Grouping => {
            if (l1Grouping && l1Grouping.values && l1Grouping.values && l1Grouping.values.length > 0) {
                l1Grouping.values.forEach(l2ChildGrouping => {
                    const clonedL2ChildGrouping: DashboardStatsElementResponse = JSON.parse(JSON.stringify(l2ChildGrouping));
                    tempL2Grouping.push(clonedL2ChildGrouping);

                    clonedL2ChildGrouping?.values?.forEach(l3ChildGrouping => {
                        const clonedL3ChildGrouping = JSON.parse(JSON.stringify(l3ChildGrouping));
                        tempL3Grouping.push(clonedL3ChildGrouping);
                    });
                });
            }
        });

        // We need to get the counts without modifying the original instances, so we keep track in our countByKeyMaps
        tempL2Grouping.forEach(grouping => {
            if (grouping) {
                // Squash the array to only 1 instance of each grouping label
                if (!l2Grouping.find(l2Group => l2Group.name === grouping.name)) {
                    l2Grouping.push(grouping);
                }
                if (l2CountByKeyMap[grouping.name]) {
                    l2CountByKeyMap[grouping.name] += grouping.count;
                } else {
                    l2CountByKeyMap[grouping.name] = grouping.count;
                }
            }
        });
        tempL3Grouping.forEach(grouping => {
            if (grouping) {
                if (!l3Grouping.find(l3Group => l3Group.name === grouping.name)) {
                    l3Grouping.push(grouping);
                }
                if (l3CountByKeyMap[grouping.name]) {
                    l3CountByKeyMap[grouping.name] += grouping.count;
                } else {
                    l3CountByKeyMap[grouping.name] = grouping.count;
                }
            }
        });

        // now that we have the counts, we need to go through and update each grouping
        Object.keys(l2CountByKeyMap).forEach(key => {
            const currentl2Grouping = l2Grouping.find(l2Group => l2Group.name === key);

            if (currentl2Grouping) {
                currentl2Grouping.count = l2CountByKeyMap[key];
            }
        });
        Object.keys(l3CountByKeyMap).forEach(key => {
            const currentL3Grouping = l3Grouping.find(l2Group => l2Group.name === key);

            if (currentL3Grouping) {
                currentL3Grouping.count = l3CountByKeyMap[key];
            }
        });

        return { l2Grouping, l3Grouping };
    };

    const calculateVerticalBlockPosition = (index: number, count: number) => {
        const centerPoint = parentSize.height / 2;
        const isCountEven = count % 2 === 0;
        const positions: number[] = [];
        const middleIndex = Math.floor(count / 2);

        if (count === 2) {
            positions.push(centerPoint - blockheights - blockSpacing / 2);
            positions.push(centerPoint + blockSpacing / 2);
            return positions[index];
        }

        for (let i = 0; i < count; i++) {
            let calculatedPosition: number = 0;
            if (isCountEven) {
                if (i < middleIndex) {
                    calculatedPosition =
                        centerPoint - ((middleIndex - i - 1) * blockSpacing) / 2 - blockheights - (middleIndex - i - 1) * blockheights;
                } else {
                    calculatedPosition =
                        centerPoint +
                        ((i - middleIndex) * blockSpacing) / 2 +
                        blockSpacing / 2 +
                        blockheights +
                        (i - middleIndex - 1) * blockheights;
                }
            } else {
                if (i === middleIndex) {
                    calculatedPosition = centerPoint - blockheights / 2;
                } else if (i < middleIndex) {
                    calculatedPosition =
                        centerPoint -
                        ((middleIndex - i - 1) * blockSpacing) / 2 -
                        blockheights / 2 -
                        (middleIndex - i) * blockheights -
                        blockSpacing / 2;
                } else {
                    calculatedPosition =
                        centerPoint +
                        ((i - middleIndex - 1) * blockSpacing) / 2 -
                        blockheights / 2 +
                        (i - middleIndex) * blockheights +
                        blockSpacing / 2;
                }
            }

            positions.push(calculatedPosition);

            if (i === index) {
                return positions[i];
            }
        }

        return 0;
    };

    const getLevel1PathColor = (index: number, reverse?: boolean) => {
        //const colors = ['#85bcd3', '#90b4cc', '#9bacc5', '#a6a4bf', '#b19cb8', '#bc94b2', '#c78cab', '#d385a5'];
        // const pastelColors = ['#fd7f6f', '#7eb0d5',  '#b2e061','#bd7ebe','#ffb55a','#ffee65','#beb9db','#fdcce5','#8bd3c7','#beb9db','#fdcce5','#8bd3c7'];

        const colors = caseChartHelpers.getColors();

        if (reverse) {
            colors.reverse();
        }

        return colors[index];
    };

    const getLevel2PathColor = (index: number) => {
        const colors = ['#27323A', '#435055', '#29A19C', '#A3F7BF'];
        return colors[index];
    };

    const calculateLevel1PathCoordinates = (level1Index: number, level2Index: number) => {
        const level1BlockVPosition = calculateVerticalBlockPosition(level1Index, level1ObjectGrouping.length);
        const level2BlockVPosition = calculateVerticalBlockPosition(level2Index, level2ObjectGrouping.length);

        // x and y position on the level 1 block end
        const xStart = blockWidths + svgleftAndRightPadding;
        const yStart = level1BlockVPosition + blockheights / 2;

        // x and y position on the level 2 block start
        const xEnd = parentSize.width / 2 - blockWidths / 2;
        const yEnd = level2BlockVPosition + blockheights / 2;

        return `M ${xStart},${yStart} C ${xEnd},${yStart} ${xStart},${yEnd} ${xEnd},${yEnd}`;
    };

    const calculateLevel2PathCoordinates = (level2Index: number, level3Index: number, pathIndex: number) => {
        const level2BlockVPosition = calculateVerticalBlockPosition(level2Index, level2ObjectGrouping.length);
        const level3BlockVPosition = calculateVerticalBlockPosition(level3Index, level3ObjectGrouping.length);

        // x and y position on the level 1 block end
        const xStart = parentSize.width / 2 + blockWidths / 2;
        const yStart = level2BlockVPosition + (blockheights - blockSpacing) / 2 + (pathIndex ?? 1) * pathSpacing;

        // x and y position on the level 2 block start
        const xEnd = parentSize.width - blockWidths;
        const yEnd = level3BlockVPosition + blockheights / 2;

        return `M ${xStart},${yStart} C ${xEnd},${yStart} ${xStart},${yEnd} ${xEnd},${yEnd}`;
    };

    const renderL1Path = (
        l1StatGrouping: DashboardStatsElementResponse,
        l2StatGrouping: DashboardStatsElementResponse,
        level1Index: number
    ) => {
        const level2Index = level2ObjectGrouping.findIndex(grouping => grouping.name === l2StatGrouping.name);
        if (level2Index < 0) {
            return null;
        }

        let strokeWidth = (l2StatGrouping.count / l1StatGrouping.count) * (blockheights - blockSpacing);
        strokeWidth = Math.min(strokeWidth, maxPathStrokeWidth); // don't exceed the max
        strokeWidth = Math.max(strokeWidth, minPathStrokeWidth); // don't be less than the min

        return (
            <path
                key={`level-1-path-${l2StatGrouping.name}-${level2Index}`}
                data-name={`level-1-path-${l2StatGrouping.name}-${level2Index}`}
                d={calculateLevel1PathCoordinates(level1Index, level2Index)}
                fill="none"
                strokeOpacity={pathStrokeOpacity}
                stroke={isL1Selected() && !isMatchForL1SelectedStatGrouping(level1Index) ? '#eee' : getLevel1PathColor(level1Index)}
                strokeWidth={strokeWidth}
                strokeMiterlimit="5"
                pointerEvents="stroke"
            ></path>
        );
    };

    const renderL2HoverPath = (
        l2StatGrouping: DashboardStatsElementResponse,
        l3StatGrouping: DashboardStatsElementResponse,
        level2Index: number,
        pathIndex: number
    ) => {
        // quick sanity check to make sure the L3 Stat Grouping is currently shown. Due to height constraints we
        // will trim down the list to fit the chart. If we don't find it in the visible L3 objects we don't draw
        // the path
        const level3Index = level3ObjectGrouping.findIndex(grouping => grouping.name === l3StatGrouping.name);
        if (level3Index < 0 || !l3StatGrouping || !l2StatGrouping || !l2StatGrouping.values || !l2StatGrouping.values) {
            return null;
        }

        // if we are in hover/selected state we need to grab the corresponding l1, l2, and l3 items
        // we'll use these later to determine wether or not the L2 item and path needs to be highlighted
        const currentHoveredL1Item = getSelectedL1StatGrouping();
        const l2MatchedItem = currentHoveredL1Item?.values?.find(l2ChildStatGrouping => l2ChildStatGrouping.name === l2StatGrouping.name);
        const l3MatchingItem = l2MatchedItem?.values?.find(l3ChildStatGrouping => l3ChildStatGrouping.name === l3StatGrouping.name);

        if (!l2MatchedItem || !l3MatchingItem) {
            return null;
        }

        // Determine if we found a match from the l1HoveredIndex for both the current L2 and L3 we are trying to render a path
        const isChildOfHighlight = !!l2MatchedItem && !!l3MatchingItem;

        let visible = false;

        if (isChildOfHighlight && isL1Selected()) {
            visible = true;
        }

        let strokeWidth = Math.floor((l3MatchingItem.count / l2StatGrouping.count) * (blockheights - blockSpacing));
        if (strokeWidth > blockheights) {
            strokeWidth = blockheights;
        } else if (strokeWidth < minPathStrokeWidth) {
            strokeWidth = minPathStrokeWidth;
        }

        return (
            <path
                key={`level-2-path-${l3StatGrouping.name}-${level3Index}`}
                data-name={`level-2-path-${l3StatGrouping.name}-${level3Index}`}
                d={calculateLevel2PathCoordinates(level2Index, level3Index, pathIndex)}
                fill="none"
                strokeOpacity={pathStrokeOpacity}
                stroke={getLevel1PathColor(l1SelectedIndex)}
                strokeWidth={strokeWidth}
                strokeMiterlimit="2"
                style={{
                    visibility: visible ? 'visible' : 'hidden',
                }}
                pointerEvents="stroke"
            ></path>
        );
    };

    const renderL2Path = (
        l2StatGrouping: DashboardStatsElementResponse,
        l3StatGrouping: DashboardStatsElementResponse,
        level2Index: number,
        pathIndex: number
    ) => {
        // quick sanity check to make sure the L3 Stat Grouping is currently shown. Due to height constraints we
        // will trim down the list to fit the chart. If we don't find it in the visible L3 objects we don't draw
        // the path
        const level3Index = level3ObjectGrouping.findIndex(grouping => grouping.name === l3StatGrouping.name);
        if (level3Index < 0 || !l3StatGrouping || !l2StatGrouping || !l2StatGrouping.values || !l2StatGrouping.values) {
            return null;
        }

        let strokeColor = getLevel2PathColor(pathIndex);
        if (isL1Selected()) {
            strokeColor = '#eee';
        }

        let strokeWidth = (l2StatGrouping.count / l3StatGrouping.count) * (blockheights - blockSpacing);
        strokeWidth = Math.min(strokeWidth, maxPathStrokeWidth); // don't exceed the max
        strokeWidth = Math.max(strokeWidth, minPathStrokeWidth); // don't be less than the min

        return (
            <path
                key={`level-2-path-${l3StatGrouping.name}-${level3Index}`}
                data-name={`level-2-path-${l3StatGrouping.name}-${level3Index}`}
                d={calculateLevel2PathCoordinates(level2Index, level3Index, pathIndex)}
                fill="none"
                strokeOpacity={pathStrokeOpacity}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeMiterlimit="2"
                pointerEvents="stroke"
            ></path>
        );
    };

    const renderL1Group = (l1StatGrouping: DashboardStatsElementResponse | null, index: number, alwaysVisible?: boolean) => {
        if (!l1StatGrouping) {
            return null;
        }

        return (
            <g key={`level-1-${index}`} data-name={`level-1-${index}`} transform="translate(0.5,0.5)">
                <a href="#!" title={l1StatGrouping.name} onClick={event => handleL1Click(event, index)}>
                    <rect
                        x={svgleftAndRightPadding}
                        y={calculateVerticalBlockPosition(index, level1ObjectGrouping.length)}
                        width={blockWidths}
                        height={blockheights}
                        rx="6"
                        ry="6"
                        style={{
                            fill: isL1Selected() && !isMatchForL1SelectedStatGrouping(index) ? '#eee' : getLevel1PathColor(index),
                        }}
                    />
                    <SankeyCellText
                        width={blockWidths}
                        height={blockheights}
                        transform={`translate(${svgleftAndRightPadding} ${calculateVerticalBlockPosition(
                            index,
                            level1ObjectGrouping.length
                        )})`}
                        fill={isL1Selected() && !isMatchForL1SelectedStatGrouping(index) ? '#ddd' : 'inherit'}
                        count={l1StatGrouping.count}
                        title={
                            l1SelectValue === GroupByOptions.Carrier
                                ? getLabelSubString(l1StatGrouping.name)
                                : dashboardChartTitleFormat(l1StatGrouping.name, false)
                        }
                    />
                </a>
                <g
                    data-name={`level-1-${index}-paths`}
                    style={{ visibility: alwaysVisible || !isMatchForL1SelectedStatGrouping(index) ? 'visible' : 'hidden' }}
                >
                    {l1StatGrouping &&
                        l1StatGrouping.values &&
                        l1StatGrouping.values &&
                        l1StatGrouping.values.length > 0 &&
                        l1StatGrouping.values.map(childStatGrouping => renderL1Path(l1StatGrouping, childStatGrouping, index))}
                </g>
            </g>
        );
    };

    const renderL2Group = (l2StatGrouping: DashboardStatsElementResponse, index: number, selectedItem: boolean = false) => {
        const l1MatchedItem = getSelectedL1StatGrouping();
        const l2MatchedItem = l1MatchedItem?.values?.find(l2ChildStatGrouping => l2ChildStatGrouping.name === l2StatGrouping.name);
        let isSelected = false;

        if (selectedItem && l2MatchedItem) {
            isSelected = true;
        } else if (!selectedItem && !isL1Selected()) {
            isSelected = true;
        }

        return (
            <g
                key={`level-2-${index}`}
                data-name={`level-2-${index}`}
                data-is_hover_item={selectedItem}
                transform="translate(0.5,0.5)"
                style={{
                    visibility: !selectedItem || isSelected ? 'visible' : 'hidden',
                }}
            >
                {/* <a href="#!" title={l2StatGrouping.name} onClick={event => handleL2Click(event)}> */}
                <g>
                    <rect
                        x={parentSize.width / 2 - blockWidths / 2}
                        y={calculateVerticalBlockPosition(index, level2ObjectGrouping.length)}
                        width={blockWidths}
                        height={blockheights}
                        rx="6"
                        ry="6"
                        style={{
                            fill: getL2ObjectColor(l2StatGrouping, index),
                            visibility: !selectedItem || isSelected ? 'visible' : 'hidden',
                        }}
                        pointerEvents="none"
                    ></rect>
                    <SankeyCellText
                        width={blockWidths}
                        height={blockheights}
                        transform={`translate(${parentSize.width / 2 - blockWidths / 2} ${calculateVerticalBlockPosition(
                            index,
                            level2ObjectGrouping.length
                        )})`}
                        fill={getL2TextColor(l2StatGrouping)}
                        count={getL2ObjectCount(l2StatGrouping)}
                        title={dashboardChartTitleFormat(l2StatGrouping.name, false)}
                    />
                </g>
                {/* </a> */}
                {/* Rendering the overall to the leve3 object grouping. We put these last so they can sit on top of rectangles */}
                {level3ObjectGrouping &&
                    !selectedItem &&
                    level3ObjectGrouping.length > 0 &&
                    level3ObjectGrouping.map((l3Item, innerIndex) => renderL2Path(l2StatGrouping, l3Item, index, innerIndex))}
                {l2MatchedItem &&
                    selectedItem &&
                    l2MatchedItem?.values?.map((l3Item, innerIndex) => renderL2HoverPath(l2StatGrouping, l3Item, index, innerIndex))}
            </g>
        );
    };

    const renderL3Group = (l3StatGrouping: DashboardStatsElementResponse, index: number) => {
        return (
            <g key={`level-3-${index}`} transform="translate(0.5,0.5)" style={{ visibility: 'visible' }}>
                <rect
                    x={parentSize.width - blockWidths - svgleftAndRightPadding}
                    y={calculateVerticalBlockPosition(index, level3ObjectGrouping.length)}
                    width={blockWidths}
                    height={blockheights}
                    rx="5.1"
                    ry="5.1"
                    style={{
                        fill: getLevel2PathColor(index),
                    }}
                    pointerEvents="all"
                ></rect>

                <SankeyCellText
                    width={blockWidths}
                    height={blockheights}
                    transform={`translate(${parentSize.width - blockWidths - svgleftAndRightPadding} ${calculateVerticalBlockPosition(
                        index,
                        level3ObjectGrouping.length
                    )})`}
                    fill={'white'}
                    textColor="white"
                    count={getL3ObjectCount(l3StatGrouping)}
                    title={dashboardChartTitleFormat(l3StatGrouping.name, false)}
                />
            </g>
        );
    };

    const getL2ObjectColor = (item: DashboardStatsElementResponse, index: number) => {
        const matchingStatGrouping = getSelectedL1StatGrouping()?.values?.find(statGrouping => statGrouping.name === item.name);

        if (!isL1Selected()) {
            return getLevel1PathColor(index, true);
        } else if (isL1Selected() && matchingStatGrouping) {
            return getLevel1PathColor(l1SelectedIndex, false); // let's match the L1 hover all the way through
        } else {
            return '#eee';
        }
    };

    const getL2TextColor = (item: DashboardStatsElementResponse) => {
        const matchingStatGrouping = getSelectedL1StatGrouping()?.values?.find(statGrouping => statGrouping.name === item.name);

        if (!isL1Selected()) {
            return 'inherit';
        } else if (isL1Selected() && matchingStatGrouping) {
            return 'inherit';
        } else {
            return '#ddd';
        }
    };

    const getL2ObjectCount = (item: DashboardStatsElementResponse) => {
        if (!isL1Selected()) {
            return item.count;
        }

        const matchingStatGrouping = getSelectedL1StatGrouping()?.values?.find(statGrouping => statGrouping.name === item.name);

        if (isL1Selected() && matchingStatGrouping) {
            return matchingStatGrouping.count;
        } else {
            return 0;
        }
    };

    const getL3ObjectCount = (l3Grouping: DashboardStatsElementResponse) => {
        if (!isL1Selected()) {
            return l3Grouping.count;
        }

        let l3MatchingCount = 0;

        getSelectedL1StatGrouping()?.values?.forEach(l2StatGroupings => {
            if (l2StatGroupings.values) {
                l2StatGroupings.values.forEach(l3StatGrouping => {
                    if (l3Grouping.name === l3StatGrouping.name) {
                        l3MatchingCount += l3StatGrouping.count;
                    }
                });
            }
        });

        return l3MatchingCount;
    };

    const handleL1Click = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
        event.preventDefault();
        // toggle the hover index if it's already selected
        if (isMatchForL1SelectedStatGrouping(index)) {
            setL1SelectedIndex(-1);
        } else {
            setL1SelectedIndex(index);
        }
    };

    // const handleL2Click = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // event.preventDefault();
    // TODO implement second level click
    // };

    const handleL1SelectChange = (value: string) => {
        setL1SelectValue(value as GroupByOptions);
        setL1SelectedIndex(-1); // reset whatever was selected on L1
    };
    const handleL2SelectChange = (value: string) => {
        setL2SelectValue(value as GroupByOptions);
    };
    const handleL3SelectChange = (value: string) => {
        setL3SelectValue(value as GroupByOptions);
    };

    const isL1Selected = () => l1SelectedIndex > -1;

    const getSelectedL1StatGrouping = () => {
        if (isL1Selected()) {
            return level1ObjectGrouping[l1SelectedIndex];
        }
        return null;
    };

    const isMatchForL1SelectedStatGrouping = (index: number) => l1SelectedIndex === index;

    useEffect(() => {
        const handleWindowResize = () => {
            if (svgParentRef.current) {
                const { width, height } = svgParentRef.current.getBoundingClientRect();
                setParentSize({ width: Math.floor(width), height: Math.floor(height) });
            }
        };

        const observer = new ResizeObserver(handleWindowResize);
        const currentSvgParentRef = svgParentRef.current;
        if (currentSvgParentRef) {
            observer.observe(currentSvgParentRef);
        }

        return () => {
            if (currentSvgParentRef) {
                observer.unobserve(currentSvgParentRef);
            }
        };
    }, []);

    useEffect(() => {
        if (!caseGroupingState || !caseGroupingState.data || caseGroupingState.data.length === 0) {
            setLevel1ObjectGrouping([]);
            setLevel2ObjectGrouping([]);
            setLevel3ObjectGrouping([]);
            setTotalCases(0);
            return;
        }

        let l1Grouping: DashboardStatsElementResponse[] = [];
        // L1: sort the groupings by count
        caseGroupingState?.data.sort((a, b) => b.count - a.count);
        // TODO: should use the container height / blockHeight+blockStroke to determine how many we can show
        if (caseGroupingState?.data?.length > maxItems) {
            l1Grouping = caseGroupingState?.data.slice(0, maxItems);
        } else {
            l1Grouping = caseGroupingState?.data;
        }
        const totalCaseCount = l1Grouping.reduce((prevValue, statElement) => (prevValue += statElement.count), 0);

        setTotalCases(totalCaseCount);
        setLevel1ObjectGrouping(l1Grouping);

        const { l2Grouping, l3Grouping } = getGroupingsFromL1(l1Grouping);

        // sort the groupings before slicing and setting in state
        // sort and set L2 Grouping
        l2Grouping.sort((a, b) => b.count - a.count);
        if (l2Grouping.length > maxItems) {
            // TODO: should use the container height / blockHeight+blockStroke to determine how many we can show
            setLevel2ObjectGrouping(l2Grouping.slice(0, maxItems));
        } else {
            setLevel2ObjectGrouping(l2Grouping);
        }
        // sort and set L3 Grouping
        l3Grouping.sort((a, b) => b.count - a.count);
        if (l3Grouping.length > maxItems) {
            // TODO: should use the container height / blockHeight+blockStroke to determine how many we can show
            setLevel3ObjectGrouping(l3Grouping.slice(0, maxItems));
        } else {
            setLevel3ObjectGrouping(l3Grouping);
        }

        setTotalCases(totalCaseCount);
        // TODO : Do a single loop through all children across all l1, l2, and l3 groupings to create a map of flat arrays
        // to reduce the overall looping of the chart
    }, [caseGroupingState, maxItems]);

    const formattedCasesNumber = wholeNumberFormatify(totalCases || 0) as never;

    const resetFilters = () => {
        [setL1SelectValue, setL2SelectValue, setL3SelectValue].forEach((setterFn, index) =>
            setterFn(Object.values(DEFAULT_GROUPBY_FILTER_OPTIONS)[index])
        );
    };

    const resetDisabled =
        l1SelectValue === DEFAULT_GROUPBY_FILTER_OPTIONS.L1SelectValue &&
        l2SelectValue === DEFAULT_GROUPBY_FILTER_OPTIONS.L2SelectValue &&
        l3SelectValue === DEFAULT_GROUPBY_FILTER_OPTIONS.L3SelectValue;

    return (
        <BlurOverlayLoader loading={caseGroupingDataLoading || isFetching}>
            <div className="mt-8">
                <ChartHeader title={t('caseStatCharHeader', { count: formattedCasesNumber })} subtitle={undefined} />
                <div className="relative pb-6 mt-6">
                    <div
                        className="absolute top-0 bottom-0 left-0 border-r-2 border-[#EDEDED]"
                        style={{
                            width: '34%',
                        }}
                    ></div>
                    <div
                        className="absolute top-0 bottom-0 border-r-2 border-[#EDEDED]"
                        style={{
                            width: '34%',
                            left: '34%',
                        }}
                    ></div>
                    <div
                        className="absolute top-0 bottom-0 right-0"
                        style={{
                            width: '32%',
                        }}
                    ></div>
                    <div className="flex items-stretch flex-wrap mb-5 md:-mx-4 relative z-2">
                        <div className="mb-4 md:mb-0 pl-6 md:w-1/3">
                            <SelectSimple
                                options={[
                                    {
                                        value: GroupByOptions.BrokerDealerName.toString(),
                                        label: 'Broker Dealer',
                                    },
                                    {
                                        value: GroupByOptions.Carrier.toString(),
                                        label: 'Carrier',
                                    },
                                    {
                                        value: GroupByOptions.Process.toString(),
                                        label: 'Case Type',
                                    },
                                    {
                                        value: GroupByOptions.ProductName.toString(),
                                        label: 'Product Name',
                                    },
                                    {
                                        value: GroupByOptions.ProcessSubType.toString(),
                                        label: 'Sub Case Type',
                                    },
                                ]}
                                onChange={handleL1SelectChange}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={l1SelectValue}
                            />
                        </div>
                        <div className="mb-4 md:mb-0 pl-6 md:w-1/3 text-center">
                            <SelectSimple
                                options={[
                                    {
                                        value: GroupByOptions.BrokerDealerName.toString(),
                                        label: 'Broker Dealer',
                                    },
                                    {
                                        value: GroupByOptions.Carrier.toString(),
                                        label: 'Carrier',
                                    },
                                    {
                                        value: GroupByOptions.Process.toString(),
                                        label: 'Case Type',
                                    },
                                    {
                                        value: GroupByOptions.ProductName.toString(),
                                        label: 'Product Name',
                                    },
                                    {
                                        value: GroupByOptions.ProcessSubType.toString(),
                                        label: 'Sub Case Type',
                                    },
                                ]}
                                onChange={handleL2SelectChange}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={l2SelectValue}
                            />
                        </div>
                        <div className="mb-4 md:mb-0 pl-6 md:w-1/3 text-right flex flex-row align-middle items-center gap-2">
                            <SelectSimple
                                options={[
                                    {
                                        value: GroupByOptions.CaseStatus.toString(),
                                        label: 'Case Status',
                                    },
                                    {
                                        value: GroupByOptions.Process.toString(),
                                        label: 'Case Type',
                                    },
                                ]}
                                onChange={handleL3SelectChange}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={l3SelectValue}
                            />
                            <Button onClick={resetFilters} disabled={resetDisabled} mode="link" size="small">
                                <Icon width={16} height={16} type={IconType.REFRESH} />
                                reset
                            </Button>
                        </div>
                        <div></div>
                    </div>
                    {/* DO NOT REMOVE the explicity height setting. This prevents the useEffect from firing constantly after
                render due to the height changing */}
                    <div className="relative z-2" style={{ height: `${height}px` }} ref={svgParentRef}>
                        <svg
                            style={{
                                left: '0px',
                                top: '0px',
                                width: parentSize.width,
                                height: parentSize.height,
                                display: 'block',
                                minWidth: '700px',
                                minHeight: '400px',
                                backgroundImage: 'none',
                                backgroundColor: 'transparent',
                            }}
                        >
                            <g data-name="level 1">
                                {/* Loop through all of the l1 objects and render a group for each */}
                                {level1ObjectGrouping &&
                                    level1ObjectGrouping.length > 0 &&
                                    level1ObjectGrouping.map((item, index) => renderL1Group(item, index))}
                                {/* SVGs require the highlighted item to be rendered last so the paths are on top */}
                                {level1ObjectGrouping &&
                                    level1ObjectGrouping.length > 0 &&
                                    isL1Selected() &&
                                    renderL1Group(getSelectedL1StatGrouping(), l1SelectedIndex, true)}
                            </g>
                            <g data-name="level 2">
                                {level2ObjectGrouping &&
                                    level2ObjectGrouping.length > 0 &&
                                    level2ObjectGrouping.map((l2Item, index) => renderL2Group(l2Item, index))}
                                {level2ObjectGrouping &&
                                    level2ObjectGrouping.length > 0 &&
                                    level2ObjectGrouping.map((l2Item, index) => renderL2Group(l2Item, index, true))}
                            </g>
                            <g data-name="level 3">
                                <g data-name="End Stages" transform="translate(0.5,0.5)" style={{ visibility: 'visible' }}>
                                    {level3ObjectGrouping &&
                                        level3ObjectGrouping.length > 0 &&
                                        level3ObjectGrouping.map((item, index) => renderL3Group(item, index))}
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </BlurOverlayLoader>
    );
};

export default SankeyChart;
