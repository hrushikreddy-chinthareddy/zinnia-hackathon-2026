import { NextResponse } from 'next/server';

import { getCarrierConfig } from '@/services/carrier-config';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export async function GET() {
  const commonLoggingContext = await buildCommonLogContext();
  const response = await getCarrierConfig(commonLoggingContext);

  return NextResponse.json(response);
}
