import { useCallback } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { getCaseCompletionDurationStats } from '@deps/helpers/case-stat-helpers';
import { CaseStatWithCompare, CaseWithStats } from '@deps/helpers/dashboard/types';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { Case, Processes, Statuses } from '@deps/models/case/case';
import { ReactComponent as TrendingDownIcon } from '@deps/styles/elements/icons/icons_outlined/trending-down.svg';
import { ReactComponent as TrendingUpIcon } from '@deps/styles/elements/icons/icons_outlined/trending-up.svg';

interface Props {
    cases: Case[];
    comparedCases: Case[];
}

const CaseOverviewStats = ({ cases, comparedCases }: Props) => {
    const getStats = useCallback((lastWeekCases: CaseWithStats[], twoWeekAgoCases: CaseWithStats[]) => {
        return [
            getCaseCountCompareData(
                'New Applications',
                'cases',
                caseItem => caseItem.process === Processes.NewBusiness,
                lastWeekCases,
                twoWeekAgoCases,
                false
            ),
            getCaseCountCompareData(
                'Completed',
                'cases',
                caseItem => caseItem.caseStatus === Statuses.Completed,
                lastWeekCases,
                twoWeekAgoCases,
                true
            ),
            getCaseCountCompareData(
                'Exceptions',
                'cases',
                caseItem => caseItem.exceptions.length > 0,
                lastWeekCases,
                twoWeekAgoCases,
                true
            ),
            getCaseCountCompareData(
                'NIGO',
                'cases',
                caseItem => caseItem.caseStatus === Statuses.Exception,
                lastWeekCases,
                twoWeekAgoCases,
                true
            ),
        ];
    }, []);

    const calculateStatsData = (caseData: Case[]) => {
        const casesWithStats: CaseWithStats[] = [];
        caseData.forEach(caseItem => {
            casesWithStats.push(Object.assign({}, caseItem, { stats: getCaseCompletionDurationStats(caseItem) }));
        });
        return casesWithStats;
    };

    const getCaseCountCompareData = (
        label: string,
        measurementLabel: string,
        caseFilterFunc: (val: Case) => boolean,
        cases: Case[],
        caseDataCompare: Case[],
        invertColor: boolean
    ) => {
        const caseStat: CaseStatWithCompare = {
            label: label,
            value: 0,
            change: 0.0,
            measurementlabel: measurementLabel,
            invertColor: invertColor,
        };

        const filteredCases = cases.filter(caseFilterFunc);
        const casesCompare = caseDataCompare.filter(caseFilterFunc);
        caseStat.value = filteredCases.length;
        caseStat.change = 1 - filteredCases.length / casesCompare.length;

        return caseStat;
    };

    const stats = getStats(calculateStatsData(cases), calculateStatsData(comparedCases));

    return (
        <div>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row ">
                <div className="flex flex-col gap-16 lg:flex-row">
                    {stats.map((stat, index) => (
                        <div key={index}>
                            <Label label={stat.label} variant={LabelVariant.LabelLg} />
                            <div className="flex items-center gap-1 mt-2">
                                <Content details={wholeNumberFormatify(stat.value)} variant={ContentVariant.Value} />
                                <Content details={stat.measurementlabel} variant={ContentVariant.BodySm} />

                                {stat.change > 0 && <TrendingUpIcon className={`h-5 w-5`} />}
                                {stat.change < 0 && <TrendingDownIcon className={`h-5 w-5`} />}
                            </div>
                            <div></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CaseOverviewStats;
