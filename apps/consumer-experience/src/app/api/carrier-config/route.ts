import { NextResponse } from 'next/server';

import { getCarrierConfig } from '@/services/carrier-config';

export async function GET() {
  try {
    return NextResponse.json({
      data: await getCarrierConfig(),
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      error: 'something went wrong',
    });
  }
}
