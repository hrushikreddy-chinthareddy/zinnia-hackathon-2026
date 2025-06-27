export default function TxtPreview({
    documentBinary,
}: {
    documentBinary: string;
}) {
    const binaryString = atob(documentBinary);
    const bytes = new Uint8Array(
        binaryString.split('').map((char) => char.charCodeAt(0))
    );
    const decodedText = new TextDecoder('utf-8').decode(bytes);

    let formattedText = decodedText;
    try {
        const parsedJson = JSON.parse(decodedText);
        formattedText = JSON.stringify(parsedJson, null, 4);
    } catch (error) {
        // If parsing fails, keeping plain text as it is.
    }

    return (
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {formattedText}
        </div>
    );
}
