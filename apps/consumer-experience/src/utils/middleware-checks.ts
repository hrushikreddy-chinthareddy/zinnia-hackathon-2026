import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { getRouteKeyFromUrl, RouteKey } from '@/route-map';
import { checkResetDeliveryDateEligibility } from '@/services/bpm/delivery-date';
import { getRoutePermissions } from '@/services/display-rules';
import { getPolicyDetails } from '@/services/policy';
import { User } from '@/types/auth';

import { getCarrierSubdomainById, isValidCarrierSubdomain } from './carriers';
import { logTrace } from './logging/log-fns';
import { buildCommonLogContext } from './logging/server-logging';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from './serverClientUtils';
import { getPolicyDataFromPath } from './url';
import { COOKIE_DOMAIN } from '../../constants';

const file = 'utils/middleware-checks.ts';

export const getValidSubdomainForPolicy = async ({
  currentSubdomain,
  planCode,
  policyNumber,
}: {
  currentSubdomain?: string;
  planCode: string;
  policyNumber: string;
}) => {
  const logDetails = {
    planCode,
    policyNumber,
    currentSubdomain,
    file,
    function: 'getValidSubdomainForPolicy',
  };
  if (!currentSubdomain) {
    logTrace('Missing subdomain for policy', logDetails);
    return null;
  }

  const loggingCtx = await buildCommonLogContext();
  const { data: policyData } = await getPolicyDetails(
    {
      planCode,
      policyNumber,
    },
    loggingCtx
  );

  // if the user is not on a valid subdomain, redirect them to the correct subdomain based on the
  // policy they have selected. Prevents someone from being going to like `wellabe.com/123everlyCode/456everlyPolicyNumber`
  const carrierSubdomain = getCarrierSubdomainById(policyData?.carrierId);

  if (carrierSubdomain === currentSubdomain) {
    return currentSubdomain;
  }

  if (!carrierSubdomain) {
    logTrace('No matching carrier for provided subdomain', {
      ...logDetails,
      policySubdomain: policyData?.carrierId,
    });

    return null;
  }

  const validSubdomain = isValidCarrierSubdomain(currentSubdomain);

  if (!validSubdomain) {
    logTrace('Subdomain is not valid', {
      ...logDetails,
      policySubdomain: policyData?.carrierId,
    });

    return null;
  }

  return carrierSubdomain;
};

export const hasPermissionsForPolicyRoute = async (pathname: string) => {
  const { planCode, policyNumber } = getPolicyDataFromPath(pathname);

  const routePermissions = await getRoutePermissions(policyNumber, planCode);
  const routeKeyFromPathname = getRouteKeyFromUrl(pathname);

  const hasPermission = routePermissions?.[routeKeyFromPathname as RouteKey]();

  // Only return false if explicitly fails permissions check. If routePermissions returns null
  // somehow, than still return true and rely on API to handle restriction
  if (!hasPermission) {
    return false;
  }

  return true;
};

export const pathAccessibleWithoutPolicyAcknowledgement = (
  pathname: string
) => {
  return (
    pathname.includes('/policy-acknowledgement') ||
    pathname.includes('/documents/error')
  );
};

export const hasAcknowledgedPolicy = async (
  {
    planCode,
    policyNumber,
    user,
  }: { planCode: string; policyNumber: string; user: User },
  req: NextRequest,
  resNext: NextResponse
) => {
  const hasAckowledgedPolicy = req.cookies.get(
    ACKNOWLEDGEMENT_COOKIE_KEY
  )?.value;
  const parsedCookie: string[] = JSON.parse(hasAckowledgedPolicy || '[]');
  const logDetails = {
    planCode,
    policyNumber,
    file,
    function: 'hasAcknowledgedPolicy',
    user,
    correlationId: uuidv4(),
  };
  // we check to see if the policy number is in the cookie,
  // this means they have already acknowledged the policy
  if (parsedCookie.includes(policyNumber)) {
    logTrace('Policy already acknowledged', logDetails);
    return true;
  }

  // You'll only get to this logic if you NEED to acknowledge the policy
  // AND you've NEVER been to the policy page before AND you're trying
  // to get to an interior page (not the index page). Includes the case
  // where you have a single policy and this is the first time you've
  // visited the site
  const { data: eligiblityData } = await checkResetDeliveryDateEligibility(
    {
      planCode,
      policyNumber,
    },
    logDetails
  );

  // If you REQUIRE policy acknowledgement, you will be redirected to the index page
  // We can assume that once theyve ackowledged the policy, the cookie will be set
  // in policy acknowledgement action and they won't make it here, but if the policy
  // is not in the cookie, then the eligibility check will have returned false
  // and user will get to the else here
  if (eligiblityData?.isEligible) {
    logTrace(
      'Policy requires acknowledgement before viewing inner policy pages',
      {
        ...logDetails,
        eligiblityData,
      }
    );

    return false;
  } else {
    logTrace(
      'Policy already acknowledged or does not require acknowledgement',
      {
        ...logDetails,
        eligiblityData,
      }
    );
    parsedCookie.push(policyNumber);
    resNext.cookies.set(
      ACKNOWLEDGEMENT_COOKIE_KEY,
      JSON.stringify(parsedCookie),
      { domain: COOKIE_DOMAIN }
    );

    return true;
  }
};
