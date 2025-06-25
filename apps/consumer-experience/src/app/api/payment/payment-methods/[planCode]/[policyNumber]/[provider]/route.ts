import { NextRequest, NextResponse } from 'next/server';

import { getPaymentMethods } from '@/services/payment-methods';
import { PaymentProvider } from '@/types/carrier-config';
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
      provider: PaymentProvider;
    };
  }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace(
    `payment::payment-methods::${params.provider.toLowerCase()}::GET::start`,
    loggingContext
  );

  if (!Object.values(PaymentProvider).includes(params.provider)) {
    throw new Error('Invalid provider');
  }

  try {
    const { data, error } = await getPaymentMethods(
      {
        paymentProvider: params.provider,
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
    logError(
      `payment::payment-methods::${params.provider.toLowerCase()}::GET::error`,
      {
        ...loggingContext,
        error,
      }
    );
    throw error;
  }
}
