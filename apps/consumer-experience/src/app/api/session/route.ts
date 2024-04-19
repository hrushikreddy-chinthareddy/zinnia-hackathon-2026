import { getSession, touchSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { HAD_PREVIOUS_SESSION_COOKIE_KEY } from '@/utils/serverClientUtils';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    isActiveSession: !!session,
  });
}

export async function POST() {
  const session = await getSession();
  if (session) {
    await touchSession();
    cookies().set(HAD_PREVIOUS_SESSION_COOKIE_KEY, '1');
  }
  return NextResponse.json({
    success: !!session,
  });
}
