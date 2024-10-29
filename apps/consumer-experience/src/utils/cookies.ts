/**
 * Copy cookies from the Set-Cookie header of the response to the Cookie header of the request,
 * so that it will appear to SSR/RSC as if the user already has the new cookies.
 */

import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Found this here: https://github.com/vercel/next.js/discussions/50374#discussioncomment-6732402
 * next 14 has a bug where cookies set in middleware are not available to that same request that set them
 * so this is a workaround for that until we update to next 15
 * https://github.com/vercel/next.js/pull/65008
 */
export function applySetCookie(req: NextRequest, res: NextResponse) {
  // 1. Parse Set-Cookie header from the response
  const setCookies = new ResponseCookies(res.headers);

  // 2. Construct updated Cookie header for the request
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach(cookie => newReqCookies.set(cookie));

  // 3. Set up the “request header overrides” (see https://github.com/vercel/next.js/pull/41380)
  //    on a dummy response
  // NextResponse.next will set x-middleware-override-headers / x-middleware-request-* headers
  const dummyRes = NextResponse.next({ request: { headers: newReqHeaders } });

  // 4. Copy the “request header overrides” headers from our dummy response to the real response
  dummyRes.headers.forEach((value, key) => {
    if (
      key === 'x-middleware-override-headers' ||
      key.startsWith('x-middleware-request-')
    ) {
      res.headers.set(key, value);
    }
  });
}
