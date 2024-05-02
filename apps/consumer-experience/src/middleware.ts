import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import { isMockAllowed } from '@/utils';
import {
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  MFA_OOB_CODE_COOKIE_KEY,
  MFA_TOKEN_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

import { consumerExperienceAPIBaseUrl } from './services/api-config';
import { ServerApi } from './services/server-http';
import { TermsAndConditionApiResponse } from './types/auth';
import {
  deleteCookie,
  getMfaCookie,
  getOobMfaCookie,
  getSession,
  setTermsAndConditionsCookie,
  touchSession,
} from './utils/auth';

/**
 * NextJS doesn't foward the headers to react server components.
 * This method creates a new header and copies the request headers over
 * it then sets the headers on the response so the react server components have the updated cookies and headers
 * @param req NextRequest
 * @param res NextResponse
 */
function applySetCookie(req: NextRequest, res: NextResponse): void {
  // parse the outgoing Set-Cookie header
  const setCookies = new ResponseCookies(res.headers);
  // Build a new Cookie header for the request by adding the setCookies
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach(cookie => newReqCookies.set(cookie));
  // set “request header overrides” on the outgoing response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (
      key === 'x-middleware-override-headers' ||
      key.startsWith('x-middleware-request-')
    ) {
      res.headers.set(key, value);
    }
  });
}

const applyMockCookies = (req: NextRequest, res: NextResponse<unknown>) => {
  if (!isMockAllowed()) {
    return;
  }

  const mockParam = req.nextUrl.searchParams.get(MOCK_COOKIE_KEY);
  const showDevMenu = req.nextUrl.searchParams.get(SHOW_DEV_MENU_COOKIE_KEY);
  const mockErrorParam = req.nextUrl.searchParams.get(MOCK_ERROR_COOKIE_KEY);

  if (mockParam) {
    if (mockParam === 'off') {
      res.cookies.delete(MOCK_COOKIE_KEY);
    } else {
      res.cookies.set(MOCK_COOKIE_KEY, mockParam);
    }
  }

  if (mockErrorParam) {
    if (mockErrorParam === 'off') {
      res.cookies.delete(MOCK_ERROR_COOKIE_KEY);
    } else {
      res.cookies.set(MOCK_ERROR_COOKIE_KEY, mockErrorParam);
    }
  }

  if (showDevMenu) {
    res.cookies.set(SHOW_DEV_MENU_COOKIE_KEY, showDevMenu);
  }
};

export async function middleware(req: NextRequest) {
  const resNext = NextResponse.next();
  const session = await getSession(resNext);
  const pathname = req.nextUrl.pathname;
  const isLoginLikeOrRoot = pathname.includes('/login') || pathname === '/';
  const isSessionPage = pathname === '/session';

  if (session) {
    // since the user has a session we need to check if they signed the terms and conditions
    // we only want to do this once per session. We will store the value on the user object
    if (!session.user.hasSignedTermsAndConditions) {
      // call API to check if the user has signed the terms and conditions
      const termsAndConditionsRequest = await ServerApi.get(
        `${consumerExperienceAPIBaseUrl}/agreementToTermsAndConditions`
      );
      const data = await termsAndConditionsRequest.json();
      // set the AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY cookie
      // getSession will pick this up and we can then use the user object to see if they have signed the terms and conditions
      if (termsAndConditionsRequest.status === 200) {
        await setTermsAndConditionsCookie(
          (data as TermsAndConditionApiResponse).agreedToTermsAndConditions,
          resNext
        );
      }
    }
    await touchSession(resNext);

    if (isLoginLikeOrRoot) {
      return NextResponse.redirect(new URL('/policies', req.url));
    }

    applyMockCookies(req, resNext);
    applySetCookie(req, resNext);
    return resNext;
  }

  if (req.cookies.has(HAD_PREVIOUS_SESSION_COOKIE_KEY) && isSessionPage) {
    await deleteCookie(HAD_PREVIOUS_SESSION_COOKIE_KEY, resNext);
    return resNext;
  }

  if (req.cookies.has(HAD_PREVIOUS_SESSION_COOKIE_KEY) && !isSessionPage) {
    const res = NextResponse.redirect(new URL(`/session`, req.url));
    return res;
  }

  if (pathname === '/login/mfa/mfa-enrollment') {
    const mfaToken = (await getMfaCookie()) || '';
    if (!mfaToken) {
      return NextResponse.redirect(new URL('/login/error', req.url));
    }
  }

  if (pathname === '/login/mfa/mfa-challenge') {
    const oobCode = (await getOobMfaCookie()) || '';
    if (!oobCode) {
      return NextResponse.redirect(new URL('/login/error', req.url));
    }
  }

  if (pathname === '/login/error') {
    await deleteCookie(MFA_OOB_CODE_COOKIE_KEY, resNext);
    await deleteCookie(MFA_TOKEN_COOKIE_KEY, resNext);
  }

  if (isLoginLikeOrRoot) {
    return resNext;
  }

  // default to the home page if the user is not authenticated
  // We don't want users to access the policy pages without being authenticated
  return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - login
     * - session
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|health|_next/static|_next/image|favicon.ico).*)',
  ],
};
