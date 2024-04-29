import { NextRequest, NextResponse } from 'next/server';

import { deleteSession } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get('host');
  const returnTo = `${url.protocol}//${host}`;
  await deleteSession();
  return NextResponse.redirect(new URL(`/`, returnTo));
}
