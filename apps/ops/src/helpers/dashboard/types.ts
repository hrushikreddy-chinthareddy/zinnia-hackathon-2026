import { Case, Processes, Statuses } from '@deps/models/case/case';

export interface CaseStat {
    label: string;
    value: number;
    measurementlabel: string;
}

export interface CaseStatWithCompare extends CaseStat {
    change: number;
    invertColor: boolean;
}

export interface CaseWithStats extends Case {
    stats: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        ms: number;
    };
}

export enum StatGroupingOptions {
    Default = 'default',
    Aging = 'aging',
    AgingRange = 'agingRange',
    Carrier = 'carrier',
    CaseStatus = 'caseStatus',
    CreatedAt = 'createdAt',
    ExceptionsCategory = 'exceptionsCategory',
    ExceptionsMostRecentCategory = 'exceptionsMostRecentCategory',
    ExceptionsExceptionType = 'exceptionsExceptionType',
    ParentInstanceId = 'parentInstanceId',
    PlanCode = 'planCode',
    ProcessSubType = 'processSubType',
    PolicyNumber = 'policyNumber',
    Process = 'process',
    ProductName = 'productName',
    OpenStages = 'openStages',
    UpdatedAt = 'updatedAt',
}

export interface CaseGrouping {
    key: Statuses | Processes | string;
    cases: Case[];
}
export interface StatGrouping {
    label: Statuses | Processes | string;
    count: number;
    children?: StatGroupingResponse | null;
}

export interface StatGroupingResponse {
    count: number;
    stats: StatGrouping[];
    groupBy: StatGroupingOptions;
}

// export type TimeFrameOptions =
//     | 'All'
//     | 'ZeroToSeven'
//     | 'EightToFourteen'
//     | 'FifteenToThirty'
//     | 'ThirtyOneToFortyFive'
//     | 'FortySixToFiftyNine'
//     | 'SixtyPlus';
