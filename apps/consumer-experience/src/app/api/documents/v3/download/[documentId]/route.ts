import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { NextRequest, NextResponse } from 'next/server';

import { b64ToBlob } from '@/app/api/documents/utils';
import { getDocumentDownloadV3 } from '@/services/document/v3';
import { getSession } from '@/utils/auth';
import { logWarn } from '@/utils/logging/log-fns';
import {
  getUserInfoFromSession,
  logCompliance,
} from '@/utils/logging/server-logging';

export const GET = async (
  request: NextRequest,
  { params }: { params: { documentId: string; lineOfBusiness: LineOfBusiness } }
) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.error();
  }

  const searchParams = request.nextUrl.searchParams;
  const parentCarrierCode = searchParams.get('parentCarrierCode') as string;
  const documentClassification = searchParams.get(
    'documentClassification'
  ) as string;
  const policyNumber = searchParams.get('policyNumber') as string;
  const planCode = searchParams.get('planCode') as string;

  const loggingContext = {
    parentCarrierCode,
    documentNumber: params.documentId,
    file: 'api/documents/v3/[documentId]/download/route.ts',
    function: 'GET',
    planCode,
    policyNumber,
    documentClassification,
    ...getUserInfoFromSession(session),
  };

  logCompliance('Document download attempt', {
    ...loggingContext,
  });

  const download = await getDocumentDownloadV3(
    params.documentId,
    documentClassification as string,
    parentCarrierCode as string
  );

  if (!download?.data?.binaryData) {
    logWarn('Could not download document', {
      ...loggingContext,
      error: download.error,
    });

    return NextResponse.redirect(
      new URL(
        `/coverage/${params.lineOfBusiness}/${planCode}/${policyNumber}/documents/error`,
        request.url
      )
    );
  }
  const blob = b64ToBlob(download.data.binaryData as string);

  return new Response(blob, {
    headers: { 'content-type': 'application/pdf' },
  });
};
