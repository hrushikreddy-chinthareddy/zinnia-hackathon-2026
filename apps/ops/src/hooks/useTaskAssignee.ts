import { useQuery } from '@tanstack/react-query';
import { User } from '@zinnia/api-types/types/fga';

import { PROCESSOR_ROLE } from '@deps/helpers/ops-manager.helpers';
import {
    AssignedTask,
    UnassignedTask,
    ManagementTask,
} from '@deps/models/case/task-instance';
import { SearchUsersQuery } from '@deps/queries/tanstack/usersQueries/usersQueries';
import { FIVE_MINUTES_IN_MS } from '@deps/types/constants';

import { getUserNameFromEmail } from './useTaskManagementQueue';

export const useTaskAssignee = ({
    task,
}: {
    task: AssignedTask | UnassignedTask | ManagementTask;
}) => {
    const {
        data: allAssigneeList,
        isLoading: assigneeLoading,
        refetch,
    } = useQuery({
        queryKey: ['assigneeList', task.carrier, task.queue, PROCESSOR_ROLE],
        queryFn: async () => {
            return await SearchUsersQuery({
                carrier: task.carrier,
                queue: task.queue ?? '',
                access: PROCESSOR_ROLE,
            });
        },
        select: (users) =>
            users.map((user: User) => ({
                user: getUserNameFromEmail(user.email),
                partyId: user.id.split(':')[1],
            })) || [],
        enabled: false,
        // Caching assignee list for 5 minutes to avoid refetching on every dropdown open
        staleTime: FIVE_MINUTES_IN_MS,
    });

    return {
        allAssigneeList: allAssigneeList ?? [],
        assigneeLoading,
        refetch,
    };
};
