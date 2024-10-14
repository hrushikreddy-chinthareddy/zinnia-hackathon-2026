'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import Loading from '@/app/loading';

import PreviewUnsupported from './PreviewUnsupported';

export default function PdfPreviewer({
  clientCode,
  documentId,
  fileName,
  planCode,
  policyNumber,
  source,
}: {
  clientCode: string;
  documentId: string;
  planCode: string;
  policyNumber: string;
  fileName: string;
  source: string;
}) {
  const [supportsEmbed, setSupportsEmbed] = useState(true);
  const [documentData, setDocumentData] = useState<string>('');
  const fetchInProgress = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (fetchInProgress.current || documentData) {
      return;
    }
    fetchInProgress.current = true;

    const getDocumentData = async () => {
      let shouldRedirectToError = false;
      // default to the documents error page, however, if the response is a redirect we will use that (see below)
      let redirectHref = `/polices/${planCode}/${policyNumber}/documents/error`;

      try {
        const response = await fetch(
          `/api/documents/${documentId}/download/${fileName}.pdf?clientCode=${clientCode}&source=${source}&planCode=${planCode}&policyNumber=${policyNumber}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        if (response.redirected) {
          shouldRedirectToError = true;
          // if the response was a redirect, we should redirect to the error page
          // in this case lets use the URL returned from the API route
          redirectHref = response.url;
        } else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setDocumentData(url);
        }
      } catch (error) {
        shouldRedirectToError = true;
      } finally {
        fetchInProgress.current = false;
      }

      if (shouldRedirectToError) {
        router.push(redirectHref);
      }
    };
    getDocumentData();

    // Cleanup function to revoke the object URL created.
    return () => {
      if (documentData) {
        URL.revokeObjectURL(documentData);
      }
    };
  }, [
    clientCode,
    documentData,
    documentId,
    fileName,
    planCode,
    policyNumber,
    router,
    source,
  ]);

  return supportsEmbed ? (
    documentData ? (
      <object
        data={documentData}
        // eslint-disable-next-line react/no-unknown-property
        onError={() => setSupportsEmbed(false)}
        type="application/pdf"
        width={'100%'}
        height={'100%'}
      >
        <PreviewUnsupported fileName={fileName} url={documentData} />
      </object>
    ) : (
      <Loading />
    )
  ) : (
    <PreviewUnsupported fileName={fileName} url={documentData} />
  );
}
