import { NextRequest, NextResponse } from 'next/server';

import { CARRIER_REDIRECT_URLS } from '@/carrier-config/urls';
import { CompanyName } from '@/types/carriers';
import { deleteCookie, deleteSession } from '@/utils/auth';
import { HAD_PREVIOUS_SESSION_COOKIE_KEY } from '@/utils/serverClientUtils';
import { getThemeCookies } from '@/utils/theme';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const host = req.headers.get('host');
  const currentCarrier = await getThemeCookies();
  let returnTo = `${url.protocol}//${host}`;

  if (currentCarrier === CompanyName.FARMERS) {
    returnTo = CARRIER_REDIRECT_URLS[CompanyName.FARMERS].POLICY_SUMMARY;
  }

  await deleteSession();
  await deleteCookie(HAD_PREVIOUS_SESSION_COOKIE_KEY);

  return NextResponse.redirect(new URL(returnTo));
}
