import { CaseAdditionalData } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { Statuses } from '@deps/models/case/case';
export type InstanceInfo = {
    entityType?: string;
    identifier: string;
    label: string;
};
type BaseStepInstance = {
    additionalData?: CaseAdditionalData;
    createdAt: string;
    eventRef: string[];
    id: string;
    info?: string;
    label: string;
    mappedDocuments?: string[];
    mappedExceptions: string[];
    mappedNotes: string[];
    mappedTasks: string[] | null;
    multiInstance?: boolean;
    stepResult?: string | null; // BPB - maybe enumerate this one day
    stepStatus: Statuses;
    tasks?: null;
    updatedAt: string;
};

export interface SingleStepInstance extends BaseStepInstance {
    instanceInfo: null;
    multiInstance: boolean;
}

/**  A multi-step instance will have additional information about the object it is applying the step to.
 * In this case, the step's id will no longer be a unique identifier.  A step can be uniqulely identified
 * by the combination of the instanceInfo identifier and the step id.
 * The object the step is applying the step to can be grouped by the instanceInfo identifier.
 * Example: validate agent may have multiple steps to validate multiple agents.
 * id may be something like 'agentCanSellCheck'.  There could gbe multiple steps with the same id, but each
 * step is validating a different agent can sell.  The instanceInfo identifier would be the agent id.
 * Another step may be agentTrainingCheck.  You can group Agent X's training and can sell checks together
 * using the instanceInfo identifier.
 */
export interface MultiStepInstance extends BaseStepInstance {
    instanceInfo: InstanceInfo;
    multiInstance: true;
}

export type StepInstance = SingleStepInstance | MultiStepInstance;
