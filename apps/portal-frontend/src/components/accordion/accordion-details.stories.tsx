import { Meta } from '@storybook/react';

import Accordion from './accordion';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Accordion',
    component: Accordion,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof Accordion>;

export const AccordionCard = () => (
    <Accordion isOpen={false} title={'Policy Details'}>
        <div>Child elements are added to the accordion body!</div>
    </Accordion>
);

export const AccordionCardWithHeader = () => (
    <Accordion isOpen={false} title={'Create Case'} renderHeaderComponent={<div></div>}>
        <div>Accordion with Header element and Children</div>
    </Accordion>
);
