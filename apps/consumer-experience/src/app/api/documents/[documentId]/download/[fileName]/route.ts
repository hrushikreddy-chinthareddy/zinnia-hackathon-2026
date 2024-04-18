import { getDocumentDownload } from '@/services/document';
import {
  getUserInfoFromSession,
  logCompliance,
} from '@/utils/logging/server-logging';
import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

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
  const clientCode = searchParams.get('clientCode');
  const source = searchParams.get('source');

  logCompliance('Document download attempt', {
    documentNumber: params.documentId,
    clientCode,
    source,
    ...getUserInfoFromSession(session),
  });

  const data = await getDocumentDownload(
    params.documentId,
    source as string,
    clientCode as string
  );

  const blob = b64ToBlob(data?.data?.binaryData as string);

  return new Response(blob, { headers: { 'content-type': 'application/pdf' } });
};
