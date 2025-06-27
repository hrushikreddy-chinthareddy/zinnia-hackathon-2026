import { Meta, StoryObj } from '@storybook/react';
import { Label } from '@zinnia/bloom/components';

import { FieldDate } from './FieldDate';

const meta: Meta<typeof FieldDate> = {
    component: FieldDate,
    title: 'Components/Field/FieldDate',
    tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<any> = {
    args: {
        label: <Label>Date</Label>,
    },
};
