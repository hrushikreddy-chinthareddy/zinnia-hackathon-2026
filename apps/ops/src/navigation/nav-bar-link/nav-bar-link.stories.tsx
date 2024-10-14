import { Meta } from '@storybook/react';

import NavBarLink from './nav-bar-link';

export default {
    title: 'Components/NavBarLink',
    component: NavBarLink,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof NavBarLink>;

export const NavBarLinkDefault = () => <NavBarLink link={'/'} label={'Case Management'} />;
