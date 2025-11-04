import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, useCallback } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { MessageType } from '@deps/models/case/task';
import {
    AssignedTask,
    TaskStatus,
    UnassignedTask,
} from '@deps/models/case/task-instance';
import { UserProfile } from '@deps/models/user-profile';
import { TaskListingParams } from '@deps/pages/tasks';
import { getUserDataByPartyIds } from '@deps/queries/api/parties';
import { claimNextTask } from '@deps/queries/api/v1/claim-task';
import {
    getAssignedTasks,
    getManagerTasks,
    getUnassignedTasks,
} from '@deps/queries/api/v1/task';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const NO_ASSIGNEE = 'No Assignee';
export const HOMEPAGE_PATH_SEGMENT = 'home';
export const DEFAULT_ASSIGNEE_FIELDS = ['firstName', 'lastName', 'email'];
export const ASSIGNEE_PARTY_ID_FIELD = 'assigneePartyId';

interface UseTaskManagementQueueProps {
    isOpsManagerView?: boolean;
    additionalData?: {
        user: UserProfile;
        authorizedCarriers?: string[];
        taskListingParams?: TaskListingParams;
    };
}

type Assignee = {
    firstName?: string;
    lastName?: string;
    email: string;
};

type AssigneeMap = Record<string, Assignee>;

export const getUserNameFromEmail = (email: string): string => {
    return (
        email
            ?.split('@')[0]
            ?.split('.')
            ?.map((part) =>
                part.replace(/\d+/g, '').replace(/^\w/, (c) => c.toUpperCase())
            )
            ?.join(' ') || ''
    );
};

const useTaskManagementQueue = ({
    isOpsManagerView,
    additionalData,
}: UseTaskManagementQueueProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const [taskDetails, setTaskDetails] = useState<
        (AssignedTask | UnassignedTask)[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState<MessageType>(MessageType.Error);
    const [offset, setOffset] = useState(0);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    const isHomePage = useCallback(
        () => router.pathname.includes(HOMEPAGE_PATH_SEGMENT),
        [router.pathname]
    );

    const findAssignee = (
        assigneeMap: AssigneeMap,
        assigneePartyId?: string
    ): string => {
        if (!assigneePartyId || !assigneeMap[assigneePartyId])
            return NO_ASSIGNEE;
        const user = assigneeMap[assigneePartyId];
        return user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : getUserNameFromEmail(user.email);
    };

    const getRegularTasks = async (handleLoader: boolean) => {
        const assignee = additionalData?.user?.name || '';
        if (handleLoader) setIsLoading(true);
        setErrorMessage('');

        try {
            const assignedTasks = await getAssignedTasks();
            const assignedTasksWithUser = assignedTasks.map((task) => ({
                ...task,
                assignee,
            }));

            if (isHomePage()) {
                const activeTasks = assignedTasks.filter(
                    (task) => task.status !== TaskStatus.Scheduled
                );

                if (activeTasks.length > 0) {
                    setTaskDetails(assignedTasksWithUser);
                } else {
                    const unassignedTasks = await getUnassignedTasks();

                    if (unassignedTasks.length > 0) {
                        setTaskDetails([
                            ...assignedTasksWithUser,
                            { ...unassignedTasks[0], assignee: NO_ASSIGNEE },
                        ]);
                    } else {
                        setTaskDetails(assignedTasksWithUser);
                    }
                }
            } else {
                setTaskDetails(assignedTasksWithUser);
            }
        } catch (error) {
            setErrorMessage(t('fetchTaskError') ?? '');
        } finally {
            if (handleLoader) setIsLoading(false);
        }
    };

    const attachAssigneesToTasks = async (
        tasks: (AssignedTask | UnassignedTask)[]
    ): Promise<(AssignedTask | UnassignedTask)[]> => {
        const partyIds = tasks
            .filter((task) => task.assigneePartyId)
            .map((task) => task.assigneePartyId as string);

        if (!partyIds.length)
            return tasks.map((task) => ({ ...task, assignee: NO_ASSIGNEE }));

        const { parties } = await getUserDataByPartyIds({
            partyIds,
            fields: DEFAULT_ASSIGNEE_FIELDS,
        });

        return tasks.map((task) => ({
            ...task,
            assignee:
                ASSIGNEE_PARTY_ID_FIELD in task
                    ? findAssignee(parties, task.assigneePartyId)
                    : NO_ASSIGNEE,
        }));
    };

    const getManagerTask = async (
        handleLoader: boolean,
        searchParams: Record<string, any> = {},
        newOffset = 0,
        isScrollReset?: boolean
    ) => {
        if (handleLoader) setIsLoading(true);
        setErrorMessage('');

        try {
            const filters = {
                ...searchParams,
                offset: searchParams?.offset || newOffset,
                limit,
            };
            const { data, total } = await getManagerTasks(filters);
            let tasksWithAssignees: (AssignedTask | UnassignedTask)[] = [];

            if (data.length) {
                tasksWithAssignees = await attachAssigneesToTasks(data);
            }

            setTaskDetails(tasksWithAssignees);
            setTotal(total || 0);
            setOffset(searchParams?.offset || newOffset);

            if (isScrollReset) {
                window.scrollTo(0, 0);
            }
        } catch (error) {
            setErrorMessage(t('fetchTaskError') ?? '');
        } finally {
            if (handleLoader) setIsLoading(false);
        }
    };
    const getTasks = async (
        handleLoader: boolean,
        searchParams?: Record<string, any>,
        newOffset = 0,
        isScrollReset?: boolean
    ) => {
        setErrorMessage('');
        isOpsManagerView
            ? await getManagerTask(
                  handleLoader,
                  searchParams,
                  newOffset,
                  isScrollReset
              )
            : await getRegularTasks(handleLoader);
    };

    const handleClaimTask = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await claimNextTask();
            if (response?.status === 200 && !response.data?.statusCode) {
                await getTasks(true);
            } else {
                const { message, statusCode } = response.data;
                setErrorType(
                    statusCode === 404 ? MessageType.Info : MessageType.Error
                );
                setErrorMessage(message);
            }
        } catch (error) {
            setErrorMessage(t('claimTaskError') ?? '');
            browserLogError('handleClaimTask::Error claiming task', {
                ...parseErrorInformation(error),
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (additionalData && additionalData.taskListingParams) {
            const searchParams = {
                ...additionalData.taskListingParams,
            };
            getTasks(true, searchParams);
        } else {
            getTasks(true);
        }
    }, [isOpsManagerView]);

    return {
        taskDetails,
        isLoading,
        errorMessage,
        errorType,
        handleClaimTask,
        setErrorMessage,
        getTasks,
        setTaskDetails,
        attachAssigneesToTasks,
        offset,
        limit,
        total,
    };
};

export default useTaskManagementQueue;
