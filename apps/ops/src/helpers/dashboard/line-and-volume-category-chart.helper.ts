import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Highcharts from 'highcharts';

import { TimeframeFilterOptions } from '@deps/containers/dashboard/issued-business/issued-business';
import { DashboardStatsElementResponse } from '@deps/models/case/case';

dayjs.extend(isBetween);

export type ChartSeriesSummary = {
  series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
  name: string;
  total: number;
};

export type LineAndVolumeCategoryAndSeries = {
  weeklyByLevel1Grouping: Record<string, ChartSeriesSummary>;
  weeklySeries: Highcharts.SeriesLineOptions;
  monthlyByLevel1Grouping: Record<string, ChartSeriesSummary>;
  monthlySeries: Highcharts.SeriesColumnOptions;
  weeklyCategories: string[];
  monthlyCategories: number[];
  weeklyCategoriesLabels: {
    earliestDate: string;
    lastDate: string;
  }[];
  monthlyCategoriesLabels: {
    earliestDate: string;
    lastDate: string;
  }[];
};

export type Summary = {
  series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
  name: string;
  total: number;
};



export const CHART_HEIGHT = 500;

export const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

const defaultDateFormat = 'YYYY-MM-DD';


const createChartCategories = ({ start, end = dayjs(), chartInterval = 'week' }: { start: Dayjs, end?: Dayjs, chartInterval?: 'week' | 'day' }) => {
  let currentDate = start.startOf('month');
  end = end.endOf('month');
  const weeklyCategories = [];
  const monthlyCategories = [];

  while (chartInterval === 'day' && currentDate.isBefore(end)) {
    weeklyCategories.push({
      earliestDate: currentDate.format(defaultDateFormat),
      lastDate: currentDate.format(defaultDateFormat),
    })

    if (currentDate.isSame(currentDate.startOf('month'), 'day')) {
      monthlyCategories.push({
        earliestDate: currentDate.startOf('month').format(defaultDateFormat),
        lastDate: currentDate.endOf('month').format(defaultDateFormat),
      })
    }

    currentDate = currentDate.add(1, 'day');
  }

  while (currentDate.isBefore(end)) {
    for (let i = 0; i < 4; i++) {
      const earliestDate = currentDate.date(1 + (i * 7));
      let lastDate = earliestDate.add(6, 'day');

      if (i === 3) {
        lastDate = currentDate.endOf('month')
      }
      weeklyCategories.push({
        earliestDate: earliestDate.format(defaultDateFormat),
        lastDate: lastDate.format(defaultDateFormat),
      });
    }

    monthlyCategories.push({
      earliestDate: currentDate.startOf('month').format(defaultDateFormat),
      lastDate: currentDate.endOf('month').format(defaultDateFormat),
    })

    currentDate = currentDate.add(1, 'month');
  }
  return {
    weeklyCategories: weeklyCategories,
    monthlyCategories: monthlyCategories
  };
}

const toolTipFormatter = (points: Highcharts.TooltipFormatterContextObject[] | undefined, dateStr = dayjs().format('M/D/YYYY')) => {
  if (!points || points.length === 0) return;

  let total = 0;

  const labelData: Array<{
    label: string;
    total: number;
    color: string | Highcharts.GradientColorObject | Highcharts.PatternObject;
  }> = points.map(point => {
    total += point.y || 0;
    return {
      label: point.series.name,
      total: point.y || 0,
      color: point.color || '#000000',
    };
  });
  const labelWrapper = document.createElement('div');

  labelWrapper.style.display = 'flex';
  labelWrapper.style.flexDirection = 'column';
  labelWrapper.style.gap = '4px';
  labelWrapper.style.zIndex = '5';
  for (const value of labelData) {
    const labelElement = document.createElement('div');
    labelElement.style.display = 'flex';
    labelElement.style.alignItems = 'center';
    labelElement.style.gap = '5px';
    const colorElement = document.createElement('div');
    colorElement.style.backgroundColor = String(value.color);
    colorElement.style.width = '10px';
    colorElement.style.height = '10px';
    colorElement.style.borderRadius = '50%';
    const titleElement = document.createElement('div');
    titleElement.innerHTML = `${value.label}: <b>${value.total.toLocaleString()}</b>`;
    labelElement.appendChild(colorElement);
    labelElement.appendChild(titleElement);
    labelWrapper.appendChild(labelElement);
  }
  const dateElement = document.createElement('div');
  dateElement.style.justifySelf = 'end';
  dateElement.style.alignSelf = 'end';
  dateElement.classList.add('typography-labels-label-sm-alt');
  dateElement.innerHTML = `<i>${dateStr}</i>`;
  labelWrapper.appendChild(dateElement);
  const totalElement = document.createElement('div');
  totalElement.style.justifySelf = 'end';
  totalElement.style.alignSelf = 'end';
  totalElement.style.marginTop = '4px';
  totalElement.innerHTML = `Total: <b>${total.toLocaleString()}</b>`;
  labelWrapper.appendChild(totalElement);
  return labelWrapper.outerHTML;
};

