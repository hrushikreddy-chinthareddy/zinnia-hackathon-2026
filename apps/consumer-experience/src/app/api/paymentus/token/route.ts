import { NextRequest, NextResponse } from 'next/server';

import { getFarmersECN } from '@/utils/auth';
import { getPaymentusIframeToken } from '@/utils/paymentus/encrypt-token';

export async function POST(_request: NextRequest) {
  const { postMessagePmDetailsOrigin, timestamp, pmCategory } =
    await _request.json();

  const ownerId = await getFarmersECN();
  const encryptedToken = getPaymentusIframeToken({
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
