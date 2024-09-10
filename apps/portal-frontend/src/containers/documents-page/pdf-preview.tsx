import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import PageLoader from '@deps/components/page-loader/page-loader';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// An approach to improve page performance without using a library; others recs were react-virtualized or react-window
const MemoizedPage = React.memo(function PageComponent({
    pageNum,
    loadNextPage,
}: {
    pageNum: number;
    loadNextPage: (num: number) => void;
}) {
    return (
        <Page
            key={`document-page-${pageNum}`}
            pageNumber={pageNum}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="m-auto mt-8 w-min !bg-inherit first:mt-0"
            onRenderSuccess={() => loadNextPage(pageNum + 1)}
            loading={<PageLoader />}
        />
    );
});

interface PdfPreviewProps {
    documentBinary: string;
}

export default function PdfPreview({ documentBinary }: PdfPreviewProps) {
    const [numPages, setNumPages] = useState(0);
    const [maxPageLoaded, setMaxPageLoaded] = useState(0);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setMaxPageLoaded(1);
    };

    return (
        <div className="mt-8 print:hidden">
            <Document
                file={'data:application/pdf;base64,' + documentBinary}
                onContextMenu={e => e.preventDefault()}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex flex-col justify-items-center"
            >
                {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum =>
                    pageNum <= maxPageLoaded ? (
                        <MemoizedPage key={`document-page-${pageNum}`} pageNum={pageNum} loadNextPage={setMaxPageLoaded} />
                    ) : null
                )}
            </Document>
        </div>
    );
}
