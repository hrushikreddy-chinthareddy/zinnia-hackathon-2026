'use server';

import { SetCookieOptions } from '@/types/auth';
import {
  deleteCookie,
  getCookie,
  setCookie as setAuthCookie,
} from '@/utils/auth';
import { REFRESH_ROUTER_COOKIE_KEY } from '@/utils/serverClientUtils';

export const removeRefreshCookie = async () => {
  await deleteCookie(REFRESH_ROUTER_COOKIE_KEY);
};

export const getRefreshCookie = async () => {
  return await getCookie(REFRESH_ROUTER_COOKIE_KEY);
};

// TODO: pull all cookie functions from utils/auth into this file so there
// is only one place where all cookies are being interacted with
export const setCookie = async ({
  cookieName,
  value,
  cookieConfig,
}: SetCookieOptions) => {
  await setAuthCookie({ cookieName, value, cookieConfig });
};

export const removeCookie = async (cookieName: string) => {
  if (!cookieName) {
    throw new Error('Must supply a cookieName');
  }

  await deleteCookie(cookieName);
};
