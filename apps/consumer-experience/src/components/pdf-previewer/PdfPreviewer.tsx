'use client';

import React, { useState } from 'react';
import PreviewUnsupported from './PreviewUnsupported';

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

  const documentUrl = `/api/documents/${documentId}/download/${fileName}.pdf?clientCode=${clientCode}&source=${source}`;

  return supportsEmbed ? (
    <object
      data={documentUrl}
      onError={() => setSupportsEmbed(false)}
      type="application/pdf"
      width={'100%'}
      height={'100%'}
    >
      <PreviewUnsupported fileName={fileName} url={documentUrl} />
    </object>
  ) : (
    <PreviewUnsupported fileName={fileName} url={documentUrl} />
  );
}
