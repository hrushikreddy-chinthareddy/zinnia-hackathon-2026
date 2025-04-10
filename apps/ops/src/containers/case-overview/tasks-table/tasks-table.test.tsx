import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ManagementTask } from '@deps/models/case/task-instance';

import TasksTable from './tasks-table';

jest.mock('@deps/utils/server-logging', () => ({
    withPageAuthAndLogging: jest.fn(() => ({
        getServerSideProps: jest.fn(),
    })),
}));

const tasks = [
    {
        id: 'TA000000001140',
        taskName: 'Suitability Review',
        status: 'Open',
        createdAt: '2024-02-22T08:47:28.000Z',
        updatedAt: '2024-02-22T10:07:48.000Z',
    },
    {
        id: 'TA000000001066',
        taskName: 'Suitability Review',
        status: 'Closed',
        createdAt: '2024-02-20T06:53:12.000Z',
        updatedAt: '2024-02-22T09:03:20.000Z',
    },
] as ManagementTask[];

describe('TasksTable', () => {
    it('renders text when there are no tasks', () => {
        render(<TasksTable tasks={[]} caseId="Sample" />);
        expect(screen.getByText('caseOverview.tasks.noItemsToDisplay')).toBeInTheDocument();
        expect(screen.getByText('caseOverview.tasks.taskAge')).toHaveAttribute('class', 'sr-only');
        expect(screen.getByText('caseOverview.tasks.task')).toBeInTheDocument();
        expect(screen.getByText('caseOverview.tasks.status')).toBeInTheDocument();
        expect(screen.getByText('Sample caseOverview.tasks.tasks')).toBeInTheDocument();
    });

    it('renders tasks correctly ', () => {
        render(<TasksTable tasks={tasks} caseId="Sample" />);
        expect(screen.queryByText('caseOverview.tasks.noItemsToDisplay')).toBeNull();
        expect(screen.getByText('caseOverview.tasks.taskAge')).toHaveAttribute('class', 'sr-only');
        expect(screen.getByText('caseOverview.tasks.task')).toBeInTheDocument();
        expect(screen.getByText('caseOverview.tasks.status')).toBeInTheDocument();
        expect(screen.getByText('Sample caseOverview.tasks.tasks')).toBeInTheDocument();
        expect(screen.getAllByText('tasks.open')).toHaveLength(1);
        expect(screen.getAllByText('Suitability Review')).toHaveLength(2);
        expect(screen.getAllByText('tasks.openFor')).toHaveLength(1);
        expect(screen.getAllByText('tasks.closed')).toHaveLength(1);
        expect(screen.getAllByText('tasks.closedFor')).toHaveLength(1);
    });

    // it('calls onClick prop when the tile is clicked', () => {
    //     render(<TasksTable tasks={tasks} caseId="Sample" />);
    //     const firstTask = screen.getAllByText('Suitability Review')[0];
    //     fireEvent.click(firstTask);
    //     expect(handleClick).toHaveBeenCalledTimes(1);
    // });
});
