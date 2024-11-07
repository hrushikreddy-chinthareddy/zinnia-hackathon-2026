import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { getCaseGroupingStats } from '@deps/helpers/dashboard/dashboard-helpers';
import { StatGrouping, StatGroupingOptions, StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { Case } from '@deps/models/case/case';
import { debounce } from '@deps/utils/useDebounce';

import Typography, { TypographyVariant } from '../typography/typography';

interface Props {
    cases: Case[];
    height?: number;
    width?: number;
    chartOptions?: SankeyChartOptions;
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

const SankeyChart = ({ cases, height = 570, width = 1536, chartOptions = defaultChartOptions }: Props) => {
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

    const [caseGroupingState, setCaseGroupingState] = useState<StatGroupingResponse>();

    const [level1ObjectGrouping, setLevel1ObjectGrouping] = useState<StatGrouping[]>([]);
    const [level2ObjectGrouping, setLevel2ObjectGrouping] = useState<StatGrouping[]>([]);
    const [level3ObjectGrouping, setLevel3ObjectGrouping] = useState<StatGrouping[]>([]);
    const [l1SelectedIndex, setL1SelectedIndex] = useState<number>(-100);

    const [l1SelectValue, setL1SelectValue] = useState<string>(StatGroupingOptions.Carrier.toString());
    const [l2SelectValue, setL2SelectValue] = useState<string>(StatGroupingOptions.Process.toString());
    const [l3SelectValue, setL3SelectValue] = useState<string>(StatGroupingOptions.CaseStatus.toString());

    const [parentSize, setParentSize] = useState({ width: 0, height: 0 });
    const svgParentRef = useRef<HTMLDivElement>(null);

    const getGroupingsFromL1 = (l1ObjectGrouping: StatGrouping[]) => {
        const l2Grouping: StatGrouping[] = [];
        const l3Grouping: StatGrouping[] = [];
        const tempL2Grouping: StatGrouping[] = [];
        const tempL3Grouping: StatGrouping[] = [];

        const l2CountByKeyMap: { [key: string]: number } = {};
        const l3CountByKeyMap: { [key: string]: number } = {};

        // Loop through and build the temp arrays to later squash and add counts up
        l1ObjectGrouping.forEach(l1Grouping => {
            if (l1Grouping && l1Grouping.children && l1Grouping.children.stats.length > 0) {
                l1Grouping.children.stats.forEach(l2ChildGrouping => {
                    const clonedL2ChildGrouping: StatGrouping = JSON.parse(JSON.stringify(l2ChildGrouping));
                    tempL2Grouping.push(clonedL2ChildGrouping);

                    clonedL2ChildGrouping?.children?.stats.forEach(l3ChildGrouping => {
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
                if (!l2Grouping.find(l2Group => l2Group.label === grouping.label)) {
                    l2Grouping.push(grouping);
                }
                if (l2CountByKeyMap[grouping.label]) {
                    l2CountByKeyMap[grouping.label] += grouping.count;
                } else {
                    l2CountByKeyMap[grouping.label] = grouping.count;
                }
            }
        });
        tempL3Grouping.forEach(grouping => {
            if (grouping) {
                if (!l3Grouping.find(l3Group => l3Group.label === grouping.label)) {
                    l3Grouping.push(grouping);
                }
                if (l3CountByKeyMap[grouping.label]) {
                    l3CountByKeyMap[grouping.label] += grouping.count;
                } else {
                    l3CountByKeyMap[grouping.label] = grouping.count;
                }
            }
        });

        // now that we have the counts, we need to go through and update each grouping
        Object.keys(l2CountByKeyMap).forEach(key => {
            const currentl2Grouping = l2Grouping.find(l2Group => l2Group.label === key);

            if (currentl2Grouping) {
                currentl2Grouping.count = l2CountByKeyMap[key];
            }
        });
        Object.keys(l3CountByKeyMap).forEach(key => {
            const currentL3Grouping = l3Grouping.find(l2Group => l2Group.label === key);

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

    const calculateLevel1PathCoordinates = (level1Index: number, level2Index: number, pathIndex: number) => {
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

    const renderL1Path = (l1StatGrouping: StatGrouping, l2StatGrouping: StatGrouping, level1Index: number, pathIndex: number) => {
        const level2Index = level2ObjectGrouping.findIndex(grouping => grouping.label === l2StatGrouping.label);
        if (level2Index < 0) {
            return null;
        }

        let strokeWidth = (l2StatGrouping.count / l1StatGrouping.count) * (blockheights - blockSpacing);
        strokeWidth = Math.min(strokeWidth, maxPathStrokeWidth); // don't exceed the max
        strokeWidth = Math.max(strokeWidth, minPathStrokeWidth); // don't be less than the min

        return (
            <path
                key={`level-1-path-${l2StatGrouping.label}-${level2Index}`}
                data-name={`level-1-path-${l2StatGrouping.label}-${level2Index}`}
                d={calculateLevel1PathCoordinates(level1Index, level2Index, pathIndex)}
                fill="none"
                strokeOpacity={pathStrokeOpacity}
                stroke={isL1Selected() && !isMatchForL1SelectedStatGrouping(level1Index) ? '#eee' : getLevel1PathColor(level1Index)}
                strokeWidth={strokeWidth}
                strokeMiterlimit="5"
                pointerEvents="stroke"
            ></path>
        );
    };

    const renderL2HoverPath = (l2StatGrouping: StatGrouping, l3StatGrouping: StatGrouping, level2Index: number, pathIndex: number) => {
        // quick sanity check to make sure the L3 Stat Grouping is currently shown. Due to height constraints we
        // will trim down the list to fit the chart. If we don't find it in the visible L3 objects we don't draw
        // the path
        const level3Index = level3ObjectGrouping.findIndex(grouping => grouping.label === l3StatGrouping.label);
        if (level3Index < 0 || !l3StatGrouping || !l2StatGrouping || !l2StatGrouping.children || !l2StatGrouping.children.stats) {
            return null;
        }

        // if we are in hover/selected state we need to grab the corresponding l1, l2, and l3 items
        // we'll use these later to determine wether or not the L2 item and path needs to be highlighted
        const currentHoveredL1Item = getSelectedL1StatGrouping();
        const l2MatchedItem = currentHoveredL1Item?.children?.stats.find(
            l2ChildStatGrouping => l2ChildStatGrouping.label === l2StatGrouping.label
        );
        const l3MatchingItem = l2MatchedItem?.children?.stats.find(
            l3ChildStatGrouping => l3ChildStatGrouping.label === l3StatGrouping.label
        );

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
                key={`level-2-path-${l3StatGrouping.label}-${level3Index}`}
                data-name={`level-2-path-${l3StatGrouping.label}-${level3Index}`}
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

    const renderL2Path = (l2StatGrouping: StatGrouping, l3StatGrouping: StatGrouping, level2Index: number, pathIndex: number) => {
        // quick sanity check to make sure the L3 Stat Grouping is currently shown. Due to height constraints we
        // will trim down the list to fit the chart. If we don't find it in the visible L3 objects we don't draw
        // the path
        const level3Index = level3ObjectGrouping.findIndex(grouping => grouping.label === l3StatGrouping.label);
        if (level3Index < 0 || !l3StatGrouping || !l2StatGrouping || !l2StatGrouping.children || !l2StatGrouping.children.stats) {
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
                key={`level-2-path-${l3StatGrouping.label}-${level3Index}`}
                data-name={`level-2-path-${l3StatGrouping.label}-${level3Index}`}
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

    const getLabelSubString = (label: string) => {
        if (!label) {
            return '';
        }
        return label.length > 25 ? `${label.substring(0, 25)}...` : label;
    };

    const renderL1Group = (l1StatGrouping: StatGrouping | null, index: number, alwaysVisible?: boolean) => {
        if (!l1StatGrouping) {
            return null;
        }

        return (
            <g key={`level-1-${index}`} data-name={`level-1-${index}`} transform="translate(0.5,0.5)">
                <a href="#!" title={l1StatGrouping.label} onClick={event => handleL1Click(event, index)}>
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
                    <text
                        transform={`translate(${svgleftAndRightPadding} ${
                            calculateVerticalBlockPosition(index, level1ObjectGrouping.length) + blockheights / 2
                        })`}
                        x="10"
                        y="10"
                        style={{
                            fill: isL1Selected() && !isMatchForL1SelectedStatGrouping(index) ? '#ddd' : 'inherit',
                        }}
                        pointerEvents="none"
                    >
                        <tspan className="tracking-normal no-underline font-primary text-xl font-medium">
                            {wholeNumberFormatify(l1StatGrouping.count)}
                        </tspan>
                        <tspan className="font-primary text-sm font-medium"> {getLabelSubString(l1StatGrouping.label)}</tspan>
                        <title>{l1StatGrouping.label}</title>
                    </text>
                </a>
                <g
                    data-name={`level-1-${index}-paths`}
                    style={{ visibility: alwaysVisible || !isMatchForL1SelectedStatGrouping(index) ? 'visible' : 'hidden' }}
                >
                    {l1StatGrouping &&
                        l1StatGrouping.children &&
                        l1StatGrouping.children.stats.length > 0 &&
                        l1StatGrouping.children.stats.map((childStatGrouping, innerIndex) =>
                            renderL1Path(l1StatGrouping, childStatGrouping, index, innerIndex)
                        )}
                </g>
            </g>
        );
    };

    const renderL2Group = (l2StatGrouping: StatGrouping, index: number, selectedItem: boolean = false) => {
        const l1MatchedItem = getSelectedL1StatGrouping();
        const l2MatchedItem = l1MatchedItem?.children?.stats.find(
            l2ChildStatGrouping => l2ChildStatGrouping.label === l2StatGrouping.label
        );
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
                <a href="#!" title={l2StatGrouping.label} onClick={event => handleL2Click(event, index)}>
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
                        pointerEvents="all"
                    ></rect>
                    <text
                        transform={`translate(${parentSize.width / 2 - blockWidths / 2 + 10} ${
                            calculateVerticalBlockPosition(index, level2ObjectGrouping.length) + blockheights / 2
                        })`}
                        x="10"
                        y="10"
                        width={blockWidths}
                        overflow="auto"
                        style={{
                            fill: getL2TextColor(l2StatGrouping),
                        }}
                    >
                        <tspan className="tracking-normal no-underline font-primary text-xl font-medium">
                            {wholeNumberFormatify(getL2ObjectCount(l2StatGrouping))}
                        </tspan>
                        <tspan className="font-primary text-sm font-medium">&nbsp;{getLabelSubString(l2StatGrouping.label)}</tspan>
                        <title>{l2StatGrouping.label}</title>
                    </text>
                </a>
                {/* Rendering the overall to the leve3 object grouping. We put these last so they can sit on top of rectangles */}
                {level3ObjectGrouping &&
                    !selectedItem &&
                    level3ObjectGrouping.length > 0 &&
                    level3ObjectGrouping.map((l3Item, innerIndex) => renderL2Path(l2StatGrouping, l3Item, index, innerIndex))}
                {l2MatchedItem &&
                    selectedItem &&
                    l2MatchedItem?.children?.stats.map((l3Item, innerIndex) =>
                        renderL2HoverPath(l2StatGrouping, l3Item, index, innerIndex)
                    )}
            </g>
        );
    };

    const renderL3Group = (l3StatGrouping: StatGrouping, index: number) => {
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
                <text
                    transform={`translate(${parentSize.width - blockWidths - svgleftAndRightPadding} ${
                        calculateVerticalBlockPosition(index, level3ObjectGrouping.length) + blockheights / 2
                    })`}
                    x="10"
                    y="10"
                    fill="white"
                >
                    <tspan className="tracking-normal no-underline font-primary text-xl font-medium">
                        {wholeNumberFormatify(getL3ObjectCount(l3StatGrouping))}
                    </tspan>
                    <tspan className="font-primary text-sm font-medium"> {getLabelSubString(l3StatGrouping.label)}</tspan>
                    <title>{l3StatGrouping.label}</title>
                </text>
            </g>
        );
    };

    const getL2ObjectColor = (item: StatGrouping, index: number) => {
        const matchingStatGrouping = getSelectedL1StatGrouping()?.children?.stats.find(statGrouping => statGrouping.label === item.label);

        if (!isL1Selected()) {
            return getLevel1PathColor(index, true);
        } else if (isL1Selected() && matchingStatGrouping) {
            return getLevel1PathColor(l1SelectedIndex, false); // let's match the L1 hover all the way through
        } else {
            return '#eee';
        }
    };

    const getL2TextColor = (item: StatGrouping) => {
        const matchingStatGrouping = getSelectedL1StatGrouping()?.children?.stats.find(statGrouping => statGrouping.label === item.label);

        if (!isL1Selected()) {
            return 'inherit';
        } else if (isL1Selected() && matchingStatGrouping) {
            return 'inherit';
        } else {
            return '#ddd';
        }
    };

    const getL2ObjectCount = (item: StatGrouping) => {
        if (!isL1Selected()) {
            return item.count;
        }

        const matchingStatGrouping = getSelectedL1StatGrouping()?.children?.stats.find(statGrouping => statGrouping.label === item.label);

        if (isL1Selected() && matchingStatGrouping) {
            return matchingStatGrouping.count;
        } else {
            return 0;
        }
    };

    const getL3ObjectCount = (l3Grouping: StatGrouping) => {
        if (!isL1Selected()) {
            return l3Grouping.count;
        }

        let l3MatchingCount = 0;

        getSelectedL1StatGrouping()?.children?.stats.forEach(l2StatGroupings => {
            l2StatGroupings.children?.stats.forEach(l3StatGrouping => {
                if (l3Grouping.label === l3StatGrouping.label) {
                    l3MatchingCount += l3StatGrouping.count;
                }
            });
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

    const handleL2Click = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
        event.preventDefault();
        // TODO implement second level click
    };

    const handleL3Click = (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
        event.preventDefault();
        // TODO implement second level click
    };

    const handleL1SelectChange = (value: string) => {
        setL1SelectValue(value);
        setL1SelectedIndex(-1); // reset whatever was selected on L1
    };
    const handleL2SelectChange = (value: string) => {
        setL2SelectValue(value);
    };
    const handleL3SelectChange = (value: string) => {
        setL3SelectValue(value);
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
        const handleWindowResize = debounce(() => {
            if (svgParentRef.current) {
                const { width, height } = svgParentRef.current.getBoundingClientRect();
                setParentSize({ width: Math.floor(width), height: Math.floor(height) });
            }
        }, 200);

        const observer = new ResizeObserver(handleWindowResize);

        if (svgParentRef.current) {
            observer.observe(svgParentRef.current);
        }

        return () => {
            if (svgParentRef.current) {
                observer.unobserve(svgParentRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (height && width) {
            setParentSize({ height, width });
        }
    }, [height, width]);

    useEffect(() => {
        const groupingsResponse = getCaseGroupingStats(cases, [
            l1SelectValue as StatGroupingOptions,
            l2SelectValue as StatGroupingOptions,
            l3SelectValue as StatGroupingOptions,
        ]);
        setCaseGroupingState(groupingsResponse);
    }, [cases, l1SelectValue, l2SelectValue, l3SelectValue]);

    useEffect(() => {
        if (!caseGroupingState || !caseGroupingState.stats || caseGroupingState.stats.length === 0) {
            setLevel1ObjectGrouping([]);
            setLevel2ObjectGrouping([]);
            setLevel3ObjectGrouping([]);
            return;
        }

        // L1: sort the groupings by count
        caseGroupingState?.stats.sort((a, b) => b.count - a.count);
        // TODO: should use the container height / blockHeight+blockStroke to determine how many we can show
        if (caseGroupingState?.stats?.length > maxItems) {
            setLevel1ObjectGrouping(caseGroupingState?.stats.slice(0, maxItems));
        } else {
            setLevel1ObjectGrouping(caseGroupingState?.stats);
        }

        const { l2Grouping, l3Grouping } = getGroupingsFromL1(caseGroupingState?.stats);

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
        // TODO : Do a single loop through all children across all l1, l2, and l3 groupings to create a map of flat arrays
        // to reduce the overall looping of the chart
    }, [caseGroupingState]);

    const formattedCasesNumber = wholeNumberFormatify(cases?.length || 0) as never;
    const title = t('caseStatCharHeader', { count: formattedCasesNumber });

    return (
        <div>
            <Typography className="flex items-center mt-7 mb-7" variant={TypographyVariant.H4} asTag="h2" data-testid="header-text">
                {title}
            </Typography>
            <div className="relative pb-6">
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
                                    value: StatGroupingOptions.Carrier.toString(),
                                    label: 'Carrier',
                                },
                                {
                                    value: StatGroupingOptions.Process.toString(),
                                    label: 'Case Type',
                                },

                                {
                                    value: StatGroupingOptions.ProductName.toString(),
                                    label: 'Product Name',
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
                                    value: StatGroupingOptions.Carrier.toString(),
                                    label: 'Carrier',
                                },
                                {
                                    value: StatGroupingOptions.Process.toString(),
                                    label: 'Case Type',
                                },
                                {
                                    value: StatGroupingOptions.OpenStages.toString(),
                                    label: 'Open Stages',
                                },
                                {
                                    value: StatGroupingOptions.ProcessSubType.toString(),
                                    label: 'Sub Case Type',
                                },

                                {
                                    value: StatGroupingOptions.ExceptionsCategory.toString(),
                                    label: 'Exceptions Category',
                                },
                            ]}
                            onChange={handleL2SelectChange}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={l2SelectValue}
                        />
                    </div>
                    <div className="mb-4 md:mb-0 pl-6 md:w-1/3 text-right">
                        <SelectSimple
                            options={[
                                {
                                    value: StatGroupingOptions.CaseStatus.toString(),
                                    label: 'Case Status',
                                },
                                {
                                    value: StatGroupingOptions.Process.toString(),
                                    label: 'Case Type',
                                },

                                {
                                    value: StatGroupingOptions.ProductName.toString(),
                                    label: 'Product Name',
                                },
                            ]}
                            onChange={handleL3SelectChange}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={l3SelectValue}
                        />
                    </div>
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
    );
};

export default SankeyChart;
