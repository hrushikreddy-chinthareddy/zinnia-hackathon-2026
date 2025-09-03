import { getFileSubtype } from './document.helpers';

jest.mock('@deps/models/case/document', () => ({
    mimeToExt: {
        'message/rfc822': 'eml',
        'message/global': 'eml',
        'application/vnd.ms-outlook': 'pst',
        'application/vnd.ms-office': 'msg',
        'application/x-pst': 'pst',
        'application/octet-stream': 'pst',
    },
    nameToExt: ['eml', 'msg', 'pst', 'ost'],
}));

describe('document.helpers', () => {
    it('returns empty string when blob is null or undefined', () => {
        // @ts-expect-error - Intentionally testing null input
        expect(getFileSubtype(null)).toBe('');
        // @ts-expect-error - Intentionally testing undefined input
        expect(getFileSubtype(undefined)).toBe('');
    });

    it('handles files with multiple dots in the filename', () => {
        const multiDotBlob = new Blob([]);
        Object.defineProperty(multiDotBlob, 'type', { value: '' });
        Object.defineProperty(multiDotBlob, 'name', {
            value: 'document.backup.eml',
        });

        expect(getFileSubtype(multiDotBlob)).toBe('eml');
    });

    it('handles case sensitivity in extensions correctly', () => {
        const uppercaseExtBlob = new Blob([]);
        Object.defineProperty(uppercaseExtBlob, 'type', { value: '' });
        Object.defineProperty(uppercaseExtBlob, 'name', {
            value: 'document.EML',
        });

        expect(getFileSubtype(uppercaseExtBlob)).toBe('');
    });

    it('handles empty filename with valid type', () => {
        const noNameBlob = new Blob([], { type: 'application/pdf' });
        Object.defineProperty(noNameBlob, 'name', { value: '' });

        expect(getFileSubtype(noNameBlob)).toBe('pdf');
    });

    it('handles priority between MIME mapping and MIME splitting', () => {
        const ambiguousBlob = new Blob([], {
            type: 'application/octet-stream',
        });
        expect(getFileSubtype(ambiguousBlob)).toBe('pst');
    });
    it('handles PDF documents properly', () => {
        const pdfBlob = new Blob(['%PDF-1.5'], {
            type: 'application/pdf',
        });
        Object.defineProperty(pdfBlob, 'name', {
            value: 'policy_document.pdf',
        });
        expect(getFileSubtype(pdfBlob)).toBe('pdf');

        const misclassifiedPdfBlob = new Blob(['%PDF-1.5'], {
            type: 'application/octet-stream',
        });
        Object.defineProperty(misclassifiedPdfBlob, 'name', {
            value: 'policy_document.pdf',
        });
        expect(getFileSubtype(misclassifiedPdfBlob)).toBe('pst');
    });

    it('handles image file uploads for supporting documents', () => {
        const jpegBlob = new Blob([], { type: 'image/jpeg' });
        Object.defineProperty(jpegBlob, 'name', {
            value: 'id_scan.jpg',
        });
        expect(getFileSubtype(jpegBlob)).toBe('jpeg');

        const pngBlob = new Blob([], { type: 'image/png' });
        Object.defineProperty(pngBlob, 'name', {
            value: 'screenshot.png',
        });
        expect(getFileSubtype(pngBlob)).toBe('png');
    });

    it('handles email formats used for correspondence', () => {
        const emlBlob = new Blob([], { type: 'message/rfc822' });
        Object.defineProperty(emlBlob, 'name', {
            value: 'client_correspondence.eml',
        });
        expect(getFileSubtype(emlBlob)).toBe('eml');

        const msgBlob = new Blob([], {
            type: 'application/vnd.ms-office',
        });
        Object.defineProperty(msgBlob, 'name', {
            value: 'client_email.msg',
        });
        expect(getFileSubtype(msgBlob)).toBe('msg');
    });

    it('handles documents with no extension but with content type', () => {
        const htmlBlob = new Blob(['<!DOCTYPE html>'], {
            type: 'text/html',
        });
        Object.defineProperty(htmlBlob, 'name', {
            value: 'exported_report',
        });
        expect(getFileSubtype(htmlBlob)).toBe('html');
    });

    it('determines type from filename when browser provides generic type', () => {
        const pstFileBlob = new Blob([], {
            type: 'application/octet-stream',
        });
        Object.defineProperty(pstFileBlob, 'name', {
            value: 'outlook_archive.pst',
        });
        expect(getFileSubtype(pstFileBlob)).toBe('pst');
    });
});
