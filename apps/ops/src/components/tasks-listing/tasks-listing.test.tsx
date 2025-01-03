import { render } from '@testing-library/react';
// import router from 'next/router';

import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import TasksListing from './tasks-listing';

jest.mock('next/router', () => ({
    push: jest.fn(),
}));

describe('#TasksListing', () => {
    const mockProps = {
        t: jest.fn(id => id),
        isHeaderHidden: true,
        isTaskCreationSupported: false,
        tasks: [],
        config: {
            searchResults: 'Search Results',
            createNewTask: 'Create New Task',
            noTaskFound: 'No tasks found',
            actionCellParams: {
                isReadOnly: (status: string) => CaseStatus.Submit || status === TaskStatus.Completed,
                isEditable: (status: string) =>  (status === CaseStatus.Pending || status === TaskStatus.New ||  status === TaskStatus.InProgress),
                actionLabels: {
                    edit: 'Edit',
                    readOnlyView: 'Read-only view',
                    duplicateTaskContent: 'Edit',
                },
                actionMenu: 'Actions',
            }
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
                "id": "TA000000012645",
                "status": "COMPLETED",
                "taskName": "Withdrawal form input",
                "userId": "B, Leena",
                "createdDate": "2024-09-24T07:29:33Z",
                "updatedDate": "2024-09-27T07:55:34Z"
            }
        ]
        const { queryByText, container } = render(<TasksListing {...mockProps} tasks={mockTask} />);
        console.log("??container", container);
        expect(queryByText('TA000000012645')).toBeInTheDocument();
    });
});
