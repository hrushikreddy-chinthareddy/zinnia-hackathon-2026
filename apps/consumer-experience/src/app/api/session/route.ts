import { NextResponse } from 'next/server';

import { getSession, touchSession } from '@/utils/auth';

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
  }
  return NextResponse.json({
    success: !!session,
  });
}
