import { getSession, touchSession } from '@auth0/nextjs-auth0/edge';
import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import { isProd } from '@/utils';
import {
  MAX_AGE_SESSION_COOKIE,
  REDIRECT_TO_SESSION_COOKIE_KEY,
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

export async function middleware(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    const path = req.cookies.has(REDIRECT_TO_SESSION_COOKIE_KEY)
      ? 'session'
      : 'login';
    const res = NextResponse.redirect(new URL(`/${path}`, req.url));
    return res;
  }
  const res = NextResponse.next();
  await touchSession(req, res);
  res.cookies.set(REDIRECT_TO_SESSION_COOKIE_KEY, 'true', {
    maxAge: MAX_AGE_SESSION_COOKIE,
  });
  const pathname = req.nextUrl.pathname;
  if (pathname.includes('/policies/')) {
    const urlParts = pathname.split('/');
    const planCode = urlParts[2];
    const policyNumber = urlParts[4];
    // This is to allow access to planCode and policyNumber inside server components
    // allows each of those components to make the necessary data requests.
    res.headers.set('planCode', planCode || '');
    res.headers.set('policyNumber', policyNumber || '');
  }

  if (!isProd()) {
    const mockParam = req.nextUrl.searchParams.get('..mock..');
    const showMockLinkParam =
      req.nextUrl.searchParams.get('..show_mock_link..');
    if (mockParam) {
      if (mockParam === 'off') {
        res.cookies.delete('..mock..');
      } else {
        res.cookies.set('..mock..', mockParam);
      }
    }

    if (showMockLinkParam) {
      res.cookies.set('..show_mock_link..', showMockLinkParam);
    }
  }

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
    '/((?!api|login|session|_next/static|_next/image|favicon.ico).*)',
  ],
};
