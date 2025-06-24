import { NextRequest, NextResponse } from 'next/server';

import { deleteCookie, deleteSession } from '@/utils/auth';
import { HAD_PREVIOUS_SESSION_COOKIE_KEY } from '@/utils/serverClientUtils';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get('host');
  const returnTo = `${url.protocol}//${host}`;
  await deleteSession();
  await deleteCookie(HAD_PREVIOUS_SESSION_COOKIE_KEY);

  return NextResponse.redirect(new URL(`/`, returnTo));
}
