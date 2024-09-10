import { Meta } from '@storybook/react';

import NavBarCase from './nav-bar-case';

export default {
    title: 'Components/NavBarCase',
    component: NavBarCase,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof NavBarCase>;

export const NavBarCaseDefault = () => <NavBarCase />;
