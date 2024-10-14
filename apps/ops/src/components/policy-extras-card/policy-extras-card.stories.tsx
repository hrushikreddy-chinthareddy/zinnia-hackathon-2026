import { Meta, StoryObj } from '@storybook/react';

import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';
import { tooltipPlacementArgTypes, numberOfFieldsArgTypes } from '@deps/utils/storybook';

import PolicyExtrasCard, { PolicyExtrasCardProps } from './policy-extras-card';
import BadgeWithTooltip from '../badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '../badge/badge.helper';
import { NoTooltip as HeaderNoTooltip, WithTooltip as HeaderWithTooltip } from '../policy-extras-header/policy-extras-header.stories';
import { PopoverPlacement } from '../popover/popover';

type StoryType = StoryObj<
    PolicyExtrasCardProps & {
        numberOfFields: number;
        rainbow: boolean;
    }
>;

const meta = {
    title: 'Components/PolicyExtrasCard',
    component: PolicyExtrasCard,
    argTypes: {
        ...tooltipPlacementArgTypes,
        ...numberOfFieldsArgTypes,
        badgeStatus: {
            options: [BadgeVariant.Success, BadgeVariant.Info],
        },
    },
} as Meta<typeof PolicyExtrasCard>;

export default meta;

export const NoTooltip: StoryType = {
    render: ({ numberOfFields, rainbow, ...args }) => (
        <PolicyExtrasCard {...args}>{generateFields(numberOfFields, rainbow)}</PolicyExtrasCard>
    ),
    args: {
        ...HeaderNoTooltip.args,
        badge: <BadgeWithTooltip label="terminated" tooltip="tooltip text" variant={BadgeVariant.Success} />,
        numberOfFields: 12,
    },
};

export const WithTooltip = {
    render: NoTooltip.render,
    args: {
        ...HeaderWithTooltip.args,
        tooltipPlacement: PopoverPlacement.BottomRight,
        numberOfFields: 3,
    },
};
