import { UserProfile } from '@deps/models/user-profile';

import { isInternalZinniaUser, UserEmailDomain } from './user.helpers';

describe('isInternalZinniaUser', () => {
    it('should return true if user email is on zinnia domain', () => {
        const user: Partial<UserProfile> = {
            email: `user@${UserEmailDomain.ZINNIA}`,
        };

        return expect(isInternalZinniaUser(user as UserProfile)).toBe(true);
    });

    it('should return false if user email is not on zinnia domain', () => {
        const user: Partial<UserProfile> = {
            email: 'user@everly.com',
        };

        return expect(isInternalZinniaUser(user as UserProfile)).toBe(false);
    });
});
