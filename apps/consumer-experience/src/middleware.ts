// NOTE!! Redirecting in server actions and then redirecting in middleware results in some wonky
// behavior where the browser has redirected but middleware does one more redirect and loads the next
// responses page data as noted in this github issue: https://github.com/vercel/next.js/discussions/65900 and
// https://github.com/vercel/next.js/discussions/64993
// prefetched pages also hit middleware by default!!

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { CarrierName } from '@zinnia/bloom/components';
import { NextResponse, type NextRequest } from 'next/server';

import { RouteKey } from '@/route-map';
import { isMockAllowed } from '@/utils';
import {
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  MFA_OOB_CODE_COOKIE_KEY,
  MFA_TOKEN_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

import { consumerExperienceAPIBaseUrl, ServerApi } from './services';
import { ROOT_URL_PATH } from './types';
import { COOKIE_DOMAIN } from '../constants';
import { CARRIER_REDIRECT_URLS } from './carrier-config/urls';
import { TermsAndConditionApiResponse } from './types/auth';
import { Subdomains } from './types/carriers';
import {
  deleteCookie,
  deleteSession,
  getMfaCookie,
  getOobMfaCookie,
  getSession,
  setRefreshRouterCookie,
  setReturnUrlCookie,
  setTermsAndConditionsCookie,
  touchSession,
} from './utils/auth';
import { lineOfBusinessUrlPath } from './utils/data';
import {
  getValidSubdomainForPolicy,
  hasAcknowledgedPolicy,
  hasPermissionsForPolicyRoute,
  pathAccessibleWithoutPolicyAcknowledgement,
} from './utils/middleware-checks';
import {
  getFriendlyRedirectUrl,
  isRedirectAFriendlyUrl,
  userSinglePolicy,
} from './utils/singlePolicyRedirect';
import { applyThemeCookies } from './utils/theme';
import {
  getPolicyDataFromPath,
  getSubdomain,
  prependSubdomain,
} from './utils/url';

const setResCookie = (
  res: NextResponse,
  { name, value }: { name: string; value: string }
) => {
  res.cookies.set(name, value, { domain: COOKIE_DOMAIN });
};

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
      setResCookie(res, { name: MOCK_COOKIE_KEY, value: mockParam });
    }
  }

  if (mockErrorParam) {
    if (mockErrorParam === 'off') {
      res.cookies.delete(MOCK_ERROR_COOKIE_KEY);
    } else {
      setResCookie(res, { name: MOCK_ERROR_COOKIE_KEY, value: mockErrorParam });
    }
  }

  if (showDevMenu) {
    setResCookie(res, { name: SHOW_DEV_MENU_COOKIE_KEY, value: showDevMenu });
  }
};

