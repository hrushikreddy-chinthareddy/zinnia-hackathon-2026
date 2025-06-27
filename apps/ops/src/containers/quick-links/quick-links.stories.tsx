import { Meta } from '@storybook/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import QuickLinks from './quick-links';

import '@deps/styles/styles.css';

export default {
    title: 'Components/QuickLinks',
    component: QuickLinks,
    decorators: [
        (Story) => (
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
                sessionId="123"
                userPartyId="userPartyId"
                policy={
                    {
                        isLife: true,
                        freeLookPeriodDetails: { isInFreeLookPeriod: true },
                    } as PolicyDetails
                }
            />
        </div>
    );
};
