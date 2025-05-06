// NOTE!! Redirecting in server actions and then redirecting in middleware results in some wonky
// behavior where the browser has redirected but middleware does one more redirect and loads the next
// responses page data as noted in this github issue: https://github.com/vercel/next.js/discussions/65900 and
// https://github.com/vercel/next.js/discussions/64993
// prefetched pages also hit middleware by default!!

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { NextResponse, type NextRequest } from 'next/server';

import { RouteKey } from '@/route-map';
import { isMockAllowed } from '@/utils';
import {
  ACKNOWLEDGEMENT_COOKIE_KEY,
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  MFA_OOB_CODE_COOKIE_KEY,
  MFA_TOKEN_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

import {
  consumerExperienceAPIBaseUrl,
  getPolicyDetails,
  ServerApi,
} from './services';
import { checkResetDeliveryDateEligibility } from './services/bpm';
import { ROOT_URL_PATH } from './types';
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
import {
  getCarrierSubdomainById,
  isValidCarrierSubdomain,
} from './utils/carriers';
import { lineOfBusinessUrlPath } from './utils/data';
import { applyThemeCookies } from './utils/theme';
import {
  getPolicyDataFromPath,
  getSubdomain,
  prependSubdomain,
} from './utils/url';
import { TermsAndConditionApiResponse } from './types/auth';
import {
  getFriendlyRedirectUrl,
  isRedirectAFriendlyUrl,
  userSinglePolicy,
} from './utils/singlePolicyRedirect';

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

    // Ensure user is on a valid subdomain for the policy theyre viewing.
    // If not, redirect them to the correct subdomain for a policy
    if (pathnameIsInternalPage) {
      const { planCode, policyNumber, lineOfBusiness } =
        getPolicyDataFromPath(pathname);

      if (!planCode || !policyNumber || !lineOfBusiness) {
        return resNext;
      }

      const { data: policyData } = await getPolicyDetails({
        planCode,
        policyNumber,
      });

      // if the user is not on a valid subdomain, redirect them to the correct subdomain based on the
      // policy they have selected. Prevents someone from being going to like `wellabe.com/123everlyCode/456everlyPolicyNumber`
      const carrierSubdomain = getCarrierSubdomainById(policyData?.carrierId);
      const currentSubDomain = getSubdomain(req.headers);
      const validSubdomain = isValidCarrierSubdomain(currentSubDomain);

      const onWrongUrl =
        carrierSubdomain &&
        carrierSubdomain !== currentSubDomain &&
        validSubdomain;

      if (onWrongUrl) {
        const subdomainPath = prependSubdomain(carrierSubdomain);
        return NextResponse.redirect(
          new URL(
            `/coverage/${lineOfBusinessUrlPath(lineOfBusiness as LineOfBusiness)}/${planCode}/${policyNumber}`,
            subdomainPath
          )
        );
      }
    }

    //********************************** */
    // Policy delivery eligibility check
    //********************************** */
    // Check if the user still needs to acknowledge their policy.
    // First check if we've already checked this policy in this session, if yes, ignore,
    // otherwise check if the policy requires acknowledgement and redirect them back to the coverage page instead of letting them
    // go to the policy details page
    if (pathnameIsInternalPage) {
      const { planCode, policyNumber } = getPolicyDataFromPath(pathname);
      const hasAckowledgedPolicy = req.cookies.get(
        ACKNOWLEDGEMENT_COOKIE_KEY
      )?.value;

      const parsedCookie: string[] = JSON.parse(hasAckowledgedPolicy || '[]');
      // we check to see if the policy number is in the cookie,
      // this means they have already acknowledged the policy
      if (
        !planCode ||
        !policyNumber ||
        parsedCookie.includes(policyNumber) ||
        // These two routes need to be accessible so that users can view their
        // policy acknowledgement document
        pathname.includes('/policy-acknowledgement') ||
        pathname.includes('/documents/error')
      ) {
        return resNext;
      }

      // You'll only get to this logic if you NEED to acknowledge the policy
      // AND you've NEVER been to the policy page before AND you're trying
      // to get to an interior page (not the index page). Includes the case
      // where you have a single policy and this is the first time you've
      // visited the site
      const { data: eligiblityData } = await checkResetDeliveryDateEligibility({
        planCode,
        policyNumber,
      });

      // If you REQUIRE policy acknowledgement, you will be redirected to the index page
      // We can assume that once theyve ackowledged the policy, the cookie will be set
      // in policy acknowledgement action and they won't make it here, but if the policy
      // is not in the cookie, then the eligibility check will have returned false
      // and user will get to the else here
      if (eligiblityData.isEligible) {
        return NextResponse.redirect(new URL('/coverage', req.url));
      } else {
        parsedCookie.push(policyNumber);
        resNext.cookies.set(
          ACKNOWLEDGEMENT_COOKIE_KEY,
          JSON.stringify(parsedCookie)
        );
        return resNext;
      }
    }

    applyMockCookies(req, resNext);

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
