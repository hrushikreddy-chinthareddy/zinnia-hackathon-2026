import { Meta, StoryObj } from '@storybook/react';
import { Icon, IconType, Label } from '@zinnia/bloom/components';

import { FieldDataActive } from './FieldDataActive';
import { FieldStatus } from '../types';

const meta: Meta<typeof FieldDataActive> = {
    component: FieldDataActive,
    title: 'Components/Field/FieldDataActive',
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<any> = {
    args: {
        onSelect: () => {},
        label: <Label>Data Active</Label>,
    },
};

export const WithError: StoryObj<any> = {
    args: {
        label: <Label>Data Active</Label>,
        icon: <Icon type={IconType.CALENDAR} />,
        fieldStatus: FieldStatus.ERROR,
    },
};

export const WithIcon: StoryObj<any> = {
    args: {
        label: <Label>Data Active</Label>,
        icon: <Icon type={IconType.CALENDAR} />,
    },
};
