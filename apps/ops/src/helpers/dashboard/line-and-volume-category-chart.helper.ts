import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import * as Highcharts from 'highcharts';

import { ChartSeriesSummary, LineAndVolumeCategoryAndSeries } from "@deps/components/dashboard/line-and-volume-category-chart/line-and-volume-category-chart";
import { TimeframeFilterOptions } from '@deps/containers/dashboard/issued-business/issued-business';
import { DashboardStatsElementResponse } from '@deps/models/case/case';

dayjs.extend(isBetween);

export const CHART_HEIGHT = 500;

export const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

const defaultDateFormat = 'YYYY-MM-DD';
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
    const weeklySeriesData: number[] = new Array(weeklyCategories.length).fill(0);
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
      weeklySeriesData[weeklyIndex] += count;

      // Update monthly data
      monthlySeriesData[monthlyIndex] += count;

      // Update totals
      result.monthlyByLevel1Grouping[level1GroupedByName].total += count;
    });
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

  return result;
}

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