export const getTopChartConfig = (
  weeklyCategories: string[],
  weeklySeries: Highcharts.SeriesLineOptions[],
  weeklyCategoriesLabels: {
    earliestDate: string;
    lastDate: string;
  }[],
  timeframe: TimeframeFilterOptions
): Highcharts.Options => {
  let interval = 'Weekly';
  if ([TimeframeFilterOptions.Last60Days, TimeframeFilterOptions.LastMonth].includes(timeframe)) {
    interval = 'Daily';
  }
  const plotlines = Array.from({ length: weeklyCategories.length }, (_, i) => {
    const currentDate = weeklyCategoriesLabels[i].lastDate;
    const prevDate = weeklyCategoriesLabels[i - 1]?.lastDate;
    const shouldShow = prevDate && !dayjs(currentDate).isSame(dayjs(prevDate), 'month');
    return {
      color: shouldShow ? '#D3D3D3' : '#FFFFFF', // Color ticks for the edges of the month
      width: 1,
      value: i - 0.5, // Position of the gridline
      zIndex: 1,
    };
  });
  // weeklySeries.push({
  //     data: Array.from({ length: weeklyCategories.length }, (_, i) => 25),
  //     name: 'Total',
  //     color: '#BADA55',
  //     type: 'line',
  //     marker: {
  //         enabled: false,
  //     },
  //     label: {
  //         formatter: function () {
  //             return 'eiffj';
  //         },
  //     },
  // });

  return {
    chart: {
      height: 350,
      type: 'line', // Line chart
      spacingTop: 0, // Remove top spacing
      spacingLeft: 0,
      spacingRight: 0,
      marginLeft: 0, // Set consistent left margin. Need to be the same for both charts
      marginRight: 120, // this needs to be the same for both charts so the y-axis is aligned
    },
    legend: {
      enabled: false, // Disable the legend
    },
    credits: {
      enabled: false,
    },
    navigation: {
      buttonOptions: {
        enabled: false,
      },
    },
    title: {
      text: '', // No title
    },
    xAxis: [
      {
        // startOnTick: true,
        // endOnTick: true, // Ensures the axis extends to the last tick
        height: '100%',
        // min: 0, // Start at the first category or value
        // offset: 0, // Remove extra spacing
        tickmarkPlacement: 'on',
        plotLines: plotlines,

        labels: {
          step: 1,
          formatter: function () {
            const idx = this.pos;
            const { earliestDate } = weeklyCategoriesLabels[idx];
            const middleOfMonth = dayjs(earliestDate).date(15);
            if (!dayjs(earliestDate).isSame(middleOfMonth, 'day')) return '';
            return dayjs(earliestDate).format('MMM');
          },
          align: 'right',
          rotation: 0, // Force labels to be horizontal
        },
        top: '0%',
        categories: weeklyCategories,
      },
    ],
    yAxis: [
      {
        stackLabels: {
          enabled: true,
        },
        allowDecimals: false,
        gridLineWidth: 1,
        height: '100%',
        lineWidth: 2,
        min: 0,
        offset: 0, // Remove extra spacing
        opposite: true, // Moves the x-axis to the right side
        title: {
          text: `<b>${interval}<br/>Volume</b>`,
          align: 'high', // Aligns the title to the top
          rotation: 0, // Force title to be horizontal
          x: -15,
          y: 15,
          useHTML: true, // Enables HTML in the title
        },
        top: 0,
        labels: {
          y: 12,
        },
      },
    ],
    series: weeklySeries,
    plotOptions: {
      series: {
        connectNulls: true,
      },
      // TODO: remove
      column: {
        stacking: 'normal',
        pointWidth: 20, // Fixed width for bars
        groupPadding: 0.1, // Reduce group spacing
        pointPadding: 0.05, // Minimize spacing between bars in a group
        borderWidth: 0, // Remove borders
      },
    },
    tooltip: {
      shared: true, // Set shared to false
      formatter: function () {
        const index = this.point.index;
        const { earliestDate, lastDate } = weeklyCategoriesLabels[index];
        const date = dayjs(earliestDate);
        let dateStr = '';

        if (timeframe === TimeframeFilterOptions.LastMonth || timeframe === TimeframeFilterOptions.Last60Days) {
          dateStr = date.format('M/D/YY');
        } else {
          dateStr = `Week of ${date.format('M/D/YYYY')} - ${dayjs(lastDate).format('M/D/YYYY')}`;
        }
        return toolTipFormatter(this.points, dateStr);
      },
      useHTML: true,
    },
  };
};

