import { NextRequest, NextResponse } from 'next/server';

import { checkResetDeliveryDateEligibility } from '@/services/bpm/delivery-date';
import { logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('policies::requires-acknowledgement::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { data, error } = await checkResetDeliveryDateEligibility(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    {
      user: loggingContext.user,
      correlationId: loggingContext.correlationId,
    }
  );

  logTrace('policies::requires-acknowledgement::GET::complete', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
