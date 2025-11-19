import { NextRequest, NextResponse } from 'next/server';

import { b64ToBlob } from '@/app/api/documents/utils';
import { getTaxDocumentDownloadV3 } from '@/services/document/v3';
import { getSession } from '@/utils/auth';
import { logWarn } from '@/utils/logging/log-fns';
import {
  buildNextReqLoggingContext,
  getUserInfoFromSession,
  logCompliance,
} from '@/utils/logging/server-logging';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

export const GET = async (
  request: NextRequest,
  { params }: { params: { documentId: string; lineOfBusiness: LineOfBusiness } }
) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.error();
  }

  const searchParams = request.nextUrl.searchParams;
  const clientCode = searchParams.get('clientCode') as string;
  const taxYear = searchParams.get('taxYear') as string;
  const formId = searchParams.get('formId') as string;
  const fChar = searchParams.get('fChar') as string;
  const planCode = searchParams.get('planCode') as string;
  const contractNumber = searchParams.get('policyNumber') as string;

  const commonLogContext = await buildNextReqLoggingContext(request);

  const loggingContext = {
    clientCode,
    documentNumber: params.documentId,
    file: 'api/documents/v3/tax-docs/[documentId]/download/[fileName]/route.ts',
    function: 'GET',
    planCode,
    contractNumber,
    taxYear,
    formId,
    fChar,
    ...getUserInfoFromSession(session),
  };

  logCompliance('Document download attempt', {
    ...loggingContext,
  });

  const download = await getTaxDocumentDownloadV3(
    {
      contractNumber,
      carrierId: clientCode as string,
      taxYear,
      fChar,
      formId: params.documentId,
    },
    {
      user: commonLogContext.user,
      correlationId: commonLogContext.correlationId,
    }
  );

  if (!download?.data?.binaryData) {
    logWarn('Could not download document', {
      ...loggingContext,
      error: download.error,
    });

    return NextResponse.redirect(
      new URL(
        `/coverage/${params.lineOfBusiness}/${planCode}/${contractNumber}/documents/error`,
        request.url
      )
    );
  }
  const blob = b64ToBlob(download.data.binaryData as string);

  return new Response(blob, {
    headers: { 'content-type': 'application/pdf' },
  });
};
