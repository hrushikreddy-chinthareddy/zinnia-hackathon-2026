/**
 * pdfjs-dist expects Path2D in some Node runtimes (e.g. older Node or stripped
 * environments). Apply once before loading `pdfjs-dist/legacy/build/pdf.js`.
 */
let applied = false;

export function ensurePdfjsNodePolyfills(): void {
    if (applied) {
        return;
    }
    if (typeof globalThis.Path2D === 'undefined') {
        globalThis.Path2D = class Path2D {} as unknown as typeof Path2D;
    }
    applied = true;
}
