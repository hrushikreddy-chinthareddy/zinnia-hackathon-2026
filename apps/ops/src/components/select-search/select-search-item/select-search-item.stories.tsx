import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import SelectSearchItem from './select-search-item';

export default {
    title: 'Components/SelectSearchItem',
    component: SelectSearchItem,
    decorators: [
        Story => (
            <div className=" container max-w-[1302px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SelectSearchItem>;

export const Default = () => <SelectSearchItem fieldLabel="Menu Text" data="Menu Text" href="zinnia.com" />;
export const NoLink = () => <SelectSearchItem fieldLabel="Menu Text" data="Menu Text" />;
