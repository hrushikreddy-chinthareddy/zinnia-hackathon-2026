import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse, type NextRequest } from 'next/server';

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
  const mockParam = req.nextUrl.searchParams.get('..mock..');
  if (mockParam) {
    if (mockParam === 'off') {
      res.cookies.delete('..mock..');
    } else {
      res.cookies.set('..mock..', mockParam);
    }
  }

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
