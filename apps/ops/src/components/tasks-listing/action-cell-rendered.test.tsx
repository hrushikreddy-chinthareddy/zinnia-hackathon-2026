import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

import ActionCellRenderer from './action-cell-renderer';

describe('#ActionCellRenderer', () => {
    it('should render readonly action when the task status is completed', () => {
        const params = {
            data: {
                status: TaskStatus.Completed,
            },
            actionParams: {
                isReadOnly: (status: string) => CaseStatus.Submit || status === TaskStatus.Completed,
                isEditable: (status: string) =>  (status === CaseStatus.Pending || status === TaskStatus.New ||  status === TaskStatus.InProgress),
                actionLabels: {
                    edit: 'Edit',
                    readOnlyView: 'Read-only view',
                    duplicateTaskContent: 'Edit',
                },
                actionMenu: 'Actions',
            }
        };

        render(<ActionCellRenderer {...(params as any)} />);

        userEvent.click(screen.getByRole('button'));
        screen.debug();
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Read-only view')).toBeInTheDocument();
    });

    it('should render the edit action when task Status us new', () => {
        const params = {
            data: {
                status: TaskStatus.New ,
            },
            actionParams: {
                isReadOnly: (status: string) => CaseStatus.Submit || status === TaskStatus.Completed,
                isEditable: (status: string) =>  (status === CaseStatus.Pending || status === TaskStatus.New ||  status === TaskStatus.InProgress),
                actionLabels: {
                    edit: 'Edit',
                    readOnlyView: 'Read-only view',
                    duplicateTaskContent: 'Edit',
                },
                actionMenu: 'Actions',
            }
        };

        render(<ActionCellRenderer {...(params as any)} />);

        userEvent.click(screen.getByRole('button'));
        screen.debug();
        expect(screen.queryByText('Edit')).toBeInTheDocument();
        expect(screen.queryByText('Read-only view')).not.toBeInTheDocument();
    });
});
