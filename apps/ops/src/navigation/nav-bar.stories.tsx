import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Meta } from '@storybook/react';

import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { ReactComponent as ShieldCheckIcon } from '@deps/styles/elements/icons/icons_outlined/shield-check.svg';

import { NavBar } from './nav-bar';

export default {
    title: 'Components/NavBar',
    component: NavBar,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof NavBar>;

const navItems = [
    { label: 'Case Management', link: '/', icon: <DocumentIcon width={20} height={20} /> },
    { label: 'Policy Search', link: '/', icon: <ShieldCheckIcon width={20} height={20} /> },
];

export const NavBarDefault = () => (
    <UserProvider>
        <NavBar navItems={navItems} />
    </UserProvider>
);

const LoggedInUser = {
    email: 'john@doe.com',
    email_verified: true,
    name: 'John Doe',
    nickname: 'Joe',
    picture: 'https://picsum.photos/200',
    sub: 'mock:johndoe',
    updated_at: '2021-04-02T12:42:42.042Z',
};

export const LoggedInNavBar = () => (
    <UserProvider user={LoggedInUser}>
        <NavBar navItems={navItems} />
    </UserProvider>
);
