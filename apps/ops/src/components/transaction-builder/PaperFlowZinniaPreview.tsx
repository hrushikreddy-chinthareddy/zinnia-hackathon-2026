import { useMemo } from 'react';

import TaskContainer from '@deps/containers/task-container/task-container';
import { TaskProvider } from '@deps/containers/task-container/task-provider';
import type { FullRjsfOutput } from '@deps/lib/transaction-builder/pipeline-types';
import {
    buildMockManagementTaskFromRjsfOutput,
    fullRjsfOutputToTaskMetadata,
} from '@deps/lib/transaction-builder/rjsf-output-task-preview';

export type PaperFlowZinniaPreviewProps = {
    fullRjsfOutput: FullRjsfOutput;
    taskInfoLink?: string;
};

/**
 * Renders generated RJSF tabs inside real TaskContainer / DynamicForm (same as live Zinnia task UI).
 */
export default function PaperFlowZinniaPreview({
    fullRjsfOutput,
    taskInfoLink = '/transaction-builder',
}: PaperFlowZinniaPreviewProps) {
    const taskMetadata = useMemo(
        () => fullRjsfOutputToTaskMetadata(fullRjsfOutput),
        [fullRjsfOutput]
    );
    const initialTask = useMemo(
        () => buildMockManagementTaskFromRjsfOutput(fullRjsfOutput),
        [fullRjsfOutput]
    );

    if (taskMetadata.length === 0) {
        return (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                No form tabs were generated — nothing to preview.
            </p>
        );
    }

    return (
        <TaskProvider
            key={initialTask.id}
            initialTask={initialTask}
            correlationId="mock-correlation-id"
        >
            <TaskContainer
                taskInfoLink={taskInfoLink}
                nigoExceptions={[]}
                nigoSubExceptions={[]}
                taskMetadata={taskMetadata}
                isSaveAsDraftEnabled={false}
                isContinueButtonEnabled={true}
                forceEditMode
            />
        </TaskProvider>
    );
}
