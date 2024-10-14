import { Statuses } from '@deps/models/case/case';

import { StepInstance } from './step-instance';

export type StageInstance = {
    createdAt?: string;
    id: string;
    label: string;
    mappedNotes?: string[];
    mappedTasks?: string[] | null;
    stageStatus: Statuses;
    steps?: StepInstance[];
    tasks?: null;
    updatedAt?: string;
};
