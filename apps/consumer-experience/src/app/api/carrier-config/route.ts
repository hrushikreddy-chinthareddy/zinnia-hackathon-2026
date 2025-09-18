import { NextResponse } from 'next/server';

import { getCarrierConfig } from '@/services/carrier-config';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export async function GET() {
  const commonLoggingContext = await buildCommonLogContext();

  try {
    return NextResponse.json({
      data: (await getCarrierConfig(commonLoggingContext)).data, //Since its wrapped in withLogging, just return data here.
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      error: 'something went wrong',
      correlationId: commonLoggingContext?.correlationId,
    });
  }
}
