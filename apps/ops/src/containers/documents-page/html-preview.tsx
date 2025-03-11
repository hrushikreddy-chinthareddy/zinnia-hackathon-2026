import { default as DOMPurify } from 'dompurify';

export default function HtmlPreview({ documentBinary }: { documentBinary: string }) {
    const decoded = Buffer.from(documentBinary, 'base64').toString();

    return (
        <div className="responsive-padding flex justify-center">
            <div
                className="responsive-padding max-w-[1130px] bg-white print:hidden"
                onContextMenu={e => {
                    e.preventDefault();
                    console.error('cannot save html');
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decoded) }}
            />
        </div>
    );
}
