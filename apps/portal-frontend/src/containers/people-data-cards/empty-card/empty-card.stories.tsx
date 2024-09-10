import { Meta } from '@storybook/react';

import EmptyCard from './empty-card';

export default {
    title: 'Containers/PeopleDataCards',
    component: EmptyCard,
} as Meta<typeof EmptyCard>;

export const EmptyCardContainer = () => (
    <div className="p-6">
        <EmptyCard text="No tests on record" />
    </div>
);
