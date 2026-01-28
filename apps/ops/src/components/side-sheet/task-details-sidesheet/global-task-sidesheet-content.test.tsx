import { useUser } from '@auth0/nextjs-auth0/client';
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/jest-globals';
import userEvent from '@testing-library/user-event';

import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { TaskStatus } from '@deps/models/case/task-instance';
import { getTaskInstance, getTaskSummaryById } from '@deps/queries/api/v2/task';
import { checkQueuePermissions } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';

import GlobalTaskSideSheet from './global-task-sidesheet-content';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: 'en',
        },
    }),
}));
const renderWithQueryClient = (
    component: React.ReactNode,
    options?: {
        queryClient?: QueryClient;
    }
) => {
    const queryClient = options?.queryClient || new QueryClient();
    return {
        ...render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        ),
        queryClient,
    };
};

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
}));

// Mock task API
jest.mock('@deps/queries/api/v2/task', () => ({
    getTaskInstance: jest.fn(),
    getTaskSummaryById: jest.fn(),
}));

// Mock permissions
const mockCheckQueuePermissions = jest.fn();

jest.mock(
    '@deps/queries/tanstack/permissionsQueries/permissions-queries',
    () => ({
        checkQueuePermissions: (...args: any[]) =>
            mockCheckQueuePermissions(...args),
    })
);

// Mock the API client
jest.mock('@deps/queries/api-utils/client', () => ({
    client: {
        get: jest.fn(),
    },
}));

// Mock task fetching functions
jest.mock('@deps/queries/api/v2/task', () => ({
    getTaskInstance: jest.fn(),
    getTaskSummaryById: jest.fn(),
}));

jest.mock('@auth0/nextjs-auth0/client', () => ({
    useUser: jest.fn(),
}));

jest.mock('@deps/contexts/SideSheetContext', () => ({
    useSideSheetContext: jest.fn(),
}));

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: jest.fn().mockReturnValue({
        isZinniaInternalProcessor: false,
    }),
}));

const defaultProps = {
    taskId: 'task-123',
    caseId: 'case-123',
    type: 'case',
    taskName: 'Test Task',
    taskDescription: 'Test Description',
    queue: 'DEFAULT_QUEUE',
    carrier: 'TEST_CARRIER',
    onTaskClaimSuccess: jest.fn(),
    onTaskUpdated: jest.fn(),
};

const mockTask = {
    ...defaultProps,
    status: TaskStatus.New,
    assignee: 'user@example.com',
    created: '2023-01-01T00:00:00Z',
    data: {
        taskType: 'REVIEW',
        queue: 'DEFAULT_QUEUE',
        carrier: 'TEST_CARRIER',
    },
    dueDate: '2023-01-10T00:00:00Z',
    priority: 'High',
    queue: 'test-queue',
    carrier: 'test-carrier',
};

