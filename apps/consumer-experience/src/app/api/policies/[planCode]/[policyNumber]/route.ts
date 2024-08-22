import { NextRequest, NextResponse } from 'next/server';

import { getPolicyByPlanCodeAndId } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  try {
    const policyData = await getPolicyByPlanCodeAndId(params);

    return NextResponse.json({
      data: policyData,
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'get policy by plan code route handler Error',
      },
    });
  }
}
