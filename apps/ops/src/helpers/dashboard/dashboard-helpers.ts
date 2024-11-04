import { StatGroupingOptions, StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { AgingTimeframes, AgingTimeRanges, Case, Statuses } from '@deps/models/case/case';
import { ExceptionInstance } from '@deps/models/case/exception-instance';

export function getAllGroupings(cases: Case[]): { [key: string]: StatGroupingResponse } {
    const allStats: { [key: string]: StatGroupingResponse } = {};
    if (!cases || cases.length === 0) {
        return allStats;
    }
    Object.values(StatGroupingOptions).forEach((key: string) => {
        const statResponse = getCaseGroupingStats(cases, key as StatGroupingOptions);
        allStats[key] = statResponse;
    });
    return allStats;
}

export function getCaseGroupingStats(cases: Case[], groupBy: StatGroupingOptions | StatGroupingOptions[]): StatGroupingResponse {
    let statGroupingResponse: StatGroupingResponse = {
        count: 0,
        stats: [],
        groupBy: StatGroupingOptions.Default,
    };

    let caseGrouping: Record<string, Case[]> = {};

    if (!cases || cases.length === 0) {
        return statGroupingResponse;
    }

    if (Array.isArray(groupBy) && groupBy.length > 0) {
        const currentGroupBy = groupBy[0];
        const currentCaseGrouping = getCaseGrouping(cases, currentGroupBy);
        statGroupingResponse = getCaseGroupingStats(cases, currentGroupBy);

        Object.keys(currentCaseGrouping).forEach(key => {
            const childCases = currentCaseGrouping[key];
            if (statGroupingResponse && statGroupingResponse.stats && statGroupingResponse.stats.length > 0) {
                const stat = statGroupingResponse.stats.find(statGrouping => statGrouping.label === key);
                if (stat) {
                    // TODO: If no additional groupBy options just skip over this
                    stat.children = getCaseGroupingStats(childCases, groupBy.slice(1));
                }
            }
        });
    } else {
        caseGrouping = getCaseGrouping(cases, groupBy as StatGroupingOptions);
        statGroupingResponse.groupBy = groupBy as StatGroupingOptions;
    }

    Object.keys(caseGrouping).forEach(key => {
        statGroupingResponse.stats.push({
            label: key,
            count: caseGrouping[key].length,
        });
    });

    statGroupingResponse.count = cases.length;

    return statGroupingResponse;
}

const getCaseGrouping: (cases: Case[], groupBy: StatGroupingOptions) => { [key: string]: Case[] } = function (
    cases: Case[],
    groupBy: StatGroupingOptions
) {
    let caseGrouping: Record<string, Case[]> = {};
    switch (groupBy) {
        case StatGroupingOptions.Aging:
            caseGrouping = groupCasesByAgingCategory(cases);
            break;
        case StatGroupingOptions.AgingRange:
            caseGrouping = groupCasesByAgingRange(cases);
            break;
        case StatGroupingOptions.Carrier:
        case StatGroupingOptions.CaseStatus:
        case StatGroupingOptions.ParentInstanceId:
        case StatGroupingOptions.PlanCode:
        case StatGroupingOptions.ProcessSubType:
        case StatGroupingOptions.PolicyNumber:
        case StatGroupingOptions.Process:
        case StatGroupingOptions.ProductName:
            caseGrouping = groupCasesByKey(cases, groupBy);
            break;
        case StatGroupingOptions.ExceptionsCategory:
            caseGrouping = groupCasesByExceptionCategory(cases);
        case StatGroupingOptions.ExceptionsMostRecentCategory:
            caseGrouping = groupCasesByMostRecentExceptionCategory(cases);
            break;
        case StatGroupingOptions.CreatedAt:
        case StatGroupingOptions.UpdatedAt:
            caseGrouping = groupCasesByDateKey(cases, groupBy);
            break;
        case StatGroupingOptions.ExceptionsExceptionType:
            // TODO
            break;
        case StatGroupingOptions.OpenStages:
            caseGrouping = groupCasesByOpenStages(cases);
            break;
    }
    return caseGrouping;
};

const groupCasesByKey: (cases: Case[], caseKey: string) => { [key: string]: Case[] } = function (cases: Case[], caseKey: string) {
    const casesByKey: Record<string, Case[]> = {};

    if (!cases) {
        return casesByKey;
    }

    cases.forEach(caseItem => {
        const currentKey = caseItem[caseKey as keyof Case];
        if (!casesByKey[currentKey as keyof Case]) {
            casesByKey[currentKey as keyof Case] = [] as Case[];
        }
        casesByKey[currentKey as keyof Case].push(caseItem);
    });

    return casesByKey;
};

const groupCasesByExceptionCategory: (cases: Case[]) => { [key: string]: Case[] } = function (cases: Case[]) {
    const casesByExceptionCategory: { [key: string]: Case[] } = {};

    if (!cases) {
        return casesByExceptionCategory;
    }

    cases.forEach(caseItem => {
        if (!caseItem || !caseItem.exceptions || caseItem.exceptions.length === 0) {
            return;
        }

        caseItem.exceptions.forEach(exception => {
            if (exception.category) {
                if (!casesByExceptionCategory[exception.category]) {
                    casesByExceptionCategory[exception.category] = [];
                }
                casesByExceptionCategory[exception?.category].push(caseItem);
            }
        });
    });

    return casesByExceptionCategory;
};

const groupCasesByMostRecentExceptionCategory: (cases: Case[]) => { [key: string]: Case[] } = function (cases: Case[]) {
    const casesByMostRecentExceptionCategory: { [key: string]: Case[] } = {};

    if (!cases) {
        return casesByMostRecentExceptionCategory;
    }

    cases.forEach(caseItem => {
        if (caseItem?.exceptions?.length === 0) {
            return;
        }
        // start it in the past
        let latestExceptionDate = new Date('01/01/1970');
        let latestException: ExceptionInstance | null = null;

        caseItem.exceptions.forEach(exception => {
            if (new Date(exception.updatedAt) > latestExceptionDate) {
                latestExceptionDate = new Date(exception.updatedAt);
                latestException = exception;
            }
        });

        if (latestException) {
            latestException = latestException as ExceptionInstance;
            if (latestException.category) {
                if (!casesByMostRecentExceptionCategory[latestException.category]) {
                    casesByMostRecentExceptionCategory[latestException.category] = [];
                }
                casesByMostRecentExceptionCategory[latestException?.category].push(caseItem);
            }
        }
    });

    return casesByMostRecentExceptionCategory;
};

const groupCasesByAgingCategory: (cases: Case[]) => { [key: string]: Case[] } = function (cases: Case[]) {
    const casesByAgingCategory: { [key in keyof typeof AgingTimeframes]: Case[] } = {
        ThreeDays: [],
        FiveDays: [],
        SevenDays: [],
        FourteenDays: [],
        ThirtyDays: [],
        SixtyDays: [],
        NinetyDays: [],
    };

    if (!cases) {
        return casesByAgingCategory;
    }

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    cases.map(caseItem => {
        if (caseItem.caseStatus === Statuses.Completed || caseItem.caseStatus === Statuses.Canceled) {
            return;
        }

        const caseCreatedDate = new Date(caseItem.createdAt);

        if (caseCreatedDate < ninetyDaysAgo) {
            casesByAgingCategory.NinetyDays.push(caseItem);
        } else if (caseCreatedDate < sixtyDaysAgo) {
            casesByAgingCategory.SixtyDays.push(caseItem);
        } else if (caseCreatedDate < thirtyDaysAgo) {
            casesByAgingCategory.ThirtyDays.push(caseItem);
        } else if (caseCreatedDate < fourteenDaysAgo) {
            casesByAgingCategory.FourteenDays.push(caseItem);
        } else if (caseCreatedDate < sevenDaysAgo) {
            casesByAgingCategory.SevenDays.push(caseItem);
        } else if (caseCreatedDate < fiveDaysAgo) {
            casesByAgingCategory.FiveDays.push(caseItem);
        } else if (caseCreatedDate < threeDaysAgo) {
            casesByAgingCategory.ThreeDays.push(caseItem);
        }
    });

    return casesByAgingCategory;
};

const groupCasesByAgingRange: (cases: Case[]) => { [key: string]: Case[] } = function (cases: Case[]) {
    const casesByAgingRange: { [key in keyof typeof AgingTimeRanges]: Case[] } = {
        ZeroToSeven: [],
        EightToFourteen: [],
        FifteenToThirty: [],
        ThirtyOneToFortyFive: [],
        FortySixToFiftyNine: [],
        SixtyPlus: [],
    };

    if (!cases) {
        return casesByAgingRange;
    }
    const now = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fourtyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    cases.map(caseItem => {
        if (caseItem.caseStatus === Statuses.Completed || caseItem.caseStatus === Statuses.Canceled) {
            return;
        }

        const caseCreatedDate = new Date(caseItem.createdAt);

        if (caseCreatedDate < sixtyDaysAgo) {
            casesByAgingRange.SixtyPlus.push(caseItem);
        } else if (caseCreatedDate < fourtyFiveDaysAgo) {
            casesByAgingRange.FortySixToFiftyNine.push(caseItem);
        } else if (caseCreatedDate < thirtyDaysAgo) {
            casesByAgingRange.ThirtyOneToFortyFive.push(caseItem);
        } else if (caseCreatedDate < fourteenDaysAgo) {
            casesByAgingRange.FifteenToThirty.push(caseItem);
        } else if (caseCreatedDate < sevenDaysAgo) {
            casesByAgingRange.EightToFourteen.push(caseItem);
        } else {
            casesByAgingRange.ZeroToSeven.push(caseItem);
        }
    });

    return casesByAgingRange;
};

const groupCasesByDateKey: (cases: Case[], caseKey: string) => { [key: string]: Case[] } = function (cases: Case[], caseKey: string) {
    const casesByKey: Record<string, Case[]> = {};

    if (!cases) {
        return casesByKey;
    }

    cases.forEach(caseItem => {
        const isoDate: string = caseItem[caseKey as keyof Case] as string;
        const currentDate = new Date(isoDate);
        const simpleDateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        if (!casesByKey[simpleDateString]) {
            casesByKey[simpleDateString] = [] as Case[];
        }
        casesByKey[simpleDateString].push(caseItem);
    });

    return casesByKey;
};

const groupCasesByOpenStages: (cases: Case[]) => { [key: string]: Case[] } = function (cases: Case[]) {
    const casesByKey: Record<string, Case[]> = {};

    if (!cases) {
        return casesByKey;
    }

    cases.forEach(caseItem => {
        const stages = caseItem.stages || [];
        stages.forEach(stage => {
            if (stage.stageStatus === Statuses.Completed || stage.stageStatus === Statuses.Canceled) {
                return;
            }
            if (!casesByKey[stage.label]) {
                casesByKey[stage.label] = [] as Case[];
            }
            casesByKey[stage.label].push(caseItem);
        });
    });

    return casesByKey;
};

export const sortAlphabetically = (a: any, b: any, key?: string) => {
    let aa: string = '';
    let bb: string = '';

    if (typeof a === 'string') {
        aa = a.toUpperCase();
    } else if (key) {
        aa = a[key];
    }

    if (typeof b === 'string') {
        bb = b.toUpperCase();
    } else if (key) {
        bb = b[key];
    }

    if (aa < bb) {
        return -1;
    }
    if (aa > bb) {
        return 1;
    }
    return 0;
};
