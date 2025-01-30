export default function TxtPreview({ documentBinary }: { documentBinary: string }) {
    const binaryString = atob(documentBinary);
    const bytes = new Uint8Array(binaryString.split('').map(char => char.charCodeAt(0)));
    const decodedText = new TextDecoder('utf-8').decode(bytes); // Proper UTF-8 decoding

    let formattedText = decodedText; // Default to plain text

    // Check if the decoded text is JSON
    try {
        const parsedJson = JSON.parse(decodedText);
        formattedText = JSON.stringify(parsedJson, null, 4); // Pretty-print JSON
    } catch (error) {
        // If parsing fails, keeping plain text as it is.
    }

    return <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{formattedText}</div>;
}