export const getBottomChartConfig = (
  monthlyCategories: string[],
  monthlySeries: Highcharts.SeriesColumnOptions[],
  monthlyCategoriesLabels: { earliestDate: string; lastDate: string }[],
  timeframe: TimeframeFilterOptions
): Highcharts.Options => {
  const interval = 'Monthly';
  const pointWidth = 20 * Math.max(Object.values(TimeframeFilterOptions).indexOf(timeframe) + 1, 1);

  return {
    chart: {
      height: 150,
      type: 'column', // Line chart
      spacingTop: 0, // Remove top spacing
      spacingLeft: 0,
      spacingRight: 0,
      marginLeft: 0, // Set consistent left margin
      marginRight: 120,
    },
    legend: {
      enabled: false, // Disable the legend
    },
    credits: {
      enabled: false,
    },
    navigation: {
      buttonOptions: {
        enabled: false,
      },
    },
    title: {
      text: '', // No title
    },
    xAxis: {
      categories: monthlyCategories,
      gridLineWidth: 1,
      height: '100%',
      labels: {
        formatter: function () {
          const value = Number(this.value?.toString());
          const str = new Intl.NumberFormat().format(value);
          return str;
        },
      },
      offset: 0, // Remove extra spacing
      tickLength: 0, // Hide tick marks
      top: '0%',
    },
    yAxis: {
      allowDecimals: false,
      gridLineWidth: 1,
      height: '100%',
      lineWidth: 2,
      labels: {
        y: 12,
      },
      min: 0,
      offset: 0, // Remove extra spacing
      opposite: true, // Moves the x-axis to the right side
      title: {
        text: `<b>${interval}<br/>Volume</b>`,
        align: 'high', // Aligns the title to the top
        rotation: 0, // Force title to be horizontal
        x: -15,
        y: 15,
        useHTML: true, // Enables HTML in the title
      },
      top: '0%',
    },
    series: monthlySeries,
    plotOptions: {
      column: {
        stacking: 'normal',
        pointWidth, // Fixed width for bars
        groupPadding: 0.1, // Reduce group spacing
        pointPadding: 0.05, // Minimize spacing between bars in a group
        borderWidth: 0, // Remove borders
      },
    },
    tooltip: {
      shared: true,
      formatter: function () {
        let key = '';
        const index = this.point.index;
        const { earliestDate } = monthlyCategoriesLabels[index];
        key = dayjs(earliestDate).format('MMMM');

        return toolTipFormatter(this.points, key);
      },
      useHTML: true,
    },
  };
};

