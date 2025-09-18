import { NextResponse } from 'next/server';

import { getCarrierConfig } from '@/services/carrier-config';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export async function GET() {
  try {
    const commonLoggingContext = await buildCommonLogContext();
    return NextResponse.json({
      data: await getCarrierConfig(commonLoggingContext),
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      error: 'something went wrong',
    });
  }
}
