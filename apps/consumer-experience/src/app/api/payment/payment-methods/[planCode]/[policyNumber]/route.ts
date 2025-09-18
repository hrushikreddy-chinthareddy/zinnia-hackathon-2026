import { NextRequest, NextResponse } from 'next/server';

import { getPaymentMethods } from '@/services/payment-methods';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: {
      planCode: string;
      policyNumber: string;
    };
  }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace(`payment::payment-methods::GET::start`, loggingContext);

  try {
    const { data, error } = await getPaymentMethods(
      {
        policyNumber: params.policyNumber,
        planCode: params.planCode,
      },
      loggingContext
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ data, error });
  } catch (error) {
    logError(`payment::payment-methods::GET::error`, {
      ...loggingContext,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'payment::payment-methods::GET::error',
        message: 'Failed to fetch payment methods',
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
