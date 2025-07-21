import Cookies from 'js-cookie';

import { COOKIE_DOMAIN } from '../../constants';

export const setClientCookie = (
  name: string,
  value: string,
  options?: Cookies.CookieAttributes
) => {
  Cookies.set(name, value, { ...options, domain: COOKIE_DOMAIN });
};

export const removeClientCookie = (
  name: string,
  options?: Cookies.CookieAttributes
) => {
  Cookies.remove(name, { ...options, domain: COOKIE_DOMAIN });
};
