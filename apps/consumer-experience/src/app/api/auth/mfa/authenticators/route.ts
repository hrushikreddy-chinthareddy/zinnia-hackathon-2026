import { NextRequest, NextResponse } from 'next/server';

import { ServerApi } from '@/services';
import { getMfaCookie } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const headers = req.headers.get('authorization');
  const token = headers?.split(' ')[1] ?? (await getMfaCookie());
  if (!token) {
    return NextResponse.json(
      {
        error: 'No token provided',
      },
      {
        status: 400,
      }
    );
  }
  const response = await ServerApi.getMfaAuthenticators(token);
  if (response.ok) {
    const data = await response.json();
    return NextResponse.json(data);
  }

  return NextResponse.json(
    {
      error: response.statusText,
    },
    {
      status: response.status,
    }
  );
}
