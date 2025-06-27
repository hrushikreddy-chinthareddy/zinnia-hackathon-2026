import { Meta } from '@storybook/react';

import { generateParty } from '@deps/utils/mock/mockParty';

import { PolicyOwner as PolicyOwnerComponent } from './policy-owner';

export default {
    title: 'Components/GlobalValues/PolicyOwner',
    component: PolicyOwnerComponent,
    decorators: [
        (Story) => (
            <div className="h-screen bg-white">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PolicyOwnerComponent>;

const owner = generateParty('123456');

export const PolicyOwner = () => (
    <PolicyOwnerComponent owner={owner} policyNumber="AU22029654" />
);
