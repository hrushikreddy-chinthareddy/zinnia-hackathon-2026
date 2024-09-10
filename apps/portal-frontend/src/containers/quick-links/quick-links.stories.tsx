import { Meta } from '@storybook/react';

import { LineOfBusiness } from '@deps/models/policy/sor-policy';

import QuickLinks from './quick-links';

import '@deps/styles/styles.css';

export default {
    title: 'Components/QuickLinks',
    component: QuickLinks,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof QuickLinks>;

export const QuickLinksComponent = () => {
    return (
        <div className="flex">
            <QuickLinks
                links={[
                    { name: 'Link 1', href: '#' },
                    { name: 'Link 2', href: '#' },
                ]}
                planCode="planCode"
                policyNumber="123456"
                policy={{
                    product: {
                        planCode: 'planCode',
                        lineOfBusiness: LineOfBusiness.LIFE,
                    },
                }}
            />
        </div>
    );
};
