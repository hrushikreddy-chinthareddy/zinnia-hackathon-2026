import { Meta } from '@storybook/react';
import React from 'react';

import { Statuses } from '@deps/models/case/case';

import StatusCounterTile, { StatusCounterTileProps } from './status-counter-tile';

import '@deps/styles/styles.css';

export default {
    title: 'Components/StatusCounterTile',
    component: StatusCounterTile,
    decorators: [
        Story => (
            <div className="bg-background p-10">
                <div
                    style={{
                        width: '276px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        status: {
            control: 'text',
        },
    },
} as Meta<typeof StatusCounterTile>;

export const DefaultLabel = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
DefaultLabel.args = {
    label: 'All',
    count: 9001,
    countTypeUnits: 'Cases',
};

export const SelectedLabel = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
SelectedLabel.args = {
    label: 'All',
    count: 212,
    countTypeUnits: 'Cases',
    isSelected: true,
};

export const InActiveLabel = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
InActiveLabel.args = {
    label: 'All',
    count: 212,
    countTypeUnits: 'Cases',
    isActive: false,
};

export const InProgressStatus = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
InProgressStatus.args = {
    count: 212,
    countTypeUnits: 'Cases',
    status: Statuses.InProgress,
};

export const ExceptionStatus = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
ExceptionStatus.args = {
    count: 212,
    countTypeUnits: 'Cases',
    status: Statuses.Exception,
};

export const ZeroCountLabel = (args: StatusCounterTileProps) => <StatusCounterTile {...args} />;
ZeroCountLabel.args = {
    label: 'All',
    count: 0,
    countTypeUnits: 'Cases',
};
