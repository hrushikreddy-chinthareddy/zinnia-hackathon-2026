import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { NextResponse, type NextRequest } from 'next/server';

import { RouteKey, getRedirectUrl, routeMap } from '@/route-map';
import { isMockAllowed } from '@/utils';
import {
  ACKNOWLEDGEMENT_COOKIE_KEY,
  FROM_LOGIN_QUERY_KEY,
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  MFA_OOB_CODE_COOKIE_KEY,
  MFA_TOKEN_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  MOCK_ERROR_COOKIE_KEY,
  RETURN_TO_URL_COOKIE_KEY,
  SHOW_DEV_MENU_COOKIE_KEY,
} from '@/utils/serverClientUtils';

import { getMyPoliciesByCarrier, getPolicyDetails } from './services';
import { consumerExperienceAPIBaseUrl } from './services/api-config';
import { checkResetDeliveryDateEligibility } from './services/bpm';
import { ServerApi } from './services/server-http';
import { ROOT_URL_PATH } from './types';
import { TermsAndConditionApiResponse } from './types/auth';
import { CarrierId } from './types/policy';
import {
  deleteCookie,
  deleteSession,
  getMfaCookie,
  getOobMfaCookie,
  getReturnUrlCookie,
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

  // These are set to true with the feature flag query commented out becuase we were seeing a 500 error when
  // trying to make a route handler call from within this file on mypolicyview domains. We were seeing a cert
  // issue in the logs that is most likely related
  // const featureFlags = await getFeatureFlagQuery(req);

  applyThemeCookies(req, resNext);

  if (session) {
    const searchParmas = req.nextUrl.searchParams;
    const fromLogin = searchParmas.get(FROM_LOGIN_QUERY_KEY);
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
      return NextResponse.redirect(new URL(ROOT_URL_PATH, req.url));
    }

    const returnUrl = await getReturnUrlCookie();
    const routeKey = returnUrl?.pathname
    let redirectObj

    if (routeKey?.length && routeKey in routeMap) {
      redirectObj = routeMap[routeKey as RouteKey]
    }

    // if we have a return url and the route isn't a "friendly" path, for example /riders
    // it means we should redirect to the fully qualified path
    if (returnUrl && !redirectObj) {
      const resRedirect = NextResponse.redirect(new URL(returnUrl.href));
      await deleteCookie(RETURN_TO_URL_COOKIE_KEY, resRedirect);
      return resRedirect;
    }

    // This logic is hit when a user had a friendly url + multiple policies and has clicked on their
    // selected policy. Rather than going to the policy overview page, we redirect them to the route
    // of the friendly url so we check to see if the 3 pathname url item is present,
    // if it is that means it is not the coverage index page (because it has more than '' and ROOT_URL_PATH in the array)
    //
    if (
      req.nextUrl.pathname.includes('/coverage/') &&
      returnUrl &&
      redirectObj
    ) {
      // there is no good way at the moment to get params in middleware like there is on the client side (useParams)
      // so we need to grab the planCode and policyNumber from the path
      const { planCode, policyNumber, lineOfBusiness } =
        getPolicyDataFromPath(pathname);

      const url = getRedirectUrl(redirectObj, {
        planCode,
        policyNumber,
        lineOfBusiness,
      });
      const resRedirect = NextResponse.redirect(new URL(url, req.url));
      await deleteCookie(RETURN_TO_URL_COOKIE_KEY, resRedirect);
      return resRedirect;
    }

    // If the url is not the index page AND has a friendly url object
    const redirect = pathname !== RouteKey.COVERAGE && routeMap[pathname as RouteKey];

    // if we get here and we have a redirect we need to determine how many policies a user has
    // if they have multiple policies or some unknown error occurs we send them to the policies index page
    // after the user select a policy we will redirect them to the appropiate page.
    // For example if the user entered /riders after they select a policy we will redirect them to
    // /coverage/[planCode]/[policyNumber]/riders
    if (redirect) {
      const allPolicies = await getMyPoliciesByCarrier([
        CarrierId.SBUL,
        CarrierId.ELIC,
        'WELB',
      ]);
      if (
        !allPolicies.data ||
        allPolicies.data.length === 0 ||
        allPolicies.data.length > 1
      ) {
        const resRedirect = NextResponse.redirect(
          new URL(ROOT_URL_PATH, req.url)
        );
        await setReturnUrlCookie(req.nextUrl, resRedirect);
        await setRefreshRouterCookie(resRedirect);
        return resRedirect;
      }

      const [policy] = allPolicies.data;
      const redirectUrl = getRedirectUrl(redirect, {
        planCode: policy?.planCode || '',
        policyNumber: policy?.policyNumber || '',
        lineOfBusiness: lineOfBusinessUrlPath(policy?.lineOfBusiness),
      });

      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // if the user is on the login page and they have a session we need to redirect them to the policies index page
    // if they have only one policy we will redirect them to the policy details page
    // otherwise we will send them to the policy index page

    if (fromLogin === 'true') {
      const allPolicies = await getMyPoliciesByCarrier([
        CarrierId.SBUL,
        CarrierId.ELIC,
        'WELB',
      ]);

      // We need to hit the feature flag route handler in middleware instead of the server function.
      // This has something to do with how middleware runs on the Edge runtime instead of Node runtime
      // If you try to hit the server function directly, optimizely will error out initializing.

      // If Annuity mode is on, if they are on a valid subdomain, direct them straight to the policy.
      // Otherwise they need to go to the carrier picker and select a carrier before this applies
      const currentSubDomain = getSubdomain(req.headers);
      const validSubdomain = isValidCarrierSubdomain(currentSubDomain);

      if (allPolicies.data && allPolicies.data.length === 1 && validSubdomain) {
        const [policy] = allPolicies.data;
        const carrierSubdomainById = getCarrierSubdomainById(policy?.carrierId);

        // Make sure that if someone is logging into like 'every.mypolicyview' but they only have a 'wellabe' policy,
        // we dont send them to the every policy.
        if (carrierSubdomainById === currentSubDomain) {
          return NextResponse.redirect(
            new URL(
              `/coverage/${lineOfBusinessUrlPath(policy?.lineOfBusiness)}/${policy?.planCode}/${policy?.policyNumber}`,
              req.url
            )
          );
        }
      }
    }

    // Ensure user is on a valid subdomain for the policy theyre viewing.
    // If not, redirect them to the correct subdomain for a policy
    if (pathname.includes('/coverage/')) {
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
    if (pathname.includes('/coverage/')) {
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
    pathname !== RouteKey.COVERAGE &&
    routeMap[pathname as RouteKey]
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
     * - login
     * - session
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - everly-logo.png (this is used for the email template. This is in place for MVP)
     */
    '/((?!api|health|_next/static|_next/image|favicon.ico|everly-logo.png).*)',
  ],
};
