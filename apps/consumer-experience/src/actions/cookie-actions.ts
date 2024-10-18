'use server';

import { deleteCookie, getCookie } from '@/utils/auth';
import { REFRESH_ROUTER_COOKIE_KEY } from '@/utils/serverClientUtils';

export const removeRefreshCookie = async () => {
  await deleteCookie(REFRESH_ROUTER_COOKIE_KEY);
};

export const getRefreshCookie = async () => {
  return await getCookie(REFRESH_ROUTER_COOKIE_KEY);
};
