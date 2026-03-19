import { render } from '@testing-library/react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { SswUpdateOption } from '@deps/models/case/enums';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import TasksListing from './tasks-listing';

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: jest.fn(() => ({
        featureFlags: {},
    })),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        pathname: '',
    })),
}));

describe('#TasksListing', () => {
    const mockedUseOptimizely = useOptimizely as jest.Mock;

    const mockProps = {
        t: jest.fn((id) => id),
        isHeaderHidden: true,
        isTaskCreationSupported: false,
        tasks: [],
        config: {
            searchResults: 'Search Results',
            createNewTask: 'Create New Task',
            noTaskFound: 'No tasks found',
            actionCellParams: {
                isReadOnly: (status: string) =>
                    CaseStatus.Submit || status === TaskStatus.Completed,
                isEditable: (status: string) =>
                    status === CaseStatus.Pending ||
                    status === TaskStatus.New ||
                    status === TaskStatus.InProgress,
                actionLabels: {
                    edit: 'Edit',
                    readOnlyView: 'Read-only view',
                    duplicateTaskContent: 'Edit',
                },
                actionMenu: 'Actions',
            },
        },
        caseId: '1',
        caseType: 'Type',
        documentNumber: '123',
        clientId: '456',
    };

    it('should render a component', () => {
        render(<TasksListing {...mockProps} />);
    });

    it('should display tasks when available', () => {
        const mockTask = [
            {
                id: 'TA000000012645',
                status: 'COMPLETED',
                taskName: 'Withdrawal form input',
                userId: 'B, Lee',
                createdDate: '2024-09-24T07:29:33Z',
                updatedDate: '2024-09-27T07:55:34Z',
                taskType: 'WithdrawalFormInputTask',
            },
        ];
        const { queryByText } = render(
            <TasksListing {...mockProps} tasks={mockTask} />
        );
        expect(queryByText('TA000000012645')).toBeInTheDocument();
    });

    it('should render when featureFlags has SSW_UPDATE_READONLY true and task has updateType (FF on)', () => {
        mockedUseOptimizely.mockReturnValue({
            featureFlags: { [FEATURE_FLAGS.SSW_UPDATE_READONLY]: true },
        });
        const mockTask = [
            {
                id: 'TA000000074601',
                status: 'COMPLETED',
                taskName: 'Data entry',
                userId: 'User One',
                createdDate: '2026-02-06T07:47:14Z',
                updatedDate: '2026-02-06T07:55:15Z',
                taskType: 'SSWFormInputTask',
                updateType: SswUpdateOption.SSW_UPDATE,
            },
        ];
        const { queryByText } = render(
            <TasksListing {...mockProps} tasks={mockTask} />
        );
        expect(queryByText('TA000000074601')).toBeInTheDocument();
    });

    it('should render when featureFlags has SSW_UPDATE_READONLY false (FF off)', () => {
        mockedUseOptimizely.mockReturnValue({
            featureFlags: { [FEATURE_FLAGS.SSW_UPDATE_READONLY]: false },
        });
        const mockTask = [
            {
                id: 'TA000000074601',
                status: 'COMPLETED',
                taskName: 'Data entry',
                userId: 'User One',
                createdDate: '2026-02-06T07:47:14Z',
                updatedDate: '2026-02-06T07:55:15Z',
                taskType: 'SSWFormInputTask',
                updateType: SswUpdateOption.SSW_UPDATE,
            },
        ];
        const { queryByText } = render(
            <TasksListing {...mockProps} tasks={mockTask} />
        );
        expect(queryByText('TA000000074601')).toBeInTheDocument();
    });
});
