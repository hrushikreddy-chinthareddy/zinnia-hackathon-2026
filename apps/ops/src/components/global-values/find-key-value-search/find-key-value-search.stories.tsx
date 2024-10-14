import { Meta } from '@storybook/react';

import { FindKeyValueSearch as FindKeyValueSearchComponent } from './find-key-value-search';

export default {
    title: 'Components/GlobalValues/FindKeyValueSearch',
    component: FindKeyValueSearchComponent,
    decorators: [
        Story => (
            <div className="h-screen bg-white">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof FindKeyValueSearchComponent>;

export const FindKeyValueSearch = () => <FindKeyValueSearchComponent policyNumber="AU22029654" />;
