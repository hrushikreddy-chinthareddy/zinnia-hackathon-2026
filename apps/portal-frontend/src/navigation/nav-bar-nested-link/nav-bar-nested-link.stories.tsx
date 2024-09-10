import '@deps/styles/styles.css';
import { Meta, StoryObj } from '@storybook/react';

import NavBarNestedLink, { NavBarNestedLinkProps } from './nav-bar-nested-link';

const plusCircleSVG = (
    <svg width="20" height="20" preserveAspectRatio="none" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.25 4C7.83172 4 4.25 7.58172 4.25 12C4.25 16.4183 7.83172 20 12.25 20C16.6683 20 20.25 16.4183 20.25 12C20.25 7.58172 16.6683 4 12.25 4ZM2.25 12C2.25 6.47715 6.72715 2 12.25 2C17.7728 2 22.25 6.47715 22.25 12C22.25 17.5228 17.7728 22 12.25 22C6.72715 22 2.25 17.5228 2.25 12ZM12.25 8C12.8023 8 13.25 8.44772 13.25 9V11H15.25C15.8023 11 16.25 11.4477 16.25 12C16.25 12.5523 15.8023 13 15.25 13H13.25V15C13.25 15.5523 12.8023 16 12.25 16C11.6977 16 11.25 15.5523 11.25 15V13H9.25C8.69772 13 8.25 12.5523 8.25 12C8.25 11.4477 8.69772 11 9.25 11H11.25V9C11.25 8.44772 11.6977 8 12.25 8Z"
            fill="currentColor"
        />
    </svg>
);

const meta: Meta<typeof NavBarNestedLink> = {
    title: 'Components/NavBarNestedLink',
    component: NavBarNestedLink,
    decorators: [
        Story => (
            <div className="container bg-gray-400">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        link: { table: { expanded: true } },
    },
};

export default meta;
type Story = StoryObj<NavBarNestedLinkProps>;

export const DefaultNestedNavBarLink: Story = {
    args: {
        link: {
            text: 'Policy',
            href: '#',
            startIcon: plusCircleSVG,
        },
    },
};

export const NoSetIconsNestedNavBarLink: Story = {
    args: {
        link: {
            text: 'Policy',
            href: '#',
        },
    },
};
