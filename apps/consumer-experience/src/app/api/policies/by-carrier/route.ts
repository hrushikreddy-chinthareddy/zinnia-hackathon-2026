import { NextRequest, NextResponse } from 'next/server';

import { getMyPoliciesByCarrier } from '@/services';
import {
  baseExperienceCarriers,
  getCarrierListDetails,
} from '@/utils/carriers';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

/**
 *
 * Returns list of policies by carrier from the baseExperienceCarriers array
 * note: Previously this took in a query param of carrierIds. This is a no-no. We cant
 * show other carrierCodes to people client side
 */
export async function GET(request: NextRequest) {
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('policies::by-carrier::GET::start', {
    ...loggingContext,
  });

  try {
    const { data: policyData, error } = await getMyPoliciesByCarrier(
      baseExperienceCarriers,
      loggingContext
    );

    if (error || !policyData) {
      logError('policies::by-carrier::GET::getMyPoliciesByCarrier::error', {
        ...loggingContext,
        error,
      });
      throw error;
    }

    const carrierDetails = getCarrierListDetails(policyData);

    logTrace('policies::by-carrier::GET::complete', {
      ...loggingContext,
    });

    return NextResponse.json({
      data: carrierDetails,
      error,
    });
  } catch (error) {
    logError('policies::by-carrier::GET::error', {
      ...loggingContext,

      error,
    });
    throw error;
  }
}
