import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { Statuses } from '@deps/models/case/case';

import { TaskView } from './progress-tab-types';
import { Task, default as Tasks } from './tasks';
// Mock all the dependencies
const mockT = jest.fn((key, options) => {
    if (key === 'caseOverview.tabs.openSince') {
        return `Open since ${options.date}`;
    }
    if (key === 'caseOverview.tabs.scheduledTill') {
        return `Pending till ${options.date}`;
    }
    if (key === 'caseOverview.tabs.closedOn') {
        return `Closed on ${options.date}`;
    }
    if (key === 'caseOverview.tabs.taskSideSheetLabel') {
        return `Task: ${options.task}`;
    }
    if (key === 'sideSheet.task.taskHeading') {
        return 'Task';
    }
    if (key === 'caseOverview.tabs.reviewIssues') {
        return 'Review Issues';
    }
    return key;
});

jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { id: 'test-case-id' },
        pathname: '/test',
        asPath: '/test',
        push: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        back: jest.fn(),
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        events: {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        },
        isFallback: false,
        isLocaleDomain: false,
        isReady: true,
        defaultLocale: 'en',
        domainLocales: [],
        isPreview: false,
    }),
}));

// Define mockChangeSideSheetContent and mockHandleOpen at the top level so they're accessible to the mock
const mockChangeSideSheetContent = jest.fn();
const mockHandleOpen = jest.fn();

jest.mock('@deps/contexts/SideSheetContext', () => {
    // Create a mock emitter that satisfies both Map and Emitter interfaces
    const createMockEmitter = () => {
        const mapMethods = {
            clear: jest.fn(),
            delete: jest.fn(),
            forEach: jest.fn(),
            get: jest.fn(),
            has: jest.fn(),
            set: jest.fn(),
            entries: jest.fn(),
            keys: jest.fn(),
            values: jest.fn(),
            [Symbol.iterator]: jest.fn(),
        };

        const emitterMethods = {
            all: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        };

        return { ...mapMethods, ...emitterMethods };
    };

    return {
        useSideSheetContextLegacy: jest.fn(() => ({
            changeSideSheetContent: mockChangeSideSheetContent,
            handleOpen: mockHandleOpen,
            events: createMockEmitter(),
            handleLocation: jest.fn(),
            openSecondarySideSheet: jest.fn(),
            onClose: jest.fn(),
        })),
    };
});

// Mock Optimizely SDK first to prevent initialization errors
jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: jest.fn().mockReturnValue({
        onReady: jest.fn().mockResolvedValue({ success: true }),
        close: jest.fn(),
        notificationCenter: {
            addNotificationListener: jest.fn(),
        },
        track: jest.fn(),
    }),
    enums: {
        ERROR_MESSAGES: {},
    },
    LogLevel: {
        ERROR: 0,
    },
}));

// Now mock the OptimizelyContext that uses the SDK
jest.mock('@deps/contexts/OptimizelyContext', () => ({
    __esModule: true,
    useOptimizely: () => ({
        featureFlags: { someFlag: true },
        eventFlushInterval: 1000,
        eventBatchSize: 10,
    }),
}));

jest.mock('@deps/helpers/string.helpers', () => ({
    convertKebabedDateString: (date: string) => `formatted-${date}`,
}));

jest.mock('@deps/hooks/useTaskIdFromUrl', () => ({
    useTaskIdFromUrl: jest.fn(),
}));

describe('Task Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createMockTask = (overrides = {}): TaskView => ({
        id: 'task-123',
        taskName: 'Test Task',
        description: 'Test Description',
        status: Statuses.New,
        createdAt: '2023-05-15',
        updatedAt: '2023-05-16',
        ...overrides,
        hasParentException: false,
    });

    it('renders the task correctly', () => {
        const task = createMockTask();
        render(<Task task={task} />);

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-label',
            'Task: Test Description'
        );
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('displays fallback text when taskName is missing', () => {
        const task = createMockTask({ taskName: undefined });
        render(<Task task={task} />);

        expect(screen.getByText('Review Issues')).toBeInTheDocument();
    });

    it('shows "Open since" for open status tasks', () => {
        const task = createMockTask({ status: Statuses.New });
        render(<Task task={task} />);

        expect(mockT).toHaveBeenCalledWith('caseOverview.tabs.openSince', {
            date: 'formatted-2023-05-15',
        });
    });

    it('shows "Pending till" for pending status tasks', () => {
        const task = createMockTask({ status: Statuses.Pending });
        render(<Task task={task} />);

        expect(mockT).toHaveBeenCalledWith('caseOverview.tabs.scheduledTill', {
            date: 'formatted-2023-05-16',
        });
    });

    it('shows "Closed on" for closed status tasks', () => {
        const task = createMockTask({ status: Statuses.Completed });
        render(<Task task={task} />);

        expect(mockT).toHaveBeenCalledWith('caseOverview.tabs.closedOn', {
            date: 'formatted-2023-05-16',
        });
    });

    it('opens the side sheet when clicked', async () => {
        const task = createMockTask();
        render(<Task task={task} />);

        // Setup user event
        const user = userEvent.setup();

        // Wait for the click operation to complete
        await user.click(screen.getByRole('button'));

        expect(mockChangeSideSheetContent).toHaveBeenCalled();
        expect(mockHandleOpen).toHaveBeenCalledWith(true);
    });
});

describe('Tasks Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders null when no tasks are provided', () => {
        const { container } = render(<Tasks tasks={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders a list of tasks', () => {
        const tasks = [
            {
                id: 'task-1',
                taskName: 'Task 1',
                description: 'Description 1',
                status: Statuses.New,
                createdAt: '2023-05-15',
                updatedAt: '2023-05-16',
            },
            {
                id: 'task-2',
                taskName: 'Task 2',
                description: 'Description 2',
                status: Statuses.Completed,
                createdAt: '2023-05-17',
                updatedAt: '2023-05-18',
            },
        ] as TaskView[];

        render(<Tasks tasks={tasks} />);

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getAllByRole('button').length).toBe(2);
        expect(screen.getAllByTestId('chevron-down-icon').length).toBe(2);
    });
});
