'use client';

import { saveAs } from 'file-saver';
import React, { useState } from 'react';
import { Button } from '@zinnia/bloom/internal/components';

export default function PdfPreviewer({
  documentId,
  clientCode,
  source,
  fileName,
}: {
  clientCode: string;
  documentId: string;
  fileName: string;
  source: string;
}) {
  const [supportsEmbed, setSupportsEmbed] = useState(true);

  const documentUrl = `/api/documents/${documentId}/download?clientCode=${clientCode}&source=${source}`;

  const saveDocument = () => {
    saveAs(documentUrl, `${fileName}.pdf`);
  };

  return !supportsEmbed ? (
    <embed
      src={documentUrl}
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
