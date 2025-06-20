import { NextRequest, NextResponse } from 'next/server';

import { getPaymentusIframeToken } from '@/utils/paymentus/encrypt-token';

export async function POST(_request: NextRequest) {
  const { ownerId, postMessagePmDetailsOrigin, timestamp, pmCategory } =
    await _request.json();

  const encryptedToken = getPaymentusIframeToken({
    // TODO: get this from the access token
    ownerId,
    // TODO: is this supposed to be postbackUrl? postMessagePmDetailsOrigin is
    // from the farmers implementation
    postMessagePmDetailsOrigin: postMessagePmDetailsOrigin,
    timestamp,
    entryPoint: 'iframe',
    pmCategory,
  });

  return NextResponse.json({
    data: encryptedToken,
    error: null,
  });
}
