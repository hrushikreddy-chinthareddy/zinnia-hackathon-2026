/** One PDF text run with geometry (for grouping / repeated labels). */
export type PdfTextItem = {
    text: string;
    /** PDF text transform matrix [a,b,c,d,e,f] — e,f are translation in PDF user space. */
    transform: [number, number, number, number, number, number];
    x: number;
    y: number;
    width: number;
    height: number;
    fontName?: string;
};

/** Minimal run — enough for most LLM / field-list pipelines. */
export type PdfTextItemCompact = {
    text: string;
};

export type PdfExtractItemsMode = 'full' | 'text' | 'none';

export type PdfExtractPage = {
    pageNumber: number;
    width: number;
    height: number;
    /** Concatenated text items (with hasEOL newlines where PDF provides them). */
    fullText: string;
    /** Omitted when itemsMode is `none`. */
    items?: PdfTextItem[] | PdfTextItemCompact[];
};

export type PdfTextLayoutResult = {
    mode: 'pdf_text_layer';
    /** How `items` was populated (`none` means field absent). */
    itemsMode: PdfExtractItemsMode;
    pageCount: number;
    pagesProcessed: number;
    pages: PdfExtractPage[];
    warnings: string[];
};
