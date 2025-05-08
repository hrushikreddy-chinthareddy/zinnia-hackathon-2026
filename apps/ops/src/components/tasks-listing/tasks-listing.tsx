import router from 'next/router';

import NavElement, { NavElementType, NavElementSize, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { getSlug } from '@deps/helpers/string.helpers';

import NoTasksFound from './no-tasks-found';
import { toFormattedTask } from './task-listing.helpers';
import { TaskTableRow, TasksListingProps } from './task-listing.types';
import TasksTable from './tasks-table';

export default function TasksListing({
    t,
    tasks,
    config,
    caseId,
    caseType,
    documentNumber,
    clientId,
    isTaskCreationSupported,
    isHeaderHidden = true,
}: TasksListingProps) {
    const taskTableRows: TaskTableRow[] =
        (tasks && tasks?.map(task => toFormattedTask(t, task, caseId, caseType, documentNumber, clientId))) || [];
    const route = getSlug(caseType) + '/' + caseId;

    const handleCreateNewTask = () => {
        router.push(`/create-case/${route}?doc=${documentNumber}&clientId=${clientId}&action=new`);
    };

    return (
        <div>
            <div className="mb-4 grid grid-cols-2">
                <div className="col-span-1">
                    <p className="leading-7.5 font-primary text-xl font-medium text-gray-900">
                        {isHeaderHidden ? '' : `${config.searchResults} ${caseId}`}
                    </p>
                </div>
                <div className="col-span-1">
                    {isTaskCreationSupported && tasks && tasks.length > 0 ? (
                        <NavElement
                            type={NavElementType.Link}
                            className="float-right flex items-center"
                            size={NavElementSize.Small}
                            variant={NavElementVariant.Default}
                            href={`/create-case/${route}?doc=${documentNumber}&clientId=${clientId}&action=new`}
                        >
                            <span data-testid="create-task-link">+ {config.createNewTask}</span>
                        </NavElement>
                    ) : null}
                </div>
            </div>
            {tasks && tasks?.length > 0 ? (
                <TasksTable tasks={taskTableRows} t={t} config={config} />
            ) : (
                tasks && <NoTasksFound labels={config.noTaskFound} handleCreateNewTask={handleCreateNewTask} />
            )}
        </div>
    );
}
