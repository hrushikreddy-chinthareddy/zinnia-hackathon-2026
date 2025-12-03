import { render, screen, fireEvent } from '@testing-library/react';

import { TaskStatus } from '@deps/models/case/task-instance';

import AssigneePopover from './assignee-popover';

const defaultProps = {
    assignee: 'John Doe',
    assigneeList: [{ partyId: '1', user: 'Jane Doe' }],
    assigneeLoading: false,
    searchValue: '',
    handleClick: jest.fn(),
    handleSearch: jest.fn(),
    handleTaskAssignAsAdmin: jest.fn(),
    handleTaskUnassignAsAdmin: jest.fn(),
    hasAssignee: jest.fn(() => true),
    task: { id: 't1', status: TaskStatus.InProgress, assigneePartyId: '0' },
};

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key, // or return some dummy text
        i18n: { changeLanguage: jest.fn() },
    }),
}));

describe('AssigneePopover', () => {
    it('does not open popover when status is Completed', () => {
        render(
            <AssigneePopover
                {...defaultProps}
                task={{ id: 't1', status: TaskStatus.Completed }}
            />
        );

        fireEvent.click(screen.getByRole('button'));

        expect(
            screen.queryByPlaceholderText(/Find a person/i)
        ).not.toBeInTheDocument();
    });

    it('renders placeholder when no assignee', () => {
        render(<AssigneePopover {...defaultProps} hasAssignee={() => false} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument(); // as Content placeholder
    });

    it.skip('calls handleSearch on input change', () => {
        render(<AssigneePopover {...defaultProps} />);
        const triggerButton = screen.getByRole('button', {
            name: /open assignee popover/i,
        });
        fireEvent.click(triggerButton);

        const input = screen.getByPlaceholderText(/find a person/i);
        fireEvent.change(input, { target: { value: 'Jane' } });

        expect(defaultProps.handleSearch).toHaveBeenCalledWith('Jane');
    });

    it('renders placeholder when no assignee', () => {
        render(<AssigneePopover {...defaultProps} hasAssignee={() => false} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument(); // as Content placeholder
    });

    it.skip('calls handleTaskAssignAsAdmin on selecting new assignee', () => {
        render(<AssigneePopover {...defaultProps} />);

        const triggerButton = screen.getByRole('button', {
            name: /open assignee popover/i,
        });
        fireEvent.click(triggerButton);

        fireEvent.click(screen.getByText('Jane Doe'));

        expect(defaultProps.handleTaskAssignAsAdmin).toHaveBeenCalledWith(
            't1',
            '1'
        );
    });

    it.skip('calls handleTaskUnassignAsAdmin on unassign click', () => {
        render(<AssigneePopover {...defaultProps} />);
        fireEvent.click(
            screen.getByRole('button', { name: /open assignee popover/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /unassign/i }));
        expect(defaultProps.handleTaskUnassignAsAdmin).toHaveBeenCalled();
    });

    it.skip('toggles popover on click when allowed', () => {
        render(<AssigneePopover {...defaultProps} />);

        const triggerButton = screen.getByRole('button', {
            name: /open assignee popover/i,
        });
        fireEvent.click(triggerButton);

        expect(
            screen.getByPlaceholderText(/Find a person/i)
        ).toBeInTheDocument();
    });

    it.skip('calls handleSearch on input change', () => {
        render(<AssigneePopover {...defaultProps} />);
        const triggerButton = screen.getByRole('button', {
            name: /open assignee popover/i,
        });
        fireEvent.click(triggerButton);

        const input = screen.getByPlaceholderText(/find a person/i);
        fireEvent.change(input, { target: { value: 'Jane' } });

        expect(defaultProps.handleSearch).toHaveBeenCalledWith('Jane');
    });
});
