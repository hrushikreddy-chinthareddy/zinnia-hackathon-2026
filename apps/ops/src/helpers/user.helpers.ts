import { UserProfile } from "@deps/models/user-profile";

export enum UserEmailDomain {
  ZINNIA = 'zinnia.com',
}

export const isInternalZinniaUser = (user: UserProfile) => {
  return user?.email?.includes(UserEmailDomain.ZINNIA);
};
