import { UserProfile } from '@auth0/nextjs-auth0/client';

export enum UserEmailDomain {
    ZINNIA = 'zinnia.com',
}

export const isInternalZinniaUser = (user: UserProfile) => {
    return user?.email?.includes(UserEmailDomain.ZINNIA);
};
