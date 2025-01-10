import { NextRequest, NextResponse } from 'next/server';

import { getCookie, setCookie } from './auth';
import { isVercelEnvironment } from './environment';
import { THEME_COOKIE } from './serverClientUtils';
import { getSubdomain } from './url';

export const themes = ['everly', 'wellabe'];

export const isValidTheme = (theme: string) => themes.includes(theme);

export const getThemeCookies = async () => await getCookie(THEME_COOKIE);

export const setThemeCookies = async (val: string) => {
  await setCookie({ value: val, cookieName: THEME_COOKIE });
};

export const hasThemeCookie = async () => {
  const theme = await getThemeCookies();
  return !!theme && isValidTheme(theme);
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
  // Dont do this stuff on vercel because vercel doesnt support subdomains.
  // We set the cookie manually on vercel
  const onVercel = isVercelEnvironment();
  if (onVercel) {
    return;
  }
  const subdomain = getSubdomain(req.headers);

  if (subdomain && isValidTheme(subdomain)) {
    res.cookies.set(THEME_COOKIE, subdomain);
  } else {
    res.cookies.delete(THEME_COOKIE);
  }
};
