import { render, screen, waitFor } from '@testing-library/react';

import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { getTaskInstance } from '@deps/queries/api/v2/task';

import TaskSideSheet from './task-sidesheet-content';

jest.mock('@deps/queries/api/v2/task');
jest.mock('@deps/utils/server-logging');
const mockedGetTaskInstance = jest.mocked(getTaskInstance);

const mockSuitabilityTask: ManagementTask = {
    id: 'TA1',
    caseId: 'CA1',
    taskType: 'Suitability',
    taskName: 'Suitability Review',
    status: TaskStatus.Closed,
    carrier: 'MASS',
    process: 'New Business',
    assignedTo: null,
    queue: null,
    createdAt: '2024-02-20T12:54:29.892Z',
    updatedAt: '2024-02-22T15:03:24.605Z',
    data: {
        followUpDate: '3/9/2023 12:00:00 AM',
        suitabilityStatus: 'Needs Review',
        notes: [
            {
                submissionDate: '2/22/2024 7:11:31 AM',
                commentCategory: '1st Call Out Successful',
                commentSubCategory: 'TOA PPWK Received',
                commentDetail: 'Stale Dated',
                comment: 'dummy task comment',
                description: 'd',
                createdDate: '2/22/2024 07:11:31 AM',
                createBy: 'SBDQ36',
                noteId: 9658702,
            },
        ],
        suitabiltyQuestion: 'Question added',
    },
};

const mockOtherTask: ManagementTask = {
    ...mockSuitabilityTask,
    id: 'TA2',
    taskType: 'OTHER',
    taskName: 'OTHER Review',
    status: TaskStatus.Open,
    data: null,
};

describe('TaskSideSheet', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders loader at first', async () => {
        render(<TaskSideSheet taskId="mocked" />);

        await waitFor(() => {
            expect(screen.getByTestId('test-loader')).toBeInTheDocument();
        });
    });

    it('renders suitability task correctly', async () => {
        mockedGetTaskInstance.mockReturnValueOnce(Promise.resolve(mockSuitabilityTask));
        render(<TaskSideSheet taskId="mocked" />);

        await waitFor(() => {
            expect(screen.getByText('sideSheet.suitability.taskLabel')).toBeInTheDocument();
            expect(screen.getByText('TA1')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.status.label')).toBeInTheDocument();
            expect(screen.getByText('Closed')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.createdlabel')).toBeInTheDocument();
            expect(screen.getByText('2/20/2024')).toBeInTheDocument();
            expect(screen.getByText('(temporal.timeago)')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.closedlabel')).toBeInTheDocument();
            expect(screen.getByText('2/22/2024')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.suitabilitystatus.header')).toBeInTheDocument();
            expect(screen.getByText('Needs Review')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.suitability.comments.header')).toBeInTheDocument();
            expect(screen.getByText('TOA PPWK Received. Stale Dated. d. dummy task comment')).toBeInTheDocument();
        });
    });

    it('renders suitability task correctly when no additional data', async () => {
        mockedGetTaskInstance.mockReturnValueOnce(Promise.resolve({ ...mockSuitabilityTask, data: null }));
        render(<TaskSideSheet taskId="mocked" />);

        await waitFor(() => {
            expect(screen.getByText('Sidesheet.suitability.suitabilitystatus.header')).toBeInTheDocument();
            expect(screen.getAllByText('--')).toHaveLength(1);
            expect(screen.getByText('sideSheet.suitability.comments.header')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.suitability.comments.noComments')).toBeInTheDocument();
        });
    });

    it('renders other task types correctly', async () => {
        mockedGetTaskInstance.mockReturnValueOnce(Promise.resolve(mockOtherTask));
        render(<TaskSideSheet taskId="mocked" />);

        await waitFor(() => {
            expect(screen.getByText('sideSheet.suitability.taskLabel')).toBeInTheDocument();
            expect(screen.getByText('TA2')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.status.label')).toBeInTheDocument();
            expect(screen.getByText('Open')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.createdlabel')).toBeInTheDocument();
            expect(screen.getByText('2/20/2024')).toBeInTheDocument();
            expect(screen.getByText('(temporal.timeago)')).toBeInTheDocument();
            expect(screen.getByText('Sidesheet.suitability.closedlabel')).toBeInTheDocument();
            expect(screen.getByText('--')).toBeInTheDocument();
            expect(screen.queryByText('Sidesheet.suitability.questionsheader')).toBeNull();
            expect(screen.queryByText('Sidesheet.suitability.suitabilitystatus.header')).toBeNull();
            expect(screen.getByText('sideSheet.suitability.comments.header')).toBeInTheDocument();
            expect(screen.getByText('sideSheet.suitability.comments.noComments')).toBeInTheDocument();
        });
    });
});
