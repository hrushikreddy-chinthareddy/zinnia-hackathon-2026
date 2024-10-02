import { NextRequest, NextResponse } from 'next/server';

import { getDocumentDownload } from '@/services/document';
import { getSession } from '@/utils/auth';
import {
  getUserInfoFromSession,
  logCompliance,
  logWarn,
} from '@/utils/logging/server-logging';

// Converts the Base 64 encoded binaryData string into a blob on the client to allow for downloading.
const b64ToBlob = (b64data: string): Blob | null => {
  try {
    const chunkSize = 1024;
    const byteChars = atob(b64data);

    const chunks: Uint8Array[] = [];

    for (let i = 0; i < byteChars.length; i += chunkSize) {
      const chunk = byteChars.slice(i, i + chunkSize);

      const byteArray = new Uint8Array(chunk.length);
      for (let j = 0; j < chunkSize; ++j) {
        byteArray[j] = chunk.charCodeAt(j);
      }

      chunks.push(byteArray);
    }

    const blob = new Blob(chunks, { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error(
      'document-downloader::b64ToBlob::Error converting document response to Blob',
      error
    );
    return null;
  }
};
export const GET = async (
  request: NextRequest,
  { params }: { params: { documentId: string } }
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
        `/coverage/${planCode}/${policyNumber}/documents/error`,
        request.url
      )
    );
  }
  const blob = b64ToBlob(download.data.binaryData as string);

  return new Response(blob, {
    headers: { 'content-type': 'application/pdf' },
  });
};
