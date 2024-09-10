import router from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

import getCreateCaseConfig from '@deps/containers/otp/create-case-form/create-case-form.helper';
import { getSlug } from '@deps/helpers/string.helper';
import { Case, CaseType, Statuses } from '@deps/models/case/case';
import fetchTasks from '@deps/operations/tasks/taskOperations';

import { Task } from './task-listing.types';
import TasksListing from './tasks-listing';
import PageLoader, { PageLoaderVariant } from '../page-loader/page-loader';

interface TaskListingContainerProps {
    t: TFunction;
    caseData: Case;
    clientId: string;
    caseType: CaseType;
    documentNumber: string;
}

const TaskListingContainer = ({ t, caseData, caseType, documentNumber, clientId }: TaskListingContainerProps) => {
    const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
    const [showLoader, setShowLoader] = useState(false);
    const { taskTableConfig } = getCreateCaseConfig(t);

    useEffect(() => {
        const getTasks = async () => {
            if (caseData.id) {
                setShowLoader(true);
                const tasks = await fetchTasks(caseData.id, caseType);
                setTasks(tasks || undefined);
                setShowLoader(false);
                if (caseData.caseStatus !== Statuses.Completed && tasks && tasks.length === 0) {
                    const route = getSlug(caseType) + '/' + caseData.id;
                    router.push(`/create-case/${route}?doc=${documentNumber}&clientId=${clientId}`);
                }
            }
        };
        getTasks();
    }, [caseData.id, caseData.caseStatus, caseType, documentNumber, clientId]);

    return (
        <>
            {showLoader && <PageLoader variant={PageLoaderVariant.Center} />}
            <TasksListing
                t={t}
                isHeaderHidden={true}
                isTaskCreationSupported={caseData.caseStatus !== Statuses.Completed}
                tasks={tasks}
                caseId={caseData.id}
                caseType={caseType}
                documentNumber={documentNumber}
                clientId={clientId}
                config={taskTableConfig}
            />
        </>
    );
};

export default TaskListingContainer;
