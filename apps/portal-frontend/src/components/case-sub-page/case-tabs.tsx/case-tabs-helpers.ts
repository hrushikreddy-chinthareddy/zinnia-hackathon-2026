import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { TFunction } from 'next-i18next';

import { percentFormatify } from '@deps/helpers/numbers.helper';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { Case, Statuses } from '@deps/models/case/case';
import { ExceptionInstance, ExceptionStatuses } from '@deps/models/case/exception-instance';
import { StageInstance } from '@deps/models/case/stage-instance';
import { MultiStepInstance, StepInstance } from '@deps/models/case/step-instance';
import { TaskInstance, TaskStatus } from '@deps/models/case/task-instance';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

// Needed to properly ingest the Zahara datetime format
dayjs.extend(customParseFormat);
// Needed to properly use the timezone plugin
dayjs.extend(utc);
// Needed to provide the 3-digit format of the timezone to the timestamp string
dayjs.extend(advancedFormat);
// Needed to provide timezone to the timestamp string
dayjs.extend(timezone);

interface MultiStepInstanceWithSteps extends MultiStepInstance {
    steps: MultiStepInstance[];
}

export type TaskView = {
    createdAt: string;
    description: string;
    id: string;
    hasParentException: boolean;
    parentExceptionStatus?: ExceptionStatuses | null;
    status: string;
    updatedAt: string; // Zahara API date String
};

export type ExceptionView = {
    createdAt?: string;
    description: string;
    id: string;
    tasks: TaskView[];
    status: string;
    updatedAt: string;
};

export type StepView = {
    description?: string;
    exceptions: ExceptionView[];
    id: string;
    name: string;
    status: string; // Status of the step, or ranked status if it is a multi-instance step
    substeps?: StepInstance[]; // Any steps that make up the multi-instance step
    tasks: TaskView[]; // Mapped tasks for the step that are unrelated to an exception
    updatedAt: string;
};

export type StageView = {
    completedSteps: number;
    id: string;
    name: string;
    nigoSteps: number;
    status: string;
    steps: StepView[];
    totalSteps: number;
    updatedAt: string;
};

export type CaseView = {
    completedSteps: number;
    totalSteps: number;
    stages: StageView[];
    unmappedExceptions: ExceptionView[];
};

