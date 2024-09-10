import { Meta } from '@storybook/react';

import { tooltipPlacementArgTypes } from '@deps/utils/storybook';

import PolicyExtrasHeader from './policy-extras-header';
import { PopoverPlacement } from '../popover/popover';

export default {
    title: 'Components/PolicyExtrasHeader',
    component: PolicyExtrasHeader,
    argTypes: {
        ...tooltipPlacementArgTypes,
    },
} as Meta<typeof PolicyExtrasHeader>;

export const NoTooltip = {
    args: {
        headerText: 'this is the header',
        subheaderNode: (
            <span>
                node type <b>accepts html</b> for styling
            </span>
        ),
        labelText: 'this is the label',
    },
};

export const WithTooltip = {
    args: {
        ...NoTooltip.args,
        tooltipTitle: 'this title is tooly tipio',
        tooltipBody: 'this body is tippy twoolio',
        tooltipPlacement: PopoverPlacement.BottomRight,
    },
};