export function processGroupedData(input: DashboardStatsElementResponse[], timeframe: TimeframeFilterOptions): LineAndVolumeCategoryAndSeries {
  const today = dayjs();
  let earliestDate = dayjs()

  let chartInterval: 'day' | 'week' = 'week';

  switch (timeframe) {
    case TimeframeFilterOptions.Trailing12Months:
      earliestDate = today.subtract(12, 'month').startOf('month');
      break;
    case TimeframeFilterOptions.Last6Months:
      earliestDate = today.subtract(6, 'month').startOf('month');
      break;
    case TimeframeFilterOptions.Last90Days:
      earliestDate = today.subtract(90, 'day').startOf('month');
      break;
    case TimeframeFilterOptions.Last60Days:
      earliestDate = today.subtract(60, 'day').startOf('month');
      chartInterval = 'day';
      break;
    case TimeframeFilterOptions.LastMonth:
      earliestDate = today.subtract(1, 'month').startOf('month');
      chartInterval = 'day';
      break;
  }



  const { weeklyCategories, monthlyCategories } = createChartCategories({
    start: earliestDate,
    chartInterval
  })



  const result: LineAndVolumeCategoryAndSeries = {
    weeklyByLevel1Grouping: {},
    weeklySeries: {} as Highcharts.SeriesLineOptions,
    monthlyByLevel1Grouping: {},
    monthlySeries: {} as Highcharts.SeriesColumnOptions,
    weeklyCategories: weeklyCategories.map(({ earliestDate }) => earliestDate),
    monthlyCategories: monthlyCategories.map(() => 0),
    weeklyCategoriesLabels: weeklyCategories,
    monthlyCategoriesLabels: monthlyCategories,
  };

  // Generate categories

  // Process data as before
  // ex: 'productName': { 'count': 10, 'key': 'productName', name: 'SBIC' }
  input.forEach((level1GroupedBy, i) => {
    const weeklySeriesData: Array<number | null> = new Array(weeklyCategories.length).fill(0);
    const monthlySeriesData: number[] = new Array(monthlyCategories.length).fill(0);
    const dataColor = colors[i % colors.length];

    const level1GroupedByName = level1GroupedBy.name;

    result.weeklyByLevel1Grouping[level1GroupedByName] = {
      name: level1GroupedByName,
      total: 0,
      series: {
        type: 'line',
        data: weeklySeriesData,
        name: level1GroupedByName,
        lineWidth: 2,
        marker: {
          enabled: false, // Disable markers for a clean line chart
        },
        color: dataColor,
      } as Highcharts.SeriesLineOptions,
    }

    result.monthlyByLevel1Grouping[level1GroupedByName] = {
      name: level1GroupedByName,
      total: 0,
      series: {
        name: level1GroupedByName,
        data: monthlySeriesData,
        stack: 'stackedBar',
        type: 'column',
        color: dataColor,
      } as Highcharts.SeriesColumnOptions,
    };


    // Flatten and aggregate counts by date
    const groupedByDate: Record<string, number> = {};
    level1GroupedBy.values?.reduce((acc, level2GroupedBy) => {
      if (level2GroupedBy?.values?.length) {
        level2GroupedBy.values.forEach(entry => {
          const date = entry.name; // Example: "2024-01-05"
          const count = entry.count;
          acc[date] = (acc[date] || 0) + count;
        });
      } else {
        const date = level2GroupedBy.name; // Example: "2024-01-05"
        const count = level2GroupedBy.count;
        acc[date] = (acc[date] || 0) + count;
      }
      return acc
    }, groupedByDate);

    // Process dates
    Object.entries(groupedByDate).forEach(([dateString, count]) => {
      const date = dayjs(dateString);

      // [] is inclusive of start and end dates
      const weeklyIndex = weeklyCategories.findIndex(({ earliestDate, lastDate }) => date.isBetween(earliestDate, lastDate, 'day', '[]'));
      const monthlyIndex = monthlyCategories.findIndex(({ earliestDate, lastDate }) => date.isBetween(earliestDate, lastDate, 'day', '[]'));

      if (weeklyIndex === -1 || monthlyIndex === -1) return;
      // Update weekly data
      weeklySeriesData[weeklyIndex] = (weeklySeriesData[weeklyIndex] || 0) + count;

      // Update monthly data
      monthlySeriesData[monthlyIndex] += count;

      // Update totals
      result.monthlyByLevel1Grouping[level1GroupedByName].total += count;
    });

    // set zero values to null for chart
    weeklySeriesData.forEach((value, index) => {
      if (value === 0) {
        weeklySeriesData[index] = null
      }
    })
  });

  // Set the total for each month. this is used as the category for the stacked bar chart
  result.monthlyByLevel1Grouping = Object.entries(result.monthlyByLevel1Grouping).sort((a, b) => {
    return b[1].total - a[1].total
  }).slice(0, 5).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc
  }, {} as Record<string, ChartSeriesSummary>)

  Object.values(result.monthlyByLevel1Grouping).forEach((seriesData) => {
    const data = seriesData.series.data ?? [];
    data.forEach((value, index) => {
      const newValue = typeof value === 'number' ? value : 0;
      result.monthlyCategories[index] += newValue;
    });

  });

  // console.log('result', result);
  return result;
}
