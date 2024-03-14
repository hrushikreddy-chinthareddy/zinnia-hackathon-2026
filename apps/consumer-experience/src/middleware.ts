import { getSession } from '@auth0/nextjs-auth0/edge';
import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';
import { NextResponse, type NextRequest } from 'next/server';

import { isProd } from '@/utils';

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
  const res = NextResponse.next();
  const user = await getSession(req, res);
  // if the user does not have a session, send them to the login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  const pathname = req.nextUrl.pathname;
  if (pathname.includes('/policies/')) {
    const urlParts = pathname.split('/');
    const planCode = urlParts[2];
    const policyNumber = urlParts[4];
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
