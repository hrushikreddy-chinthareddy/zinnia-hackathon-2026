import { Meta } from '@storybook/react';

import { NavBarBrand } from './nav-bar-brand';

export default {
    title: 'Components/NavBarBrand',
    component: NavBarBrand,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof NavBarBrand>;

export const NavBarBrandDefault = () => (
    <NavBarBrand
        isOpen={false}
        toggleMenu={event => {
            console.log('event', event);
        }}
        onClose={() => {
            console.log('closing');
        }}
        adjustResponsiveBreakPoint={false}
    />
);
