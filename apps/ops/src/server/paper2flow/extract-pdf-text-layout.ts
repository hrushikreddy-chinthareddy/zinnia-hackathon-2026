import { createRequire } from 'module';

import { ensurePdfjsNodePolyfills } from './pdf-node-polyfills';

import type {
    PdfExtractItemsMode,
    PdfExtractPage,
    PdfTextLayoutResult,
} from './types';

const require = createRequire(__filename);

export type ExtractPdfTextLayoutOptions = {
    /** Max pages to process (default: all pages). */
    maxPages?: number;
    /**
     * `full` — text + transform, x, y, width, height, fontName.
     * `text` — `{ text }` only per run (smaller JSON; often enough for LLMs).
     * `none` — no `items`; only `fullText` (and page dimensions).
     */
    itemsMode?: PdfExtractItemsMode;
};

/**
 * Extracts text and approximate layout from a PDF using the PDF.js text layer
 * (embedded text, not OCR for scanned image-only PDFs).
 *
 * Uses `pdfjs-dist/legacy/build/pdf.js` for Node compatibility.
 */
export async function extractPdfTextAndLayout(
    pdfBuffer: Buffer,
    options: ExtractPdfTextLayoutOptions = {}
): Promise<PdfTextLayoutResult> {
    ensurePdfjsNodePolyfills();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjsLib =
        require('pdfjs-dist/legacy/build/pdf.js') as typeof import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
        'pdfjs-dist/legacy/build/pdf.worker.min.js'
    );

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        disableFontFace: true,
        verbosity: 0,
    });

    const pdfDocument = await loadingTask.promise;
    const pageCount = pdfDocument.numPages;
    const maxPages = Math.min(options.maxPages ?? pageCount, pageCount);

    const itemsMode: PdfExtractItemsMode = options.itemsMode ?? 'full';

    const pages: PdfExtractPage[] = [];
    const warnings: string[] = [];

    for (let pageIndex = 1; pageIndex <= maxPages; pageIndex++) {
        const page = await pdfDocument.getPage(pageIndex);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();

        const items: NonNullable<PdfExtractPage['items']> = [];

        let fullText = '';
        for (const raw of textContent.items) {
            if (!('str' in raw) || typeof raw.str !== 'string') {
                continue;
            }
            if (itemsMode === 'text') {
                items.push({ text: raw.str });
            } else if (itemsMode === 'full') {
                const m = raw.transform;
                const w =
                    'width' in raw && typeof raw.width === 'number'
                        ? raw.width
                        : 0;
                const h =
                    'height' in raw && typeof raw.height === 'number'
                        ? raw.height
                        : 0;

                items.push({
                    text: raw.str,
                    transform: [...m] as [
                        number,
                        number,
                        number,
                        number,
                        number,
                        number
                    ],
                    x: m[4],
                    y: m[5],
                    width: w,
                    height: h,
                    fontName:
                        'fontName' in raw && typeof raw.fontName === 'string'
                            ? raw.fontName
                            : undefined,
                });
            }

            fullText += raw.str;
            if ('hasEOL' in raw && raw.hasEOL) {
                fullText += '\n';
            }
        }

        const pagePayload: PdfExtractPage = {
            pageNumber: pageIndex,
            width: viewport.width,
            height: viewport.height,
            fullText,
        };
        if (itemsMode !== 'none') {
            pagePayload.items = items;
        }

        pages.push(pagePayload);
    }

    if (textLayerLooksEmpty(pages)) {
        warnings.push(
            'Very little text was extracted. This PDF may be image-only (scanned). Add rasterization + Tesseract or an external OCR service for true OCR.'
        );
    }

    return {
        mode: 'pdf_text_layer',
        itemsMode,
        pageCount,
        pagesProcessed: maxPages,
        pages,
        warnings,
    };
}

function textLayerLooksEmpty(pages: PdfExtractPage[]): boolean {
    const joined = pages.map((p) => p.fullText).join('');
    const letters = joined.replace(/\s+/g, '').length;
    return letters < 40;
}
