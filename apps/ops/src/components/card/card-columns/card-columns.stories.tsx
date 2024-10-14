import { Meta } from '@storybook/react';

import { mockPolicyData } from '@deps/utils/mockData';

import CardColumns from './card-columns';

export default {
    title: 'Components/CardColumns',
    component: CardColumns,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof CardColumns>;

const [info, summary] = mockPolicyData();

export const CardColumnsDefault = () => <CardColumns titles={['Owner Info', 'Policy Summary']} items={[info, summary]} />;
