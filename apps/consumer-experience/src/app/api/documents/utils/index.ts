// Converts the Base 64 encoded binaryData string into a blob on the client to allow for downloading.
export const b64ToBlob = (b64data: string): Blob | null => {
  try {
    const chunkSize = 1024;
    const byteChars = atob(b64data);

    const chunks: Uint8Array<ArrayBuffer>[] = [];

    for (let i = 0; i < byteChars.length; i += chunkSize) {
      const chunk = byteChars.slice(i, i + chunkSize);

      const byteArray = new Uint8Array(chunk.length);
      for (let j = 0; j < chunkSize; ++j) {
        byteArray[j] = chunk.charCodeAt(j);
      }

      chunks.push(byteArray);
    }

    const blob = new Blob(chunks, { type: 'application/pdf' });
    return blob;
  } catch (error) {
    console.error(
      'document-downloader::b64ToBlob::Error converting document response to Blob',
      error
    );
    return null;
  }
};
