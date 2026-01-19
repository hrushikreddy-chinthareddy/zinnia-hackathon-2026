import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ColumnPicker from './column-picker';
import { Column } from '../task-queue-columns';

// mock translation to return key as label
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const columns: Column<any>[] = [
    { id: 'task', label: 'task', locked: true, defaultVisible: true },
    { id: 'status', label: 'status', locked: true, defaultVisible: true },
    { id: 'carrierCase', label: 'carrierCase', defaultVisible: true },
    { id: 'assignee', label: 'assignee', defaultVisible: false },
];

const TriggerIcon = () => <svg />;

describe('ColumnPicker', () => {
    test('renders trigger button and does not show popover initially', () => {
        render(
            <ColumnPicker
                title="Column Picker"
                availableColumns={columns}
                selectedIds={['carrierCase']}
                onChange={jest.fn()}
                TriggerIcon={TriggerIcon}
            />
        );

        expect(
            screen.getByRole('button', { name: 'Column Picker' })
        ).toBeInTheDocument();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    test('opens popover when trigger is clicked', () => {
        render(
            <ColumnPicker
                title="Column Picker"
                availableColumns={columns}
                selectedIds={['carrierCase']}
                onChange={jest.fn()}
                TriggerIcon={TriggerIcon}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Column Picker' }));
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    test('shows toggleable (non-locked) columns in list', () => {
        render(
            <ColumnPicker
                title="Column Picker"
                availableColumns={columns}
                selectedIds={['carrierCase']}
                onChange={jest.fn()}
                TriggerIcon={TriggerIcon}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Column Picker' }));

        // locked columns should NOT appear
        expect(screen.queryByText('task')).not.toBeInTheDocument();
        expect(screen.queryByText('status')).not.toBeInTheDocument();

        // toggleable columns should
        expect(screen.getByText('carrierCase')).toBeInTheDocument();
        expect(screen.getByText('assignee')).toBeInTheDocument();
    });

    test('toggles selection and calls onChange with updated ids', () => {
        const onChange = jest.fn();

        render(
            <ColumnPicker
                title="Column Picker"
                availableColumns={columns}
                selectedIds={['carrierCase']}
                onChange={onChange}
                TriggerIcon={TriggerIcon}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Column Picker' }));

        const assigneeBtn = screen.getByRole('menuitemcheckbox', {
            name: 'assignee',
        });

        // toggle on
        fireEvent.click(assigneeBtn);
        expect(onChange).toHaveBeenLastCalledWith(['carrierCase', 'assignee']);

        // toggle off
        fireEvent.click(assigneeBtn);
        expect(onChange).toHaveBeenLastCalledWith(['carrierCase']);
    });

    test('closes popover when clicking outside', () => {
        render(
            <>
                <div data-testid="outside" />
                <ColumnPicker
                    title="Column Picker"
                    availableColumns={columns}
                    selectedIds={['carrierCase']}
                    onChange={jest.fn()}
                    TriggerIcon={TriggerIcon}
                />
            </>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Column Picker' }));
        expect(screen.getByRole('menu')).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByTestId('outside'));
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
