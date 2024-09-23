import { NextRequest, NextResponse } from 'next/server';

import { getCookie, setCookie } from './auth';
import { THEME_COOKIE } from './serverClientUtils';

export const themes = ['everly', 'wellabe'];

export const isValidTheme = (theme: string) => themes.includes(theme);

export const getThemeCookies = async () => await getCookie(THEME_COOKIE);

export const setThemeCookies = async (val: string) => {
  await setCookie({ value: val, cookieName: THEME_COOKIE });
};

/**
 * Add a cookie based on the subdomain. This maps to a css file that targets a `data` attribute inside the authenticated layout file
 * @param req
 * @param res
 */
export const applyThemeCookies = (
  req: NextRequest,
  res: NextResponse<unknown>
) => {
  const subdomain = req.headers.get('host')?.split('.')[0];
  if (subdomain && isValidTheme(subdomain)) {
    res.cookies.set(THEME_COOKIE, subdomain);
  }
};
