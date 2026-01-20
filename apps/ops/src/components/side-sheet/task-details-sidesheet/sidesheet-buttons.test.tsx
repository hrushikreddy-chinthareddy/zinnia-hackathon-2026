import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { TaskStatus } from '@deps/models/case/task-instance';

import SidesheetButtons from './sidesheet-buttons';

const mockT = jest.fn((key: string) => {
    if (key === 'sideSheet.task.viewTask') return 'View Task';
    if (key === 'sideSheet.task.noPermissionToViewTask')
        return 'No permission to view task';
    if (key === 'sideSheet.task.goToCase') return 'Go to Case';
    if (key === 'sideSheet.task.startTask') return 'Start Task';
    return key;
});

jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('@zinnia/bloom/components', () => ({
    Button: ({ children, disabled, onClick, ...props }: any) => (
        <button disabled={disabled} onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@deps/components/loader/customLoader', () => {
    return function CustomLoader() {
        return <div data-testid="custom-loader">Loading...</div>;
    };
});

jest.mock('@deps/components/tooltip/tooltip', () => {
    const PopoverPlacement = {
        BottomRight: 'bottom-right',
        BottomLeft: 'bottom-left',
        TopRight: 'top-right',
        TopLeft: 'top-left',
    };
    return {
        __esModule: true,
        default: function Tooltip({ children, body }: any) {
            return (
                <div data-testid="tooltip-test-id" data-tooltip-body={body}>
                    {children}
                </div>
            );
        },
        PopoverPlacement,
    };
});

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogError: jest.fn(),
}));

describe('SidesheetButtons', () => {
    const mockTask = {
        id: 'task-123',
        caseId: 'case-123',
        status: TaskStatus.New,
        data: {},
        carrier: 'TEST',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        process: 'test-process',
        taskName: 'Test Task',
        taskType: 'test-type',
    };

    const defaultProps = {
        isGoToCaseButtonVisible: false,
        isViewTaskButtonVisible: true,
        className: 'test-class',
        task: mockTask,
        startLoader: false,
        goToCaseLoader: false,
        isViewTaskButtonDisabled: false,
        isStartButtonVisible: false,
        isStartButtonDisabled: false,
        handleGoToCase: jest.fn(),
        handleStart: jest.fn(),
        handleViewTask: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ViewTaskButton tooltip behavior', () => {
        it('should show tooltip when isViewTaskButtonDisabled is true', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    isViewTaskButtonDisabled={true}
                    startLoader={false}
                />
            );

            const tooltip = screen.queryByTestId('tooltip-test-id');
            expect(tooltip).toBeInTheDocument();
            expect(tooltip).toHaveAttribute(
                'data-tooltip-body',
                'No permission to view task'
            );
        });

        it('should NOT show tooltip when button is enabled (both disabled flags are false)', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    isViewTaskButtonDisabled={false}
                    startLoader={false}
                />
            );

            const tooltip = screen.queryByTestId('tooltip-test-id');
            expect(tooltip).not.toBeInTheDocument();
        });

        it('should show tooltip when both startLoader and isViewTaskButtonDisabled are true', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    startLoader={true}
                    isViewTaskButtonDisabled={true}
                />
            );

            const tooltip = screen.queryByTestId('tooltip-test-id');
            expect(tooltip).toBeInTheDocument();
        });
    });

    describe('ViewTaskButton rendering', () => {
        it('should render view task button when isViewTaskButtonVisible is true', () => {
            render(<SidesheetButtons {...defaultProps} />);

            const button = screen.getByTestId('view-task-btn');
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('View Task');
        });

        it('should not render view task button when isViewTaskButtonVisible is false', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    isViewTaskButtonVisible={false}
                />
            );

            const button = screen.queryByTestId('view-task-btn');
            expect(button).not.toBeInTheDocument();
        });

        it('should call handleViewTask when button is clicked', async () => {
            const handleViewTask = jest.fn();
            render(
                <SidesheetButtons
                    {...defaultProps}
                    handleViewTask={handleViewTask}
                    isViewTaskButtonDisabled={false}
                />
            );

            const button = screen.getByTestId('view-task-btn');
            await userEvent.click(button);

            expect(handleViewTask).toHaveBeenCalledWith('task-123');
        });
    });

    describe('GoToCase button', () => {
        it('should render go to case button when isGoToCaseButtonVisible is true', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    isGoToCaseButtonVisible={true}
                />
            );

            const button = screen.getByTestId('go-to-case-btn');
            expect(button).toBeInTheDocument();
        });

        it('should not render go to case button when isGoToCaseButtonVisible is false', () => {
            render(<SidesheetButtons {...defaultProps} />);

            const button = screen.queryByTestId('go-to-case-btn');
            expect(button).not.toBeInTheDocument();
        });
    });

    describe('Start button', () => {
        it('should render start button when isStartButtonVisible is true', () => {
            render(
                <SidesheetButtons
                    {...defaultProps}
                    isStartButtonVisible={true}
                />
            );

            const button = screen.getByTestId('start-task-btn');
            expect(button).toBeInTheDocument();
        });

        it('should not render start button when isStartButtonVisible is false', () => {
            render(<SidesheetButtons {...defaultProps} />);

            const button = screen.queryByTestId('start-task-btn');
            expect(button).not.toBeInTheDocument();
        });
    });
});
