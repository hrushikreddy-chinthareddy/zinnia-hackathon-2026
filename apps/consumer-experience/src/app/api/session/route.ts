import { getSession, touchSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  MAX_AGE_SESSION_COOKIE,
  REDIRECT_TO_SESSION_COOKIE_KEY,
} from '@/utils/serverClientUtils';

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
    cookies().set(REDIRECT_TO_SESSION_COOKIE_KEY, 'true', {
      maxAge: MAX_AGE_SESSION_COOKIE,
    });
  }
  return NextResponse.json({
    success: !!session,
  });
}
