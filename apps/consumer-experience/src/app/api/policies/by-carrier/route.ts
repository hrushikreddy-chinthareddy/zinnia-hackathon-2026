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
 * Takes in a queryParam of carriers as a comma separated list.
 * If no carriers are provided, defaults to baseExperienceCarriers
 */
export async function GET(request: NextRequest) {
  const carrierParams = request.nextUrl.searchParams.get('carriers');
  const carrierArray = carrierParams?.split(',') || baseExperienceCarriers;
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('policies::by-carrier::GET::start', {
    ...loggingContext,
  });

  try {
    const { data: policyData, error } = await getMyPoliciesByCarrier(
      carrierArray,
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
