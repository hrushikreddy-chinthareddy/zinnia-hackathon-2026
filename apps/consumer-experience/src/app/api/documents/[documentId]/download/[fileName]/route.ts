import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { NextRequest, NextResponse } from 'next/server';

import { getDocumentDownload } from '@/services/document';
import { getSession } from '@/utils/auth';
import {
  getUserInfoFromSession,
  logCompliance,
  logWarn,
} from '@/utils/logging/server-logging';

import { b64ToBlob } from '../../../utils';

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
  const source = searchParams.get('source') as string;
  const policyNumber = searchParams.get('policyNumber') as string;
  const planCode = searchParams.get('planCode') as string;

  const loggingContext = {
    clientCode,
    documentNumber: params.documentId,
    file: 'api/documents/[documentId]/download/[fileName]/route.ts',
    function: 'GET',
    planCode,
    policyNumber,
    source,
    ...getUserInfoFromSession(session),
  };

  logCompliance('Document download attempt', {
    ...loggingContext,
  });

  const download = await getDocumentDownload(
    params.documentId,
    source as string,
    clientCode as string,
    policyNumber as string,
    planCode as string
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
