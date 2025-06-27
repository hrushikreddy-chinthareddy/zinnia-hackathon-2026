import { Meta } from '@storybook/react';

import TruncateComponent from './truncate';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Pagination/Truncate',
    component: TruncateComponent,
    decorators: [
        (Story) => (
            <div className="h-screen w-screen p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof TruncateComponent>;

// Truncate
export const Truncate = {
    render: () => <TruncateComponent />,
};