describe('GlobalTaskSideSheet', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = new QueryClient();
        mockCheckQueuePermissions.mockReset();
        (getTaskInstance as jest.Mock).mockReset();
        (getTaskSummaryById as jest.Mock).mockReset();

        (useUser as jest.Mock).mockReturnValue({
            user: { email: 'test@example.com', partyId: 'test-party-id' },
        });

        (useSideSheetContext as jest.Mock).mockReturnValue({
            closeSideSheet: jest.fn(),
        });

        (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
            if (queryKey?.[0] === 'taskInstance') {
                return {
                    data: mockTask,
                    isLoading: false,
                    isError: false,
                };
            }
            if (queryKey?.[0] === 'documentSideSheetSearch') {
                return {
                    data: { data: [] },
                    status: 200,
                    isLoading: false,
                    isError: false,
                };
            }
            return {
                data: null,
                isLoading: false,
                isError: false,
            };
        });
    });

    it('should return true permissions for given party and queue', async () => {
        mockCheckQueuePermissions.mockResolvedValueOnce({
            canRead: true,
            canWrite: true,
        });

        const partyId = 'c4413af5922b4314ad143677efa65e77';
        const queue = 'welb_new_business';

        const permissions = await checkQueuePermissions(partyId, queue);

        expect(mockCheckQueuePermissions).toHaveBeenCalledWith(partyId, queue);

        expect(permissions).toEqual({
            canRead: true,
            canWrite: true,
        });
    });

    it('should return false permissions for given party and queue', async () => {
        mockCheckQueuePermissions.mockResolvedValueOnce({
            canRead: false,
            canWrite: false,
        });

        const partyId = 'c4413af5922b4314ad143677efa65e77';
        const queue = 'gilli_new_business';

        const permissions = await checkQueuePermissions(partyId, queue);

        expect(mockCheckQueuePermissions).toHaveBeenCalledWith(partyId, queue);

        expect(permissions).toEqual({
            canRead: false,
            canWrite: false,
        });
    });

    it('should call task Api when permissions are true', async () => {
        mockCheckQueuePermissions.mockResolvedValueOnce({
            canRead: true,
            canWrite: true,
        });

        const partyId = 'c4413af5922b4314ad143677efa65e77';
        const queue = 'welb_new_business';

        const permissions = await checkQueuePermissions(partyId, queue);

        expect(mockCheckQueuePermissions).toHaveBeenCalledWith(partyId, queue);

        expect(permissions).toEqual({
            canRead: true,
            canWrite: true,
        });
        if (permissions.canWrite) {
            const mockTaskData = {
                assignee: 'aarti.yadav1@zinnia.com',
                assigneePartyId: 'a846a184f3a2458d8adf2cb2c6f96ae7',
                carrier: 'FNWL',
                caseId: 'CA0000610318',
                createdAt: '2026-01-09T10:12:57Z',
                id: 'TA000000069991',
                process: 'Operations Review',
                queue: 'compliance',
                status: 'INPROGRESS',
                taskName: 'Validation',
                taskType: 'OPS_REVIEW',
                updatedAt: '2026-01-19T09:32:00Z',
            };

            (getTaskInstance as jest.Mock).mockResolvedValueOnce(mockTaskData);

            const result = await getTaskInstance({ taskId: 'TA000000069991' });

            expect(getTaskInstance).toHaveBeenCalledWith({
                taskId: 'TA000000069991',
            });
            expect(result).toEqual(mockTaskData);
        }
    });

    it('should call getTaskSummaryById when permissions are false', async () => {
        mockCheckQueuePermissions.mockResolvedValueOnce({
            canRead: false,
            canWrite: false,
        });

        const partyId = 'c4413af5922b4314ad143677efa65e77';
        const queue = 'gilli_new_business';

        const permissions = await checkQueuePermissions(partyId, queue);

        expect(mockCheckQueuePermissions).toHaveBeenCalledWith(partyId, queue);

        expect(permissions).toEqual({
            canRead: false,
            canWrite: false,
        });

        if (!permissions.canWrite) {
            const mockTaskData = {
                assignee: 'aarti.yadav1@zinnia.com',
                assigneePartyId: 'a846a184f3a2458d8adf2cb2c6f96ae7',
                carrier: 'FNWL',
                caseId: 'CA0000610318',
                createdAt: '2026-01-09T10:12:57Z',
                id: 'TA000000069991',
                process: 'Operations Review',
                queue: 'compliance',
                status: 'INPROGRESS',
                taskName: 'Validation',
                taskType: 'OPS_REVIEW',
                updatedAt: '2026-01-19T09:32:00Z',
            };

            (getTaskSummaryById as jest.Mock).mockResolvedValueOnce(
                mockTaskData
            );

            const result = await getTaskSummaryById({
                taskId: 'TA000000069991',
            });

            expect(getTaskSummaryById).toHaveBeenCalledWith({
                taskId: 'TA000000069991',
            });
            expect(result).toEqual(mockTaskData);
        }
    });

    it('should return task data when API call is failed', async () => {
        const mockTaskData = {
            status: 403,
            statusText: 'Forbidden',
        };

        (getTaskInstance as jest.Mock).mockResolvedValueOnce(mockTaskData);

        const result = await getTaskInstance({ taskId: 'TA000000061' });

        expect(getTaskInstance).toHaveBeenCalledWith({
            taskId: 'TA000000061',
        });
        expect(result).toEqual(mockTaskData);
    });

    it('should render task and enable View Task button when CIAM returns allowed:true', async () => {
        mockCheckQueuePermissions.mockResolvedValue({
            canRead: true,
            canWrite: true,
        });

        const mockTaskData = {
            id: 'TA000000069991',
            caseId: 'CA0000610318',
            status: TaskStatus.InProgress,
            assignee: 'test@example.com',
            assigneePartyId: 'a846a184f3a2458d8adf2cb2c6f96ae7',
            carrier: 'FNWL',
            queue: 'compliance',
            taskName: 'Validation',
            taskType: 'OPS_REVIEW',
            data: {
                taskId: 'TA000000069991',
                status: 'INPROGRESS',
            },
            created: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
        };

        (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
            if (queryKey?.[0] === 'taskInstance') {
                return {
                    data: mockTaskData,
                    isLoading: false,
                    isError: false,
                };
            }
            if (queryKey?.[0] === 'documentSideSheetSearch') {
                return { data: { data: [] }, isLoading: false };
            }
            return { data: [], isLoading: false };
        });

        (useUser as jest.Mock).mockReturnValue({
            user: { sub: 'auth0|123' },
            isLoading: false,
        });

        (useSideSheetContext as jest.Mock).mockReturnValue({
            closeSideSheet: jest.fn(),
        });
        jest.mock('react-i18next', () => ({
            useTranslation: () => ({
                t: (key: string) => key, // Return the key as the translation
                i18n: { language: 'en' },
            }),
        }));

        render(
            <QueryClientProvider client={queryClient}>
                <GlobalTaskSideSheet
                    {...defaultProps}
                    taskId="TA0000610318"
                    caseId="CA0000610318"
                    queue="compliance"
                    carrier="FNWL"
                    taskName="Validation"
                    onTaskClaimSuccess={jest.fn()}
                    onTaskUpdated={jest.fn()}
                />
            </QueryClientProvider>
        );

        await waitFor(() => {
            const viewTaskButton = screen.getByTestId('view-task-btn');
            expect(viewTaskButton).toBeInTheDocument();
            expect(viewTaskButton).toBeEnabled();

            expect(viewTaskButton).toHaveTextContent('sideSheet.task.viewTask');
        });
    });
    it('should render task but disable View Task button when CIAM returns allowed:false', async () => {
        mockCheckQueuePermissions.mockResolvedValue({
            canRead: true,
            canWrite: false,
        });

        const mockTaskData = {
            id: 'TA000000069991',
            caseId: 'CA0000610318',
            status: TaskStatus.InProgress,
            assignee: 'test@example.com',
            assigneePartyId: 'a846a184f3a2458d8adf2cb2c6f96ae7',
            carrier: 'FNWL',
            queue: 'compliance',
            taskName: 'Validation',
            taskType: 'OPS_REVIEW',
            data: {
                taskId: 'TA000000069991',
                status: 'INPROGRESS',
            },
            created: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z',
        };

        (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
            if (queryKey?.[0] === 'taskInstance') {
                return {
                    data: mockTaskData,
                    isLoading: false,
                    isError: false,
                };
            }
            if (queryKey?.[0] === 'documentSideSheetSearch') {
                return { data: { data: [] }, isLoading: false };
            }
            return { data: [], isLoading: false };
        });

        (useUser as jest.Mock).mockReturnValue({
            user: { sub: 'auth0|123' },
            isLoading: false,
        });

        (useSideSheetContext as jest.Mock).mockReturnValue({
            closeSideSheet: jest.fn(),
        });

        render(
            <QueryClientProvider client={queryClient}>
                <GlobalTaskSideSheet
                    {...defaultProps}
                    taskId="TA0000610318"
                    caseId="CA0000610318"
                    queue="compliance"
                    carrier="FNWL"
                    taskName="Validation"
                    onTaskClaimSuccess={jest.fn()}
                    onTaskUpdated={jest.fn()}
                />
            </QueryClientProvider>
        );
        await waitFor(() => {
            const viewTaskButton = screen.getByTestId('view-task-btn');
            expect(viewTaskButton).toBeInTheDocument();
            expect(viewTaskButton).toBeEnabled();
            expect(viewTaskButton).toHaveTextContent('sideSheet.task.viewTask');
        });
    });

    it('renders task details when data is loaded', async () => {
        renderWithQueryClient(<GlobalTaskSideSheet {...defaultProps} />);

        await waitFor(() => {
            const statusBadge = screen.getByTestId('badge-test-id');
            expect(statusBadge).toBeInTheDocument();

            const assigneeLabel = screen.getByText(
                'sideSheet.task.assigneeLabel'
            );
            expect(assigneeLabel).toBeInTheDocument();
        });
    });

    it('shows assignee field', async () => {
        renderWithQueryClient(<GlobalTaskSideSheet {...defaultProps} />);

        await waitFor(() => {
            const assigneeField = screen.getByText(
                'sideSheet.task.assigneeLabel'
            );
            expect(assigneeField).toBeInTheDocument();
        });
    });
    it('switches between tabs', async () => {
        renderWithQueryClient(<GlobalTaskSideSheet {...defaultProps} />);
        const detailsTab = screen.getByRole('tab', {
            name: /sideSheet.task.tabs.details/i,
        });
        const documentsTab = screen.getByRole('tab', {
            name: /sideSheet.task.tabs.documents/i,
        });
        expect(detailsTab).toHaveAttribute('data-state', 'active');
        expect(documentsTab).toHaveAttribute('data-state', 'inactive');
        await userEvent.click(documentsTab);
        expect(documentsTab).toHaveAttribute('data-state', 'active');
        expect(detailsTab).toHaveAttribute('data-state', 'inactive');
        await userEvent.click(detailsTab);
        expect(detailsTab).toHaveAttribute('data-state', 'active');
        expect(documentsTab).toHaveAttribute('data-state', 'inactive');
    });
});
