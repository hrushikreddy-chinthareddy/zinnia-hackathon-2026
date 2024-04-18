'use client';

import { saveAs } from 'file-saver';
import React, { useState } from 'react';
import { Button } from '@zinnia/bloom/internal/components';

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

export default function PdfPreviewer({
  documentBinary,
}: {
  documentBinary: string;
}) {
  const [supportsEmbed, setSupportsEmbed] = useState(true);

  const blob = b64ToBlob(documentBinary);
  const saveDocument = () => {
    blob && saveAs(blob, 'fileNameBPBFixMe.pdf');
  };

  return supportsEmbed ? (
    <embed
      src={`data:application/pdf;base64,${documentBinary}`}
      onError={() => setSupportsEmbed(false)}
      type="application/pdf"
      width={'100%'}
      height={'100%'}
    />
  ) : (
    <>
      PDF Preview doesn't seem to be supported by this browser.{' '}
      <Button onClick={saveDocument}>Download File Instead</Button>
    </>
  );
}
