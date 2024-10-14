import { ICellRendererParams } from 'ag-grid-community';

import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { ReactComponent as VerticalDots } from '@deps/styles/elements/icons/icons_outlined/dots-vertical.svg';

export interface actionLabelsParams {
    edit: string;
    readOnlyView: string;
    duplicateTaskContent: string;
}

export interface ActionCellRendererParams extends ICellRendererParams {
    actionLabels?: actionLabelsParams;
    actionMenu: string;
    isEditable: (status: string) => boolean;
    isReadOnly: (status: string) => boolean;
}

const getBody = (params: ActionCellRendererParams) => {
    const { status, taskInfoLink } = params.data;
    const actions = [];
    const { isEditable, isReadOnly } = params;
    const actionLabels = params.actionLabels || null;
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
            setLink: (link: string) => <a href={link}>{actionLabels?.readOnlyView}</a>,
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

const ActionCellRenderer = (params: ActionCellRendererParams) => {
    return (
        <Popover triggerClassName="mb-4" title={params.actionMenu} body={getBody(params)} placement={PopoverPlacement.BottomLeft}>
            <span className="block p-[5px]">
                <VerticalDots height={'25px'} width={'25px'} className="text-primary" />
            </span>
        </Popover>
    );
};

export default ActionCellRenderer;
