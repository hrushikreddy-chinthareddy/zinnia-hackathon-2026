import { render, fireEvent } from '@testing-library/react';

import NoTasksFound from './no-tasks-found';

describe('#NoTasksFound', () => {
    const mockHandleCreateNewTask = jest.fn();
    const labels = {
        createNewTask: 'Create New Task',
        noTasksFoundTitle: 'No Tasks Found',
        noTasksMessage: 'Please create a new task.',
    };

    it('should render a component', () => {
        const { getByText } = render(
            <NoTasksFound
                labels={labels}
                handleCreateNewTask={mockHandleCreateNewTask}
            />
        );
        expect(getByText(labels.noTasksFoundTitle)).toBeInTheDocument();
        expect(getByText(labels.noTasksMessage)).toBeInTheDocument();
        expect(getByText(labels.createNewTask)).toBeInTheDocument();
    });

    it('should call handleCreateNewTask when Create New Task button is clicked', () => {
        const { getByText } = render(
            <NoTasksFound
                labels={labels}
                handleCreateNewTask={mockHandleCreateNewTask}
            />
        );
        fireEvent.click(getByText(labels.createNewTask));
        expect(mockHandleCreateNewTask).toHaveBeenCalled();
    });
});
