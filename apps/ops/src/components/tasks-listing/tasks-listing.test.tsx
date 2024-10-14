import { render } from '@testing-library/react';
// import router from 'next/router';

import TasksListing from './tasks-listing';

jest.mock('next/router', () => ({
    push: jest.fn(),
}));

describe('#TasksListing', () => {
    const mockProps = {
        t: jest.fn(id => id),
        tasks: [],
        config: {
            searchResults: 'Search Results',
            createNewTask: 'Create New Task',
            taskTableColConfig: [],
            noTaskFound: 'No tasks found',
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
        const { queryByText } = render(<TasksListing {...mockProps} tasks={[{ id: '1', name: 'Task 1' }] as any} />);
        expect(queryByText('No tasks found')).toBeNull();
    });
});
