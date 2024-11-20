import { Link } from '@zinnia/bloom/components';
import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HC_TREEMAP from 'highcharts/modules/treemap';
import HighchartsReact from 'highcharts-react-official';
import { useMemo, useRef } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { sankeyTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

const CHART_HEIGHT = 600;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
    HC_TREEMAP(Highcharts);
}

export type ExceptionInsightsProps = {
    completedCasesByProcessSubType: DashboardResponseData[];
    selectedSubprocess: string;
    selectedException: string | undefined;
};

export const ExceptionInsights = ({
    completedCasesByProcessSubType,
    selectedException = '',
    selectedSubprocess = '',
}: ExceptionInsightsProps) => {
    const chartCompomentRef = useRef<HighchartsReact.RefObject>(null);
    const exceptions = useMemo(
        () =>
            completedCasesByProcessSubType
                .find(item => item.name === selectedSubprocess)
                ?.values?.filter(item => item.name !== 'NULL_VALUE'),
        [completedCasesByProcessSubType, selectedSubprocess]
    );
    const noData = !exceptions || exceptions?.length === 0;
    const chartOptions: Highcharts.Options = useMemo(() => {
        // todo: XG - add ref for keeping track of all exception types so we can animate smoothly
        let seriesData: DashboardResponseData[] = [];
        if (!exceptions || exceptions?.length === 0) {
            seriesData = [];
        } else {
            seriesData = exceptions;
        }
        const chartData = seriesData.map((item: DashboardResponseData) => ({
            name: item.name,
            value: item.count,
        }));
        return {
            accessibility: {
                enabled: true,
            },
            chart: {
                backgroundColor: 'transparent',
                type: 'treemap',
                animation: true,
                height: CHART_HEIGHT,
            },
            credits: {
                enabled: false,
            },
            drilldown: {
                allowPointDrilldown: true,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            // plotOptions: {
            // series: {
            // allowPointSelect: true,
            // point: {
            //     events: {
            //         select: function (e: Highcharts.PointInteractionEventObject) {
            //             const selection = e.target as unknown as Highcharts.Point;
            //             setSelectedException(selection?.name);
            //         },
            //     },
            // },
            // },
            // },
            series: [
                {
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    colorByPoint: true,
                    colors: caseChartHelpers.getColors(),
                    data: chartData,
                },
            ],
            title: {
                text: '',
            },
        };
    }, [exceptions]);

    const caseLink = useMemo(() => {
        const href = new URL('/cases', window.location.origin);
        if (selectedSubprocess.length > 0) {
            href.searchParams.append('processSubType', selectedSubprocess);
        }
        if (selectedException.length > 0) {
            href.searchParams.append('case', selectedException);
        }
        return href.toString();
    }, [selectedSubprocess, selectedException]);

    return (
        <div className="bg-white flex flex-col lg:flex-row gap-4 pt-6">
            <div className="basis-1/3 flex flex-col gap-4 items-start">
                <Typography variant={TypographyVariant.H3}>{sankeyTitleFormat(selectedSubprocess, false)}</Typography>
                <div className="flex flow-col items-center align-middle gap-2">
                    <LightBulbIcon height={'24px'} width={'24px'} />
                    <Typography variant={TypographyVariant.LabelLg}>Insight</Typography>
                </div>
                <Typography variant={TypographyVariant.BodySm}>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus autem vitae praesentium eligendi inventore laboriosam
                    aliquam repellendus architecto, veniam hic iure velit ex dolore exercitationem quibusdam fugiat culpa. Odit, nulla!
                </Typography>
                <Link
                    size="small"
                    className="mt-4 inline"
                    href={caseLink}
                    text={`View all ${sankeyTitleFormat(selectedSubprocess)} exceptions`}
                />
            </div>
            <div className="basis-2/3 pt-4 flex flex-col">
                <Typography className="ml-2" variant={TypographyVariant.LabelMd}>
                    {'Last 12 months'}
                </Typography>
                <div className={clsx(`w-full h-[${CHART_HEIGHT}px]`, noData && 'grid gap-4 place-content-center bg-gray-800 opacity-70')}>
                    {noData ? (
                        <Typography className="text-white" variant={TypographyVariant.BodyBold}>
                            No data
                        </Typography>
                    ) : (
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartCompomentRef} />
                    )}
                </div>
            </div>
        </div>
    );
};
