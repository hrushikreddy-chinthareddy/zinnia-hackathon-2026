import { getSession, touchSession } from '@auth0/nextjs-auth0/edge';
import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import { isProd } from '@/utils';
import {
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

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
  if (isProd()) {
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
  const session = await getSession();
  const pathname = req.nextUrl.pathname;

  if (!session && pathname.includes('/session')) {
    const res = NextResponse.next();
    res.cookies.delete(HAD_PREVIOUS_SESSION_COOKIE_KEY);
    return res;
  }

  if (!session) {
    const path = req.cookies.has(HAD_PREVIOUS_SESSION_COOKIE_KEY)
      ? 'session'
      : 'login';
    const res = NextResponse.redirect(new URL(`/${path}`, req.url));
    res.cookies.delete(HAD_PREVIOUS_SESSION_COOKIE_KEY);
    return res;
  }

  if (pathname.includes('/session')) {
    return NextResponse.redirect(new URL('/policies', req.url));
  }
  const res = NextResponse.next();
  await touchSession(req, res);
  if (pathname.includes('/policies/')) {
    const urlParts = pathname.split('/');
    const planCode = urlParts[2];
    const policyNumber = urlParts[4];
    // This is to allow access to planCode and policyNumber inside server components
    // allows each of those components to make the necessary data requests.
    res.headers.set('planCode', planCode || '');
    res.headers.set('policyNumber', policyNumber || '');
  }

  applyMockCookies(req, res);
  applySetCookie(req, res);

  return res;
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
    '/((?!api|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
