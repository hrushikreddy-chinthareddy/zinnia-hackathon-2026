import { NextRequest, NextResponse } from 'next/server';

import { getPolicyProfileData } from '@/services';
import { getSession } from '@/utils/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  // const session = await getSession();
  // if (!session) {
  //   return NextResponse.json({
  //     data: null,
  //     error: {
  //       status: 401,
  //       message: 'Unauthorized',
  //     },
  //   });
  // }
  const { data, error } = await getPolicyProfileData({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
