import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { ReactComponent as VerticalDots } from '@deps/styles/elements/icons/icons_outlined/dots-vertical.svg';

import { TaskTableRow } from './task-listing.types';

export interface actionLabelsParams {
    edit: string;
    readOnlyView: string;
    duplicateTaskContent: string;
}

export interface ActionCellRendererParams {
    actionLabels: actionLabelsParams;
    actionMenu: string;
    isEditable: (status: string) => boolean;
    isReadOnly: (status: string) => boolean;
}

export interface ActionCellParams {
    data: TaskTableRow;
    actionParams: ActionCellRendererParams;
}
export const getTaskActions = (params: ActionCellParams) => {
    const { data, actionParams } = params;
    const { status, taskInfoLink } = data || {};
    const actions = [];

    const { actionLabels, isEditable, isReadOnly } = actionParams || {};

    if (isReadOnly(status)) {
        /*
        const duplicateAction = {
            key: 'duplicate',
            setLink: (link: string) => <a href={link}>{actionLabels?.edit}</a>,
            link: taskInfoLink + '&action=duplicate',
        };
        actions.push(duplicateAction);
        */
        const readOnlyAction = {
            key: 'read-only',
            setLink: (link: string) => (
                <a href={link}>{actionLabels?.readOnlyView}</a>
            ),
            link: taskInfoLink + '&action=readonly',
        };
        actions.push(readOnlyAction);
    }

    if (isEditable(status)) {
        const editAction = {
            key: 'edit',
            setLink: (link: string) => <a href={link}>{actionLabels?.edit}</a>,
            link: taskInfoLink,
        };
        actions.push(editAction);
    }

    return actions.map(({ setLink, key, link }) => (
        <div className="my-1 ml-[-11px] p-3 text-base underline" key={key}>
            {setLink(link)}
        </div>
    ));
};

const ActionCellRenderer = (params: ActionCellParams) => {
    return (
        <Popover
            title={params?.actionParams?.actionMenu}
            body={getTaskActions(params)}
            placement={PopoverPlacement.BottomLeft}
        >
            <span className="block p-[5px]">
                <VerticalDots
                    height={'25px'}
                    width={'25px'}
                    className="text-primary"
                />
            </span>
        </Popover>
    );
};

export default ActionCellRenderer;