export const formatTimestamp = (timestamp: string): string => {
    const time = dayjs(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
    if (!time.isValid()) {
        return DEFAULT_ERROR_STRING;
    }
    return time.tz(dayjs.tz.guess()).format('M/D/YYYY [at] h:mma z');
};

// creates a whole-number x% Complete string based on 2 numbers (complete and total)
export const completionPercentageString = (complete: number, total: number, t: TFunction): string => {
    try {
        const percentComplete = Math.round((100 * complete) / total) / 100;
        return t('caseOverview.tabs.percentComplete', {
            percent: percentFormatify(percentComplete),
        });
    } catch (e) {
        return DEFAULT_ERROR_STRING;
    }
};

// Take the highest value step status for multi-instance steps
const statusHierarchy = {
    [Statuses.NotStarted as string]: 1,
    RESOLVED: 2,
    [Statuses.Completed as string]: 3,
    [Statuses.InProgress as string]: 4,
    [Statuses.Exception as string]: 5,
};

const taskStatusHierarchy = {
    [Statuses.New as string]: 1,
    [Statuses.NotStarted as string]: 1,
    [TaskStatus.New as string]: 1,
    [TaskStatus.Open as string]: 2,
    OPEN: 2,
    [Statuses.InProgress as string]: 3,
    [TaskStatus.Closed as string]: 4,
    [TaskStatus.Completed as string]: 4,
    [Statuses.Completed as string]: 4,
    CLOSED: 4,
    [Statuses.Canceled as string]: 5,
};

// Resolved exceptions should be at the end of the list sorted by updatedAt.  Do not modify unresolved exceptions relative order to each other
const exceptionSorter = (exceptionA: ExceptionView, exceptionB: ExceptionView) => {
    const isAResolved = [ExceptionStatuses.Resolved, Statuses.Completed].includes(exceptionA.status as ExceptionStatuses | Statuses);
    const isBResolved = [ExceptionStatuses.Resolved, Statuses.Completed].includes(exceptionB.status as ExceptionStatuses | Statuses);
    if (isAResolved && !isBResolved) {
        return 1;
    }
    if (!isAResolved && isBResolved) {
        return -1;
    }
    if (isAResolved && isBResolved) {
        return dayjs(exceptionA.updatedAt).isBefore(dayjs(exceptionB.updatedAt)) ? -1 : 1;
    }
    return 0;
};

// Sort tasks by status hierarchy and then by createdAt dates.
const taskSorter = (taskA: TaskView, taskB: TaskView) => {
    if (taskStatusHierarchy[taskA.status] === taskStatusHierarchy[taskB.status]) {
        return taskA.createdAt > taskB.createdAt ? 1 : -1;
    }
    return taskStatusHierarchy[taskB.status] - taskStatusHierarchy[taskA.status];
};

class Step {
    description?: string;
    exceptions: ExceptionView[] = [];
    id: string;
    isMultiInstance: boolean = false;
    name: string = '';
    parentStage: Stage;
    status: string; // Status of the step, or ranked status if it is a multi-instance step
    stepRaw: StepInstance;
    substeps?: StepInstance[]; // Any steps that make up the multi-instance step
    tasks: TaskView[] = []; // Mapped tasks for the step that are unrelated to an exception
    updatedAt: string;

    constructor(step: StepInstance, parentStage: Stage) {
        this.parentStage = parentStage;
        this.stepRaw = step;
        this.id = step.id;
        this.status = step.stepStatus;
        this.updatedAt = step.updatedAt;
        this.isMultiInstance = step.multiInstance;
        this.buildNameAndDescription();
        this.buildExceptions();
        this.buildTasks();
    }

    private buildExceptions() {
        this.exceptions = (
            (this.stepRaw.mappedExceptions || ([] as string[]))
                ?.map(exId => {
                    return this.parentStage.useException(exId);
                })
                ?.filter(Boolean) as ExceptionView[]
        ).sort(exceptionSorter);
    }

    private buildTasks() {
        this.tasks = (
            (this.stepRaw.mappedTasks || ([] as string[]))
                .map(taskId => {
                    return this.parentStage.useTask(taskId);
                })
                .filter(Boolean) as TaskView[]
        ).sort(taskSorter);
    }

    private buildNameAndDescription() {
        if (this.isMultiInstance) {
            this.name = this.parentStage.parentCase.t('caseOverview.tabs.validate', { label: this.stepRaw.label });
            return;
        }
        this.name = this.parentStage.parentCase.t([`caseManagementApiKeys.steps.${this.id}`, toSentenceCase(this.stepRaw.label)], {
            subType: this.parentStage.parentCase.processSubType,
        });

        this.description =
            this.parentStage.parentCase.t([`caseManagementApiKeys.stepDescriptions.${this.id}`, ''], {
                subType: this.parentStage.parentCase.processSubType,
            }) || undefined;
    }

    public get viewData(): StepView {
        return {
            ...(this.isMultiInstance ? { substeps: this.substeps } : {}), // Only add substeps if the step is a multi-instance step(this.isMultiInstance ? { substeps: this.substeps } : {}},
            id: this.id,
            description: this.description,
            exceptions: this.exceptions,
            tasks: this.tasks,
            name: this.name,
            status: this.status,
            updatedAt: this.updatedAt,
        };
    }
}

class Stage {
    completedSteps: number;
    id: string;
    name: string;
    nigoSteps: number;
    parentCase: TransformedCase;
    stageRaw: StageInstance;
    status: string;
    steps: Step[] = [];
    totalSteps: number;

    constructor(stage: StageInstance, parentCase: TransformedCase) {
        this.parentCase = parentCase;
        this.stageRaw = stage;
        this.completedSteps = 0;
        this.nigoSteps = 0;
        this.totalSteps = 0;
        this.id = stage.id;
        this.status = stage.stageStatus;
        this.name = this.parentCase.t([`caseManagementApiKeys.stages.${this.id}`, toSentenceCase(stage.label)], {
            subType: this.parentCase.processSubType,
        });
        this.processSteps();
    }

    public useException(exceptionId: string) {
        return this.parentCase.useException(exceptionId);
    }

    public useTask(taskId: string) {
        return this.parentCase.useTask(taskId);
    }

    public get updatedAt(): string {
        return (
            this.stageRaw.updatedAt ??
            this.steps.reduce((latestUpdatedAt, step) => {
                if (!latestUpdatedAt) {
                    return step.updatedAt;
                }
                return step.updatedAt > latestUpdatedAt ? step.updatedAt : latestUpdatedAt;
            }, '')
        );
    }

    public get viewData(): StageView {
        return {
            completedSteps: this.completedSteps,
            id: this.id,
            name: this.name,
            nigoSteps: this.nigoSteps,
            status: this.status,
            steps: this.getStepsViewData(),
            totalSteps: this.totalSteps,
            updatedAt: this.updatedAt,
        };
    }

    private getStepsViewData() {
        return this.steps.map(step => step.viewData);
    }

    /**
     * Steps can be multi-instance or not.  The UI wants to treat multi-instance steps as a single step for display purposes.
     * Convert all multi-instance steps with the same instanceInfo.identifier into a single step with a list of multi-instance steps
     * Converts an array of StepInstance objects to an array of StepInstance or MultiStepInstanceWithSteps objects.
     *
     * @param {StepInstance[]} steps - The array of StepInstance objects to convert.
     * @return {(StepInstance | MultiStepInstanceWithSteps)[]} The converted array of StepInstance or MultiStepInstanceWithSteps objects.
     */
    private convertStepsToMultiInstanceSteps = (): (StepInstance | MultiStepInstanceWithSteps)[] => {
        if (!this.stageRaw.steps) {
            console.error('No steps found in stage ', this.stageRaw.id);
            return [];
        }
        const multiInstanceSteps = {} as { [key: string]: MultiStepInstance[] };
        const convertedSteps = [] as (StepInstance | MultiStepInstanceWithSteps)[];
        this.stageRaw.steps.forEach(step => {
            if (step.multiInstance) {
                if (!multiInstanceSteps[step.instanceInfo.identifier]) {
                    multiInstanceSteps[step.instanceInfo.identifier] = [];
                }
                multiInstanceSteps[step.instanceInfo.identifier].push(step);
            } else {
                convertedSteps.push(step);
            }
        });
        const convertedMultiSteps = Object.keys(multiInstanceSteps)
            .map(key => {
                // Does the multi-instance step have any steps in the not started status
                let hasNotStartedStep = false;
                const consolidatedStep = multiInstanceSteps[key].reduce((acc, val) => {
                    const stepStatus =
                        !statusHierarchy[acc.stepStatus] || statusHierarchy[val.stepStatus] > statusHierarchy[acc.stepStatus]
                            ? val.stepStatus
                            : acc.stepStatus; // use the highest status for the multi-instance step
                    hasNotStartedStep = hasNotStartedStep || val.stepStatus === Statuses.NotStarted;
                    return {
                        additionalData: { ...acc.additionalData, ...val.additionalData },
                        createdAt: acc.createdAt < val.createdAt ? acc.createdAt : val.createdAt, // Take the earliest created at date for the multi-instance step
                        eventRef: (acc.eventRef ?? []).concat(val.eventRef ?? []),
                        id: val.instanceInfo?.identifier as string, // a multi-instance step MUST have an identifier
                        instanceInfo: val?.instanceInfo as { identifier: string; label: string }, // a multi-instance step MUST have instanceInfo
                        label: val.instanceInfo?.label as string, // a multi-instance step MUST have a label
                        mappedExceptions: (acc.mappedExceptions ?? []).concat(val.mappedExceptions ?? []),
                        mappedNotes: (acc.mappedNotes ?? []).concat(val.mappedNotes ?? []),
                        mappedTasks: (acc.mappedTasks ?? []).concat(val.mappedTasks ?? []),
                        multiInstance: true,
                        updatedAt: acc.updatedAt > val.updatedAt ? acc.updatedAt : val.updatedAt, // Take the latest updated at date for the multi-instance step
                        stepStatus,
                    };
                }, {} as MultiStepInstance);

                // If there are any not started steps in the multi-instance step where the rest are completed, set the step status to in progress
                if ([Statuses.Completed, 'RESOLVED' as Statuses].includes(consolidatedStep.stepStatus) && hasNotStartedStep) {
                    consolidatedStep.stepStatus = Statuses.InProgress;
                }

                return { ...consolidatedStep, steps: multiInstanceSteps[key] } as MultiStepInstanceWithSteps;
            })
            .sort((a, b) => a.label.localeCompare(b.label));
        return convertedSteps.concat(convertedMultiSteps);
    };

    private processSteps() {
        this.totalSteps = 0;
        this.nigoSteps = 0;
        this.completedSteps = 0;
        const convertedSteps = this.convertStepsToMultiInstanceSteps();
        this.steps = convertedSteps.map(step => {
            const stepInstance = new Step(step, this);
            this.totalSteps++;
            this.nigoSteps += stepInstance.exceptions.reduce((count, exception) => {
                if (exception.status === ExceptionStatuses.New) {
                    count++;
                }
                return count;
            }, 0);
            [Statuses.Completed, 'RESOLVED' as Statuses].includes(stepInstance.status as Statuses) && this.completedSteps++;
            return stepInstance;
        });
    }
}

class TransformedCase {
    caseRaw: Case;
    completedSteps: number;
    exceptionMap: { [key: string]: ExceptionInstance & { usedInStep?: boolean } };
    processSubType: string;
    stages: Stage[] = [];
    t: TFunction;
    taskMap: { [key: string]: TaskInstance };
    totalSteps: number;
    // Exceptions that are not tied to any step
    unmappedExceptions: ExceptionView[] = [];
    constructor(caseDetails: Case, t: TFunction) {
        this.caseRaw = caseDetails;
        this.t = t;
        this.totalSteps = 0;
        this.completedSteps = 0;
        this.exceptionMap = caseDetails?.exceptions?.reduce((acc, exception) => {
            acc[exception.id] = exception;
            return acc;
        }, {} as { [key: string]: ExceptionInstance });
        this.processSubType = (caseDetails?.processSubType || caseDetails?.process)?.toLowerCase();
        this.taskMap = caseDetails?.tasks?.reduce((acc, task) => {
            acc[task.id] = task;
            return acc;
        }, {} as { [key: string]: TaskInstance });
        this.transformCaseDetails();
    }

    // Looks for an exception in the map, and marks it as used in a step
    public useException(exceptionId: string) {
        if (!this.exceptionMap[exceptionId]) {
            return null;
        }
        this.exceptionMap[exceptionId].usedInStep = true;
        return this.buildException(this.exceptionMap[exceptionId]);
    }

    public useTask(taskId: string) {
        if (!this.taskMap[taskId]) {
            return null;
        }
        return this.buildTaskFromTaskId(taskId, false);
    }

    /*
     * Maps the given taskId to a StepTask, or null if the task is not found or already completed.
     * @param {string} taskId - The id of the task to be mapped
     * @return {StepTask | null} - The mapped task
     */
    private buildTaskFromTaskId(taskId: string, isFromException: boolean, status?: ExceptionStatuses): TaskView | null {
        const foundTask = this.taskMap[taskId];

        if (!foundTask) {
            return null;
        }
        return {
            createdAt: foundTask.createdAt,
            description: foundTask.label || foundTask.taskType, // BPB - taskType is where we get the info, but label is on the type?
            id: foundTask.id,
            hasParentException: isFromException,
            parentExceptionStatus: status,
            status: foundTask.status,
            updatedAt: foundTask.updatedAt,
        };
    }

    // Builds an ExceptionView from an ExceptionInstance
    private buildException(exception: ExceptionInstance): ExceptionView {
        const descriptionArr: string[] = [];
        exception?.reason && descriptionArr.push(toSentenceCase(exception?.reason));
        exception?.detailedReason && descriptionArr.push(toSentenceCase(exception?.detailedReason));
        const tasks: TaskView[] = (
            (exception.taskIdList || ([] as string[]))
                .map(taskId => {
                    return this.buildTaskFromTaskId(taskId, true, exception.status);
                })
                .filter(Boolean) as TaskView[]
        ).sort(taskSorter);

        const description = this.t(
            [Statuses.Completed, ExceptionStatuses.Resolved].includes(exception.status)
                ? 'caseOverview.tabs.resolved'
                : 'caseOverview.tabs.issue',
            { issue: descriptionArr.join('. ') }
        );
        return {
            createdAt: exception.createdAt,
            description,
            id: exception.id,
            status: exception.status,
            tasks: tasks,
            updatedAt: exception.updatedAt,
        };
    }

    // Transforms the raw case details into a more useful format
    private transformCaseDetails() {
        this.totalSteps = 0;
        this.completedSteps = 0;
        this.stages = this.caseRaw.stages.map(stage => {
            const stageInstance = new Stage(stage, this);
            this.totalSteps += stageInstance.totalSteps;
            this.completedSteps += stageInstance.completedSteps;
            return stageInstance;
        });
        this.unmappedExceptions = Object.keys(this.exceptionMap).reduce((acc, exceptionId) => {
            const exception = this.exceptionMap[exceptionId] as ExceptionInstance & { usedInStep: boolean };
            if (exception && !exception.usedInStep) {
                acc.push(this.buildException(exception));
            }
            return acc;
        }, [] as ExceptionView[]);
    }

    // Builds the stages view data
    private getStagesViewData() {
        return this.stages.map(stage => {
            return stage.viewData;
        });
    }

    // Generates the case details view data for use in the progress tab
    public get viewData() {
        return {
            completedSteps: this.completedSteps,
            totalSteps: this.totalSteps,
            stages: this.getStagesViewData(),
            unmappedExceptions: this.unmappedExceptions,
        };
    }
}

export const mapCaseDetails = (caseDetails: Case, t: TFunction): CaseView => {
    const mapper = new TransformedCase(caseDetails, t);
    return mapper.viewData;
};
