'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import Loading from '@/app/loading';

import PreviewUnsupported from './PreviewUnsupported';

export default function PdfPreviewer({
  defaultRedirectUrl,
  documentDownloadUrl,
  fileName,
}: {
  defaultRedirectUrl: string;
  documentDownloadUrl: string;
  fileName: string;
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
      let redirectHref = defaultRedirectUrl;

      try {
        const response = await fetch(documentDownloadUrl);
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
  }, [defaultRedirectUrl, documentData, documentDownloadUrl, router]);

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
