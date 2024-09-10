import { Meta } from '@storybook/react';

import OneOrManyHeader, { OneOrManyHeaderProps } from './one-or-many-header';
import '@deps/styles/styles.css';

export default {
    title: 'Components/OneOrManyHeader',
    component: OneOrManyHeader,
    decorators: [
        Story => (
            <div className="mt-16 h-screen w-screen p-10">
                <div
                    style={{
                        width: '300px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        entities: {
            control: 'array',
            defaultValue: [],
        },
    },
} as Meta<typeof OneOrManyHeader>;

export const ZeroOwners = (args: OneOrManyHeaderProps) => <OneOrManyHeader {...args} />;
ZeroOwners.args = {
    entities: [[]],
    labels: ['Joint Owner', 'SSN'],
};

export const OneOwner = (args: OneOrManyHeaderProps) => <OneOrManyHeader {...args} />;
OneOwner.args = {
    entities: [['Chakarabarti Padmanbhman'], ['***-**-6789']],
    labels: ['Joint Owner', 'SSN'],
};

export const TwoOwners = (args: OneOrManyHeaderProps) => <OneOrManyHeader {...args} />;
TwoOwners.args = {
    entities: [
        ['Chakarabarti Padmanbhman', 'Roger Aikmann'],
        ['***-**-6789', '***-**-4321'],
    ],
    labels: ['Joint Owner', 'SSN'],
};

export const ThreeOwners = (args: OneOrManyHeaderProps) => <OneOrManyHeader {...args} />;
ThreeOwners.args = {
    entities: [
        ['Chakarabarti Padmanbhman', 'Roger Aikmann', 'Carrie Donald'],
        ['***-**-6789', '***-**-4321', '***-**-6789'],
    ],
    labels: ['Joint Owner', 'SSN'],
};

export const ThreeAgents = (args: OneOrManyHeaderProps) => <OneOrManyHeader {...args} />;
ThreeAgents.args = {
    entities: [['Agent 1', 'Agent 2', 'Agent 3']],
    labels: [],
};
