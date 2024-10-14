import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import ActionCellRenderer from './action-cell-renderer';

describe('#ActionCellRenderer', () => {
    it('should render the popover with the correct actions based on status when Reg60', () => {
        const params = {
            data: {
                status: 'IN_PROGRESS',
            },
            isReadOnly: (status: string) => CaseStatus.Submit || status === TaskStatus.Completed,
            isEditable: (status: string) =>status === (CaseStatus.Pending || status === TaskStatus.New),
        };

        render(<ActionCellRenderer {...(params as any)} />);

        userEvent.click(screen.getByRole('button'));
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should render the edit action when status is PENDING and case is Reg60', () => {
        const params = {
            data: {
                status: 'PENDING',
            },
            isReadOnly: (status: string) => CaseStatus.Submit || status === TaskStatus.Completed,
            isEditable: (status: string) =>  status === (CaseStatus.Pending || status === TaskStatus.New),
        };

        render(<ActionCellRenderer {...(params as any)} />);

        userEvent.click(screen.getByRole('button'));
        expect(screen.queryByText('Duplicate task content')).not.toBeInTheDocument();
        expect(screen.queryByText('Read-only view')).not.toBeInTheDocument();
    });
});
