import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Meta } from '@storybook/react';

import { NavBarButtons } from './nav-bar-buttons';

export default {
    title: 'Components/NavBarButtons',
    component: NavBarButtons,
    decorators: [
        Story => (
            <div className="w-[185px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof NavBarButtons>;

export const NavBarButtonsDefault = () => (
    <UserProvider>
        <NavBarButtons
            onClick={() => {
                console.log('closing');
            }}
        />
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

export const LoggedInNavBarButtons = () => (
    <UserProvider user={LoggedInUser}>
        <NavBarButtons
            onClick={() => {
                console.log('closing');
            }}
        />
    </UserProvider>
);