export async function middleware(req: NextRequest) {
  const resNext = NextResponse.next();

  const session = await getSession(resNext);
  const pathname = req.nextUrl.pathname;
  // If the path includes `/coverage/` it means that the user is on something like
  // /coverage/policies/{planCode}/{policyNumber}
  const pathnameIsInternalPage = pathname.includes('/coverage/');
  const isLoginLikeOrRoot = pathname.includes('/login') || pathname === '/';
  const isSessionPage = pathname === '/session';

  // These are set to true with the feature flag query commented out becuase we were seeing a 500 error when
  // trying to make a route handler call from within this file on mypolicyview domains. We were seeing a cert
  // issue in the logs that is most likely related
  // const featureFlags = await getFeatureFlagQuery(req);

  applyThemeCookies(req, resNext);

  const currentSubDomain = getSubdomain(req.headers);
  // Checking isMockAllowed because in lower levels (not uat or prod), we want
  // users to be able to log in via the standard mypolicyview process.
  // In the real experience we will only allow farmers users with current
  // sessions to access mypolicyview
  // which forces them to authenticate and go through the sso app before landing
  // in mypolicyview with active session
  // TODO: use the carrier config with `requiresSSO` property and `redirectAfterLogout`
  if (!session && currentSubDomain === Subdomains.FARMERS) {
    return NextResponse.redirect(
      CARRIER_REDIRECT_URLS[CarrierName.FARMERS].MY_PROFILE
    );
  }

  if (session) {
    // since the user has a session we need to check if they signed the terms and conditions
    // we only want to do this once per session. We will store the value on the user object
    if (!session?.user.hasSignedTermsAndConditions) {
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
    applyMockCookies(req, resNext);

    // This is to handle user coming in after login flow or with just a root url
    if (isLoginLikeOrRoot) {
      return NextResponse.redirect(new URL(ROOT_URL_PATH, req.url));
    }

    // If page isn't the coverage page AND is a friendlyUrl e.g. mypolicyview.com/riders
    // this logic is only hit if the user is already within a session, if they are coming
    // from login, the logic is handled in login-actions
    if (pathname !== RouteKey.COVERAGE && isRedirectAFriendlyUrl(pathname)) {
      const singlePolicyUserPolicy = await userSinglePolicy();
      const friendlyRedirectUrl = await getFriendlyRedirectUrl({
        redirectTo: pathname,
        policy: singlePolicyUserPolicy,
      });

      return NextResponse.redirect(new URL(friendlyRedirectUrl, req.url));
    }

    if (pathnameIsInternalPage) {
      const { planCode, policyNumber, lineOfBusiness } =
        getPolicyDataFromPath(pathname);
      const currentSubdomain = getSubdomain(req.headers);

      // If these don't exist exit early because nothing following
      // is relevant without them
      if (!planCode || !policyNumber || !lineOfBusiness || !currentSubdomain) {
        return resNext;
      }

      const validPolicySubdomain = await getValidSubdomainForPolicy({
        currentSubdomain,
        planCode: getPolicyDataFromPath(pathname).planCode,
        policyNumber: getPolicyDataFromPath(pathname).policyNumber,
      });
      const userHasRoutePermissions =
        await hasPermissionsForPolicyRoute(pathname);

      if (validPolicySubdomain && validPolicySubdomain !== currentSubDomain) {
        const subdomainPath = prependSubdomain(validPolicySubdomain);
        return NextResponse.redirect(
          new URL(
            `/coverage/${lineOfBusinessUrlPath(lineOfBusiness as LineOfBusiness)}/${planCode}/${policyNumber}`,
            subdomainPath
          )
        );
      }

      if (!userHasRoutePermissions) {
        return NextResponse.redirect(new URL('/404', req.url));
      }

      if (!pathAccessibleWithoutPolicyAcknowledgement(pathname)) {
        const userHasAcknowledgedPolicy = await hasAcknowledgedPolicy(
          { planCode, policyNumber },
          req,
          resNext
        );

        if (!userHasAcknowledgedPolicy) {
          return NextResponse.redirect(new URL('/coverage', req.url));
        }
      }

      return resNext;
    }

    return resNext;
  }

  if (req.cookies.has(HAD_PREVIOUS_SESSION_COOKIE_KEY) && isSessionPage) {
    await deleteCookie(HAD_PREVIOUS_SESSION_COOKIE_KEY, resNext);
    await deleteSession(resNext);

    return resNext;
  }

  // If the user's session has expired, and they try to reload the current page
  // they are on, this will redirect them to the session page which will get them into
  // the logic above that deletes the data associated with the session
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

  if (isLoginLikeOrRoot || isSessionPage) {
    return resNext;
  }

  // default to the login page if the user is not authenticated
  // We don't want users to access the policy pages without being authenticated
  const resRedirect = NextResponse.redirect(new URL('/login', req.url));

  // Vercel does some route injection for their tool bar in preview environments
  // so we want to ignore it.
  if (
    pathname !== '/.well-known/vercel/flags' && // If the url is not the index page AND has a friendly url object
    pathname !== RouteKey.COVERAGE
  ) {
    //if a route gets here that means the user is not authenticated and we need to store where they wanted to go
    // after login we will send them to this page
    // we are storing the nextUrl object so we have easy access to key variables that NextJS sets for us like pathname and href

    await setReturnUrlCookie(req.nextUrl, resRedirect);
    await setRefreshRouterCookie(resRedirect);
  }
  return resRedirect;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - session
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - everly-logo.png (this is used for the email template. This is in place for MVP)
     */
    {
      source:
        '/((?!api|health|_next/static|_next/image|favicon.ico|everly-logo.png).*)',
    },
  ],
};
