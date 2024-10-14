import { Meta } from '@storybook/react';

import PageLoader from './page-loader';

export default {
    title: 'Components/PageLoader',
    component: PageLoader,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PageLoader>;

export const PageLoaderDefault = () => <PageLoader />;

export const PageLoaderWithText = () => <PageLoader showText={true} />;
