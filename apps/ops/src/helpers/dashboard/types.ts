import { Case } from '@deps/models/case/case';

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
